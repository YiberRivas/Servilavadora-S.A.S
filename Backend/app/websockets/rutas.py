import asyncio
from datetime import datetime, timezone
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import async_session
from app.models.base import (
    RutaGPS, Alquiler, Usuario, Repartidor,
    ClienteEmpresa, SolicitudAlquiler, Empresa,
)
from app.security.jwt import decode_token
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

active_connections: Dict[int, Set[WebSocket]] = {}


async def get_user_from_ws(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    return payload.get("sub")


async def validate_ws_ruta_ownership(db, user_id: int, ruta):
    user_result = await db.execute(
        select(Usuario).options(
            selectinload(Usuario.rol)
        ).where(Usuario.id_usuario == user_id)
    )
    user = user_result.scalar_one_or_none()
    if not user:
        return False

    rol_codigo = user.rol.codigo if user.rol else ""

    if rol_codigo == "SUPER_ADMIN":
        return True

    if rol_codigo == "ADMIN_EMPRESA":
        empresa_result = await db.execute(
            select(Empresa).where(Empresa.id_usuario == user.id_usuario)
        )
        empresa = empresa_result.scalar_one_or_none()
        return empresa is not None and ruta.id_empresa == empresa.id_empresa

    if rol_codigo == "CLIENTE":
        alq_result = await db.execute(
            select(Alquiler).where(Alquiler.id_alquiler == ruta.id_alquiler)
        )
        alquiler = alq_result.scalar_one_or_none()
        if not alquiler:
            return False
        ce_result = await db.execute(
            select(ClienteEmpresa).where(
                ClienteEmpresa.id_usuario == user_id,
                ClienteEmpresa.estado == 1,
            )
        )
        cliente = ce_result.scalar_one_or_none()
        return cliente is not None and alquiler.id_cliente_empresa == cliente.id_cliente_empresa

    if rol_codigo == "REPARTIDOR":
        return ruta.id_repartidor is not None and True

    return False


@router.websocket("/ws/rutas/{ruta_uuid}")
async def websocket_rutas(websocket: WebSocket, ruta_uuid: str):
    user_id = await get_user_from_ws(websocket)
    if not user_id:
        await websocket.close(code=4001, reason="Token invalido")
        return

    await websocket.accept()

    async with async_session() as db:
        result = await db.execute(
            select(RutaGPS).where(RutaGPS.uuid == ruta_uuid)
        )
        ruta = result.scalar_one_or_none()
        if not ruta:
            await websocket.send_json({"error": "Ruta no encontrada"})
            await websocket.close()
            return

        if not await validate_ws_ruta_ownership(db, int(user_id), ruta):
            await websocket.send_json({"error": "Acceso denegado"})
            await websocket.close(code=4003, reason="Sin permisos")
            return

        ruta_id = ruta.id_ruta_gps

        if ruta_id not in active_connections:
            active_connections[ruta_id] = set()
        active_connections[ruta_id].add(websocket)

    try:
        while True:
            async with async_session() as db:
                result = await db.execute(
                    select(RutaGPS).where(RutaGPS.id_ruta_gps == ruta_id)
                )
                ruta = result.scalar_one_or_none()

                if not ruta:
                    await websocket.send_json({"error": "Ruta no encontrada"})
                    break

                rep_result = await db.execute(
                    select(Repartidor).where(Repartidor.id_repartidor == ruta.id_repartidor)
                )
                rep = rep_result.scalar_one_or_none()
                rep_user = None
                if rep:
                    user_result = await db.execute(
                        select(Usuario).where(Usuario.id_usuario == rep.id_usuario)
                    )
                    rep_user = user_result.scalar_one_or_none()

                await websocket.send_json({
                    "ruta_uuid": ruta.uuid,
                    "latitud_actual": float(ruta.latitud_actual) if ruta.latitud_actual else None,
                    "longitud_actual": float(ruta.longitud_actual) if ruta.longitud_actual else None,
                    "latitud_destino": float(ruta.latitud_destino) if ruta.latitud_destino else None,
                    "longitud_destino": float(ruta.longitud_destino) if ruta.longitud_destino else None,
                    "latitud_cliente": float(ruta.latitud_cliente) if ruta.latitud_cliente else None,
                    "longitud_cliente": float(ruta.longitud_cliente) if ruta.longitud_cliente else None,
                    "velocidad": float(ruta.velocidad) if ruta.velocidad else 0,
                    "heading": float(ruta.heading) if ruta.heading else 0,
                    "distancia_restante_metros": ruta.distancia_restante_metros or 0,
                    "tiempo_estimado_segundos": ruta.tiempo_estimado_segundos or 0,
                    "estado": ruta.estado,
                    "repartidor_nombre": f"{rep_user.persona.nombres} {rep_user.persona.apellidos}" if rep_user and rep_user.persona else None,
                    "ultima_actualizacion": ruta.ultima_actualizacion.isoformat() if ruta.ultima_actualizacion else None,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            await asyncio.sleep(5)

    except WebSocketDisconnect:
        if ruta_id in active_connections:
            active_connections[ruta_id].discard(websocket)
            if not active_connections[ruta_id]:
                del active_connections[ruta_id]
        logger.info("WebSocket desconectado: ruta=%s", ruta_uuid)
    except Exception as e:
        logger.error("Error en WebSocket rutas: %s", str(e))
        if ruta_id in active_connections:
            active_connections[ruta_id].discard(websocket)
            if not active_connections[ruta_id]:
                del active_connections[ruta_id]
