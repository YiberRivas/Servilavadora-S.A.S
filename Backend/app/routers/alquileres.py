from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.database import get_db
from app.models.base import (
    Usuario, Alquiler, EstadoAlquiler, SolicitudAlquiler, EstadoSolicitud,
    LiquidacionAlquiler, CronometroAlquiler, Empresa,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import require_role
from app.utils.logging import get_logger
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/alquileres", tags=["Alquileres"])


@router.get("", response_model=PaginatedResponse)
async def list_alquileres(
    search: str = Query(None),
    id_empresa: int = Query(None),
    id_estado: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Alquiler)
        .join(EstadoAlquiler, Alquiler.id_estado_alquiler == EstadoAlquiler.id_estado_alquiler)
    )

    if id_empresa:
        query = query.join(SolicitudAlquiler, Alquiler.id_solicitud_alquiler == SolicitudAlquiler.id_solicitud_alquiler)
        query = query.where(SolicitudAlquiler.id_empresa == id_empresa)
    if id_estado:
        query = query.where(Alquiler.id_estado_alquiler == id_estado)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Alquiler.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    alquileres = result.scalars().all()

    data = []
    for a in alquileres:
        data.append({
            "uuid": a.uuid,
            "id_estado_alquiler": a.id_estado_alquiler,
            "fecha_inicio": a.fecha_inicio.isoformat() if a.fecha_inicio else None,
            "fecha_fin": a.fecha_fin.isoformat() if a.fecha_fin else None,
            "minutos_facturados": a.minutos_facturados,
            "valor_total": float(a.valor_total) if a.valor_total else 0,
            "estado_nombre": a.estado_alquiler_rel.nombre if a.estado_alquiler_rel else "",
            "estado_color": a.estado_alquiler_rel.color if a.estado_alquiler_rel else "",
            "estado": a.estado,
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/solicitudes", response_model=PaginatedResponse)
async def list_solicitudes(
    id_empresa: int = Query(None),
    id_estado: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(SolicitudAlquiler).join(
        EstadoSolicitud, SolicitudAlquiler.id_estado_solicitud == EstadoSolicitud.id_estado_solicitud
    )

    if id_empresa:
        query = query.where(SolicitudAlquiler.id_empresa == id_empresa)
    if id_estado:
        query = query.where(SolicitudAlquiler.id_estado_solicitud == id_estado)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(SolicitudAlquiler.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    solicitudes = result.scalars().all()

    data = []
    for s in solicitudes:
        data.append({
            "uuid": s.uuid,
            "id_empresa": s.id_empresa,
            "fecha_solicitud": s.fecha_solicitud.isoformat() if s.fecha_solicitud else None,
            "fecha_programada": s.fecha_programada.isoformat() if s.fecha_programada else None,
            "direccion_entrega": s.direccion_entrega,
            "id_estado_solicitud": s.id_estado_solicitud,
            "estado_nombre": s.estado_solicitud_rel.nombre if s.estado_solicitud_rel else "",
            "estado_color": s.estado_solicitud_rel.color if s.estado_solicitud_rel else "",
            "estado": s.estado,
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/estados/all", response_model=ApiResponse)
async def list_estados_alquiler(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EstadoAlquiler).where(EstadoAlquiler.estado == 1))
    estados = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": e.uuid, "codigo": e.codigo, "nombre": e.nombre, "color": e.color}
            for e in estados
        ],
    )


@router.get("/estados-solicitud/all", response_model=ApiResponse)
async def list_estados_solicitud(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EstadoSolicitud).where(EstadoSolicitud.estado == 1))
    estados = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": e.uuid, "codigo": e.codigo, "nombre": e.nombre, "color": e.color}
            for e in estados
        ],
    )
