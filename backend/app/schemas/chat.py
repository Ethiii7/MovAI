from pydantic import BaseModel
from typing import Optional
from typing import Optional, List, Any

# ── Lo que recibe el endpoint /chat desde el frontend ──
class ChatRequest(BaseModel):
    message: str                        # Mensaje del usuario
    conversation_id: Optional[str] = None  # Para futuro historial
    # Ubicación actual del usuario (útil para rutas "desde aquí")
    user_lat: Optional[float] = None
    user_lng: Optional[float] = None

class RouteData(BaseModel):
    """Datos de ruta estructurados para que React los dibuje en el mapa."""
    origin:           str
    destination:      str
    total_distance:   str
    total_duration:   str
    polyline_encoded: str          # Google Maps JS lo decodifica directamente
    steps:            List[Any]
    mode:             str

# ── Lo que devuelve el endpoint /chat al frontend ──
class ChatResponse(BaseModel):
    reply:           str           # Texto legible para el usuario
    route_data:      Optional[RouteData] = None   # Datos para el mapa
    place_data:      Optional[dict]      = None   # Datos de un lugar encontrado
    tokens_used:     Optional[int]       = None
    conversation_id: Optional[str]       = None