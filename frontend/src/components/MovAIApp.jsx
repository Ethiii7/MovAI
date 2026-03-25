import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Clock,
  Settings,
  Send,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Navigation,
  Sparkles,
} from "lucide-react";
import MapView from "./MapView";
import SettingsPanel from "./SettingsPanel";

// ─── Datos de ejemplo ──────────────────────────────────────────────────────────
const HISTORY_ITEMS = [
  { id: 1, label: "Ruta al aeropuerto" },
  { id: 2, label: "Metro CDMX línea 3" },
  { id: 3, label: "Ejemplo 1" },
];

// ─── Componente: Logo ─────────────────────────────────────────────────────────
function MovAILogo({ collapsed }) {
  return (
    <div className="flex items-center gap-2 px-1 py-1 select-none">
      
      <img 
        src={collapsed ? "/MovAIm.png" : "/MovAI.png"} 
        alt="MovAI"
        className={`${collapsed ? "h-10" : "h-12"} w-auto transition-all`}
        />
    </div>
  );
}

// ─── Componente: MapPlaceholder ───────────────────────────────────────────────
function MapPlaceholder() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-[#0d1117]">
      {/* Imagen de fondo */}
      <img
        src="/mapaMoveAI.png"
        alt="Mapa"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/40 via-transparent to-[#0d1117]/80" />

      {/* Texto central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 mb-1">
          <Navigation size={20} className="text-blue-400 animate-pulse" />
        </div>
        <h2
          className="text-white text-4xl md:text-5xl font-black text-center drop-shadow-2xl"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "-0.04em" }}
        >
          ¿A dónde vamos?
        </h2>
        <p className="text-slate-400 text-sm tracking-widest uppercase">
          Escribe tu destino abajo
        </p>
      </div>
    </div>
  );
}

// ─── Componente: ChatBubble ───────────────────────────────────────────────────
function ChatBubble({ message, isUser, route, onShowRoute }) {
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}>
      
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? "bg-blue-600" : "bg-slate-800"
      }`}>
        {isUser ? <User size={14} /> : <img 
      src="/MovAIm.png" // 👈 CAMBIA ESTO por la ruta real de tu logo (ej: /src/assets/logo.png)
      alt="MovAI Logo" 
      className="h-7 w-7 mt-0.5 flex-shrink-0 object-contain" // Ajuste de tamaño y alineación (h-7/w-7, objeto-contain)
      size={14} />}
      </div>

      <div className="max-w-[80%]">
        <div className={`px-4 py-2.5 rounded-2xl text-sm ${
          isUser ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
        }`}>
          {/* 🔥 CAMBIO AQUÍ: Añadida la clase whitespace-pre-wrap */}
          <p className="text-sm whitespace-pre-wrap">
          {message}</p>
        </div>

        {/* RESUMEN DE RUTA */}
        {route && (
          <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs">
            <p>📍 {route.origin}</p>
            <p>🎯 {route.destination}</p>
            <p>⏱ {route.total_duration} • 📏 {route.total_distance}</p>

            <div className="mt-2 text-slate-400">
              {route.steps?.slice(0, 3).map((step, i) => (
                <p key={i}>
                  • {step.instruction.replace(/<[^>]+>/g, "")}
                </p>
              ))}
                <div className="mt-3 h-64 w-full rounded-xl overflow-hidden border border-slate-700">
                  <MapView route={route} />
                </div>
            </div>

            <button
              onClick={() => onShowRoute(route)}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded-lg"
            >
              Ver en el mapa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principal: MovAIApp ──────────────────────────────────────────
export default function MovAIApp({ user, onLogout, onUpdateUser }) {
  const [collapsed, setCollapsed] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { id: Date.now(), text, isUser: true }]);
    setInput("");
    setIsTyping(true);

  try {
    const API_URL = import.meta.env.VITE_API_URL || "https://movai-production-69d7.up.railway.app";
    const res = await fetch(`${API_URL}/api/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text,
        conversation_id: "1",
      }),
    });

    const data = await res.json();
    console.log("Backend response:", data);
    console.log("Route data:", data.route_data);

     // 🧠 Separación
    const replyText = data.reply;
    const routeData = data.route_data;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text: replyText,
        isUser: false,
        route: routeData || null,
      },
    ]);

    // 🔥 sincroniza mapa
    if (routeData) {
      setRouteData(routeData);
    }

  } catch (err) {
    console.error(err);
  }

  setIsTyping(false);
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showMap = messages.length === 0;

  return (
    <>
      {/* Google Font Syne */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #020817; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        textarea { resize: none; }
      `}</style>

      <div
        className="flex h-screen w-screen bg-[#020817] text-white overflow-hidden"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
        <aside
          className="relative flex flex-col border-r border-slate-800 bg-[#080f1e] transition-all duration-300 ease-in-out flex-shrink-0"
          style={{ width: collapsed ? "90px" : "260px" }}
        >
          {/* Toggle button */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-slate-700 hover:bg-blue-600 border border-slate-600 flex items-center justify-center transition-colors"
          >
            {collapsed ? (
              <ChevronRight size={12} className="text-white" />
            ) : (
              <ChevronLeft size={12} className="text-white" />
            )}
          </button>

          {/* Logo */}
          <div className="px-3 pt-5 pb-4">
            <MovAILogo collapsed={collapsed} />
          </div>

          {/* Nuevo Viaje */}
          <div className="px-3 mb-4">
            <button onClick={() => {setMessages([]); setRouteData(null); setInput("");}}
              className={`w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl px-3 py-2.5 transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Plus size={18} />
              {!collapsed && <span className="text-sm">Nuevo Viaje</span>}
            </button>
          </div>

          {/* Historial */}
          <div className="flex-1 overflow-y-auto px-3">
            <div
              className={`flex items-center gap-2 text-slate-400 mb-2 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Clock size={15} />
              {!collapsed && (
                <span className="text-xs font-bold tracking-widest uppercase">
                  Historial
                </span>
              )}
            </div>

            {!collapsed && (
              <ul className="space-y-0.5">
                {HISTORY_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white text-sm transition-colors truncate flex items-center gap-2">
                      <MapPin size={13} className="text-slate-500 flex-shrink-0" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer del sidebar */}
          <div className="px-3 pb-4 pt-2 border-t border-slate-800 space-y-1">
            
            
            
            {/* Configuración */}
            <button
              onClick={() => setShowSettings(true)}
              className={`w-full flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl px-3 py-2.5 transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <Settings size={17} />
              {!collapsed && <span className="text-sm">Configuración</span>}
            </button>

            {/* Usuario */}
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  {/* Usa user?.name desde la base de datos */}
                  <p className="text-sm font-bold text-white truncate">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-slate-500">
                    {user?.plan === "pro" ? "Plan Pro" : "Plan Gratuito"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── ÁREA PRINCIPAL ──────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Zona de contenido: mapa O chat */}
          <div className="flex-1 overflow-y-auto px-4 py-4">

    {messages.length === 0 ? (

  // 🔥 ESTADO INICIAL (imagen 2)
  <div className="h-full max-w-4xl mx-auto">
    <MapPlaceholder />
  </div>

) : (

  // 🔥 ESTADO CHAT + MAPA
  <div className="flex h-full gap-4 w-full">

    {/* CHAT */}
    <div className="max-w-2xl mx-auto space-y-4 overflow-y-auto">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg.text}
          isUser={msg.isUser}
          route={msg.route}
          onShowRoute={setRouteData}
        />
      ))}
    </div>
  </div>
)}
          </div>

          {/* ── INPUT BAR ─────────────────────────────────────────────────── */}
          <div className="px-4 pb-4 pt-2">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu destino o pregunta…"
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm outline-none leading-relaxed max-h-32 overflow-y-auto"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    height: "auto",
                    minHeight: "24px",
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
              <p className="text-center text-slate-600 text-xs mt-2">
                Puede llegar a cometer errores · MovAI Beta
              </p>
            </div>
          </div>
        </main>
      </div>
      {/* 👇 5. Renderizar el panel si showSettings es true, justo antes del cierre de return */}
      {showSettings && (
        <SettingsPanel
          user={user}
          onClose={() => setShowSettings(false)}
          onLogout={onLogout}
          onUpdateUser={onUpdateUser}
        />
      )}
    </>
  );
}