from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, text
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
from math import ceil, radians, sin, cos, sqrt, atan2

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

    data = []
    for a in alquileres:
        sol_result = await db.execute(
            select(SolicitudAlquiler).where(SolicitudAlquiler.id_solicitud_alquiler == a.id_solicitud_alquiler)
        )
        sol = sol_result.scalar_one_or_none()

        empresa_nombre = ""
        cliente_nombre = ""
        direccion = ""
        if sol:
            emp_result = await db.execute(
                select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
            )
            emp = emp_result.scalar_one_or_none()
            empresa_nombre = emp.nombre_comercial or emp.razon_social if emp else ""

            ce_result = await db.execute(
                select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == a.id_cliente_empresa)
            )
            ce = ce_result.scalar_one_or_none()
            if ce:
                user_result = await db.execute(
                    select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario == ce.id_usuario)
                )
                u = user_result.scalar_one_or_none()
                if u and u.persona:
                    cliente_nombre = f"{u.persona.nombres} {u.persona.apellidos}"

            direccion = sol.direccion_entrega or ""

        estado_result = await db.execute(
            select(EstadoAlquiler).where(EstadoAlquiler.id_estado_alquiler == a.id_estado_alquiler)
        )
        est = estado_result.scalar_one_or_none()

        ruta_result = await db.execute(
            select(RutaGPS.uuid).where(RutaGPS.id_alquiler == a.id_alquiler).limit(1)
        )
        ruta_uuid = ruta_result.scalar_one_or_none()

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

    data = []
    for a in alquileres:
        sol_result = await db.execute(
            select(SolicitudAlquiler).where(SolicitudAlquiler.id_solicitud_alquiler == a.id_solicitud_alquiler)
        )
        sol = sol_result.scalar_one_or_none()

        empresa_nombre = ""
        cliente_nombre = ""
        direccion = ""
        if sol:
            emp_result = await db.execute(
                select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
            )
            emp = emp_result.scalar_one_or_none()
            empresa_nombre = emp.nombre_comercial or emp.razon_social if emp else ""

            ce_result = await db.execute(
                select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == a.id_cliente_empresa)
            )
            ce = ce_result.scalar_one_or_none()
            if ce:
                user_result = await db.execute(
                    select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario == ce.id_usuario)
                )
                u = user_result.scalar_one_or_none()
                if u and u.persona:
                    cliente_nombre = f"{u.persona.nombres} {u.persona.apellidos}"

            direccion = sol.direccion_entrega or ""

        duracion = 0
        kilometros = 0.0
        if a.fecha_inicio and a.fecha_fin:
            duracion = int((a.fecha_fin - a.fecha_inicio).total_seconds())

        ruta_result = await db.execute(
            select(RutaGPS).where(RutaGPS.id_alquiler == a.id_alquiler)
        )
        ruta = ruta_result.scalar_one_or_none()
        if ruta:
            loc_result = await db.execute(
                select(UbicacionRuta).where(UbicacionRuta.id_ruta_gps == ruta.id_ruta_gps)
                .order_by(UbicacionRuta.timestampGPS.asc())
            )
            ubicaciones = loc_result.scalars().all()
            for i, u in enumerate(ubicaciones):
                if i > 0:
                    prev = ubicaciones[i - 1]
                    d = _haversine(float(prev.latitud), float(prev.longitud), float(u.latitud), float(u.longitud))
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


def _haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlam = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlam / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))
