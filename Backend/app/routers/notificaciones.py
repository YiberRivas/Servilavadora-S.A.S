from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import Usuario, Notificacion, DeviceToken
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.pagos import DeviceTokenRequest
from app.dependencies import get_current_user, require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("", response_model=PaginatedResponse)
async def list_notificaciones(
    leida: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Notificacion).where(Notificacion.id_usuario == current_user.id_usuario)
    if leida is not None:
        query = query.where(Notificacion.leida == leida)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(Notificacion.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    notifs = result.scalars().all()

    return PaginatedResponse(
        data=[
            {
                "uuid": n.uuid, "titulo": n.titulo, "mensaje": n.mensaje,
                "tipo": n.tipo, "icono": n.icono, "color": n.color,
                "leida": n.leida,
                "fecha_lectura": n.fecha_lectura.isoformat() if n.fecha_lectura else None,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in notifs
        ],
        total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/no-leidas/count", response_model=ApiResponse)
async def count_no_leidas(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count = (await db.execute(
        select(func.count()).where(
            Notificacion.id_usuario == current_user.id_usuario,
            Notificacion.leida == 0,
        )
    )).scalar() or 0

    return ApiResponse(success=True, message="OK", data={"count": count})


@router.get("/{notif_uuid}", response_model=ApiResponse)
async def get_notificacion(
    notif_uuid: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notificacion).where(
            Notificacion.uuid == notif_uuid,
            Notificacion.id_usuario == current_user.id_usuario,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        return ApiResponse(success=False, message="Notificacion no encontrada")

    return ApiResponse(success=True, message="OK", data={
        "uuid": notif.uuid, "titulo": notif.titulo, "mensaje": notif.mensaje,
        "tipo": notif.tipo, "icono": notif.icono, "color": notif.color,
        "leida": notif.leida,
        "fecha_lectura": notif.fecha_lectura.isoformat() if notif.fecha_lectura else None,
        "created_at": notif.created_at.isoformat() if notif.created_at else None,
    })


@router.put("/{notif_uuid}/leer", response_model=ApiResponse)
async def marcar_leida(
    notif_uuid: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notificacion).where(
            Notificacion.uuid == notif_uuid,
            Notificacion.id_usuario == current_user.id_usuario,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        return ApiResponse(success=False, message="Notificacion no encontrada")

    notif.leida = 1
    notif.fecha_lectura = datetime.now(timezone.utc)
    await db.flush()
    return ApiResponse(success=True, message="Marcada como leida")


@router.put("/leer-todas", response_model=ApiResponse)
async def marcar_todas_leidas(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notificacion).where(
            Notificacion.id_usuario == current_user.id_usuario,
            Notificacion.leida == 0,
        )
    )
    notifs = result.scalars().all()
    now = datetime.now(timezone.utc)
    for n in notifs:
        n.leida = 1
        n.fecha_lectura = now

    await db.flush()
    return ApiResponse(success=True, message=f"{len(notifs)} notificaciones marcadas como leidas")


@router.delete("/{notif_uuid}", response_model=ApiResponse)
async def eliminar_notificacion(
    notif_uuid: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notificacion).where(
            Notificacion.uuid == notif_uuid,
            Notificacion.id_usuario == current_user.id_usuario,
        )
    )
    notif = result.scalar_one_or_none()
    if not notif:
        return ApiResponse(success=False, message="Notificacion no encontrada")

    await db.delete(notif)
    await db.flush()
    return ApiResponse(success=True, message="Notificacion eliminada")


@router.post("/device", response_model=ApiResponse)
async def register_device_token(
    request: DeviceTokenRequest,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(DeviceToken).where(
            DeviceToken.id_usuario == current_user.id_usuario,
            DeviceToken.expo_push_token == request.expo_push_token,
        )
    )
    existing_token = existing.scalar_one_or_none()

    if existing_token:
        existing_token.activo = 1
        existing_token.dispositivo = request.dispositivo
        existing_token.updated_at = datetime.now(timezone.utc)
        await db.flush()
        return ApiResponse(success=True, message="Token de dispositivo actualizado", data={"uuid": existing_token.uuid})

    device_token = DeviceToken(
        uuid=generate_uuid(),
        id_usuario=current_user.id_usuario,
        expo_push_token=request.expo_push_token,
        dispositivo=request.dispositivo,
        activo=1,
    )
    db.add(device_token)
    await db.flush()
    logger.info("Device token registrado para usuario %s", current_user.username)
    return ApiResponse(success=True, message="Token de dispositivo registrado", data={"uuid": device_token.uuid})


@router.delete("/device", response_model=ApiResponse)
async def remove_device_token(
    expo_push_token: str = Query(...),
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DeviceToken).where(
            DeviceToken.id_usuario == current_user.id_usuario,
            DeviceToken.expo_push_token == expo_push_token,
        )
    )
    token = result.scalar_one_or_none()
    if not token:
        return ApiResponse(success=False, message="Token no encontrado")

    await db.delete(token)
    await db.flush()
    logger.info("Device token eliminado para usuario %s", current_user.username)
    return ApiResponse(success=True, message="Token de dispositivo eliminado")
