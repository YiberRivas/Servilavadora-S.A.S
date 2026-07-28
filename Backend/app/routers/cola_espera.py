from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import Usuario, ColaEspera
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import ColaEsperaCreate
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/cola-espera", tags=["Cola de Espera"])


@router.get("", response_model=PaginatedResponse)
async def list_cola(
    id_empresa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    query = select(ColaEspera)
    if id_empresa:
        query = query.where(ColaEspera.id_empresa == id_empresa)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(ColaEspera.prioridad.desc(), ColaEspera.created_at.asc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    items = result.scalars().all()

    return PaginatedResponse(
        data=[
            {
                "uuid": c.uuid, "id_empresa": c.id_empresa,
                "id_cliente_empresa": c.id_cliente_empresa,
                "id_capacidad_lavadora": c.id_capacidad_lavadora,
                "fecha_solicitud": c.fecha_solicitud.isoformat() if c.fecha_solicitud else None,
                "prioridad": c.prioridad, "observaciones": c.observaciones,
                "estado": c.estado,
            }
            for c in items
        ],
        total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.post("", response_model=ApiResponse)
async def create_cola(
    data: ColaEsperaCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    new_item = ColaEspera(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa,
        id_cliente_empresa=data.id_cliente_empresa,
        id_capacidad_lavadora=data.id_capacidad_lavadora,
        fecha_solicitud=datetime.now(timezone.utc),
        prioridad=data.prioridad,
        observaciones=data.observaciones,
    )
    db.add(new_item)
    await db.flush()
    return ApiResponse(success=True, message="Agregado a cola de espera", data={"uuid": new_item.uuid})


@router.put("/{item_uuid}/atender", response_model=ApiResponse)
async def atender_cola(
    item_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ColaEspera).where(ColaEspera.uuid == item_uuid))
    item = result.scalar_one_or_none()
    if not item:
        return ApiResponse(success=False, message="Item no encontrado")

    item.estado = 0
    await db.flush()
    return ApiResponse(success=True, message="Item atendido y removido de cola")


@router.delete("/{item_uuid}", response_model=ApiResponse)
async def remove_cola(
    item_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ColaEspera).where(ColaEspera.uuid == item_uuid))
    item = result.scalar_one_or_none()
    if not item:
        return ApiResponse(success=False, message="Item no encontrado")

    item.estado = 0
    await db.flush()
    return ApiResponse(success=True, message="Item removido de cola")
