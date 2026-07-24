from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.database import get_db
from app.models.base import Usuario, Persona, Rol, EstadoUsuario, Empresa, EmpresaArchivo, Archivo
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.usuario import (
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    PersonaCreate, PersonaResponse, RolResponse,
)
from app.dependencies import get_current_user, require_role
from app.security.password import hash_password
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("", response_model=PaginatedResponse)
async def list_usuarios(
    search: str = Query(None),
    id_rol: int = Query(None),
    id_estado: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Usuario).join(Persona, Usuario.id_persona == Persona.id_persona).join(Rol, Usuario.id_rol == Rol.id_rol)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Persona.nombres.ilike(search_term),
                Persona.apellidos.ilike(search_term),
                Usuario.username.ilike(search_term),
                Persona.numero_documento.ilike(search_term),
                Persona.correo.ilike(search_term),
            )
        )
    if id_rol:
        query = query.where(Usuario.id_rol == id_rol)
    if id_estado:
        query = query.where(Usuario.id_estado_usuario == id_estado)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Usuario.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    usuarios = result.scalars().all()

    data = []
    for u in usuarios:
        p = u.persona
        data.append({
            "uuid": u.uuid,
            "username": u.username,
            "id_rol": u.id_rol,
            "id_estado_usuario": u.id_estado_usuario,
            "estado": u.estado,
            "ultimo_login": u.ultimo_login.isoformat() if u.ultimo_login else None,
            "cambiar_password": u.cambiar_password,
            "created_at": u.created_at.isoformat() if u.created_at else None,
            "nombre_completo": f"{p.nombres} {p.apellidos}" if p else "",
            "numero_documento": p.numero_documento if p else "",
            "correo": p.correo if p else "",
            "telefono": p.telefono if p else "",
            "rol_nombre": u.rol.nombre if u.rol else "",
            "rol_codigo": u.rol.codigo if u.rol else "",
            "estado_nombre": u.estado_usuario.codigo if u.estado_usuario else "",
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/{user_uuid}", response_model=ApiResponse)
async def get_usuario(
    user_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).where(Usuario.uuid == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        return ApiResponse(success=False, message="Usuario no encontrado")

    p = user.persona
    return ApiResponse(
        success=True,
        message="OK",
        data={
            "uuid": user.uuid,
            "username": user.username,
            "id_rol": user.id_rol,
            "id_estado_usuario": user.id_estado_usuario,
            "estado": user.estado,
            "nombre_completo": f"{p.nombres} {p.apellidos}" if p else "",
            "numero_documento": p.numero_documento if p else "",
            "correo": p.correo if p else "",
            "telefono": p.telefono if p else "",
            "rol_nombre": user.rol.nombre if user.rol else "",
            "estado_nombre": user.estado_usuario.codigo if user.estado_usuario else "",
        },
    )


@router.post("", response_model=ApiResponse)
async def create_usuario(
    data: UsuarioCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Usuario).where(Usuario.username == data.username))
    if existing.scalar_one_or_none():
        return ApiResponse(success=False, message="El username ya existe")

    new_user = Usuario(
        uuid=generate_uuid(),
        id_persona=data.id_persona,
        id_rol=data.id_rol,
        id_estado_usuario=data.id_estado_usuario,
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(new_user)
    await db.flush()

    logger.info("Usuario creado: %s", data.username)
    return ApiResponse(success=True, message="Usuario creado", data={"uuid": new_user.uuid})


@router.put("/{user_uuid}", response_model=ApiResponse)
async def update_usuario(
    user_uuid: str,
    data: UsuarioUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).where(Usuario.uuid == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        return ApiResponse(success=False, message="Usuario no encontrado")

    if data.username is not None:
        user.username = data.username
    if data.id_rol is not None:
        user.id_rol = data.id_rol
    if data.id_estado_usuario is not None:
        user.id_estado_usuario = data.id_estado_usuario
    if data.estado is not None:
        user.estado = data.estado

    await db.flush()
    logger.info("Usuario actualizado: %s", user_uuid)
    return ApiResponse(success=True, message="Usuario actualizado")


@router.delete("/{user_uuid}", response_model=ApiResponse)
async def delete_usuario(
    user_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).where(Usuario.uuid == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        return ApiResponse(success=False, message="Usuario no encontrado")

    user.estado = 0
    await db.flush()
    logger.info("Usuario desactivado: %s", user_uuid)
    return ApiResponse(success=True, message="Usuario desactivado")


@router.get("/roles/all", response_model=ApiResponse)
async def list_roles(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Rol).where(Rol.estado == 1))
    roles = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": r.uuid, "codigo": r.codigo, "nombre": r.nombre}
            for r in roles
        ],
    )
