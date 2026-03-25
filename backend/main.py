import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# ── Carga las variables del archivo .env ANTES de todo ──
load_dotenv()

from app.routes import chat, auth
from app.database import create_tables

# ── Instancia principal de FastAPI ──
app = FastAPI(
    title="MovAI API",
    description="Backend del chatbot de movilidad urbana MovAI",
    version="0.1.0",
)

# ── CORS: lista de orígenes permitidos ─────────────────────────────────────────
# En desarrollo: el puerto de Vite. En producción: tu dominio de Vercel.
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://mov-ai-three.vercel.app",
    # NOTA: Nunca pongas la URL con diagonal al final en CORS (ej. .app/)
]

# Obtenemos la variable de entorno, si existe y no está vacía, la agregamos
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    create_tables()   # Crea las tablas automáticamente al iniciar

app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])




# ── Ruta de salud: útil para verificar que el servidor está vivo ───────────────
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "MovAI API 🚀"}