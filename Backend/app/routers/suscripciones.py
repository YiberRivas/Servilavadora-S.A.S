from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import (
    Usuario, Suscripcion, Plan, Empresa, PagoEmpresa, MetodoPago, EstadoPago,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import SuscripcionCreate, SuscripcionUpdate, PagoEmpresaCreate
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/suscripciones", tags=["Suscripciones"])


@router.get("", response_model=PaginatedResponse)
async def list_suscripciones(
    id_empresa: int = Query(None),
    activa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Suscripcion).join(Plan, Suscripcion.id_plan == Plan.id_plan)
    if id_empresa:
        query = query.where(Suscripcion.id_empresa == id_empresa)
    if activa is not None:
        query = query.where(Suscripcion.activa == activa)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Suscripcion.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    subs = result.scalars().all()

    plan_ids = list({s.id_plan for s in subs})
    plan_map = {}
    if plan_ids:
        plan_q = select(Plan).where(Plan.id_plan.in_(plan_ids))
        plan_map = {p.id_plan: p for p in (await db.execute(plan_q)).scalars().all()}

    emp_ids = list({s.id_empresa for s in subs})
    emp_map = {}
    if emp_ids:
        emp_q = select(Empresa).where(Empresa.id_empresa.in_(emp_ids))
        emp_map = {e.id_empresa: e for e in (await db.execute(emp_q)).scalars().all()}

    data = []
    for s in subs:
        plan = plan_map.get(s.id_plan)
        emp = emp_map.get(s.id_empresa)
        data.append({
            "uuid": s.uuid, "id_empresa": s.id_empresa,
            "empresa_nombre": emp.razon_social if emp else "",
            "id_plan": s.id_plan,
            "plan_nombre": plan.nombre if plan else "",
            "fecha_inicio": s.fecha_inicio.isoformat() if s.fecha_inicio else None,
            "fecha_fin": s.fecha_fin.isoformat() if s.fecha_fin else None,
            "valor": float(s.valor),
            "pagada": s.pagada, "activa": s.activa,
        })

    return PaginatedResponse(
        data=data, total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.post("", response_model=ApiResponse)
async def create_suscripcion(
    data: SuscripcionCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    new_sub = Suscripcion(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa, id_plan=data.id_plan,
        fecha_inicio=data.fecha_inicio, fecha_fin=data.fecha_fin,
        valor=data.valor,
    )
    db.add(new_sub)
    await db.flush()
    logger.info("Suscripcion creada: empresa=%s plan=%s", data.id_empresa, data.id_plan)
    return ApiResponse(success=True, message="Suscripcion creada", data={"uuid": new_sub.uuid})


@router.put("/{sub_uuid}", response_model=ApiResponse)
async def update_suscripcion(
    sub_uuid: str, data: SuscripcionUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Suscripcion).where(Suscripcion.uuid == sub_uuid))
    sub = result.scalar_one_or_none()
    if not sub:
        return ApiResponse(success=False, message="Suscripcion no encontrada")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sub, key, value)
    await db.flush()
    return ApiResponse(success=True, message="Suscripcion actualizada")


@router.get("/metodos-pago/all", response_model=ApiResponse)
async def list_metodos_pago(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(MetodoPago).where(MetodoPago.estado == 1))
    metodos = result.scalars().all()
    return ApiResponse(
        success=True, message="OK",
        data=[{"uuid": m.uuid, "nombre": m.nombre} for m in metodos],
    )


@router.get("/estados-pago/all", response_model=ApiResponse)
async def list_estados_pago(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EstadoPago).where(EstadoPago.estado == 1))
    estados = result.scalars().all()
    return ApiResponse(
        success=True, message="OK",
        data=[{"uuid": e.uuid, "codigo": e.codigo, "nombre": e.nombre, "color": e.color} for e in estados],
    )


@router.post("/pagos", response_model=ApiResponse)
async def create_pago_empresa(
    data: PagoEmpresaCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    estado_pendiente = (await db.execute(
        select(EstadoPago).where(EstadoPago.codigo == "PENDIENTE")
    )).scalar_one_or_none()

    new_pago = PagoEmpresa(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa,
        id_suscripcion=data.id_suscripcion,
        id_metodo_pago=data.id_metodo_pago,
        id_estado_pago=estado_pendiente.id_estado_pago if estado_pendiente else 1,
        valor=data.valor,
        numero_transaccion=data.numero_transaccion,
        comprobante=data.comprobante,
        observaciones=data.observaciones,
    )
    db.add(new_pago)
    await db.flush()
    return ApiResponse(success=True, message="Pago registrado", data={"uuid": new_pago.uuid})
