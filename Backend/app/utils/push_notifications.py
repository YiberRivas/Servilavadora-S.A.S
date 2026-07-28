import httpx
from app.utils.logging import get_logger

logger = get_logger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def send_push_notification(expo_push_token: str, title: str, body: str, data: dict = None, sound: str = "default"):
    payload = {
        "to": expo_push_token,
        "title": title,
        "body": body,
        "sound": sound,
        "badge": 1,
    }
    if data:
        payload["data"] = data

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                EXPO_PUSH_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            if response.status_code == 200:
                result = response.json()
                if result.get("data", {}).get("status") == "ok":
                    logger.info("Push notification enviada a %s", expo_push_token[:20])
                    return True
                else:
                    logger.warning("Push notification fallo: %s", result)
                    return False
            else:
                logger.warning("Push notification HTTP %s: %s", response.status_code, response.text[:200])
                return False
    except Exception as e:
        logger.error("Error enviando push notification: %s", str(e))
        return False


async def send_push_to_user(db, user_id: int, title: str, body: str, data: dict = None):
    from sqlalchemy import select
    from app.models.base import DeviceToken

    result = await db.execute(
        select(DeviceToken).where(
            DeviceToken.id_usuario == user_id,
            DeviceToken.activo == 1,
        )
    )
    tokens = result.scalars().all()

    if not tokens:
        return False

    sent_count = 0
    for token_record in tokens:
        success = await send_push_notification(
            expo_push_token=token_record.expo_push_token,
            title=title,
            body=body,
            data=data,
        )
        if success:
            sent_count += 1

    logger.info("Push notifications enviadas a %d/%d dispositivos del usuario %d", sent_count, len(tokens), user_id)
    return sent_count > 0


async def create_notification_and_push(db, user_id: int, titulo: str, mensaje: str, tipo: str = "SISTEMA", icono: str = None, color: str = None, data: dict = None):
    from app.models.base import Notificacion
    from app.utils.uuid import generate_uuid

    notif = Notificacion(
        uuid=generate_uuid(),
        id_usuario=user_id,
        titulo=titulo,
        mensaje=mensaje,
        tipo=tipo,
        icono=icono,
        color=color,
        data=str(data) if data else None,
        leida=0,
    )
    db.add(notif)
    await db.flush()

    await send_push_to_user(db, user_id, titulo, mensaje, data)

    return notif
