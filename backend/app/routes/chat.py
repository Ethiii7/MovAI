from dotenv import load_dotenv
load_dotenv()
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from app.schemas.chat import ChatRequest, ChatResponse
import os
import json
from app.schemas.chat import ChatRequest, ChatResponse, RouteData
from app.services.google_maps import search_place, get_directions

router = APIRouter()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("NO SE ENCONTRÓ LA API KEY")

client = OpenAI(api_key=api_key)

SYSTEM_PROMPT = """
Eres MovAI, un asistente experto en movilidad urbana y rutas eficientes.
Ayudas a los usuarios a encontrar rutas de transporte público, metro,
autobús y otros medios de movilidad, principalmente en ciudades de México
y Latinoamérica.

Tienes acceso a dos herramientas reales:
- search_place: para encontrar coordenadas de cualquier lugar por nombre.
- get_directions: para obtener rutas reales entre dos puntos.

REGLAS IMPORTANTES:
1. Cuando el usuario pregunte cómo ir de un lugar a otro, DEBES:
   a) Primero usar search_place para encontrar el origen
   b) Luego usar search_place para encontrar el destino
   c) Finalmente usar get_directions con los lugares encontrados

2. Responde en español, de forma amigable y concisa.

3. Cuando des una ruta, resume los pasos más importantes (máx 4-5 pasos).

4. Menciona la duración y distancia total siempre que tengas una ruta.

5. Si el usuario no especifica ciudad, asume Ciudad de México.
"""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_place",
            "description": (
                "Busca un lugar por nombre y devuelve sus coordenadas GPS "
                "y dirección exacta. Úsala cuando el usuario mencione un "
                "lugar, negocio, dirección o punto de interés."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Nombre del lugar a buscar, ej: 'Starbucks Reforma', 'Aeropuerto CDMX', 'Zócalo'",
                    },
                    "location_bias": {
                        "type": "string",
                        "description": "Ciudad para acotar la búsqueda, ej: 'Ciudad de México'. Opcional.",
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_directions",
            "description": (
                "Obtiene una ruta entre origen y destino usando Google Maps. "
                "Devuelve los pasos, duración, distancia y polilínea para "
                "dibujar en el mapa. Úsala cuando el usuario quiera ir de "
                "un lugar a otro."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "origin": {
                        "type": "string",
                        "description": "Dirección o nombre del punto de origen",
                    },
                    "destination": {
                        "type": "string",
                        "description": "Dirección o nombre del destino",
                    },
                    "mode": {
                        "type": "string",
                        "enum": ["transit", "driving", "walking", "bicycling"],
                        "description": "Medio de transporte. Por defecto 'transit' (transporte público).",
                    },
                },
                "required": ["origin", "destination"],
            },
        },
    },
]

AVAILABLE_FUNCTIONS = {
    "search_place":   search_place,
    "get_directions": get_directions,
}

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío.")

    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if request.user_lat and request.user_lng:
            messages.append({
                "role": "system",
                "content": f"Ubicación actual del usuario: lat={request.user_lat}, lng={request.user_lng}. Puedes usarla como origen si el usuario dice 'desde aquí' o 'cerca de mí'."
            })

        messages.append({"role": "user", "content": request.message})

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1000,
        )

        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        route_data = None
        place_data = None
        total_tokens = response.usage.total_tokens

        # Almacenar los resultados de search_place en orden
        search_results = []

        if tool_calls:
            messages.append(response_message)

            for tool_call in tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                fn_to_call = AVAILABLE_FUNCTIONS.get(fn_name)

                if not fn_to_call:
                    continue

                fn_result = fn_to_call(**fn_args)

                print(f"\n--- RESULTADO DE {fn_name} ---")
                print(fn_result)
                print("-------------------------------\n")

                if fn_name == "search_place" and "lat" in fn_result:
                    search_results.append(fn_result)
                    place_data = fn_result

                elif fn_name == "get_directions" and "polyline_encoded" in fn_result:
                    route_data = RouteData(**fn_result)
                    print("\n📦 RouteData a enviar:")
                    print(f"  origin: {route_data.origin if route_data else 'None'}")
                    print(f"  destination: {route_data.destination if route_data else 'None'}")
                    print(f"  polyline length: {len(route_data.polyline_encoded) if route_data else 0}")
                
                print("\n📦 RouteData a enviar:")
                print(f"  origin: {route_data.origin if route_data else 'None'}")
                print(f"  destination: {route_data.destination if route_data else 'None'}")
                print(f"  polyline length: {len(route_data.polyline_encoded) if route_data else 0}")

                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": fn_name,
                    "content": json.dumps(fn_result, ensure_ascii=False),
                })

            # Si se encontraron dos lugares y no hay ruta, obtenerla automáticamente
            if len(search_results) == 2 and not route_data:
                print("\n🔍 Intentando obtener ruta entre los dos lugares encontrados...")
                print(f"   search_results[0]: {search_results[0].get('name')} - {search_results[0].get('address')}")
                print(f"   search_results[1]: {search_results[1].get('name')} - {search_results[1].get('address')}")
                origin_place = search_results[0]
                dest_place = search_results[1]

                # Usar el place_id de Google para exactitud absoluta
                origin_str = f"place_id:{origin_place['place_id']}"
                dest_str = f"place_id:{dest_place['place_id']}"

                print(f"   Llamando a get_directions con origin='{origin_str}', destination='{dest_str}'")
                directions_result = get_directions(
                    origin=origin_str,
                    destination=dest_str,
                    mode="transit"
                )

                if "polyline_encoded" in directions_result:
                    print(f"   Direcciones devueltas por Google: origen='{directions_result['origin']}', destino='{directions_result['destination']}'")
                    route_data = RouteData(**directions_result)
                    print("✅ Ruta obtenida exitosamente")
                    # 🔥 En lugar de agregar un mensaje 'tool', agregamos un mensaje 'system' con los datos de la ruta
                    route_summary = f"""
            [Información de la ruta obtenida]
            Origen: {directions_result['origin']}
            Destino: {directions_result['destination']}
            Distancia: {directions_result['total_distance']}
            Duración: {directions_result['total_duration']}
            Modo de transporte: {directions_result['mode']}

            Pasos principales:
            """
                    for step in directions_result['steps'][:4]:
                        route_summary += f"- {step['instruction']} ({step['distance']}, {step['duration']})\n"

                    messages.append({
                        "role": "system",
                        "content": route_summary
                    })
                else:
                    print(f"⚠️ Error obteniendo ruta: {directions_result}")

            # Segunda llamada a GPT para redactar la respuesta final
            second_response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=600,
            )
            final_reply = second_response.choices[0].message.content
            total_tokens += second_response.usage.total_tokens

        else:
            final_reply = response_message.content

        # Log de depuración: mostrar qué se devuelve
        print(f"\n📤 Respuesta final: reply='{final_reply[:100]}...', route_data={'SÍ' if route_data else 'NO'}")

        return ChatResponse(
            reply=final_reply,
            route_data=route_data,
            place_data=place_data,
            tokens_used=total_tokens,
        )

    except Exception as e:
        print(f"❌ Error en chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))