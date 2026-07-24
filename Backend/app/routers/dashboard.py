from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.base import (
    Usuario, Empresa, EstadoEmpresa, Suscripcion, Plan, PagoEmpresa,
    Alquiler, EstadoAlquiler, SolicitudAlquiler, EstadoSolicitud,
    Lavadora, EstadoLavadora, EstadoPago,
)
from app.schemas.common import ApiResponse
from app.dependencies import require_role

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=ApiResponse)
async def get_dashboard(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    total_empresas = (await db.execute(select(func.count(Empresa.id_empresa)))).scalar() or 0
    empresas_activas = (await db.execute(
        select(func.count(Empresa.id_empresa)).join(EstadoEmpresa).where(EstadoEmpresa.codigo == "ACTIVA")
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

    return ApiResponse(
        success=True,
        message="OK",
        data={
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
        },
    )
