from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import (
    Usuario, Empresa, EstadoEmpresa, Suscripcion, Plan, PagoEmpresa,
    Alquiler, EstadoAlquiler, SolicitudAlquiler, EstadoSolicitud,
    Lavadora, EstadoLavadora, EstadoPago, ClienteEmpresa, Repartidor,
)
from app.schemas.common import ApiResponse
from app.dependencies import require_role, get_admin_empresa_id

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=ApiResponse)
async def get_dashboard(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN", "ADMIN_EMPRESA")),
    db: AsyncSession = Depends(get_db),
):
    empresa_id = await get_admin_empresa_id(db, current_user)

    if empresa_id is not None:
        data = await _dashboard_empresa(db, empresa_id)
    else:
        data = await _dashboard_global(db)

    return ApiResponse(success=True, message="OK", data=data)


async def _dashboard_global(db):
    total_empresas = (await db.execute(select(func.count(Empresa.id_empresa)))).scalar() or 0
    empresas_activas = (await db.execute(
        select(func.count(Empresa.id_empresa)).join(EstadoEmpresa).where(EstadoEmpresa.codigo == "ACTIVO")
    )).scalar() or 0
    empresas_pendientes = (await db.execute(
        select(func.count(Empresa.id_empresa)).join(EstadoEmpresa).where(EstadoEmpresa.codigo == "PENDIENTE")
    )).scalar() or 0
    empresas_suspendidas = (await db.execute(
        select(func.count(Empresa.id_empresa)).join(EstadoEmpresa).where(EstadoEmpresa.codigo == "SUSPENDIDA")
    )).scalar() or 0

    total_suscripciones = (await db.execute(
        select(func.count(Suscripcion.id_suscripcion)).where(Suscripcion.activa == 1)
    )).scalar() or 0

    ingresos_totales = (await db.execute(
        select(func.coalesce(func.sum(PagoEmpresa.valor), 0))
        .join(EstadoPago, PagoEmpresa.id_estado_pago == EstadoPago.id_estado_pago)
        .where(EstadoPago.codigo == "PAGADO")
    )).scalar() or 0

    total_alquileres = (await db.execute(select(func.count(Alquiler.id_alquiler)))).scalar() or 0
    alquileres_activos = (await db.execute(
        select(func.count(Alquiler.id_alquiler)).join(EstadoAlquiler).where(EstadoAlquiler.codigo == "ACTIVO")
    )).scalar() or 0

    total_lavadoras = (await db.execute(select(func.count(Lavadora.id_lavadora)))).scalar() or 0
    lavadoras_disponibles = (await db.execute(
        select(func.count(Lavadora.id_lavadora)).join(EstadoLavadora).where(EstadoLavadora.codigo == "DISPONIBLE")
    )).scalar() or 0

    total_solicitudes = (await db.execute(select(func.count(SolicitudAlquiler.id_solicitud_alquiler)))).scalar() or 0
    solicitudes_pendientes = (await db.execute(
        select(func.count(SolicitudAlquiler.id_solicitud_alquiler))
        .join(EstadoSolicitud).where(EstadoSolicitud.codigo == "PENDIENTE")
    )).scalar() or 0

    planes_result = await db.execute(select(Plan).where(Plan.estado == 1))
    planes = planes_result.scalars().all()
    distribucion_planes = []
    for plan in planes:
        count = (await db.execute(
            select(func.count(Suscripcion.id_suscripcion))
            .where(Suscripcion.id_plan == plan.id_plan, Suscripcion.activa == 1)
        )).scalar() or 0
        distribucion_planes.append({
            "nombre": plan.nombre,
            "cantidad": count,
            "precio": float(plan.precio_mensual),
        })

    return {
        "resumen": {
            "total_empresas": total_empresas,
            "empresas_activas": empresas_activas,
            "empresas_pendientes": empresas_pendientes,
            "empresas_suspendidas": empresas_suspendidas,
            "total_suscripciones": total_suscripciones,
            "ingresos_totales": float(ingresos_totales),
            "total_alquileres": total_alquileres,
            "alquileres_activos": alquileres_activos,
            "total_lavadoras": total_lavadoras,
            "lavadoras_disponibles": lavadoras_disponibles,
            "total_solicitudes": total_solicitudes,
            "solicitudes_pendientes": solicitudes_pendientes,
        },
        "distribucion_planes": distribucion_planes,
    }


async def _dashboard_empresa(db, empresa_id):
    total_clientes = (await db.execute(
        select(func.count(ClienteEmpresa.id_cliente_empresa))
        .where(ClienteEmpresa.id_empresa == empresa_id, ClienteEmpresa.estado == 1)
    )).scalar() or 0

    total_repartidores = (await db.execute(
        select(func.count(Repartidor.id_repartidor))
        .where(Repartidor.id_empresa == empresa_id, Repartidor.estado == 1)
    )).scalar() or 0
    repartidores_disponibles = (await db.execute(
        select(func.count(Repartidor.id_repartidor))
        .where(Repartidor.id_empresa == empresa_id, Repartidor.estado == 1, Repartidor.disponible == 1)
    )).scalar() or 0

    total_lavadoras = (await db.execute(
        select(func.count(Lavadora.id_lavadora))
        .where(Lavadora.id_empresa == empresa_id, Lavadora.estado == 1)
    )).scalar() or 0
    lavadoras_disponibles = (await db.execute(
        select(func.count(Lavadora.id_lavadora))
        .join(EstadoLavadora, Lavadora.id_estado_lavadora == EstadoLavadora.id_estado_lavadora)
        .where(Lavadora.id_empresa == empresa_id, Lavadora.estado == 1, EstadoLavadora.codigo == "DISPONIBLE")
    )).scalar() or 0
    lavadoras_en_uso = (await db.execute(
        select(func.count(Lavadora.id_lavadora))
        .join(EstadoLavadora, Lavadora.id_estado_lavadora == EstadoLavadora.id_estado_lavadora)
        .where(Lavadora.id_empresa == empresa_id, Lavadora.estado == 1, EstadoLavadora.codigo == "ALQUILER")
    )).scalar() or 0

    total_solicitudes = (await db.execute(
        select(func.count(SolicitudAlquiler.id_solicitud_alquiler))
        .where(SolicitudAlquiler.id_empresa == empresa_id)
    )).scalar() or 0
    solicitudes_pendientes = (await db.execute(
        select(func.count(SolicitudAlquiler.id_solicitud_alquiler))
        .join(EstadoSolicitud, SolicitudAlquiler.id_estado_solicitud == EstadoSolicitud.id_estado_solicitud)
        .where(SolicitudAlquiler.id_empresa == empresa_id, EstadoSolicitud.codigo == "PENDIENTE")
    )).scalar() or 0

    total_alquileres = (await db.execute(
        select(func.count(Alquiler.id_alquiler))
        .join(SolicitudAlquiler, Alquiler.id_solicitud_alquiler == SolicitudAlquiler.id_solicitud_alquiler)
        .where(SolicitudAlquiler.id_empresa == empresa_id)
    )).scalar() or 0
    alquileres_activos = (await db.execute(
        select(func.count(Alquiler.id_alquiler))
        .join(SolicitudAlquiler, Alquiler.id_solicitud_alquiler == SolicitudAlquiler.id_solicitud_alquiler)
        .join(EstadoAlquiler, Alquiler.id_estado_alquiler == EstadoAlquiler.id_estado_alquiler)
        .where(SolicitudAlquiler.id_empresa == empresa_id, EstadoAlquiler.codigo == "ACTIVO")
    )).scalar() or 0

    ingresos = (await db.execute(
        select(func.coalesce(func.sum(PagoEmpresa.valor), 0))
        .join(EstadoPago, PagoEmpresa.id_estado_pago == EstadoPago.id_estado_pago)
        .where(PagoEmpresa.id_empresa == empresa_id, EstadoPago.codigo == "PAGADO")
    )).scalar() or 0

    return {
        "resumen": {
            "total_clientes": total_clientes,
            "total_repartidores": total_repartidores,
            "repartidores_disponibles": repartidores_disponibles,
            "total_lavadoras": total_lavadoras,
            "lavadoras_disponibles": lavadoras_disponibles,
            "lavadoras_en_uso": lavadoras_en_uso,
            "total_solicitudes": total_solicitudes,
            "solicitudes_pendientes": solicitudes_pendientes,
            "total_alquileres": total_alquileres,
            "alquileres_activos": alquileres_activos,
            "ingresos": float(ingresos),
        },
    }
