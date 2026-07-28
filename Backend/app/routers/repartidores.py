from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, Repartidor, Persona, Empresa, EmpleadoEmpresa,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import RepartidorCreate, RepartidorUpdate
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/repartidores", tags=["Repartidores"])


async def get_admin_empresa_id(db, current_user):
    if current_user.rol.codigo == "SUPER_ADMIN":
        return None
    emp_result = await db.execute(
        select(Empresa).where(Empresa.id_usuario == current_user.id_usuario)
    )
    empresa = emp_result.scalar_one_or_none()
    return empresa.id_empresa if empresa else None


@router.get("", response_model=PaginatedResponse)
async def list_repartidores(
    id_empresa: int = Query(None),
    search: str = Query(None),
    disponible: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    empresa_id = await get_admin_empresa_id(db, current_user)

    query = (
        select(Repartidor)
        .join(Usuario, Repartidor.id_usuario == Usuario.id_usuario)
        .join(Persona, Usuario.id_persona == Persona.id_persona)
    )

    if empresa_id is not None:
        query = query.where(Repartidor.id_empresa == empresa_id)
    elif id_empresa:
        query = query.where(Repartidor.id_empresa == id_empresa)

    if disponible is not None:
        query = query.where(Repartidor.disponible == disponible)
    if search:
        search_term = f"%{search}%"
        query = query.where(or_(Persona.nombres.ilike(search_term), Persona.apellidos.ilike(search_term)))

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Repartidor.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    repartidores = result.scalars().all()

    data = []
    for r in repartidores:
        user = (await db.execute(
            select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario == r.id_usuario)
        )).scalar_one_or_none()
        p = user.persona if user else None
        data.append({
            "uuid": r.uuid,
            "id_empresa": r.id_empresa,
            "id_usuario": r.id_usuario,
            "licencia": r.licencia,
            "vence_licencia": r.vence_licencia.isoformat() if r.vence_licencia else None,
            "disponible": r.disponible,
            "latitud": float(r.latitud) if r.latitud else None,
            "longitud": float(r.longitud) if r.longitud else None,
            "ultima_conexion": r.ultima_conexion.isoformat() if r.ultima_conexion else None,
            "estado": r.estado,
            "nombre_completo": f"{p.nombres} {p.apellidos}" if p else "",
            "correo": p.correo if p else "",
            "telefono": p.telefono if p else "",
        })

    return PaginatedResponse(
        data=data, total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/{repartidor_uuid}", response_model=ApiResponse)
async def get_repartidor(
    repartidor_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Repartidor).where(Repartidor.uuid == repartidor_uuid))
    rep = result.scalar_one_or_none()
    if not rep:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    empresa_id = await get_admin_empresa_id(db, current_user)
    if empresa_id is not None and rep.id_empresa != empresa_id:
        return ApiResponse(success=False, message="Acceso denegado")

    user = (await db.execute(
        select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario == rep.id_usuario)
    )).scalar_one_or_none()
    p = user.persona if user else None

    return ApiResponse(success=True, message="OK", data={
        "uuid": rep.uuid,
        "id_empresa": rep.id_empresa,
        "id_usuario": rep.id_usuario,
        "licencia": rep.licencia,
        "vence_licencia": rep.vence_licencia.isoformat() if rep.vence_licencia else None,
        "disponible": rep.disponible,
        "estado": rep.estado,
        "nombre_completo": f"{p.nombres} {p.apellidos}" if p else "",
        "correo": p.correo if p else "",
        "telefono": p.telefono if p else "",
    })


@router.post("", response_model=ApiResponse)
async def create_repartidor(
    data: RepartidorCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    empresa_id = await get_admin_empresa_id(db, current_user)
    if empresa_id is not None and data.id_empresa != empresa_id:
        return ApiResponse(success=False, message="No puedes crear repartidores para otra empresa")

    new_rep = Repartidor(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa,
        id_usuario=data.id_usuario,
        licencia=data.licencia,
        vence_licencia=data.vence_licencia,
    )
    db.add(new_rep)
    await db.flush()
    logger.info("Repartidor creado: empresa=%s", data.id_empresa)
    return ApiResponse(success=True, message="Repartidor creado", data={"uuid": new_rep.uuid})


@router.put("/{repartidor_uuid}", response_model=ApiResponse)
async def update_repartidor(
    repartidor_uuid: str,
    data: RepartidorUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Repartidor).where(Repartidor.uuid == repartidor_uuid))
    rep = result.scalar_one_or_none()
    if not rep:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    empresa_id = await get_admin_empresa_id(db, current_user)
    if empresa_id is not None and rep.id_empresa != empresa_id:
        return ApiResponse(success=False, message="Acceso denegado")

    if data.licencia is not None:
        rep.licencia = data.licencia
    if data.vence_licencia is not None:
        rep.vence_licencia = data.vence_licencia
    if data.disponible is not None:
        rep.disponible = data.disponible
    if data.estado is not None:
        rep.estado = data.estado

    await db.flush()
    logger.info("Repartidor actualizado: %s", repartidor_uuid)
    return ApiResponse(success=True, message="Repartidor actualizado")


@router.delete("/{repartidor_uuid}", response_model=ApiResponse)
async def delete_repartidor(
    repartidor_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Repartidor).where(Repartidor.uuid == repartidor_uuid))
    rep = result.scalar_one_or_none()
    if not rep:
        return ApiResponse(success=False, message="Repartidor no encontrado")

    empresa_id = await get_admin_empresa_id(db, current_user)
    if empresa_id is not None and rep.id_empresa != empresa_id:
        return ApiResponse(success=False, message="Acceso denegado")

    rep.estado = 0
    await db.flush()
    logger.info("Repartidor desactivado: %s", repartidor_uuid)
    return ApiResponse(success=True, message="Repartidor desactivado")
