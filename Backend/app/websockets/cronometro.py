import asyncio
from datetime import datetime, timezone
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import async_session
from app.models.base import (
    Alquiler, CronometroAlquiler, TarifaEmpresa,
    Usuario, Repartidor, ClienteEmpresa, SolicitudAlquiler,
    Sucursal, Lavadora, CapacidadLavadora, Empresa, EmpleadoEmpresa,
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


async def validate_ws_ownership(db, user_id: int, alquiler):
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
        emp_emp_result = await db.execute(
            select(EmpleadoEmpresa).where(EmpleadoEmpresa.id_usuario == user.id_usuario)
        )
        emp_emp = emp_emp_result.scalars().first()
        if not emp_emp:
            return False
        empresa_result = await db.execute(
            select(Empresa).where(Empresa.id_empresa == emp_emp.id_empresa)
        )
        empresa = empresa_result.scalar_one_or_none()
        if not empresa:
            return False
        sol_result = await db.execute(
            select(SolicitudAlquiler).where(
                SolicitudAlquiler.id_solicitud_alquiler == alquiler.id_solicitud_alquiler
            )
        )
        sol = sol_result.scalar_one_or_none()
        return sol is not None and sol.id_empresa == empresa.id_empresa

    if rol_codigo == "CLIENTE":
        ce_result = await db.execute(
            select(ClienteEmpresa).where(
                ClienteEmpresa.id_usuario == user_id,
                ClienteEmpresa.estado == 1,
            )
        )
        cliente = ce_result.scalar_one_or_none()
        return cliente is not None and alquiler.id_cliente_empresa == cliente.id_cliente_empresa

    if rol_codigo == "REPARTIDOR":
        rep_result = await db.execute(
            select(Repartidor).where(
                Repartidor.id_usuario == user_id,
                Repartidor.estado == 1,
            )
        )
        rep = rep_result.scalar_one_or_none()
        return rep is not None and alquiler.id_repartidor == rep.id_repartidor

    return False


async def get_tarifa_para_alquiler(db, alquiler):
    sol_result = await db.execute(
        select(SolicitudAlquiler).where(
            SolicitudAlquiler.id_solicitud_alquiler == alquiler.id_solicitud_alquiler
        )
    )
    sol = sol_result.scalar_one_or_none()
    if not sol:
        return None

    empresa_result = await db.execute(
        select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
    )
    empresa = empresa_result.scalar_one_or_none()
    if not empresa:
        return None

    lav_result = await db.execute(
        select(Lavadora).where(Lavadora.id_lavadora == alquiler.id_lavadora)
    )
    lavadora = lav_result.scalar_one_or_none()
    if not lavadora:
        return None

    tarifa_result = await db.execute(
        select(TarifaEmpresa).where(
            TarifaEmpresa.id_empresa == empresa.id_empresa,
            TarifaEmpresa.id_capacidad_lavadora == lavadora.id_capacidad_lavadora,
            TarifaEmpresa.activa == 1,
        ).limit(1)
    )
    return tarifa_result.scalar_one_or_none()


@router.websocket("/ws/cronometro/{alquiler_uuid}")
async def websocket_cronometro(websocket: WebSocket, alquiler_uuid: str):
    user_id = await get_user_from_ws(websocket)
    if not user_id:
        await websocket.close(code=4001, reason="Token invalido")
        return

    await websocket.accept()

    async with async_session() as db:
        result = await db.execute(
            select(Alquiler).where(Alquiler.uuid == alquiler_uuid)
        )
        alquiler = result.scalar_one_or_none()
        if not alquiler:
            await websocket.send_json({"error": "Alquiler no encontrado"})
            await websocket.close()
            return

        if not await validate_ws_ownership(db, int(user_id), alquiler):
            await websocket.send_json({"error": "Acceso denegado"})
            await websocket.close(code=4003, reason="Sin permisos")
            return

        alquiler_id = alquiler.id_alquiler

        if alquiler_id not in active_connections:
            active_connections[alquiler_id] = set()
        active_connections[alquiler_id].add(websocket)

    try:
        while True:
            async with async_session() as db:
                result = await db.execute(
                    select(Alquiler).where(Alquiler.id_alquiler == alquiler_id)
                )
                alquiler = result.scalar_one_or_none()

                cron_result = await db.execute(
                    select(CronometroAlquiler).where(
                        CronometroAlquiler.id_alquiler == alquiler_id,
                        CronometroAlquiler.activo == 1,
                    )
                )
                cronometro = cron_result.scalar_one_or_none()

                if not alquiler or not cronometro:
                    await websocket.send_json({"error": "Alquiler o cronometro no encontrado"})
                    break

                now = datetime.now(timezone.utc)
                if not cronometro.fecha_inicio:
                    await websocket.send_json({"error": "Cronometro sin fecha de inicio"})
                    break
                start = cronometro.fecha_inicio.replace(tzinfo=timezone.utc) if cronometro.fecha_inicio.tzinfo is None else cronometro.fecha_inicio
                elapsed_seconds = max(0, int((now - start).total_seconds()))
                minutos_transcurridos = elapsed_seconds // 60
                minutos_facturables = minutos_transcurridos

                tarifa = await get_tarifa_para_alquiler(db, alquiler)
                valor_minuto = float(tarifa.valor_minuto) if tarifa else 0
                valor_acumulado = round(minutos_facturables * valor_minuto, 2)

                cronometro.minutos_transcurridos = minutos_transcurridos
                cronometro.minutos_facturables = minutos_facturables
                cronometro.valor_acumulado = valor_acumulado
                await db.commit()

            await websocket.send_json({
                "alquiler_uuid": alquiler_uuid,
                "fecha_inicio": start.isoformat(),
                "minutos_transcurridos": minutos_transcurridos,
                "minutos_facturables": minutos_facturables,
                "valor_acumulado": valor_acumulado,
                "valor_minuto": valor_minuto,
                "activo": cronometro.activo == 1,
                "timestamp": now.isoformat(),
            })

            await asyncio.sleep(10)

    except WebSocketDisconnect:
        if alquiler_id in active_connections:
            active_connections[alquiler_id].discard(websocket)
            if not active_connections[alquiler_id]:
                del active_connections[alquiler_id]
        logger.info("WebSocket desconectado: alquiler=%s", alquiler_uuid)
    except Exception as e:
        logger.error("Error en WebSocket cronometro: %s", str(e))
        if alquiler_id in active_connections:
            active_connections[alquiler_id].discard(websocket)
