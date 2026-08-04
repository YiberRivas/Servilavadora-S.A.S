from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, Repartidor, Alquiler, RutaGPS, UbicacionRuta,
    ClienteEmpresa, Persona, SolicitudAlquiler, Empresa,
    EstadoAlquiler, Lavadora, MarcaLavadora, ModeloLavadora,
    CapacidadLavadora, HistorialAlquiler, AsignacionSolicitud,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import get_current_user
from app.utils.logging import get_logger
from app.utils.geolocation import haversine
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/repartidor", tags=["Repartidor"])


async def get_repartidor_from_user(db, user_id: int):
    result = await db.execute(
        select(Repartidor).where(
            Repartidor.id_usuario == user_id,
            Repartidor.estado == 1,
        ).limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/dashboard", response_model=ApiResponse)
async def get_dashboard(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.rol.codigo != "REPARTIDOR":
        return ApiResponse(success=False, message="Solo repartidores pueden acceder")

    rep = await get_repartidor_from_user(db, current_user.id_usuario)
    if not rep:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    pendiente_ids = [s[0] for s in (await db.execute(
        select(EstadoAlquiler.id_estado_alquiler).where(
            EstadoAlquiler.codigo.in_(["PENDIENTE", "FINALIZACION"])
        )
    )).fetchall()]
    pendientes = (await db.execute(
        select(func.count()).select_from(Alquiler).where(
            Alquiler.id_repartidor == rep.id_repartidor,
            Alquiler.id_estado_alquiler.in_(pendiente_ids) if pendiente_ids else Alquiler.id_alquiler == 0,
            Alquiler.estado == 1,
        )
    )).scalar() or 0

    activo_ids = [s[0] for s in (await db.execute(
        select(EstadoAlquiler.id_estado_alquiler).where(
            EstadoAlquiler.codigo.in_(["CAMINO", "ACTIVO"])
        )
    )).fetchall()]
    activos = (await db.execute(
        select(func.count()).select_from(Alquiler).where(
            Alquiler.id_repartidor == rep.id_repartidor,
            Alquiler.id_estado_alquiler.in_(activo_ids) if activo_ids else Alquiler.id_alquiler == 0,
            Alquiler.estado == 1,
        )
    )).scalar() or 0

    finalizado_ids = [s[0] for s in (await db.execute(
        select(EstadoAlquiler.id_estado_alquiler).where(
            EstadoAlquiler.codigo == "FINALIZADO"
        )
    )).fetchall()]
    finalizados = (await db.execute(
        select(func.count()).select_from(Alquiler).where(
            Alquiler.id_repartidor == rep.id_repartidor,
            Alquiler.id_estado_alquiler.in_(finalizado_ids) if finalizado_ids else Alquiler.id_alquiler == 0,
        )
    )).scalar() or 0

    kilometros = (await db.execute(
        select(func.coalesce(func.sum(UbicacionRuta.velocidad), 0)).select_from(
            UbicacionRuta
        ).join(RutaGPS, RutaGPS.id_ruta_gps == UbicacionRuta.id_ruta_gps).where(
            RutaGPS.id_repartidor == rep.id_repartidor,
            RutaGPS.estado == "FINALIZADA",
        )
    )).scalar() or 0

    tiempo_rows = await db.execute(
        select(
            func.coalesce(
                func.sum(
                    func.TIMESTAMPDIFF(
                        text("SECOND"),
                        RutaGPS.fecha_inicio,
                        RutaGPS.fecha_fin
                    )
                ),
                0
            )
        ).where(
            RutaGPS.id_repartidor == rep.id_repartidor,
            RutaGPS.estado == "FINALIZADA",
            RutaGPS.fecha_inicio.isnot(None),
            RutaGPS.fecha_fin.isnot(None),
        )
    )
    tiempo_trabajado = tiempo_rows.scalar() or 0

    return ApiResponse(success=True, message="OK", data={
        "entregasPendientes": pendientes,
        "entregasActivas": activos,
        "entregasFinalizadas": finalizados,
        "kilometrosRecorridos": round(kilometros / 1000, 2) if kilometros else 0,
        "tiempoTrabajado": tiempo_trabajado,
        "calificacion": 4.8,
        "disponibilidad": rep.disponible == 1,
    })


@router.get("/asignaciones", response_model=ApiResponse)
async def get_asignaciones(
    estado: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.rol.codigo != "REPARTIDOR":
        return ApiResponse(success=False, message="Solo repartidores pueden acceder")

    rep = await get_repartidor_from_user(db, current_user.id_usuario)
    if not rep:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    query = (
        select(Alquiler)
        .where(Alquiler.id_repartidor == rep.id_repartidor, Alquiler.estado == 1)
    )

    if estado:
        estado_rows = await db.execute(
            select(EstadoAlquiler.id_estado_alquiler).where(
                EstadoAlquiler.codigo == estado
            )
        )
        estado_ids = [r[0] for r in estado_rows.fetchall()]
        if estado_ids:
            query = query.where(Alquiler.id_estado_alquiler.in_(estado_ids))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Alquiler.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    alquileres = result.scalars().all()

    sol_ids = list({a.id_solicitud_alquiler for a in alquileres if a.id_solicitud_alquiler})
    sol_map = {}
    if sol_ids:
        sol_q = select(SolicitudAlquiler).where(SolicitudAlquiler.id_solicitud_alquiler.in_(sol_ids))
        sol_map = {s.id_solicitud_alquiler: s for s in (await db.execute(sol_q)).scalars().all()}

    emp_ids = list({s.id_empresa for s in sol_map.values() if s.id_empresa})
    emp_map = {}
    if emp_ids:
        emp_q = select(Empresa).where(Empresa.id_empresa.in_(emp_ids))
        emp_map = {e.id_empresa: e for e in (await db.execute(emp_q)).scalars().all()}

    ce_ids = list({a.id_cliente_empresa for a in alquileres if a.id_cliente_empresa})
    ce_map = {}
    if ce_ids:
        ce_q = select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa.in_(ce_ids))
        ce_map = {c.id_cliente_empresa: c for c in (await db.execute(ce_q)).scalars().all()}

    user_ids = list({c.id_usuario for c in ce_map.values() if c.id_usuario})
    user_map = {}
    if user_ids:
        user_q = select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario.in_(user_ids))
        user_map = {u.id_usuario: u for u in (await db.execute(user_q)).scalars().unique().all()}

    est_ids = list({a.id_estado_alquiler for a in alquileres})
    est_map = {}
    if est_ids:
        est_q = select(EstadoAlquiler).where(EstadoAlquiler.id_estado_alquiler.in_(est_ids))
        est_map = {e.id_estado_alquiler: e for e in (await db.execute(est_q)).scalars().all()}

    alq_ids = [a.id_alquiler for a in alquileres]
    ruta_q = select(RutaGPS.id_alquiler, RutaGPS.uuid).where(RutaGPS.id_alquiler.in_(alq_ids)).limit(len(alq_ids))
    ruta_map = {r.id_alquiler: r.uuid for r in (await db.execute(ruta_q)).all()}

    data = []
    for a in alquileres:
        sol = sol_map.get(a.id_solicitud_alquiler)
        emp = emp_map.get(sol.id_empresa) if sol else None
        empresa_nombre = emp.nombre_comercial or emp.razon_social if emp else ""

        cliente_nombre = ""
        ce = ce_map.get(a.id_cliente_empresa)
        if ce:
            u = user_map.get(ce.id_usuario)
            if u and u.persona:
                cliente_nombre = f"{u.persona.nombres} {u.persona.apellidos}"

        direccion = sol.direccion_entrega if sol else ""
        est = est_map.get(a.id_estado_alquiler)
        ruta_uuid = ruta_map.get(a.id_alquiler)

        data.append({
            "uuid": a.uuid,
            "rutaUuid": str(ruta_uuid) if ruta_uuid else None,
            "empresa": empresa_nombre,
            "cliente": cliente_nombre,
            "direccion": direccion,
            "estado": est.codigo if est else "",
            "estadoNombre": est.nombre if est else "",
            "fechaInicio": a.fecha_inicio.isoformat() if a.fecha_inicio else None,
            "fechaFin": a.fecha_fin.isoformat() if a.fecha_fin else None,
            "valorTotal": float(a.valor_total) if a.valor_total else 0,
        })

    return ApiResponse(success=True, message="OK", data={
        "items": data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": ceil(total / per_page) if per_page > 0 else 0,
    })


@router.get("/historial", response_model=ApiResponse)
async def get_historial(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.rol.codigo != "REPARTIDOR":
        return ApiResponse(success=False, message="Solo repartidores pueden acceder")

    rep = await get_repartidor_from_user(db, current_user.id_usuario)
    if not rep:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    finalizado_ids = [s[0] for s in (await db.execute(
        select(EstadoAlquiler.id_estado_alquiler).where(
            EstadoAlquiler.codigo == "FINALIZADO"
        )
    )).fetchall()]
    query = (
        select(Alquiler)
        .where(
            Alquiler.id_repartidor == rep.id_repartidor,
            Alquiler.id_estado_alquiler.in_(finalizado_ids) if finalizado_ids else Alquiler.id_alquiler == 0,
        )
    )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Alquiler.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    alquileres = result.scalars().all()

    sol_ids = list({a.id_solicitud_alquiler for a in alquileres if a.id_solicitud_alquiler})
    sol_map = {}
    if sol_ids:
        sol_q = select(SolicitudAlquiler).where(SolicitudAlquiler.id_solicitud_alquiler.in_(sol_ids))
        sol_map = {s.id_solicitud_alquiler: s for s in (await db.execute(sol_q)).scalars().all()}

    emp_ids = list({s.id_empresa for s in sol_map.values() if s.id_empresa})
    emp_map = {}
    if emp_ids:
        emp_q = select(Empresa).where(Empresa.id_empresa.in_(emp_ids))
        emp_map = {e.id_empresa: e for e in (await db.execute(emp_q)).scalars().all()}

    ce_ids = list({a.id_cliente_empresa for a in alquileres if a.id_cliente_empresa})
    ce_map = {}
    if ce_ids:
        ce_q = select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa.in_(ce_ids))
        ce_map = {c.id_cliente_empresa: c for c in (await db.execute(ce_q)).scalars().all()}

    user_ids = list({c.id_usuario for c in ce_map.values() if c.id_usuario})
    user_map = {}
    if user_ids:
        user_q = select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario.in_(user_ids))
        user_map = {u.id_usuario: u for u in (await db.execute(user_q)).scalars().unique().all()}

    alq_ids = [a.id_alquiler for a in alquileres]
    ruta_q = select(RutaGPS).where(RutaGPS.id_alquiler.in_(alq_ids))
    rutas = (await db.execute(ruta_q)).scalars().all()
    ruta_map = {r.id_alquiler: r for r in rutas}

    ruta_ids = [r.id_ruta_gps for r in rutas]
    ubicaciones_map = {}
    if ruta_ids:
        loc_q = (
            select(UbicacionRuta)
            .where(UbicacionRuta.id_ruta_gps.in_(ruta_ids))
            .order_by(UbicacionRuta.id_ruta_gps, UbicacionRuta.timestampGPS.asc())
        )
        all_locs = (await db.execute(loc_q)).scalars().all()
        for loc in all_locs:
            ubicaciones_map.setdefault(loc.id_ruta_gps, []).append(loc)

    data = []
    for a in alquileres:
        sol = sol_map.get(a.id_solicitud_alquiler)
        emp = emp_map.get(sol.id_empresa) if sol else None
        empresa_nombre = emp.nombre_comercial or emp.razon_social if emp else ""

        cliente_nombre = ""
        ce = ce_map.get(a.id_cliente_empresa)
        if ce:
            u = user_map.get(ce.id_usuario)
            if u and u.persona:
                cliente_nombre = f"{u.persona.nombres} {u.persona.apellidos}"

        direccion = sol.direccion_entrega if sol else ""

        duracion = 0
        kilometros = 0.0
        if a.fecha_inicio and a.fecha_fin:
            duracion = int((a.fecha_fin - a.fecha_inicio).total_seconds())

        ruta = ruta_map.get(a.id_alquiler)
        ubicaciones = ubicaciones_map.get(ruta.id_ruta_gps, []) if ruta else []
        for i, u in enumerate(ubicaciones):
            if i > 0:
                prev = ubicaciones[i - 1]
                d = haversine(float(prev.latitud), float(prev.longitud), float(u.latitud), float(u.longitud))
                kilometros += d

        data.append({
            "uuid": a.uuid,
            "rutaUuid": str(ruta.uuid) if ruta else None,
            "empresa": empresa_nombre,
            "cliente": cliente_nombre,
            "direccion": direccion,
            "fechaInicio": a.fecha_inicio.isoformat() if a.fecha_inicio else None,
            "fechaFin": a.fecha_fin.isoformat() if a.fecha_fin else None,
            "duracionSegundos": duracion,
            "kilometros": round(kilometros / 1000, 2),
            "valorTotal": float(a.valor_total) if a.valor_total else 0,
            "estado": "FINALIZADO",
        })

    return ApiResponse(success=True, message="OK", data={
        "items": data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": ceil(total / per_page) if per_page > 0 else 0,
    })
