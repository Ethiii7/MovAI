import React, { useState } from 'react';

export default function AuthPage({ onLogin }) {
  // Estado que controla si el panel derecho (Registro) está activo o no
  const [isSignUp, setIsSignUp] = useState(false);

    // 👇 Estados para el formulario, carga y errores
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Manejar cambios en los inputs
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 👇 Función que llama a la Base de Datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isSignUp ? "/api/v1/auth/register" : "/api/v1/auth/login";
      const body = isSignUp
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      // 🔥 IMPORTANTE: Usar variable de entorno para la URL del API
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Error en la autenticación");
        return;
      }

      const userData = await res.json();
      onLogin(userData); // Inicia sesión en App.jsx
    } catch (e) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] font-sans">
      {/* Contenedor Principal */}
      <div className="relative w-[850px] max-w-full h-[550px] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* ─── PANEL DE REGISTRO (Izquierda, se mueve a la derecha) ─── */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-12 bg-slate-800 ${
            isSignUp
              ? 'translate-x-full opacity-100 z-50 pointer-events-auto'
              : 'translate-x-0 opacity-0 z-10 pointer-events-none'
          }`}
        >
          <h1 className="text-3xl font-bold text-white mb-6">Crear Cuenta</h1>
          {error && isSignUp && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <form className="w-full flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Nombre completo"
              className="bg-slate-700 text-white border-none rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-sky-500 outline-none placeholder-slate-400 transition-all"
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="bg-slate-700 text-white border-none rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-sky-500 outline-none placeholder-slate-400 transition-all"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="bg-slate-700 text-white border-none rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-sky-500 outline-none placeholder-slate-400 transition-all"
            />
            <button disabled={loading} className="mt-4 bg-[#3b82f6] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              {loading ? "Cargando..." : "Registrarse"}
            </button>
          </form>
        </div>

        {/* ─── PANEL DE INICIO DE SESIÓN (Izquierda) ─── */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-12 bg-slate-800 z-20 ${
            isSignUp ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100 pointer-events-auto'
          }`}
        >
          <h1 className="text-3xl font-bold text-white mb-6">Iniciar Sesión</h1>
          {error && !isSignUp && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <form className="w-full flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Correo electrónico"
              className="bg-slate-700 text-white border-none rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-sky-500 outline-none placeholder-slate-400 transition-all"
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="bg-slate-700 text-white border-none rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-sky-500 outline-none placeholder-slate-400 transition-all"
            />
            <a href="#" className="text-sm text-sky-400 hover:text-sky-300 text-center mt-2 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
            <button disabled={loading} className="mt-2 bg-[#3b82f6] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              {loading ? "Cargando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* ─── CONTENEDOR SUPERPUESTO (La cortina que se desliza) ─── */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${
            isSignUp ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div
            className={`absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-blue-700 via-sky-600 to-[#3b82f6] text-white transition-transform duration-700 ease-in-out ${
              isSignUp ? 'translate-x-1/2' : 'translate-x-0'
            }`}
          >
            {/* Panel Overlay Izquierdo (Muestra mensaje para Iniciar Sesión) */}
            <div
              className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transition-transform duration-700 ease-in-out ${
                isSignUp ? 'translate-x-0' : '-translate-x-[20%]'
              }`}
            >
              <img 
                src="//MovAIm.png" 
                alt="MovAI Logo" 
                className="w-20 h-20 mb-6 object-contain drop-shadow-lg" 
              />
              <h1 className="text-4xl font-bold mb-4">¡Bienvenido de nuevo!</h1>
              <p className="mb-8 text-sky-100 text-lg">
                Para mantenerte conectado con MovAI, inicia sesión con tu información personal.
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="px-10 py-3 border-2 border-white rounded-xl font-bold tracking-wider hover:bg-white hover:text-blue-600 transition-all"
              >
                INICIAR SESIÓN
              </button>
            </div>

            {/* Panel Overlay Derecho (Muestra mensaje para Registrarse) */}
            <div
              className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transition-transform duration-700 ease-in-out ${
                isSignUp ? 'translate-x-[20%]' : 'translate-x-0'
              }`}
            >
              <img 
                src="/MovAI.png" 
                alt="MovAI Logo" 
                className="w-40 h-40 object-contain drop-shadow-lg" 
              />
              <h1 className="text-4xl font-bold mb-4">¡Hola, Viajero!</h1>
              <p className="mb-8 text-sky-100 text-lg">
                Crea una cuenta para comenzar a trazar tus rutas inteligentes con nosotros.
              </p>
              <button
                onClick={() => { setIsSignUp(true); setError(null); }}
                className="px-10 py-3 border-2 border-white rounded-xl font-bold tracking-wider hover:bg-white hover:text-blue-600 transition-all"
              >
                REGISTRARSE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}