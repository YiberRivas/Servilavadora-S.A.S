from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, ClienteEmpresa, Persona, Empresa,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import ClienteCreate, ClienteUpdate
from app.dependencies import require_role, get_admin_empresa_id
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/clientes", tags=["Clientes"])


@router.get("", response_model=PaginatedResponse)
async def list_clientes(
    id_empresa: int = Query(None),
    search: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    empresa_id = await get_admin_empresa_id(db, current_user)

    query = (
        select(ClienteEmpresa)
        .join(Usuario, ClienteEmpresa.id_usuario == Usuario.id_usuario)
        .join(Persona, Usuario.id_persona == Persona.id_persona)
        .options(
            selectinload(ClienteEmpresa.usuario)
            .selectinload(Usuario.persona)
        )
    )

    if empresa_id is not None:
        query = query.where(ClienteEmpresa.id_empresa == empresa_id)
    elif id_empresa:
        query = query.where(ClienteEmpresa.id_empresa == id_empresa)
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(Persona.nombres.ilike(search_term), Persona.apellidos.ilike(search_term), Persona.correo.ilike(search_term))
        )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(ClienteEmpresa.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    clientes = result.unique().scalars().all()

    data = []
    for c in clientes:
        p = c.usuario.persona if c.usuario and c.usuario.persona else None
        data.append({
            "uuid": c.uuid,
            "id_empresa": c.id_empresa,
            "id_usuario": c.id_usuario,
            "fecha_registro": c.fecha_registro.isoformat() if c.fecha_registro else None,
            "observaciones": c.observaciones,
            "estado": c.estado,
            "nombre_completo": f"{p.nombres} {p.apellidos}" if p else "",
            "correo": p.correo if p else "",
            "telefono": p.telefono if p else "",
            "numero_documento": p.numero_documento if p else "",
        })

    return PaginatedResponse(
        data=data, total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/{cliente_uuid}", response_model=ApiResponse)
async def get_cliente(
    cliente_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClienteEmpresa).where(ClienteEmpresa.uuid == cliente_uuid))
    cliente = result.scalar_one_or_none()
    if not cliente:
        return ApiResponse(success=False, message="Cliente no encontrado")

    user = (await db.execute(select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario == cliente.id_usuario))).scalar_one_or_none()
    p = user.persona if user else None

    return ApiResponse(success=True, message="OK", data={
        "uuid": cliente.uuid,
        "id_empresa": cliente.id_empresa,
        "id_usuario": cliente.id_usuario,
        "fecha_registro": cliente.fecha_registro.isoformat() if cliente.fecha_registro else None,
        "observaciones": cliente.observaciones,
        "estado": cliente.estado,
        "nombre_completo": f"{p.nombres} {p.apellidos}" if p else "",
        "correo": p.correo if p else "",
        "telefono": p.telefono if p else "",
        "numero_documento": p.numero_documento if p else "",
    })


@router.post("", response_model=ApiResponse)
async def create_cliente(
    data: ClienteCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(ClienteEmpresa).where(
            ClienteEmpresa.id_empresa == data.id_empresa,
            ClienteEmpresa.id_usuario == data.id_usuario,
        )
    )
    if existing.scalar_one_or_none():
        return ApiResponse(success=False, message="Cliente ya registrado en esta empresa")

    new_cliente = ClienteEmpresa(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa,
        id_usuario=data.id_usuario,
        fecha_registro=data.fecha_registro or date.today(),
        observaciones=data.observaciones,
    )
    db.add(new_cliente)
    await db.flush()

    logger.info("Cliente creado: empresa=%s usuario=%s", data.id_empresa, data.id_usuario)
    return ApiResponse(success=True, message="Cliente creado", data={"uuid": new_cliente.uuid})


@router.put("/{cliente_uuid}", response_model=ApiResponse)
async def update_cliente(
    cliente_uuid: str,
    data: ClienteUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClienteEmpresa).where(ClienteEmpresa.uuid == cliente_uuid))
    cliente = result.scalar_one_or_none()
    if not cliente:
        return ApiResponse(success=False, message="Cliente no encontrado")

    if data.observaciones is not None:
        cliente.observaciones = data.observaciones
    if data.estado is not None:
        cliente.estado = data.estado

    await db.flush()
    logger.info("Cliente actualizado: %s", cliente_uuid)
    return ApiResponse(success=True, message="Cliente actualizado")


@router.delete("/{cliente_uuid}", response_model=ApiResponse)
async def delete_cliente(
    cliente_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ClienteEmpresa).where(ClienteEmpresa.uuid == cliente_uuid))
    cliente = result.scalar_one_or_none()
    if not cliente:
        return ApiResponse(success=False, message="Cliente no encontrado")

    cliente.estado = 0
    await db.flush()
    logger.info("Cliente desactivado: %s", cliente_uuid)
    return ApiResponse(success=True, message="Cliente desactivado")
