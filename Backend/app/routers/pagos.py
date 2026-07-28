from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, PagoCliente, LiquidacionAlquiler, MetodoPago, EstadoPago,
    Alquiler, SolicitudAlquiler, ClienteEmpresa,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import get_current_user, require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from app.utils.push_notifications import create_notification_and_push
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/pagos", tags=["Pagos"])


class PagoCreate(BaseModel):
    id_liquidacion_alquiler: int
    id_metodo_pago: int
    valor: float
    numero_transaccion: Optional[str] = None
    referencia: Optional[str] = None
    observaciones: Optional[str] = None


@router.get("/metodos", response_model=ApiResponse)
async def list_metodos_pago(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MetodoPago).where(MetodoPago.estado == 1).order_by(MetodoPago.nombre)
    )
    metodos = result.scalars().all()
    return ApiResponse(success=True, message="OK", data=[
        {"uuid": m.uuid, "nombre": m.nombre, "descripcion": m.descripcion}
        for m in metodos
    ])


@router.get("", response_model=PaginatedResponse)
async def list_pagos(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ce_result = await db.execute(
        select(ClienteEmpresa).where(
            ClienteEmpresa.id_usuario == current_user.id_usuario,
            ClienteEmpresa.estado == 1,
        )
    )
    cliente_empresas = ce_result.scalars().all()
    ce_ids = [ce.id_cliente_empresa for ce in cliente_empresas]

    if not ce_ids:
        return PaginatedResponse(data=[], total=0, page=page, per_page=per_page, total_pages=0)

    alq_ids_result = await db.execute(
        select(Alquiler.id_alquiler)
        .join(SolicitudAlquiler, Alquiler.id_solicitud_alquiler == SolicitudAlquiler.id_solicitud_alquiler)
        .where(SolicitudAlquiler.id_cliente_empresa.in_(ce_ids))
    )
    alq_ids = [row[0] for row in alq_ids_result.all()]

    if not alq_ids:
        return PaginatedResponse(data=[], total=0, page=page, per_page=per_page, total_pages=0)

    query = (
        select(PagoCliente)
        .options(
            selectinload(PagoCliente.metodo_pago),
            selectinload(PagoCliente.estado_pago_rel),
            selectinload(PagoCliente.liquidacion).selectinload(LiquidacionAlquiler.alquiler),
        )
        .where(PagoCliente.id_liquidacion_alquiler.in_(
            select(LiquidacionAlquiler.id_liquidacion_alquiler)
            .where(LiquidacionAlquiler.id_alquiler.in_(alq_ids))
        ))
    )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    query = query.order_by(PagoCliente.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    pagos = result.scalars().all()

    return PaginatedResponse(
        data=[
            {
                "uuid": p.uuid,
                "valor": float(p.valor),
                "numero_transaccion": p.numero_transaccion,
                "referencia": p.referencia,
                "fecha_pago": p.fecha_pago.isoformat() if p.fecha_pago else None,
                "metodo_pago": p.metodo_pago.nombre if p.metodo_pago else "",
                "estado_pago": p.estado_pago_rel.nombre if p.estado_pago_rel else "",
                "estado_color": p.estado_pago_rel.color if p.estado_pago_rel else "",
                "estado_codigo": p.estado_pago_rel.codigo if p.estado_pago_rel else "",
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in pagos
        ],
        total=total, page=page, per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/{pago_uuid}", response_model=ApiResponse)
async def get_pago(
    pago_uuid: str,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PagoCliente)
        .options(
            selectinload(PagoCliente.metodo_pago),
            selectinload(PagoCliente.estado_pago_rel),
            selectinload(PagoCliente.liquidacion).selectinload(LiquidacionAlquiler.alquiler),
        )
        .where(PagoCliente.uuid == pago_uuid)
    )
    pago = result.scalar_one_or_none()
    if not pago:
        return ApiResponse(success=False, message="Pago no encontrado")

    liq = pago.liquidacion
    alquiler = liq.alquiler if liq else None

    return ApiResponse(success=True, message="OK", data={
        "uuid": pago.uuid,
        "valor": float(pago.valor),
        "numero_transaccion": pago.numero_transaccion,
        "referencia": pago.referencia,
        "observaciones": pago.observaciones,
        "fecha_pago": pago.fecha_pago.isoformat() if pago.fecha_pago else None,
        "metodo_pago": pago.metodo_pago.nombre if pago.metodo_pago else "",
        "estado_pago": pago.estado_pago_rel.nombre if pago.estado_pago_rel else "",
        "estado_color": pago.estado_pago_rel.color if pago.estado_pago_rel else "",
        "estado_codigo": pago.estado_pago_rel.codigo if pago.estado_pago_rel else "",
        "liquidacion": {
            "uuid": liq.uuid if liq else None,
            "subtotal": float(liq.subtotal) if liq else 0,
            "descuentos": float(liq.descuentos) if liq else 0,
            "recargos": float(liq.recargos) if liq else 0,
            "total": float(liq.total) if liq else 0,
            "tiempo_real_minutos": liq.tiempo_real_minutos if liq else 0,
            "tiempo_facturado_minutos": liq.tiempo_facturado_minutos if liq else 0,
        } if liq else None,
        "alquiler_uuid": alquiler.uuid if alquiler else None,
        "created_at": pago.created_at.isoformat() if pago.created_at else None,
    })


@router.post("", response_model=ApiResponse)
async def create_pago(
    data: PagoCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    liq_result = await db.execute(
        select(LiquidacionAlquiler).where(
            LiquidacionAlquiler.id_liquidacion_alquiler == data.id_liquidacion_alquiler
        )
    )
    liquidacion = liq_result.scalar_one_or_none()
    if not liquidacion:
        return ApiResponse(success=False, message="Liquidacion no encontrada")

    metodo_result = await db.execute(
        select(MetodoPago).where(MetodoPago.id_metodo_pago == data.id_metodo_pago)
    )
    metodo = metodo_result.scalar_one_or_none()
    if not metodo:
        return ApiResponse(success=False, message="Metodo de pago no encontrado")

    estado_pendiente = (await db.execute(
        select(EstadoPago).where(EstadoPago.codigo == "PENDIENTE")
    )).scalar_one_or_none()

    pago = PagoCliente(
        uuid=generate_uuid(),
        id_liquidacion_alquiler=data.id_liquidacion_alquiler,
        id_metodo_pago=data.id_metodo_pago,
        id_estado_pago=estado_pendiente.id_estado_pago if estado_pendiente else 1,
        valor=data.valor,
        numero_transaccion=data.numero_transaccion,
        referencia=data.referencia,
        observaciones=data.observaciones,
        fecha_pago=datetime.now(timezone.utc),
    )
    db.add(pago)
    await db.flush()

    alq_result = await db.execute(
        select(Alquiler).where(Alquiler.id_alquiler == liquidacion.id_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()

    if alquiler:
        sol_result = await db.execute(
            select(SolicitudAlquiler).where(
                SolicitudAlquiler.id_solicitud_alquiler == alquiler.id_solicitud_alquiler
            )
        )
        sol = sol_result.scalar_one_or_none()
        if sol:
            ce_result = await db.execute(
                select(ClienteEmpresa).where(
                    ClienteEmpresa.id_cliente_empresa == sol.id_cliente_empresa
                )
            )
            ce = ce_result.scalar_one_or_none()
            if ce:
                await create_notification_and_push(
                    db, ce.id_usuario,
                    titulo="Pago registrado",
                    mensaje=f"Se ha registrado un pago de ${data.valor:,.0f} via {metodo.nombre}.",
                    tipo="PAGO",
                    icono="cash-check",
                    color="#10B981",
                    data={"pago_uuid": pago.uuid},
                )

    logger.info("Pago creado: %s por %s", pago.uuid, current_user.username)
    return ApiResponse(success=True, message="Pago registrado", data={"uuid": pago.uuid})


@router.put("/{pago_uuid}/confirmar", response_model=ApiResponse)
async def confirmar_pago(
    pago_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PagoCliente).where(PagoCliente.uuid == pago_uuid))
    pago = result.scalar_one_or_none()
    if not pago:
        return ApiResponse(success=False, message="Pago no encontrado")

    estado_aprobado = (await db.execute(
        select(EstadoPago).where(EstadoPago.codigo == "APROBADO")
    )).scalar_one_or_none()

    pago.id_estado_pago = estado_aprobado.id_estado_pago if estado_aprobado else pago.id_estado_pago
    await db.flush()

    logger.info("Pago confirmado: %s", pago_uuid)
    return ApiResponse(success=True, message="Pago confirmado")


@router.put("/{pago_uuid}/cancelar", response_model=ApiResponse)
async def cancelar_pago(
    pago_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(PagoCliente).where(PagoCliente.uuid == pago_uuid))
    pago = result.scalar_one_or_none()
    if not pago:
        return ApiResponse(success=False, message="Pago no encontrado")

    estado_rechazado = (await db.execute(
        select(EstadoPago).where(EstadoPago.codigo == "RECHAZADO")
    )).scalar_one_or_none()

    pago.id_estado_pago = estado_rechazado.id_estado_pago if estado_rechazado else pago.id_estado_pago
    await db.flush()

    logger.info("Pago cancelado: %s", pago_uuid)
    return ApiResponse(success=True, message="Pago cancelado")
