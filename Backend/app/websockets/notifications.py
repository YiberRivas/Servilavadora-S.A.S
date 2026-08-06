import asyncio
import json
from datetime import datetime, timezone
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import async_session
from app.models.base import (
    Usuario, Notificacion, Persona, Rol, EmpleadoEmpresa,
    Repartidor, ClienteEmpresa, Empresa,
)
from app.security.jwt import decode_token
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()

user_connections: Dict[int, Set[WebSocket]] = {}


class NotificationHub:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

    async def broadcast_to_user(self, user_id: int, event_type: str, data: dict):
        conns = user_connections.get(user_id, set())
        if not conns:
            return
        message = json.dumps({
            "type": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        dead = set()
        for ws in conns:
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        conns -= dead
        if not conns and user_id in user_connections:
            del user_connections[user_id]

    async def broadcast_to_empresa(self, empresa_id: int, event_type: str, data: dict):
        async with async_session() as db:
            empleados = (await db.execute(
                select(EmpleadoEmpresa.id_usuario).where(
                    EmpleadoEmpresa.id_empresa == empresa_id,
                    EmpleadoEmpresa.estado == 1,
                )
            )).scalars().all()
            for uid in empleados:
                await self.broadcast_to_user(uid, event_type, data)

    async def broadcast_to_repartidores(self, empresa_id: int, event_type: str, data: dict):
        async with async_session() as db:
            reps = (await db.execute(
                select(Repartidor.id_usuario).where(
                    Repartidor.id_empresa == empresa_id,
                    Repartidor.estado == 1,
                )
            )).scalars().all()
            for uid in reps:
                await self.broadcast_to_user(uid, event_type, data)

    async def broadcast_to_cliente(self, cliente_empresa_id: int, event_type: str, data: dict):
        async with async_session() as db:
            ce = (await db.execute(
                select(ClienteEmpresa.id_usuario).where(
                    ClienteEmpresa.id_cliente_empresa == cliente_empresa_id,
                )
            )).scalar_one_or_none()
            if ce:
                await self.broadcast_to_user(ce, event_type, data)


hub = NotificationHub()


async def get_user_from_ws(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    return payload.get("sub")


@router.websocket("/ws/notifications/{user_uuid}")
async def websocket_notifications(websocket: WebSocket, user_uuid: str):
    user_id = await get_user_from_ws(websocket)
    if not user_id:
        await websocket.close(code=4001, reason="Token invalido")
        return

    await websocket.accept()

    async with async_session() as db:
        user = (await db.execute(
            select(Usuario).where(Usuario.uuid == user_uuid, Usuario.id_usuario == int(user_id))
        )).scalar_one_or_none()
        if not user:
            await websocket.send_json({"error": "Usuario no encontrado"})
            await websocket.close()
            return

        if user.id_usuario not in user_connections:
            user_connections[user.id_usuario] = set()
        user_connections[user.id_usuario].add(websocket)

        last_notification_id = 0
        count_result = await db.execute(
            select(func.coalesce(func.max(Notificacion.id_notificacion), 0))
        )
        last_notification_id = count_result.scalar() or 0

    try:
        while True:
            async with async_session() as db:
                notif_result = await db.execute(
                    select(Notificacion).where(
                        Notificacion.id_usuario == int(user_id),
                        Notificacion.id_notificacion > last_notification_id,
                    ).order_by(Notificacion.id_notificacion.desc()).limit(5)
                )
                new_notifs = notif_result.scalars().all()

                for n in reversed(new_notifs):
                    await websocket.send_json({
                        "type": "new_notification",
                        "data": {
                            "id": n.id_notificacion,
                            "uuid": n.uuid,
                            "titulo": n.titulo,
                            "mensaje": n.mensaje,
                            "tipo": n.tipo,
                            "icono": n.icono,
                            "color": n.color,
                            "leida": n.leida,
                            "created_at": n.created_at.isoformat() if n.created_at else None,
                            "data": n.datos_extra if hasattr(n, 'datos_extra') else None,
                        },
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                    if n.id_notificacion > last_notification_id:
                        last_notification_id = n.id_notificacion

                count_result = await db.execute(
                    select(func.count()).where(
                        Notificacion.id_usuario == int(user_id),
                        Notificacion.leida == 0,
                    )
                )
                unread = count_result.scalar() or 0

                await websocket.send_json({
                    "type": "heartbeat",
                    "unread_count": unread,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            await asyncio.sleep(3)

    except WebSocketDisconnect:
        if int(user_id) in user_connections:
            user_connections[int(user_id)].discard(websocket)
            if not user_connections[int(user_id)]:
                del user_connections[int(user_id)]
        logger.info("WS notifications desconectado: user=%s", user_uuid)
    except Exception as e:
        logger.error("Error en WS notifications: %s", str(e))
        if int(user_id) in user_connections:
            user_connections[int(user_id)].discard(websocket)
            if not user_connections[int(user_id)]:
                del user_connections[int(user_id)]
