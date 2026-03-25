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
      const API_URL = import.meta.env.VITE_API_URL || "movai-production-69d7.up.railway.app";
      
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
    <div className="flex flex-col min-h-screen bg-[#0f172a] font-sans">
       {/* ─── 1. MENÚ DE ARRIBA (HEADER) COMO EN LA IMAGEN ─── */}
      <header className="w-full bg-slate-900 border-b border-slate-800 z-50 px-4 md:px-8 py-2 flex items-center justify-between bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0d2dd0] shrink-0">
        <div className="flex items-center gap-4">
          <img src="/MovAI.png" alt="MovAI Logo" className="w-auto lg:h-14 h-12 py-1.5 px-8 object-contain" /> {/* Logo de la imagen */}
        </div>
      </header>
      {/* 3. MAIN: 'flex-grow' hace que llene el espacio libre. Si el contenido es más grande, empujará el footer y permitirá scroll */}
      <main className="flex-grow flex p-4 py-8 w-full">
      {/* Contenedor Principal */}
      <div className="relative m-auto w-full lg:w-3/4 md:w-[90%] max-w-5xl min-h-[700px] md:min-h-[375px] lg:min-h-[450px] bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ─── PANEL DE REGISTRO (Izquierda, se mueve a la derecha) ─── */}
        <div
          className={`absolute top-0 left-0 md:w-1/2 w-full md:h-full h-1/2 transition-all duration-700 ease-in-out flex flex-col items-center justify-center px-12 bg-slate-800 ${
            isSignUp
              ? 'md:translate-x-full opacity-100 z-50 pointer-events-auto'
              : 'md:translate-x-0 opacity-0 z-10 pointer-events-none'
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
            <button disabled={loading} className="mt-4 bg-[#c240ff] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              {loading ? "Cargando..." : "Registrarse"}
            </button>
          </form>
        </div>

        {/* ─── PANEL DE INICIO DE SESIÓN (Izquierda) ─── */}
        <div
          className={`absolute md:top-0 bottom-0 left-0 md:w-1/2 w-full md:h-full h-1/2 transition-all duration-700 ease-in-out flex flex-col items-center justify-center md:px-12 px-6 bg-slate-800 z-20 ${
            isSignUp ? 'md:translate-x-full opacity-0 pointer-events-none' : 'md:translate-x-0 opacity-100 pointer-events-auto'
          }`}
        >
          <h1 className="text-3xl font-bold text-white md:mb-6 mb-2">Iniciar Sesión</h1>
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
            {/*<a href="#" className="text-sm text-sky-400 hover:text-sky-300 text-center mt-2 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>*/}
            <button disabled={loading} className="md:mt-2 mt-0 bg-[#ffb03a] hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg">
              {loading ? "Cargando..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* ─── CONTENEDOR SUPERPUESTO (La cortina que se desliza) ─── */}
        <div
            className={`
                absolute 
                md:top-0 md:left-1/2 md:w-1/2 md:h-full
                top-0 left-0 w-full h-1/2
                overflow-hidden transition-all duration-700 ease-in-out z-50
                ${isSignUp 
                ? 'translate-y-full md:-translate-x-full md:translate-y-0' 
                : 'translate-y-0 md:translate-x-0'}
            `}
        >
          <div
            className={`
                absolute 
                md:top-0 md:left-[-100%] md:w-[200%] md:h-full
                top-[-100%] left-0 w-full h-[200%]
                bg-gradient-to-r from-[#0b0b5f] via-[#0d2f80] to-[#0e4aa8]
                text-white transition-transform duration-700 ease-in-out
                ${isSignUp 
                ? 'translate-y-1/2 md:translate-x-1/2 md:translate-y-0' 
                : 'translate-y-0 md:translate-x-0'}
            `}
          >
            {/* Panel Overlay Izquierdo (Muestra mensaje para Iniciar Sesión) */}
            <div
            className={`
                absolute 
                md:top-0 md:left-0 md:w-1/2 md:h-full
                top-0 left-0 w-full h-1/2
                flex flex-col items-center justify-center lg:px-10 md:px-[1.2rem] px-6 text-center transition-all duration-700
                ${isSignUp ? 'translate-y-0 md:translate-x-0' : '-translate-y-[20%] md:translate-x-[-20%] md:translate-y-0'}
            `}
            >
              <img 
                src="/MovAIm.png" 
                alt="MovAI Logo" 
                className="w-20 h-20 mb-2 object-contain drop-shadow-xl/50" 
              />
              <h1 className="text-4xl font-bold mb-4">¡Bienvenido de nuevo!</h1>
              <p className="mb-4 text-sky-100 text-lg">
                Para mantenerte conectado con MovAI, inicia sesión con tu información personal.
              </p>
              <button
                onClick={() => setIsSignUp(false)}
                className="mb-4 px-10 py-3 border-2 border-white rounded-xl font-bold tracking-wider hover:bg-white hover:text-blue-600 transition-all"
              >
                INICIAR SESIÓN
              </button>
            </div>

            {/* Panel Overlay Derecho (Muestra mensaje para Registrarse) */}
            <div
            className={`
                absolute 
                md:top-0 md:left-1/2 md:w-1/2 md:h-full
                bottom-0 left-0 w-full h-1/2
                flex flex-col items-center justify-center lg:px-10 md:px-[1.2rem] px-6 text-center transition-all duration-700
                ${isSignUp ? 'translate-y-[20%] md:translate-x-[20%] md:translate-y-0' : 'translate-y-0 md:translate-x-0'}
            `}
            >
              <img 
                src="/MovAI.png" 
                alt="MovAI Logo" 
                className="w-40 h-40 object-contain drop-shadow-xl/50" 
              />
              <h1 className="md:text-4xl text-3xl font-bold mb-4">¡Hola, Viajero!</h1>
              <p className="mb-4 text-sky-100 md:text-lg text-md">
                Crea una cuenta para comenzar a trazar tus rutas inteligentes con nosotros.
              </p>
              <button
                onClick={() => { setIsSignUp(true); setError(null); }}
                className="mb-4 px-10 py-3 border-2 border-white rounded-xl font-bold tracking-wider hover:bg-white hover:text-blue-600 transition-all"
              >
                REGISTRARSE
              </button>
            </div>
          </div>
        </div>
      </div>
      </main>
      <footer className="w-full bg-slate-900 border-b border-slate-800 z-50 px-4 md:px-8 py-4 flex items-center justify-center bg-[linear-gradient(135deg,#1e283a,#0826cc,#031627,#1e283a,#0c2dcf,#1e283a)] shrink-0">
        <div>
            <h2
          className="text-[#d8dff4] text-sm md:text-xl font-black text-center drop-shadow-2xl"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: "0.04em" }}
        >
          Encuentra tu mejor ruta
        </h2>
        </div>
      </footer>
    </div>
  );
}