from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, SoporteTicket, SoporteRespuesta, Empresa,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.modulos import TicketCreate, TicketUpdate, TicketRespuestaCreate
from app.dependencies import get_current_user, require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from app.utils.push_notifications import create_notification_and_push
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/tickets", tags=["Tickets Soporte"])


@router.get("", response_model=PaginatedResponse)
async def list_tickets(
    estado: str = Query(None),
    prioridad: str = Query(None),
    id_empresa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    query = select(SoporteTicket)
    if estado:
        query = query.where(SoporteTicket.estado == estado)
    if prioridad:
        query = query.where(SoporteTicket.prioridad == prioridad)
    if id_empresa:
        query = query.where(SoporteTicket.id_empresa == id_empresa)

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(SoporteTicket.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    tickets = result.scalars().all()

    data = []
    for t in tickets:
        empresa_nombre = ""
        if t.id_empresa:
            emp = (await db.execute(select(Empresa).where(Empresa.id_empresa == t.id_empresa))).scalar_one_or_none()
            empresa_nombre = emp.razon_social if emp else ""

        resp_count = (await db.execute(
            select(func.count()).where(SoporteRespuesta.id_soporte_ticket == t.id_soporte_ticket)
        )).scalar() or 0

        data.append({
            "uuid": t.uuid, "asunto": t.asunto, "descripcion": t.descripcion,
            "prioridad": t.prioridad, "estado": t.estado,
            "fecha_cierre": t.fecha_cierre.isoformat() if t.fecha_cierre else None,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "empresa_nombre": empresa_nombre,
            "total_respuestas": resp_count,
        })

    return PaginatedResponse(
        data=data, total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/{ticket_uuid}", response_model=ApiResponse)
async def get_ticket(
    ticket_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SoporteTicket).options(selectinload(SoporteTicket.respuestas))
        .where(SoporteTicket.uuid == ticket_uuid)
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        return ApiResponse(success=False, message="Ticket no encontrado")

    respuestas = []
    for r in (ticket.respuestas or []):
        user = (await db.execute(
            select(Usuario).options(selectinload(Usuario.persona)).where(Usuario.id_usuario == r.id_usuario)
        )).scalar_one_or_none()
        p = user.persona if user else None
        respuestas.append({
            "uuid": r.uuid, "respuesta": r.respuesta,
            "usuario_nombre": f"{p.nombres} {p.apellidos}" if p else "",
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })

    return ApiResponse(success=True, message="OK", data={
        "uuid": ticket.uuid, "asunto": ticket.asunto, "descripcion": ticket.descripcion,
        "prioridad": ticket.prioridad, "estado": ticket.estado,
        "fecha_cierre": ticket.fecha_cierre.isoformat() if ticket.fecha_cierre else None,
        "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        "respuestas": respuestas,
    })


@router.post("", response_model=ApiResponse)
async def create_ticket(
    data: TicketCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_ticket = SoporteTicket(
        uuid=generate_uuid(),
        id_empresa=data.id_empresa,
        id_usuario=current_user.id_usuario,
        asunto=data.asunto,
        descripcion=data.descripcion,
        prioridad=data.prioridad,
    )
    db.add(new_ticket)
    await db.flush()
    logger.info("Ticket creado: %s por %s", data.asunto, current_user.username)

    admin_users = await db.execute(
        select(Usuario).join(Rol).where(Rol.codigo.in_(["SUPER_ADMIN", "ADMIN_EMPRESA"]))
    )
    admins = admin_users.scalars().all()
    for admin in admins:
        if admin.id_usuario != current_user.id_usuario:
            await create_notification_and_push(
                db, admin.id_usuario,
                titulo="Nuevo ticket de soporte",
                mensaje=f"Se ha creado un ticket: {data.asunto}",
                tipo="TICKET",
                icono="alert-circle-outline",
                color="#EF4444",
                data={"ticket_uuid": new_ticket.uuid},
            )

    return ApiResponse(success=True, message="Ticket creado", data={"uuid": new_ticket.uuid})


@router.put("/{ticket_uuid}", response_model=ApiResponse)
async def update_ticket(
    ticket_uuid: str, data: TicketUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SoporteTicket).where(SoporteTicket.uuid == ticket_uuid))
    ticket = result.scalar_one_or_none()
    if not ticket:
        return ApiResponse(success=False, message="Ticket no encontrado")

    if data.prioridad is not None:
        ticket.prioridad = data.prioridad
    if data.estado is not None:
        ticket.estado = data.estado
        if data.estado == "CERRADO":
            ticket.fecha_cierre = datetime.now(timezone.utc)

    await db.flush()
    return ApiResponse(success=True, message="Ticket actualizado")


@router.post("/{ticket_uuid}/respuestas", response_model=ApiResponse)
async def create_respuesta(
    ticket_uuid: str, data: TicketRespuestaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SoporteTicket).where(SoporteTicket.uuid == ticket_uuid))
    ticket = result.scalar_one_or_none()
    if not ticket:
        return ApiResponse(success=False, message="Ticket no encontrado")

    new_resp = SoporteRespuesta(
        uuid=generate_uuid(),
        id_soporte_ticket=ticket.id_soporte_ticket,
        id_usuario=current_user.id_usuario,
        respuesta=data.respuesta,
    )
    db.add(new_resp)
    await db.flush()

    if ticket.id_usuario != current_user.id_usuario:
        await create_notification_and_push(
            db, ticket.id_usuario,
            titulo="Respuesta en tu ticket",
            mensaje=f"Se ha respondido al ticket: {ticket.asunto}",
            tipo="TICKET",
            icono="message-reply-text",
            color="#3B82F6",
            data={"ticket_uuid": ticket.uuid},
        )

    return ApiResponse(success=True, message="Respuesta agregada", data={"uuid": new_resp.uuid})
