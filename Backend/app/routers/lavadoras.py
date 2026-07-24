from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.database import get_db
from app.models.base import (
    Usuario, Lavadora, EstadoLavadora, MarcaLavadora, ModeloLavadora,
    CapacidadLavadora, MantenimientoLavadora, HistorialLavadora,
    Empresa, Sucursal,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/lavadoras", tags=["Lavadoras"])


@router.get("", response_model=PaginatedResponse)
async def list_lavadoras(
    search: str = Query(None),
    id_empresa: int = Query(None),
    id_estado: int = Query(None),
    id_capacidad: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Lavadora)
        .join(Empresa, Lavadora.id_empresa == Empresa.id_empresa)
        .join(EstadoLavadora, Lavadora.id_estado_lavadora == EstadoLavadora.id_estado_lavadora)
        .join(MarcaLavadora, Lavadora.id_marca_lavadora == MarcaLavadora.id_marca_lavadora)
        .join(ModeloLavadora, Lavadora.id_modelo_lavadora == ModeloLavadora.id_modelo_lavadora)
        .join(CapacidadLavadora, Lavadora.id_capacidad_lavadora == CapacidadLavadora.id_capacidad_lavadora)
    )

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Lavadora.codigo_interno.ilike(search_term),
                Lavadora.numero_serie.ilike(search_term),
                Empresa.razon_social.ilike(search_term),
            )
        )
    if id_empresa:
        query = query.where(Lavadora.id_empresa == id_empresa)
    if id_estado:
        query = query.where(Lavadora.id_estado_lavadora == id_estado)
    if id_capacidad:
        query = query.where(Lavadora.id_capacidad_lavadora == id_capacidad)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Lavadora.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    lavadoras = result.scalars().all()

    data = []
    for l in lavadoras:
        data.append({
            "uuid": l.uuid,
            "codigo_interno": l.codigo_interno,
            "numero_serie": l.numero_serie,
            "color": l.color,
            "fecha_compra": l.fecha_compra.isoformat() if l.fecha_compra else None,
            "valor_compra": float(l.valor_compra) if l.valor_compra else None,
            "disponible": l.disponible,
            "estado": l.estado,
            "empresa_nombre": l.empresa.razon_social if l.empresa else "",
            "sucursal_nombre": l.sucursal.nombre if l.sucursal else "",
            "marca_nombre": l.marca.nombre if l.marca else "",
            "modelo_nombre": l.modelo.nombre if l.modelo else "",
            "capacidad_kg": float(l.capacidad.capacidad_kg) if l.capacidad else 0,
            "estado_nombre": l.estado_lavadora_rel.nombre if l.estado_lavadora_rel else "",
            "estado_color": l.estado_lavadora_rel.color if l.estado_lavadora_rel else "",
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/estados/all", response_model=ApiResponse)
async def list_estados_lavadora(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EstadoLavadora).where(EstadoLavadora.estado == 1))
    estados = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": e.uuid, "codigo": e.codigo, "nombre": e.nombre, "color": e.color}
            for e in estados
        ],
    )


@router.get("/marcas/all", response_model=ApiResponse)
async def list_marcas(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MarcaLavadora).where(MarcaLavadora.estado == 1))
    marcas = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[{"uuid": m.uuid, "nombre": m.nombre} for m in marcas],
    )


@router.get("/capacidades/all", response_model=ApiResponse)
async def list_capacidades(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CapacidadLavadora).where(CapacidadLavadora.estado == 1))
    capacidades = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": c.uuid, "capacidad_kg": float(c.capacidad_kg), "descripcion": c.descripcion}
            for c in capacidades
        ],
    )
