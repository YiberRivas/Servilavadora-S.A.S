from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import (
    Usuario, HistorialAlquiler, HistorialLavadora, Auditoria,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import require_role
from math import ceil

router = APIRouter(prefix="/historial", tags=["Historial"])


@router.get("/alquileres/{alquiler_uuid}", response_model=ApiResponse)
async def historial_alquiler(
    alquiler_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    from app.models.base import Alquiler
    alquiler = (await db.execute(select(Alquiler).where(Alquiler.uuid == alquiler_uuid))).scalar_one_or_none()
    if not alquiler:
        return ApiResponse(success=False, message="Alquiler no encontrado")

    result = await db.execute(
        select(HistorialAlquiler).where(HistorialAlquiler.id_alquiler == alquiler.id_alquiler)
        .order_by(HistorialAlquiler.fecha_evento.desc())
    )
    items = result.scalars().all()

    return ApiResponse(success=True, message="OK", data=[
        {
            "uuid": h.uuid, "evento": h.evento, "descripcion": h.descripcion,
            "fecha_evento": h.fecha_evento.isoformat() if h.fecha_evento else None,
            "usuario_responsable": h.usuario_responsable,
        }
        for h in items
    ])


@router.get("/lavadoras/{lavadora_uuid}", response_model=ApiResponse)
async def historial_lavadora(
    lavadora_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    from app.models.base import Lavadora
    lavadora = (await db.execute(select(Lavadora).where(Lavadora.uuid == lavadora_uuid))).scalar_one_or_none()
    if not lavadora:
        return ApiResponse(success=False, message="Lavadora no encontrada")

    result = await db.execute(
        select(HistorialLavadora).where(HistorialLavadora.id_lavadora == lavadora.id_lavadora)
        .order_by(HistorialLavadora.fecha_evento.desc())
    )
    items = result.scalars().all()

    return ApiResponse(success=True, message="OK", data=[
        {
            "uuid": h.uuid, "evento": h.evento, "descripcion": h.descripcion,
            "fecha_evento": h.fecha_evento.isoformat() if h.fecha_evento else None,
            "usuario": h.usuario,
        }
        for h in items
    ])


@router.get("/auditoria", response_model=PaginatedResponse)
async def historial_auditoria(
    modulo: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Auditoria)
    if modulo:
        query = query.where(Auditoria.modulo == modulo)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Auditoria.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return PaginatedResponse(
        data=[
            {
                "uuid": a.uuid, "modulo": a.modulo, "accion": a.accion,
                "tabla_afectada": a.tabla_afectada, "registro_uuid": a.registro_uuid,
                "ip": a.ip, "descripcion": a.descripcion,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in items
        ],
        total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )
