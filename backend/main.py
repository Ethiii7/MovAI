from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes import chat, auth
from app.database import create_tables
import os

@app.on_event("startup")
def startup():
    create_tables()   # Crea las tablas automáticamente al iniciar

app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])

# ── Carga las variables del archivo .env ANTES de todo ──
load_dotenv()

# ── Instancia principal de FastAPI ──
app = FastAPI(
    title="MovAI API",
    description="Backend del chatbot de movilidad urbana MovAI",
    version="0.1.0",
)

# ── CORS: lista de orígenes permitidos ─────────────────────────────────────────
# En desarrollo: el puerto de Vite. En producción: tu dominio de Vercel.
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite en desarrollo
    "http://localhost:3000",   # Por si usas otro puerto
    os.getenv("FRONTEND_URL", ""),  # Tu URL de Vercel en producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],       # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],       # Content-Type, Authorization, etc.
)

# ── Registra las rutas ──────────────────────────────────────────────────────────
app.include_router(chat.router, prefix="/api/v1", tags=["Chat"])

# ── Ruta de salud: útil para verificar que el servidor está vivo ───────────────
@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "MovAI API 🚀"}