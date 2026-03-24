import googlemaps
import os
from typing import Optional
from dotenv import load_dotenv
load_dotenv()

# ── Cliente de Google Maps ──────────────────────────────────────────────────────
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))
print("KEY:", os.getenv("GOOGLE_MAPS_API_KEY"))

def search_place(query: str, location_bias: Optional[str] = None) -> dict:
    """
    Busca un lugar por nombre y devuelve sus coordenadas y detalles.
    Usa Google Places API (Text Search).

    Args:
        query: Nombre del lugar, ej: "Starbucks Reforma CDMX"
        location_bias: Ciudad para acotar la búsqueda, ej: "Ciudad de México"

    Returns:
        dict con name, address, lat, lng y place_id
    """
    try:
        search_query = f"{query} {location_bias}" if location_bias else query

        results = gmaps.places(query=search_query)

        if not results.get("results"):
            return {"error": f"No se encontraron resultados para '{query}'"}

        # Tomamos el primer resultado (el más relevante)
        place = results["results"][0]
        location = place["geometry"]["location"]

        return {
            "name":     place.get("name"),
            "address":  place.get("formatted_address"),
            "lat":      location["lat"],
            "lng":      location["lng"],
            "place_id": place.get("place_id"),
        }

    except Exception as e:
        return {"error": str(e)}


def get_directions(
    origin: str,
    destination: str,
    mode: str = "transit",          # transit | driving | walking | bicycling
    language: str = "es",
    alternatives: bool = False,
) -> dict:
    """
    Obtiene una ruta entre dos puntos usando Google Directions API.

    Args:
        origin:      Dirección o coords de origen, ej: "Chapultepec, CDMX"
        destination: Dirección o coords de destino, ej: "Zócalo, CDMX"
        mode:        Medio de transporte (transit = transporte público)
        language:    Idioma de las instrucciones
        alternatives: Si True, devuelve rutas alternativas

    Returns:
        dict con pasos textuales, duración, distancia y polilínea encoded
    """
    try:
        result = gmaps.directions(
            origin=origin,
            destination=destination,
            mode=mode,
            language=language,
            alternatives=alternatives,
        )

        if not result:
            return {"error": "No se encontró ruta entre los puntos indicados."}

        route = result[0]
        leg   = route["legs"][0]

        # ── Pasos de la ruta (instrucciones textuales) ──────────────────────────
        steps = []
        for step in leg["steps"]:
            step_data = {
                "instruction": step.get("html_instructions", ""),
                "distance":    step["distance"]["text"],
                "duration":    step["duration"]["text"],
                "travel_mode": step.get("travel_mode", ""),
            }
            # Si es transporte público, agrega info del vehículo
            if "transit_details" in step:
                td = step["transit_details"]
                step_data["transit"] = {
                    "line":         td["line"].get("short_name") or td["line"].get("name"),
                    "vehicle":      td["line"]["vehicle"]["name"],
                    "departure":    td["departure_stop"]["name"],
                    "arrival":      td["arrival_stop"]["name"],
                    "num_stops":    td.get("num_stops"),
                }
            steps.append(step_data)

        return {
            "origin":            leg["start_address"],
            "destination":       leg["end_address"],
            "total_distance":    leg["distance"]["text"],
            "total_duration":    leg["duration"]["text"],
            "steps":             steps,
            # La polilínea encoded es lo que necesita el mapa de React para dibujar la ruta
            "polyline_encoded":  route["overview_polyline"]["points"],
            "mode":              mode,
        }

    except Exception as e:
        return {"error": str(e)}