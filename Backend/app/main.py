from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine
from app.routers import (
    auth, usuarios, empresas, lavadoras, alquileres,
    dashboard, configuraciones, clientes, repartidores,
    rutas, notificaciones, tickets, archivos,
    mantenimientos, cola_espera, tarifas, suscripciones,
    historial, public, pagos, repartidor,
)
from app.websockets import cronometro, rutas as ws_rutas
from app.utils.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando %s", settings.APP_NAME)
    yield
    await engine.dispose()
    logger.info("Apagando %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="API Backend para Servilavadora S.A.S. - Plataforma de alquiler de lavadoras",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")
app.include_router(empresas.router, prefix="/api")
app.include_router(lavadoras.router, prefix="/api")
app.include_router(alquileres.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(configuraciones.router, prefix="/api")
app.include_router(clientes.router, prefix="/api")
app.include_router(repartidores.router, prefix="/api")
app.include_router(rutas.router, prefix="/api")
app.include_router(notificaciones.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(archivos.router, prefix="/api")
app.include_router(mantenimientos.router, prefix="/api")
app.include_router(cola_espera.router, prefix="/api")
app.include_router(tarifas.router, prefix="/api")
app.include_router(suscripciones.router, prefix="/api")
app.include_router(historial.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(pagos.router, prefix="/api")
app.include_router(repartidor.router, prefix="/api")
app.include_router(cronometro.router)
app.include_router(ws_rutas.router)


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
