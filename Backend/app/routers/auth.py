from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.security.password import verify_password, hash_password
from app.security.jwt import create_access_token, create_refresh_token, decode_token
from app.models.base import Usuario, Sesion, RefreshToken, Persona, Rol, EstadoUsuario
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, PasswordChangeRequest
from app.schemas.common import ApiResponse

from app.dependencies import get_current_user
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid

logger = get_logger(__name__)
router = APIRouter(prefix="/auth", tags=["Autenticacion"])


@router.post("/login", response_model=ApiResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Usuario)
        .options(selectinload(Usuario.persona), selectinload(Usuario.rol), selectinload(Usuario.estado_usuario))
        .where(Usuario.username == request.username)
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(request.password, user.password_hash):
        return ApiResponse(success=False, message="Credenciales invalidas")

    if not user.estado:
        return ApiResponse(success=False, message="Usuario desactivado")

    if user.intentos_fallidos >= 5:
        return ApiResponse(success=False, message="Usuario bloqueado por intentos fallidos")

    user.ultimo_login = datetime.now(timezone.utc)
    user.intentos_fallidos = 0
    await db.flush()

    access_token = create_access_token(data={"sub": str(user.id_usuario)})
    refresh_token = create_refresh_token(data={"sub": str(user.id_usuario)})

    refresh_db = RefreshToken(
        uuid=generate_uuid(),
        id_usuario=user.id_usuario,
        token=refresh_token,
        fecha_expiracion=datetime.now(timezone.utc).replace(hour=23, minute=59, second=59),
    )
    db.add(refresh_db)

    session_db = Sesion(
        uuid=generate_uuid(),
        id_usuario=user.id_usuario,
        token=access_token,
        fecha_inicio=datetime.now(timezone.utc),
        fecha_expiracion=datetime.now(timezone.utc).replace(hour=23, minute=59, second=59),
    )
    db.add(session_db)

    await db.flush()

    persona = user.persona
    nombre = f"{persona.nombres} {persona.apellidos}" if persona else user.username

    logger.info("Login exitoso: %s", user.username)

    return ApiResponse(
        success=True,
        message="Inicio de sesion exitoso",
        data={
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "uuid": user.uuid,
                "username": user.username,
                "nombre_completo": nombre,
                "rol": user.rol.codigo if user.rol else "",
                "rol_nombre": user.rol.nombre if user.rol else "",
            },
        },
    )


@router.post("/register", response_model=ApiResponse)
async def register(request: dict, db: AsyncSession = Depends(get_db)):
    username = request.get("username", "").strip()
    password = request.get("password", "")
    email = request.get("email", "").strip()
    nombres = request.get("nombres", "").strip()
    apellidos = request.get("apellidos", "").strip()

    if not username or not password:
        return ApiResponse(success=False, message="Username y password son requeridos")

    existing = await db.execute(select(Usuario).where(Usuario.username == username))
    if existing.scalar_one_or_none():
        return ApiResponse(success=False, message="El usuario ya existe")

    role_result = await db.execute(select(Rol).where(Rol.codigo == "CLIENTE"))
    rol = role_result.scalar_one_or_none()
    if not rol:
        return ApiResponse(success=False, message="Rol CLIENTE no encontrado")

    estado_result = await db.execute(select(EstadoUsuario).where(EstadoUsuario.codigo == "ACTIVO"))
    estado = estado_result.scalar_one_or_none()

    persona = Persona(
        uuid=generate_uuid(),
        nombres=nombres or username,
        apellidos=apellidos or "",
        correo=email,
        telefono="",
    )
    db.add(persona)
    await db.flush()

    user = Usuario(
        uuid=generate_uuid(),
        username=username,
        password_hash=hash_password(password),
        id_persona=persona.id_persona,
        id_rol=rol.id_rol,
        id_estado_usuario=estado.id_estado_usuario if estado else 1,
        estado=1,
        intentos_fallidos=0,
    )
    db.add(user)
    await db.flush()

    logger.info("Registro exitoso: %s", username)
    return ApiResponse(success=True, message="Registro exitoso")


@router.post("/refresh", response_model=ApiResponse)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        return ApiResponse(success=False, message="Token de refresco invalido")

    user_id = payload.get("sub")
    result = await db.execute(select(RefreshToken).where(
        RefreshToken.token == request.refresh_token,
        RefreshToken.revocado == 0,
    ))
    refresh_db = result.scalar_one_or_none()

    if refresh_db is None:
        return ApiResponse(success=False, message="Token de refresco no encontrado")

    refresh_db.revocado = 1

    new_access = create_access_token(data={"sub": user_id})
    new_refresh = create_refresh_token(data={"sub": user_id})

    new_refresh_db = RefreshToken(
        uuid=generate_uuid(),
        id_usuario=int(user_id),
        token=new_refresh,
        fecha_expiracion=datetime.now(timezone.utc).replace(hour=23, minute=59, second=59),
    )
    db.add(new_refresh_db)
    await db.flush()

    return ApiResponse(
        success=True,
        message="Token renovado",
        data={
            "access_token": new_access,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        },
    )


@router.post("/logout", response_model=ApiResponse)
async def logout(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.id_usuario == current_user.id_usuario,
            RefreshToken.revocado == 0,
        )
    )
    tokens = result.scalars().all()
    for token in tokens:
        token.revocado = 1

    await db.flush()
    logger.info("Logout: %s", current_user.username)
    return ApiResponse(success=True, message="Sesion cerrada")


@router.get("/me", response_model=ApiResponse)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    persona = current_user.persona
    nombre = f"{persona.nombres} {persona.apellidos}" if persona else current_user.username

    return ApiResponse(
        success=True,
        message="OK",
        data={
            "uuid": current_user.uuid,
            "username": current_user.username,
            "nombre_completo": nombre,
            "rol": current_user.rol.codigo if current_user.rol else "",
            "rol_nombre": current_user.rol.nombre if current_user.rol else "",
            "correo": persona.correo if persona else "",
            "cambiar_password": current_user.cambiar_password,
        },
    )


@router.get("/profile", response_model=ApiResponse)
async def get_profile(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.persona),
            selectinload(Usuario.rol),
        )
        .where(Usuario.id_usuario == current_user.id_usuario)
    )
    user = result.scalar_one_or_none()
    persona = user.persona if user else None

    nombre = f"{persona.nombres} {persona.apellidos}" if persona else user.username
    direccion_data = None

    if persona and persona.id_direccion:
        from app.models.base import Direccion, Barrio, Municipio, Departamento
        dir_result = await db.execute(
            select(Direccion)
            .options(
                selectinload(Direccion.barrio).selectinload(Barrio.municipio).selectinload(Municipio.departamento)
            )
            .where(Direccion.id_direccion == persona.id_direccion)
        )
        direccion = dir_result.scalar_one_or_none()
        if direccion:
            barrio = direccion.barrio
            municipio = barrio.municipio if barrio else None
            depto = municipio.departamento if municipio else None
            direccion_data = {
                "direccion": direccion.direccion,
                "complemento": direccion.complemento,
                "barrio": barrio.nombre if barrio else None,
                "municipio": municipio.nombre if municipio else None,
                "departamento": depto.nombre if depto else None,
            }

    return ApiResponse(
        success=True,
        message="OK",
        data={
            "uuid": user.uuid,
            "username": user.username,
            "nombre_completo": nombre,
            "nombres": persona.nombres if persona else "",
            "apellidos": persona.apellidos if persona else "",
            "correo": persona.correo if persona else "",
            "telefono": persona.telefono if persona else "",
            "numero_documento": persona.numero_documento if persona else "",
            "foto": persona.foto if persona else None,
            "rol": user.rol.codigo if user.rol else "",
            "rol_nombre": user.rol.nombre if user.rol else "",
            "direccion": direccion_data,
            "estado": user.estado,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
    )


@router.post("/change-password", response_model=ApiResponse)
async def change_password(
    request: PasswordChangeRequest,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(request.current_password, current_user.password_hash):
        return ApiResponse(success=False, message="Contrasena actual incorrecta")

    current_user.password_hash = hash_password(request.new_password)
    current_user.cambiar_password = 0
    await db.flush()

    logger.info("Contrasena cambiada: %s", current_user.username)
    return ApiResponse(success=True, message="Contrasena actualizada")
