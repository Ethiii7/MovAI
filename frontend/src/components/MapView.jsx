import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

// Estilo del mapa (Dark Mode elegante)
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

// ── Componente Interno para polilínea y marcadores ────────────────────────
function MapRouteAndMarkers({ route }) {
  const map = useMap();
  const geometryLib = useMapsLibrary("geometry");
  const polylineRef = useRef(null);
  
  // Estado para guardar las coordenadas exactas de inicio y fin
  const [markerPositions, setMarkerPositions] = useState(null);

  useEffect(() => {
    if (!route?.polyline_encoded || !geometryLib || !map) return;

    // 1. Decodificar la polilínea
    const decodedPath = window.google.maps.geometry.encoding.decodePath(
      route.polyline_encoded
    );

    if (polylineRef.current) polylineRef.current.setMap(null);

    // 2. Dibujar la línea azul
    polylineRef.current = new window.google.maps.Polyline({
      path: decodedPath,
      strokeColor: "#3b82f6", // Azul Figma
      strokeWeight: 7,
      strokeOpacity: 1,
    });

    polylineRef.current.setMap(map);

    // 3. Ajustar el zoom automático
    const bounds = new window.google.maps.LatLngBounds();
    decodedPath.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 40);

    // 4. 🔥 TRUCO: Sacar las coordenadas de inicio y fin directo de la línea dibujada
    if (decodedPath.length > 0) {
      setMarkerPositions({
        origin: { 
          lat: decodedPath[0].lat(), 
          lng: decodedPath[0].lng() 
        },
        destination: {
          lat: decodedPath[decodedPath.length - 1].lat(),
          lng: decodedPath[decodedPath.length - 1].lng(),
        },
      });
    }

    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
    };
  }, [route, geometryLib, map]);

  return (
    <>
      {/* Solo renderizamos los marcadores cuando ya calculamos sus posiciones */}
      {markerPositions && (
        <>
          {/* Marcador de Origen (Círculo blanco con borde azul) */}
          <AdvancedMarker position={markerPositions.origin} title="Origen">
            <div
              style={{
                width: "18px",
                height: "18px",
                backgroundColor: "white",
                border: "4px solid #c240ff",
                borderRadius: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              }}
            />
          </AdvancedMarker>

          {/* Marcador de Destino (Pin azul) */}
          <AdvancedMarker position={markerPositions.destination} title="Destino">
            <Pin
              background={"#ff463a"}
              borderColor={"#ff463a"}
              glyphColor={"white"}
              scale={1.2}
            />
          </AdvancedMarker>
        </>
      )}
    </>
  );
}

// ── Componente Principal ──────────────────────────────────────────
export default function MapView({ route }) {
  const defaultCenter = { lat: 19.4326, lng: -99.1332 };

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultZoom={10}
        defaultCenter={defaultCenter}
        disableDefaultUI={true}
        mapId="dff1eeee6efdb823c23b688c" // 🔥 Requisito para usar AdvancedMarkers
      >
        <MapRouteAndMarkers route={route} />
      </Map>
    </APIProvider>
  );
}