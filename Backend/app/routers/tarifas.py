from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import Usuario, TarifaEmpresa, CapacidadLavadora
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import TarifaCreate, TarifaUpdate
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/tarifas", tags=["Tarifas"])


@router.get("", response_model=PaginatedResponse)
async def list_tarifas(
    id_empresa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    query = select(TarifaEmpresa)
    if id_empresa:
        query = query.where(TarifaEmpresa.id_empresa == id_empresa)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(TarifaEmpresa.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    tarifas = result.scalars().all()

    cap_ids = list({t.id_capacidad_lavadora for t in tarifas if t.id_capacidad_lavadora})
    cap_map = {}
    if cap_ids:
        cap_q = select(CapacidadLavadora).where(CapacidadLavadora.id_capacidad_lavadora.in_(cap_ids))
        cap_map = {c.id_capacidad_lavadora: c for c in (await db.execute(cap_q)).scalars().all()}

    data = []
    for t in tarifas:
        cap = cap_map.get(t.id_capacidad_lavadora)
        data.append({
            "uuid": t.uuid, "id_empresa": t.id_empresa,
            "id_capacidad_lavadora": t.id_capacidad_lavadora,
            "valor_hora": float(t.valor_hora), "valor_minuto": float(t.valor_minuto),
            "activa": t.activa,
            "fecha_inicio": t.fecha_inicio.isoformat() if t.fecha_inicio else None,
            "fecha_fin": t.fecha_fin.isoformat() if t.fecha_fin else None,
            "capacidad_kg": float(cap.capacidad_kg) if cap else None,
        })

    return PaginatedResponse(
        data=data, total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.post("", response_model=ApiResponse)
async def create_tarifa(
    data: TarifaCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    new_tarifa = TarifaEmpresa(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa,
        id_capacidad_lavadora=data.id_capacidad_lavadora,
        valor_hora=data.valor_hora, valor_minuto=data.valor_minuto,
        fecha_inicio=data.fecha_inicio, fecha_fin=data.fecha_fin,
    )
    db.add(new_tarifa)
    await db.flush()
    return ApiResponse(success=True, message="Tarifa creada", data={"uuid": new_tarifa.uuid})


@router.put("/{tarifa_uuid}", response_model=ApiResponse)
async def update_tarifa(
    tarifa_uuid: str, data: TarifaUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TarifaEmpresa).where(TarifaEmpresa.uuid == tarifa_uuid))
    tarifa = result.scalar_one_or_none()
    if not tarifa:
        return ApiResponse(success=False, message="Tarifa no encontrada")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tarifa, key, value)
    await db.flush()
    return ApiResponse(success=True, message="Tarifa actualizada")


@router.delete("/{tarifa_uuid}", response_model=ApiResponse)
async def delete_tarifa(
    tarifa_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(TarifaEmpresa).where(TarifaEmpresa.uuid == tarifa_uuid))
    tarifa = result.scalar_one_or_none()
    if not tarifa:
        return ApiResponse(success=False, message="Tarifa no encontrada")

    tarifa.activa = 0
    await db.flush()
    return ApiResponse(success=True, message="Tarifa desactivada")
