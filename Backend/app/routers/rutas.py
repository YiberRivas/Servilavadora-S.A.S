from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, Ruta, RutaGPS, UbicacionRuta, Alquiler,
    ClienteEmpresa, Repartidor, EstadoAlquiler,
    Lavadora, EstadoLavadora, CronometroAlquiler,
    TarifaEmpresa, LiquidacionAlquiler, PagoCliente, MetodoPago, EstadoPago,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import (
    RutaCreate, RutaUpdate, RutaGPSUpdate,
)
from app.dependencies import require_role, get_current_user
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from app.utils.push_notifications import create_notification_and_push
from app.utils.geolocation import haversine, estimate_time
from app.websockets.notifications import hub as notification_hub
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/rutas", tags=["Rutas"])


# --- Admin CRUD (existente) ---

@router.get("", response_model=PaginatedResponse)
async def list_rutas(
    id_empresa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Ruta)
    if id_empresa:
        query = query.where(Ruta.id_empresa == id_empresa)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Ruta.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    rutas = result.scalars().all()

    return PaginatedResponse(
        data=[
            {
                "uuid": r.uuid, "id_empresa": r.id_empresa, "nombre": r.nombre,
                "origen": r.origen, "destino": r.destino,
                "distancia_km": float(r.distancia_km) if r.distancia_km else None,
                "tiempo_estimado_minutos": r.tiempo_estimado_minutos,
                "activa": r.activa,
            }
            for r in rutas
        ],
        total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.post("", response_model=ApiResponse)
async def create_ruta(
    data: RutaCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    new_ruta = Ruta(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa, nombre=data.nombre,
        origen=data.origen, destino=data.destino,
        distancia_km=data.distancia_km, tiempo_estimado_minutos=data.tiempo_estimado_minutos,
        latitud_origen=data.latitud_origen, longitud_origen=data.longitud_origen,
        latitud_destino=data.latitud_destino, longitud_destino=data.longitud_destino,
    )
    db.add(new_ruta)
    await db.flush()
    return ApiResponse(success=True, message="Ruta creada", data={"uuid": new_ruta.uuid})


@router.put("/{ruta_uuid}", response_model=ApiResponse)
async def update_ruta(
    ruta_uuid: str, data: RutaUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Ruta).where(Ruta.uuid == ruta_uuid))
    ruta = result.scalar_one_or_none()
    if not ruta:
        return ApiResponse(success=False, message="Ruta no encontrada")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(ruta, key, value)
    await db.flush()
    return ApiResponse(success=True, message="Ruta actualizada")


@router.delete("/{ruta_uuid}", response_model=ApiResponse)
async def delete_ruta(
    ruta_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Ruta).where(Ruta.uuid == ruta_uuid))
    ruta = result.scalar_one_or_none()
    if not ruta:
        return ApiResponse(success=False, message="Ruta no encontrada")

    ruta.activa = 0
    await db.flush()
    return ApiResponse(success=True, message="Ruta desactivada")


# --- GPS Routing Endpoints ---

@router.get("/mia", response_model=ApiResponse)
async def get_my_route(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.rol.codigo == "CLIENTE":
        ce_result = await db.execute(
            select(ClienteEmpresa).where(
                ClienteEmpresa.id_usuario == current_user.id_usuario,
                ClienteEmpresa.estado == 1,
            )
        )
        cliente = ce_result.scalars().first()
        if not cliente:
            return ApiResponse(success=False, message="Cliente no encontrado")

        alq_result = await db.execute(
            select(Alquiler).where(
                Alquiler.id_cliente_empresa == cliente.id_cliente_empresa,
                Alquiler.estado == 1,
            ).order_by(Alquiler.created_at.desc())
        )
        alquiler = alq_result.scalar_one_or_none()
        if not alquiler:
            return ApiResponse(success=False, message="No hay alquiler activo")

        route_result = await db.execute(
            select(RutaGPS).where(RutaGPS.id_alquiler == alquiler.id_alquiler)
        )
        ruta_gps = route_result.scalar_one_or_none()
        if not ruta_gps:
            return ApiResponse(success=False, message="No hay ruta activa")

    elif current_user.rol.codigo == "REPARTIDOR":
        rep_ids = [r.id_repartidor for r in (await db.execute(
            select(Repartidor).where(
                Repartidor.id_usuario == current_user.id_usuario,
                Repartidor.estado == 1,
            )
        )).scalars().all()]
        if not rep_ids:
            return ApiResponse(success=False, message="Repartidor no encontrado")

        route_result = await db.execute(
            select(RutaGPS).where(
                RutaGPS.id_repartidor.in_(rep_ids),
                RutaGPS.estado.in_(["EN_CURSO", "PENDIENTE"]),
            ).order_by(RutaGPS.created_at.desc())
        )
        ruta_gps = route_result.scalar_one_or_none()
        if not ruta_gps:
            return ApiResponse(success=False, message="No hay ruta activa")
    else:
        return ApiResponse(success=False, message="Rol no permitido")

    rep_result = await db.execute(
        select(Repartidor).where(Repartidor.id_repartidor == ruta_gps.id_repartidor)
    )
    rep = rep_result.scalar_one_or_none()
    user_result = await db.execute(
        select(Usuario).where(Usuario.id_usuario == rep.id_usuario) if rep else select(Usuario).where(Usuario.id_usuario == 0)
    )
    rep_user = user_result.scalar_one_or_none()

    alq_result = await db.execute(
        select(Alquiler).where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()
    alquiler_estado = ""
    alquiler_uuid = ""
    if alquiler:
        alquiler_uuid = alquiler.uuid
        alq_estado_result = await db.execute(
            select(EstadoAlquiler).where(EstadoAlquiler.id_estado_alquiler == alquiler.id_estado_alquiler)
        )
        alq_estado = alq_estado_result.scalar_one_or_none()
        alquiler_estado = alq_estado.codigo if alq_estado else ""

    return ApiResponse(success=True, message="OK", data={
        "uuid": ruta_gps.uuid,
        "alquiler_uuid": alquiler_uuid,
        "alquiler_estado": alquiler_estado,
        "repartidor_nombre": f"{rep_user.persona.nombres} {rep_user.persona.apellidos}" if rep_user and rep_user.persona else None,
        "latitud_actual": float(ruta_gps.latitud_actual) if ruta_gps.latitud_actual else None,
        "longitud_actual": float(ruta_gps.longitud_actual) if ruta_gps.longitud_actual else None,
        "latitud_destino": float(ruta_gps.latitud_destino) if ruta_gps.latitud_destino else None,
        "longitud_destino": float(ruta_gps.longitud_destino) if ruta_gps.longitud_destino else None,
        "latitud_cliente": float(ruta_gps.latitud_cliente) if ruta_gps.latitud_cliente else None,
        "longitud_cliente": float(ruta_gps.longitud_cliente) if ruta_gps.longitud_cliente else None,
        "velocidad": float(ruta_gps.velocidad) if ruta_gps.velocidad else 0,
        "heading": float(ruta_gps.heading) if ruta_gps.heading else 0,
        "distancia_restante_metros": ruta_gps.distancia_restante_metros or 0,
        "tiempo_estimado_segundos": ruta_gps.tiempo_estimado_segundos or 0,
        "estado": ruta_gps.estado,
        "fecha_inicio": ruta_gps.fecha_inicio.isoformat() if ruta_gps.fecha_inicio else None,
        "fecha_fin": ruta_gps.fecha_fin.isoformat() if ruta_gps.fecha_fin else None,
        "created_at": ruta_gps.created_at.isoformat() if ruta_gps.created_at else None,
    })


@router.get("/{uuid}", response_model=ApiResponse)
async def get_route_detail(
    uuid: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    if current_user.rol.codigo == "CLIENTE":
        ce_result = await db.execute(
            select(ClienteEmpresa).where(ClienteEmpresa.id_usuario == current_user.id_usuario)
        )
        cliente = ce_result.scalar_one_or_none()
        alq_result = await db.execute(
            select(Alquiler).where(
                Alquiler.id_alquiler == ruta_gps.id_alquiler,
                Alquiler.id_cliente_empresa == cliente.id_cliente_empresa if cliente else Alquiler.id_alquiler == 0,
            )
        )
        if not alq_result.scalar_one_or_none():
            return ApiResponse(success=False, message="Acceso denegado")

    elif current_user.rol.codigo == "REPARTIDOR":
        rep_result = await db.execute(
            select(Repartidor).where(
                Repartidor.id_usuario == current_user.id_usuario,
                Repartidor.id_repartidor == ruta_gps.id_repartidor,
            ).limit(1)
        )
        rep = rep_result.scalar_one_or_none()
        if not rep:
            return ApiResponse(success=False, message="Acceso denegado")

    rep_result = await db.execute(
        select(Repartidor).where(Repartidor.id_repartidor == ruta_gps.id_repartidor)
    )
    rep = rep_result.scalar_one_or_none()
    rep_user = None
    if rep:
        user_result = await db.execute(
            select(Usuario).where(Usuario.id_usuario == rep.id_usuario)
        )
        rep_user = user_result.scalar_one_or_none()

    alq_result = await db.execute(
        select(Alquiler).where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()
    alquiler_estado = ""
    alquiler_uuid = ""
    if alquiler:
        alquiler_uuid = alquiler.uuid
        alq_estado_result = await db.execute(
            select(EstadoAlquiler).where(EstadoAlquiler.id_estado_alquiler == alquiler.id_estado_alquiler)
        )
        alq_estado = alq_estado_result.scalar_one_or_none()
        alquiler_estado = alq_estado.codigo if alq_estado else ""

    return ApiResponse(success=True, message="OK", data={
        "uuid": ruta_gps.uuid,
        "alquiler_uuid": alquiler_uuid,
        "alquiler_estado": alquiler_estado,
        "repartidor_nombre": f"{rep_user.persona.nombres} {rep_user.persona.apellidos}" if rep_user and rep_user.persona else None,
        "latitud_actual": float(ruta_gps.latitud_actual) if ruta_gps.latitud_actual else None,
        "longitud_actual": float(ruta_gps.longitud_actual) if ruta_gps.longitud_actual else None,
        "latitud_destino": float(ruta_gps.latitud_destino) if ruta_gps.latitud_destino else None,
        "longitud_destino": float(ruta_gps.longitud_destino) if ruta_gps.longitud_destino else None,
        "latitud_cliente": float(ruta_gps.latitud_cliente) if ruta_gps.latitud_cliente else None,
        "longitud_cliente": float(ruta_gps.longitud_cliente) if ruta_gps.longitud_cliente else None,
        "velocidad": float(ruta_gps.velocidad) if ruta_gps.velocidad else 0,
        "heading": float(ruta_gps.heading) if ruta_gps.heading else 0,
        "distancia_restante_metros": ruta_gps.distancia_restante_metros or 0,
        "tiempo_estimado_segundos": ruta_gps.tiempo_estimado_segundos or 0,
        "estado": ruta_gps.estado,
        "fecha_inicio": ruta_gps.fecha_inicio.isoformat() if ruta_gps.fecha_inicio else None,
        "fecha_fin": ruta_gps.fecha_fin.isoformat() if ruta_gps.fecha_fin else None,
        "created_at": ruta_gps.created_at.isoformat() if ruta_gps.created_at else None,
    })


@router.get("/{uuid}/historial", response_model=ApiResponse)
async def get_route_history(
    uuid: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    loc_result = await db.execute(
        select(UbicacionRuta)
        .where(UbicacionRuta.id_ruta_gps == ruta_gps.id_ruta_gps)
        .order_by(UbicacionRuta.timestampGPS.asc())
    )
    ubicaciones = loc_result.scalars().all()

    total_distancia = 0
    tiempo_total = 0
    velocidades = []

    for i, u in enumerate(ubicaciones):
        if i > 0:
            prev = ubicaciones[i - 1]
            d = haversine(float(prev.latitud), float(prev.longitud), float(u.latitud), float(u.longitud))
            total_distancia += d
        if u.velocidad and float(u.velocidad) > 0:
            velocidades.append(float(u.velocidad))

    if ubicaciones and len(ubicaciones) >= 2:
        first_ts = ubicaciones[0].timestampGPS
        last_ts = ubicaciones[-1].timestampGPS
        if first_ts and last_ts:
            diff = last_ts - first_ts
            tiempo_total = int(diff.total_seconds())

    vel_promedio = sum(velocidades) / len(velocidades) if velocidades else 0

    puntos = [
        {
            "latitud": float(u.latitud),
            "longitud": float(u.longitud),
            "velocidad": float(u.velocidad) if u.velocidad else 0,
            "heading": float(u.heading) if u.heading else 0,
            "timestamp": u.timestampGPS.isoformat() if u.timestampGPS else None,
        }
        for u in ubicaciones
    ]

    return ApiResponse(success=True, message="OK", data={
        "uuid": ruta_gps.uuid,
        "estado": ruta_gps.estado,
        "fecha_inicio": ruta_gps.fecha_inicio.isoformat() if ruta_gps.fecha_inicio else None,
        "fecha_fin": ruta_gps.fecha_fin.isoformat() if ruta_gps.fecha_fin else None,
        "total_distancia_metros": round(total_distancia, 2),
        "tiempo_total_segundos": tiempo_total,
        "velocidad_promedio_kmh": round(vel_promedio, 2),
        "total_puntos": len(ubicaciones),
        "puntos": puntos,
    })


@router.post("/{uuid}/iniciar", response_model=ApiResponse)
async def start_route(
    uuid: str,
    current_user: Usuario = Depends(require_role("REPARTIDOR")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    rep_result = await db.execute(
        select(Repartidor).where(
            Repartidor.id_usuario == current_user.id_usuario,
            Repartidor.id_repartidor == ruta_gps.id_repartidor,
        ).limit(1)
    )
    repartidor = rep_result.scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    if ruta_gps.estado != "PENDIENTE":
        return ApiResponse(success=False, message="La ruta ya fue iniciada")

    now = datetime.now(timezone.utc)
    ruta_gps.estado = "EN_CURSO"
    ruta_gps.fecha_inicio = now
    ruta_gps.ultima_actualizacion = now
    await db.flush()

    alq_result = await db.execute(
        select(Alquiler).where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()

    if alquiler:
        alq_estado_actual = (await db.execute(
            select(EstadoAlquiler).where(EstadoAlquiler.id_estado_alquiler == alquiler.id_estado_alquiler)
        )).scalar_one_or_none()
        if alq_estado_actual and alq_estado_actual.codigo in ("PENDIENTE",):
            estado_camino = (await db.execute(
                select(EstadoAlquiler).where(EstadoAlquiler.codigo == "CAMINO")
            )).scalar_one_or_none()
            if estado_camino:
                alquiler.id_estado_alquiler = estado_camino.id_estado_alquiler
                alquiler.fecha_inicio = now
                await db.flush()

        ce_result = await db.execute(
            select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa)
        )
        cliente = ce_result.scalar_one_or_none()
        if cliente:
            await create_notification_and_push(
                db, cliente.id_usuario,
                titulo="Repartidor en camino",
                mensaje="El repartidor ha iniciado el recorrido hacia tu ubicacion.",
                tipo="SERVICIO",
                icono="truck-delivery",
                color="#12A594",
                data={"ruta_uuid": ruta_gps.uuid, "alquiler_uuid": alquiler.uuid},
            )

        try:
            await notification_hub.broadcast_to_cliente(
                alquiler.id_cliente_empresa,
                "repartidor_en_camino",
                {"alquiler_uuid": alquiler.uuid, "ruta_uuid": ruta_gps.uuid}
            )
        except Exception:
            pass

    return ApiResponse(success=True, message="Ruta iniciada", data={"uuid": ruta_gps.uuid})


@router.post("/{uuid}/entregar", response_model=ApiResponse)
async def entregar_lavadora(
    uuid: str,
    current_user: Usuario = Depends(require_role("REPARTIDOR")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    rep_result = await db.execute(
        select(Repartidor).where(
            Repartidor.id_usuario == current_user.id_usuario,
            Repartidor.id_repartidor == ruta_gps.id_repartidor,
        ).limit(1)
    )
    repartidor = rep_result.scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    if ruta_gps.estado != "EN_CURSO":
        return ApiResponse(success=False, message="La ruta no esta en curso")

    alq_result = await db.execute(
        select(Alquiler)
        .options(selectinload(Alquiler.estado_alquiler_rel))
        .where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()
    if not alquiler:
        return ApiResponse(success=False, message="Alquiler no encontrado")

    alq_estado = alquiler.estado_alquiler_rel.codigo if alquiler.estado_alquiler_rel else ""
    if alq_estado not in ("CAMINO",):
        return ApiResponse(success=False, message=f"Estado del alquiler invalido para entrega: {alq_estado}. Se requiere CAMINO.")

    estado_activo = (await db.execute(
        select(EstadoAlquiler).where(EstadoAlquiler.codigo == "ACTIVO")
    )).scalar_one_or_none()
    if not estado_activo:
        return ApiResponse(success=False, message="Estado ACTIVO no encontrado en el sistema")

    now = datetime.now(timezone.utc)
    alquiler.id_estado_alquiler = estado_activo.id_estado_alquiler
    alquiler.updated_at = now

    cron_result = await db.execute(
        select(CronometroAlquiler).where(CronometroAlquiler.id_alquiler == alquiler.id_alquiler)
    )
    cronometro = cron_result.scalar_one_or_none()
    if cronometro:
        cronometro.fecha_inicio = now
        cronometro.activo = 1

    await db.flush()

    ce_result = await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa)
    )
    cliente = ce_result.scalar_one_or_none()
    if cliente:
        await create_notification_and_push(
            db, cliente.id_usuario,
            titulo="Lavadora entregada",
            mensaje="La lavadora fue entregada correctamente en tu ubicacion.",
            tipo="SERVICIO",
            icono="washing-machine",
            color="#10B981",
            data={"ruta_uuid": ruta_gps.uuid, "alquiler_uuid": alquiler.uuid},
        )

    try:
        await notification_hub.broadcast_to_cliente(
            alquiler.id_cliente_empresa,
            "lavadora_entregada",
            {"alquiler_uuid": alquiler.uuid, "ruta_uuid": ruta_gps.uuid}
        )
        await notification_hub.broadcast_to_empresa(
            ruta_gps.id_empresa,
            "estado_servicio",
            {"alquiler_uuid": alquiler.uuid, "estado": "ACTIVO"}
        )
    except Exception:
        pass

    return ApiResponse(success=True, message="Lavadora entregada", data={"uuid": ruta_gps.uuid})


@router.post("/{uuid}/finalizar", response_model=ApiResponse)
async def finish_route(
    uuid: str,
    current_user: Usuario = Depends(require_role("REPARTIDOR")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    rep_result = await db.execute(
        select(Repartidor).where(
            Repartidor.id_usuario == current_user.id_usuario,
            Repartidor.id_repartidor == ruta_gps.id_repartidor,
        ).limit(1)
    )
    repartidor = rep_result.scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    if ruta_gps.estado != "EN_CURSO":
        return ApiResponse(success=False, message="La ruta no esta en curso")

    now = datetime.now(timezone.utc)
    ruta_gps.estado = "FINALIZADA"
    ruta_gps.fecha_fin = now
    ruta_gps.ultima_actualizacion = now
    ruta_gps.distancia_restante_metros = 0
    ruta_gps.tiempo_estimado_segundos = 0
    await db.flush()

    alq_result = await db.execute(
        select(Alquiler).where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()
    if alquiler:
        ce_result = await db.execute(
            select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa)
        )
        cliente = ce_result.scalar_one_or_none()
        if cliente:
            await create_notification_and_push(
                db, cliente.id_usuario,
                titulo="Servicio finalizado",
                mensaje="El repartidor ha finalizado la ruta. El servicio ha concluido.",
                tipo="SERVICIO",
                icono="check-circle",
                color="#10B981",
                data={"ruta_uuid": ruta_gps.uuid, "alquiler_uuid": alquiler.uuid},
            )

    return ApiResponse(success=True, message="Ruta finalizada", data={"uuid": ruta_gps.uuid})


@router.put("/{uuid}/ubicacion", response_model=ApiResponse)
async def update_location(
    uuid: str,
    data: RutaGPSUpdate,
    current_user: Usuario = Depends(require_role("REPARTIDOR")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    rep_result = await db.execute(
        select(Repartidor).where(
            Repartidor.id_usuario == current_user.id_usuario,
            Repartidor.id_repartidor == ruta_gps.id_repartidor,
        ).limit(1)
    )
    repartidor = rep_result.scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    now = datetime.now(timezone.utc)
    ruta_gps.latitud_actual = data.latitud
    ruta_gps.longitud_actual = data.longitud
    ruta_gps.precision_gps = data.precision
    ruta_gps.heading = data.heading
    ruta_gps.velocidad = data.velocidad
    ruta_gps.ultima_actualizacion = now

    if ruta_gps.latitud_destino and ruta_gps.longitud_destino:
        dist = haversine(data.latitud, data.longitud, float(ruta_gps.latitud_destino), float(ruta_gps.longitud_destino))
        ruta_gps.distancia_restante_metros = int(dist)
        ruta_gps.tiempo_estimado_segundos = estimate_time(dist, float(data.velocidad) if data.velocidad else 0)

        if dist <= 500 and ruta_gps.estado == "EN_CURSO" and not ruta_gps.notificado_cerca:
                ruta_gps.notificado_cerca = 1
                alq_result = await db.execute(
                    select(Alquiler).where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
                )
                alquiler = alq_result.scalar_one_or_none()
                if alquiler:
                    ce_result = await db.execute(
                        select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa)
                    )
                    cliente = ce_result.scalar_one_or_none()
                    if cliente:
                        await create_notification_and_push(
                            db, cliente.id_usuario,
                            titulo="Repartidor cerca",
                            mensaje="El repartidor esta cerca de tu ubicacion.",
                            tipo="SERVICIO",
                            icono="map-marker-check",
                            color="#12A594",
                            data={"ruta_uuid": ruta_gps.uuid},
                        )

    timestampGPS = datetime.fromisoformat(data.timestamp.replace("Z", "+00:00")) if data.timestamp else now

    ubicacion = UbicacionRuta(
        uuid=generate_uuid(),
        id_ruta_gps=ruta_gps.id_ruta_gps,
        latitud=data.latitud,
        longitud=data.longitud,
        precision_gps=data.precision,
        heading=data.heading,
        velocidad=data.velocidad,
        timestampGPS=timestampGPS,
    )
    db.add(ubicacion)
    await db.flush()

    return ApiResponse(success=True, message="Ubicacion actualizada", data={
        "distancia_restante_metros": ruta_gps.distancia_restante_metros,
        "tiempo_estimado_segundos": ruta_gps.tiempo_estimado_segundos,
    })


@router.post("/{uuid}/recoger-lavadora", response_model=ApiResponse)
async def recoger_lavadora(
    uuid: str,
    metodo_pago: str = Body("EFECTIVO", embed=True),
    current_user: Usuario = Depends(require_role("REPARTIDOR")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RutaGPS).where(RutaGPS.uuid == uuid)
    )
    ruta_gps = result.scalar_one_or_none()
    if not ruta_gps:
        return ApiResponse(success=False, message="Ruta no encontrada")

    rep_result = await db.execute(
        select(Repartidor).where(
            Repartidor.id_usuario == current_user.id_usuario,
            Repartidor.id_repartidor == ruta_gps.id_repartidor,
        ).limit(1)
    )
    repartidor = rep_result.scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    if ruta_gps.estado != "EN_CURSO":
        return ApiResponse(success=False, message="La ruta no esta en curso")

    alq_result = await db.execute(
        select(Alquiler).where(Alquiler.id_alquiler == ruta_gps.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()
    if not alquiler:
        return ApiResponse(success=False, message="Alquiler no encontrado")

    alq_estado = (await db.execute(
        select(EstadoAlquiler).where(EstadoAlquiler.id_estado_alquiler == alquiler.id_estado_alquiler)
    )).scalar_one_or_none()
    if not alq_estado or alq_estado.codigo != "FINALIZACION":
        return ApiResponse(
            success=False,
            message=f"Estado del alquiler invalido: {alq_estado.codigo if alq_estado else 'DESCONOCIDO'}. Se requiere FINALIZACION.",
        )

    estado_finalizado = (await db.execute(
        select(EstadoAlquiler).where(EstadoAlquiler.codigo == "FINALIZADO")
    )).scalar_one_or_none()
    if not estado_finalizado:
        return ApiResponse(success=False, message="Estado FINALIZADO no encontrado en el sistema")

    now = datetime.now(timezone.utc)

    alquiler.id_estado_alquiler = estado_finalizado.id_estado_alquiler
    alquiler.fecha_fin = now
    alquiler.updated_at = now

    ruta_gps.estado = "FINALIZADA"
    ruta_gps.fecha_fin = now
    ruta_gps.ultima_actualizacion = now
    ruta_gps.distancia_restante_metros = 0
    ruta_gps.tiempo_estimado_segundos = 0

    lav_result = await db.execute(
        select(Lavadora).where(Lavadora.id_lavadora == alquiler.id_lavadora)
    )
    lavadora = lav_result.scalar_one_or_none()
    if lavadora:
        lavadora.disponible = 1
        disp_estado = (await db.execute(
            select(EstadoLavadora).where(EstadoLavadora.codigo == "DISPONIBLE")
        )).scalar_one_or_none()
        if disp_estado:
            lavadora.id_estado_lavadora = disp_estado.id_estado_lavadora

    repartidor.disponible = 1

    cron_result = await db.execute(
        select(CronometroAlquiler).where(CronometroAlquiler.id_alquiler == alquiler.id_alquiler)
    )
    cronometro = cron_result.scalar_one_or_none()
    if cronometro and cronometro.activo:
        cronometro.fecha_fin = now
        cronometro.activo = 0
        if cronometro.fecha_inicio:
            diff = now - cronometro.fecha_inicio
            cronometro.minutos_transcurridos = int(diff.total_seconds() / 60)
            cronometro.minutos_facturables = cronometro.minutos_transcurridos

        if lavadora and lavadora.id_capacidad_lavadora:
            tarifa = (await db.execute(
                select(TarifaEmpresa).where(
                    TarifaEmpresa.id_empresa == ruta_gps.id_empresa,
                    TarifaEmpresa.id_capacidad_lavadora == lavadora.id_capacidad_lavadora,
                    TarifaEmpresa.activa == 1,
                )
            )).scalar_one_or_none()
            if tarifa:
                cronometro.valor_acumulado = cronometro.minutos_facturables * float(tarifa.valor_minuto)
                alquiler.valor_total = cronometro.valor_acumulado
                alquiler.minutos_facturados = cronometro.minutos_facturables

    alquiler.metodo_pago = metodo_pago.upper()

    liquidacion = LiquidacionAlquiler(
        uuid=generate_uuid(),
        id_alquiler=alquiler.id_alquiler,
        tiempo_real_minutos=cronometro.minutos_transcurridos if cronometro else 0,
        tiempo_facturado_minutos=cronometro.minutos_facturables if cronometro else 0,
        subtotal=alquiler.valor_total or 0,
        total=alquiler.valor_total or 0,
        fecha_liquidacion=now,
    )
    db.add(liquidacion)
    await db.flush()

    metodo_pago_obj = (await db.execute(
        select(MetodoPago).where(MetodoPago.nombre.ilike(f"%{metodo_pago}%"))
    )).scalar_one_or_none()
    if not metodo_pago_obj:
        metodo_pago_obj = (await db.execute(
            select(MetodoPago).where(MetodoPago.nombre.ilike("%efectivo%"))
        )).scalar_one_or_none()

    estado_pago = (await db.execute(
        select(EstadoPago).where(EstadoPago.codigo == "PAGADO")
    )).scalar_one_or_none()

    if metodo_pago_obj and estado_pago and alquiler.valor_total and alquiler.valor_total > 0:
        pago = PagoCliente(
            uuid=generate_uuid(),
            id_liquidacion_alquiler=liquidacion.id_liquidacion_alquiler,
            id_metodo_pago=metodo_pago_obj.id_metodo_pago,
            id_estado_pago=estado_pago.id_estado_pago,
            valor=alquiler.valor_total,
            fecha_pago=now,
            observaciones=f"Pago por servicio de lavado - {metodo_pago.upper()}",
        )
        db.add(pago)
        await db.flush()

    ce_result = await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa)
    )
    cliente = ce_result.scalar_one_or_none()
    if cliente:
        await create_notification_and_push(
            db, cliente.id_usuario,
            titulo="Servicio finalizado",
            mensaje=f"La lavadora ha sido recogida. Pago registrado: {metodo_pago.upper()}. Total: ${alquiler.valor_total or 0}",
            tipo="SERVICIO",
            icono="check-circle",
            color="#10B981",
            data={"ruta_uuid": ruta_gps.uuid, "alquiler_uuid": alquiler.uuid},
        )

    try:
        await notification_hub.broadcast_to_cliente(
            alquiler.id_cliente_empresa,
            "servicio_finalizado",
            {"alquiler_uuid": alquiler.uuid, "ruta_uuid": ruta_gps.uuid, "valor_total": float(alquiler.valor_total or 0)}
        )
        await notification_hub.broadcast_to_empresa(
            ruta_gps.id_empresa,
            "estado_servicio",
            {"alquiler_uuid": alquiler.uuid, "estado": "FINALIZADO"}
        )
    except Exception:
        pass

    await db.flush()

    return ApiResponse(success=True, message="Lavadora recogida, pago registrado y servicio finalizado", data={
        "alquiler_uuid": alquiler.uuid,
        "ruta_uuid": ruta_gps.uuid,
        "estado_alquiler": estado_finalizado.nombre,
        "estado_ruta": ruta_gps.estado,
        "metodo_pago": metodo_pago.upper(),
        "valor_total": float(alquiler.valor_total or 0),
        "mensaje": "La lavadora fue recogida, el pago fue registrado y los recursos fueron liberados.",
    })
