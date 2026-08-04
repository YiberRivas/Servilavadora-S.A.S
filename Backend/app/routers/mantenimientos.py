from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import Usuario, MantenimientoLavadora, Lavadora
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import MantenimientoCreate
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/mantenimientos", tags=["Mantenimientos"])


@router.get("", response_model=PaginatedResponse)
async def list_mantenimientos(
    id_lavadora: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    query = select(MantenimientoLavadora)
    if id_lavadora:
        query = query.where(MantenimientoLavadora.id_lavadora == id_lavadora)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(MantenimientoLavadora.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    man = result.scalars().all()

    lav_ids = list({m.id_lavadora for m in man})
    lav_map = {}
    if lav_ids:
        lav_q = select(Lavadora).where(Lavadora.id_lavadora.in_(lav_ids))
        lav_map = {l.id_lavadora: l for l in (await db.execute(lav_q)).scalars().all()}

    data = []
    for m in man:
        lav = lav_map.get(m.id_lavadora)
        data.append({
            "uuid": m.uuid, "id_lavadora": m.id_lavadora,
            "fecha": m.fecha.isoformat() if m.fecha else None,
            "tipo": m.tipo, "descripcion": m.descripcion,
            "costo": float(m.costo) if m.costo else None,
            "realizado_por": m.realizado_por,
            "proximo_mantenimiento": m.proximo_mantenimiento.isoformat() if m.proximo_mantenimiento else None,
            "lavadora_codigo": lav.codigo_interno if lav else "",
        })

    return PaginatedResponse(
        data=data, total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.post("", response_model=ApiResponse)
async def create_mantenimiento(
    data: MantenimientoCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    from datetime import date as date_type
    new_man = MantenimientoLavadora(
        uuid=generate_uuid(),
        id_lavadora=data.id_lavadora,
        fecha=data.fecha,
        tipo=data.tipo,
        descripcion=data.descripcion,
        costo=data.costo,
        realizado_por=data.realizado_por,
        proximo_mantenimiento=data.proximo_mantenimiento,
    )
    db.add(new_man)
    await db.flush()
    logger.info("Mantenimiento registrado: lavadora=%s", data.id_lavadora)
    return ApiResponse(success=True, message="Mantenimiento registrado", data={"uuid": new_man.uuid})


@router.delete("/{man_uuid}", response_model=ApiResponse)
async def delete_mantenimiento(
    man_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MantenimientoLavadora).where(MantenimientoLavadora.uuid == man_uuid))
    man = result.scalar_one_or_none()
    if not man:
        return ApiResponse(success=False, message="Mantenimiento no encontrado")

    await db.delete(man)
    await db.flush()
    return ApiResponse(success=True, message="Mantenimiento eliminado")
