import { useState, useRef } from "react";
import {
  X, Camera, Check, Zap, Crown,
  Shield, ChevronRight, LogOut, Bell, Globe
} from "lucide-react";

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, current, onSelect }) {
  const isPro = plan.id === "pro";
  const isCurrent = current === plan.id;

  return (
    <div
      onClick={() => !isCurrent && onSelect(plan.id)}
      className="relative rounded-2xl p-5 cursor-pointer transition-all duration-200"
      style={{
        background: isPro
          ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(168,85,247,0.08))"
          : "rgba(15,23,42,0.6)",
        border: isCurrent
          ? isPro ? "1.5px solid #3b82f6" : "1.5px solid #475569"
          : "1.5px solid rgba(51,65,85,0.4)",
        boxShadow: isPro && isCurrent ? "0 0 20px rgba(59,130,246,0.12)" : "none",
        transform: isCurrent ? "scale(1.01)" : "scale(1)",
      }}
    >
      {/* Badge actual */}
      {isCurrent && (
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{
            background: isPro ? "#3b82f6" : "rgba(71,85,105,0.8)",
            color: "white",
          }}
        >
          <Check size={10} />
          Plan actual
        </div>
      )}

      {/* Ícono del plan */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: isPro
            ? "linear-gradient(135deg, #3b82f6, #a855f7)"
            : "rgba(51,65,85,0.6)",
        }}
      >
        {isPro ? <Crown size={18} className="text-white" /> : <Zap size={18} className="text-white" />}
      </div>

      <h3 className="text-white font-black text-lg mb-0.5" style={{ letterSpacing: "-0.02em" }}>
        {plan.name}
      </h3>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-white font-black text-2xl">{plan.price}</span>
        {plan.period && <span className="text-slate-500 text-sm">{plan.period}</span>}
      </div>

      <ul className="space-y-2 mb-4">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check size={13} className={isPro ? "text-blue-400 mt-0.5 flex-shrink-0" : "text-slate-500 mt-0.5 flex-shrink-0"} />
            <span className={isPro ? "text-slate-200" : "text-slate-400"}>{f}</span>
          </li>
        ))}
      </ul>

      {!isCurrent && (
        <button
          className="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
          style={{
            background: isPro ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "rgba(51,65,85,0.5)",
            color: "white",
          }}
        >
          {isPro ? "Actualizar a Pro ✨" : "Bajar a Gratuito"}
        </button>
      )}
    </div>
  );
}

// ── Setting Row ───────────────────────────────────────────────────────────────
function SettingRow({ icon: Icon, label, desc, action }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors hover:bg-slate-800/50 cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
          <Icon size={15} className="text-slate-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">{label}</p>
          {desc && <p className="text-slate-500 text-xs">{desc}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {action}
        <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        width: 40,
        height: 22,
        background: value ? "#3b82f6" : "rgba(51,65,85,0.8)",
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
        style={{
          width: 18,
          height: 18,
          left: value ? 20 : 2,
        }}
      />
    </button>
  );
}

// ── Componente Principal ───────────────────────────────────────────────────────
export default function SettingsPanel({ user, onClose, onLogout, onUpdateUser }) {
  const [tab, setTab] = useState("perfil"); // "perfil" | "planes" | "preferencias"
  const [name, setName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("es");
  const fileRef = useRef();

  const PLANS = [
    {
      id: "gratuito",
      name: "Gratuito",
      price: "$0",
      period: "/ mes",
      features: [
        "10 consultas de ruta al día",
        "Transporte público (metro, bus)",
        "Historial de últimas 5 rutas",
        "Chat con MovAI básico",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$99",
      period: "MXN / mes",
      features: [
        "Consultas ilimitadas",
        "Todos los modos de transporte",
        "Historial completo ilimitado",
        "Chat con GPT-4o priorizado",
        "Alertas de tráfico en tiempo real",
        "Soporte prioritario 24/7",
      ],
    },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onUpdateUser({ ...user, name, avatar: avatarPreview });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TABS = [
    { id: "perfil", label: "Perfil" },
    { id: "planes", label: "Planes" },
    { id: "preferencias", label: "Preferencias" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .panel-enter { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(2,8,23,0.85)", backdropFilter: "blur(8px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Panel */}
        <div
          className="panel-enter w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: "linear-gradient(160deg, #080f1e 0%, #0a1628 100%)",
            border: "1px solid rgba(51,65,85,0.5)",
            maxHeight: "90vh",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid rgba(51,65,85,0.4)" }}
          >
            <h2 className="text-white font-black text-lg" style={{ letterSpacing: "-0.02em" }}>
              Configuración
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <X size={15} className="text-slate-400" />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex gap-1 px-4 pt-3 pb-2"
            style={{ borderBottom: "1px solid rgba(51,65,85,0.3)" }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: tab === t.id ? "rgba(59,130,246,0.15)" : "transparent",
                  color: tab === t.id ? "#60a5fa" : "#64748b",
                  borderBottom: tab === t.id ? "2px solid #3b82f6" : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>

            {/* ── TAB: PERFIL ──────────────────────────────────────────────── */}
            {tab === "perfil" && (
              <>
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div
                      className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-black text-3xl">
                          {name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg transition-colors"
                    >
                      <Camera size={14} className="text-white" />
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">{user?.name}</p>
                    <p className="text-slate-500 text-xs">{user?.email}</p>
                  </div>
                </div>

                {/* Campos */}
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-bold uppercase tracking-widest block mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 text-sm outline-none cursor-not-allowed"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    />
                  </div>
                </div>

                {/* Plan badge */}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.4)" }}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={15} className="text-slate-400" />
                    <span className="text-slate-300 text-sm">Plan actual</span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: user?.plan === "pro" ? "rgba(59,130,246,0.2)" : "rgba(71,85,105,0.4)",
                      color: user?.plan === "pro" ? "#60a5fa" : "#94a3b8",
                    }}
                  >
                    {user?.plan === "pro" ? "Pro ✨" : "Gratuito"}
                  </span>
                </div>

                {/* Botón guardar */}
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: saved
                      ? "linear-gradient(135deg, #22c55e, #16a34a)"
                      : "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "white",
                    boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
                  }}
                >
                  {saved ? <><Check size={15} /> Cambios guardados</> : "Guardar cambios"}
                </button>
              </>
            )}

            {/* ── TAB: PLANES ──────────────────────────────────────────────── */}
            {tab === "planes" && (
              <>
                <div className="text-center mb-2">
                  <h3 className="text-white font-black text-xl mb-1" style={{ letterSpacing: "-0.02em" }}>
                    Elige tu plan
                  </h3>
                  <p className="text-slate-500 text-sm">Actualiza o cambia cuando quieras</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {PLANS.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      current={user?.plan || "gratuito"}
                      onSelect={(id) => onUpdateUser({ ...user, plan: id })}
                    />
                  ))}
                </div>
                <div
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
                >
                  <Shield size={15} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Los pagos son simulados. En producción se integrarán con Stripe o Conekta para pagos en México.
                  </p>
                </div>
              </>
            )}

            {/* ── TAB: PREFERENCIAS ────────────────────────────────────────── */}
            {tab === "preferencias" && (
              <>
                <div className="space-y-1">
                  <SettingRow
                    icon={Bell}
                    label="Notificaciones"
                    desc="Alertas de tráfico y rutas"
                    action={<Toggle value={notifications} onChange={setNotifications} />}
                  />
                  <SettingRow
                    icon={Globe}
                    label="Idioma"
                    desc="Español (México)"
                    action={
                      <span className="text-slate-500 text-xs">ES</span>
                    }
                  />
                </div>

                <div style={{ borderTop: "1px solid rgba(51,65,85,0.3)", paddingTop: "16px" }}>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:bg-red-500/10"
                    style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}