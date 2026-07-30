from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Usuario, Alquiler, EstadoAlquiler, SolicitudAlquiler, EstadoSolicitud,
    LiquidacionAlquiler, CronometroAlquiler, Empresa, ClienteEmpresa,
    AsignacionSolicitud, Lavadora, MarcaLavadora, ModeloLavadora,
    CapacidadLavadora, Repartidor, Persona, TarifaEmpresa, Sucursal,
    RutaGPS, EstadoLavadora,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.dependencies import require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from app.utils.push_notifications import create_notification_and_push
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/alquileres", tags=["Alquileres"])


@router.get("", response_model=PaginatedResponse)
async def list_alquileres(
    search: str = Query(None),
    id_empresa: int = Query(None),
    id_estado: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Alquiler)
        .join(EstadoAlquiler, Alquiler.id_estado_alquiler == EstadoAlquiler.id_estado_alquiler)
    )

    if id_empresa:
        query = query.join(SolicitudAlquiler, Alquiler.id_solicitud_alquiler == SolicitudAlquiler.id_solicitud_alquiler)
        query = query.where(SolicitudAlquiler.id_empresa == id_empresa)
    if id_estado:
        query = query.where(Alquiler.id_estado_alquiler == id_estado)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Alquiler.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    alquileres = result.scalars().all()

    data = []
    for a in alquileres:
        data.append({
            "uuid": a.uuid,
            "id_estado_alquiler": a.id_estado_alquiler,
            "fecha_inicio": a.fecha_inicio.isoformat() if a.fecha_inicio else None,
            "fecha_fin": a.fecha_fin.isoformat() if a.fecha_fin else None,
            "minutos_facturados": a.minutos_facturados,
            "valor_total": float(a.valor_total) if a.valor_total else 0,
            "estado_nombre": a.estado_alquiler_rel.nombre if a.estado_alquiler_rel else "",
            "estado_color": a.estado_alquiler_rel.color if a.estado_alquiler_rel else "",
            "estado": a.estado,
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/solicitudes", response_model=PaginatedResponse)
async def list_solicitudes(
    id_empresa: int = Query(None),
    id_estado: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(SolicitudAlquiler).join(
        EstadoSolicitud, SolicitudAlquiler.id_estado_solicitud == EstadoSolicitud.id_estado_solicitud
    )

    if id_empresa:
        query = query.where(SolicitudAlquiler.id_empresa == id_empresa)
    if id_estado:
        query = query.where(SolicitudAlquiler.id_estado_solicitud == id_estado)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(SolicitudAlquiler.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    solicitudes = result.scalars().all()

    data = []
    for s in solicitudes:
        data.append({
            "uuid": s.uuid,
            "id_empresa": s.id_empresa,
            "fecha_solicitud": s.fecha_solicitud.isoformat() if s.fecha_solicitud else None,
            "fecha_programada": s.fecha_programada.isoformat() if s.fecha_programada else None,
            "direccion_entrega": s.direccion_entrega,
            "id_estado_solicitud": s.id_estado_solicitud,
            "estado_nombre": s.estado_solicitud_rel.nombre if s.estado_solicitud_rel else "",
            "estado_color": s.estado_solicitud_rel.color if s.estado_solicitud_rel else "",
            "estado": s.estado,
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/estados/all", response_model=ApiResponse)
async def list_estados_alquiler(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EstadoAlquiler).where(EstadoAlquiler.estado == 1))
    estados = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": e.uuid, "codigo": e.codigo, "nombre": e.nombre, "color": e.color}
            for e in estados
        ],
    )


@router.get("/estados-solicitud/all", response_model=ApiResponse)
async def list_estados_solicitud(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(EstadoSolicitud).where(EstadoSolicitud.estado == 1))
    estados = result.scalars().all()
    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {"uuid": e.uuid, "codigo": e.codigo, "nombre": e.nombre, "color": e.color}
            for e in estados
        ],
    )


@router.get("/mis-servicios", response_model=ApiResponse)
async def mis_servicios(
    estado: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    current_user: Usuario = Depends(require_role("CLIENTE")),
    db: AsyncSession = Depends(get_db),
):
    ce_result = await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_usuario == current_user.id_usuario, ClienteEmpresa.estado == 1)
    )
    cliente_empresas = ce_result.scalars().all()
    if not cliente_empresas:
        return ApiResponse(success=True, message="OK", data=[], total=0)

    ce_ids = [ce.id_cliente_empresa for ce in cliente_empresas]

    sol_query = (
        select(SolicitudAlquiler)
        .options(
            selectinload(SolicitudAlquiler.empresa),
            selectinload(SolicitudAlquiler.capacidad),
            selectinload(SolicitudAlquiler.estado_solicitud_rel),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.marca),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.modelo),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.capacidad),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.repartidor)
            .selectinload(Repartidor.usuario)
            .selectinload(Usuario.persona),
        )
        .where(SolicitudAlquiler.id_cliente_empresa.in_(ce_ids), SolicitudAlquiler.estado == 1)
        .order_by(SolicitudAlquiler.created_at.desc())
    )
    sol_result = await db.execute(sol_query)
    solicitudes = sol_result.scalars().unique().all()

    alq_query = (
        select(Alquiler)
        .options(
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.empresa),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.capacidad),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.estado_solicitud_rel),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.marca),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.modelo),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.capacidad),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.repartidor)
            .selectinload(Repartidor.usuario)
            .selectinload(Usuario.persona),
            selectinload(Alquiler.lavadora)
            .selectinload(Lavadora.marca),
            selectinload(Alquiler.lavadora)
            .selectinload(Lavadora.modelo),
            selectinload(Alquiler.lavadora)
            .selectinload(Lavadora.capacidad),
            selectinload(Alquiler.estado_alquiler_rel),
            selectinload(Alquiler.repartidor)
            .selectinload(Repartidor.usuario)
            .selectinload(Usuario.persona),
            selectinload(Alquiler.cronometro),
        )
        .where(Alquiler.id_cliente_empresa.in_(ce_ids), Alquiler.estado == 1)
        .order_by(Alquiler.created_at.desc())
    )
    alq_result = await db.execute(alq_query)
    alquileres = alq_result.scalars().unique().all()

    alq_estados_map = {
        "PROGRAMADO": "programada",
        "EN_CAMINO": "en_camino",
        "ENTREGADO": "lavadora_entregada",
        "EN_USO": "en_uso",
        "FINALIZACION_SOLICITADA": "finalizacion_solicitada",
        "RECOGIDO": "recogida",
        "EN_INSPECCION": "en_inspeccion",
        "LIQUIDADO": "finalizada",
        "FACTURADO": "finalizada",
        "CANCELADO": "cancelado",
    }
    sol_estados_map = {
        "SOLICITUD_ENVIADA": "solicitud_enviada",
        "PENDIENTE": "pendiente",
        "ACEPTADA": "aceptada",
        "PROGRAMADA": "programada",
        "EN_CAMINO": "en_camino",
        "ENTREGADA": "lavadora_entregada",
        "EN_USO": "en_uso",
        "FINALIZACION_SOLICITADA": "finalizacion_solicitada",
        "RECOGIDA": "recogida",
        "FINALIZADA": "finalizada",
        "CANCELADA": "cancelado",
        "RECHAZADA": "rechazada",
    }

    items = []
    alquiler_solicitud_ids = set()

    for a in alquileres:
        sol = a.solicitud
        alquiler_solicitud_ids.add(a.id_solicitud_alquiler)
        empresa = sol.empresa if sol else None
        asignacion = sol.asignaciones[0] if sol and sol.asignaciones else None
        lavadora = a.lavadora or (asignacion.lavadora if asignacion else None)
        marca = lavadora.marca.nombre if lavadora and lavadora.marca else ""
        modelo = lavadora.modelo.nombre if lavadora and lavadora.modelo else ""
        capacidad_obj = lavadora.capacidad if lavadora else None
        capacidad_kg = capacidad_obj.capacidad_kg if capacidad_obj else ""
        capacidad_desc = capacidad_obj.descripcion if capacidad_obj else ""
        rep = a.repartidor or (asignacion.repartidor if asignacion else None)
        rep_persona = rep.usuario.persona if rep and rep.usuario else None
        rep_nombre = f"{rep_persona.nombres} {rep_persona.apellidos}" if rep_persona else ""
        rep_telefono = rep_persona.telefono if rep_persona else ""

        alq_estado = a.estado_alquiler_rel.codigo if a.estado_alquiler_rel else ""
        frontend_status = alq_estados_map.get(alq_estado, alq_estado.lower())

        timeline = {}
        if sol and sol.fecha_solicitud:
            timeline["solicitud"] = sol.fecha_solicitud.strftime("%H:%M")
        if alq_estado in ("EN_CAMINO", "ENTREGADO", "EN_USO", "FINALIZACION_SOLICITADA", "RECOGIDO", "LIQUIDADO", "FACTURADO"):
            timeline["aceptada"] = sol.fecha_solicitud.strftime("%H:%M") if sol and sol.fecha_solicitud else None
            timeline["programada"] = sol.fecha_programada.strftime("%H:%M") if sol and sol.fecha_programada else None
        if alq_estado in ("EN_USO", "FINALIZACION_SOLICITADA", "RECOGIDO", "LIQUIDADO", "FACTURADO"):
            timeline["en_uso"] = a.fecha_inicio.strftime("%H:%M") if a.fecha_inicio else None

        can_cancel = alq_estado in ("PROGRAMADO",)

        items.append({
            "uuid": a.uuid,
            "tipo": "alquiler",
            "serviceCode": sol.uuid[:8].upper() if sol else "",
            "empresaNombre": empresa.nombre_comercial if empresa else "",
            "empresaUuid": empresa.uuid if empresa else "",
            "direccion": sol.direccion_entrega if sol else "",
            "lavadoraMarca": marca,
            "lavadoraModelo": modelo,
            "capacidad": f"{capacidad_kg} kg" if capacidad_kg else "",
            "capacidadDescripcion": capacidad_desc,
            "lavadoraCodigoInterno": lavadora.codigo_interno if lavadora else "",
            "repartidorNombre": rep_nombre,
            "repartidorTelefono": rep_telefono,
            "fechaInicio": a.fecha_inicio.isoformat() if a.fecha_inicio else None,
            "fechaFin": a.fecha_fin.isoformat() if a.fecha_fin else None,
            "fechaProgramada": sol.fecha_programada.isoformat() if sol and sol.fecha_programada else None,
            "minutosFacturados": a.minutos_facturados or 0,
            "valorTotal": float(a.valor_total) if a.valor_total else 0,
            "estadoCodigo": alq_estado,
            "estadoNombre": a.estado_alquiler_rel.nombre if a.estado_alquiler_rel else "",
            "estadoColor": a.estado_alquiler_rel.color if a.estado_alquiler_rel else "",
            "status": frontend_status,
            "timeline": timeline,
            "observaciones": a.observaciones or (sol.observaciones if sol else ""),
            "puedeCancelar": can_cancel,
            "puedeRastrear": alq_estado in ("PROGRAMADO", "EN_CAMINO"),
            "puedeFinalizar": alq_estado == "EN_USO",
        })

    for sol in solicitudes:
        if sol.id_solicitud_alquiler in alquiler_solicitud_ids:
            continue

        empresa = sol.empresa
        asignacion = sol.asignaciones[0] if sol.asignaciones else None
        lavadora = asignacion.lavadora if asignacion else None
        marca = lavadora.marca.nombre if lavadora and lavadora.marca else ""
        modelo = lavadora.modelo.nombre if lavadora and lavadora.modelo else ""
        capacidad_obj = lavadora.capacidad if lavadora else None
        capacidad_kg = capacidad_obj.capacidad_kg if capacidad_obj else ""
        capacidad_desc = capacidad_obj.descripcion if capacidad_obj else ""
        rep = asignacion.repartidor if asignacion else None
        rep_persona = rep.usuario.persona if rep and rep.usuario else None
        rep_nombre = f"{rep_persona.nombres} {rep_persona.apellidos}" if rep_persona else ""
        rep_telefono = rep_persona.telefono if rep_persona else ""

        sol_estado = sol.estado_solicitud_rel.codigo if sol.estado_solicitud_rel else ""
        frontend_status = sol_estados_map.get(sol_estado, sol_estado.lower())

        timeline = {}
        if sol.fecha_solicitud:
            timeline["solicitud"] = sol.fecha_solicitud.strftime("%H:%M")
        if sol_estado in ("ACEPTADA", "PROGRAMADA", "EN_CAMINO", "ENTREGADA", "EN_USO", "FINALIZACION_SOLICITADA", "RECOGIDA", "FINALIZADA"):
            timeline["aceptada"] = sol.fecha_solicitud.strftime("%H:%M") if sol.fecha_solicitud else None
        if sol_estado in ("PROGRAMADA", "EN_CAMINO", "ENTREGADA", "EN_USO"):
            timeline["programada"] = sol.fecha_programada.strftime("%H:%M") if sol.fecha_programada else None

        can_cancel = sol_estado in ("SOLICITUD_ENVIADA", "PENDIENTE", "ACEPTADA")

        items.append({
            "uuid": sol.uuid,
            "tipo": "solicitud",
            "serviceCode": sol.uuid[:8].upper(),
            "empresaNombre": empresa.nombre_comercial if empresa else "",
            "empresaUuid": empresa.uuid if empresa else "",
            "direccion": sol.direccion_entrega,
            "lavadoraMarca": marca,
            "lavadoraModelo": modelo,
            "capacidad": f"{capacidad_kg} kg" if capacidad_kg else "",
            "capacidadDescripcion": capacidad_desc,
            "lavadoraCodigoInterno": "",
            "repartidorNombre": rep_nombre,
            "repartidorTelefono": rep_telefono,
            "fechaInicio": sol.fecha_solicitud.isoformat() if sol.fecha_solicitud else None,
            "fechaFin": None,
            "fechaProgramada": sol.fecha_programada.isoformat() if sol.fecha_programada else None,
            "minutosFacturados": 0,
            "valorTotal": 0,
            "estadoCodigo": sol_estado,
            "estadoNombre": sol.estado_solicitud_rel.nombre if sol.estado_solicitud_rel else "",
            "estadoColor": sol.estado_solicitud_rel.color if sol.estado_solicitud_rel else "",
            "status": frontend_status,
            "timeline": timeline,
            "observaciones": sol.observaciones or "",
            "puedeCancelar": can_cancel,
            "puedeRastrear": False,
            "puedeFinalizar": False,
        })

    if estado:
        items = [i for i in items if i["status"] == estado]

    total = len(items)
    start = (page - 1) * per_page
    items = items[start:start + per_page]

    return ApiResponse(success=True, message="OK", data=items, total=total)


@router.get("/mis-servicios/{uuid}", response_model=ApiResponse)
async def mis_servicio_detail(
    uuid: str,
    current_user: Usuario = Depends(require_role("CLIENTE")),
    db: AsyncSession = Depends(get_db),
):
    ce_result = await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_usuario == current_user.id_usuario, ClienteEmpresa.estado == 1)
    )
    cliente_empresas = ce_result.scalars().all()
    ce_ids = [ce.id_cliente_empresa for ce in cliente_empresas]

    if not ce_ids:
        return ApiResponse(success=False, message="Servicio no encontrado")

    sol_result = await db.execute(
        select(SolicitudAlquiler)
        .options(
            selectinload(SolicitudAlquiler.empresa),
            selectinload(SolicitudAlquiler.capacidad),
            selectinload(SolicitudAlquiler.estado_solicitud_rel),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.marca),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.modelo),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.lavadora)
            .selectinload(Lavadora.capacidad),
            selectinload(SolicitudAlquiler.asignaciones)
            .selectinload(AsignacionSolicitud.repartidor)
            .selectinload(Repartidor.usuario)
            .selectinload(Usuario.persona),
        )
        .where(SolicitudAlquiler.uuid == uuid, SolicitudAlquiler.id_cliente_empresa.in_(ce_ids))
    )
    sol = sol_result.scalar_one_or_none()

    if not sol:
        return ApiResponse(success=False, message="Servicio no encontrado")

    empresa = sol.empresa
    asignacion = sol.asignaciones[0] if sol.asignaciones else None
    lavadora = asignacion.lavadora if asignacion else None
    marca = lavadora.marca.nombre if lavadora and lavadora.marca else ""
    modelo = lavadora.modelo.nombre if lavadora and lavadora.modelo else ""
    cap_obj = lavadora.capacidad if lavadora else None
    rep = asignacion.repartidor if asignacion else None
    rep_persona = rep.usuario.persona if rep and rep.usuario else None

    sol_estado = sol.estado_solicitud_rel.codigo if sol.estado_solicitud_rel else ""
    sol_estados_map = {
        "SOLICITUD_ENVIADA": "solicitud_enviada", "PENDIENTE": "pendiente",
        "ACEPTADA": "aceptada", "PROGRAMADA": "programada",
        "EN_CAMINO": "en_camino", "ENTREGADA": "lavadora_entregada",
        "EN_USO": "en_uso", "FINALIZACION_SOLICITADA": "finalizacion_solicitada",
        "RECOGIDA": "recogida", "FINALIZADA": "finalizada",
        "CANCELADA": "cancelado", "RECHAZADA": "rechazada",
    }

    alq_result = await db.execute(
        select(Alquiler)
        .options(
            selectinload(Alquiler.lavadora).selectinload(Lavadora.marca),
            selectinload(Alquiler.lavadora).selectinload(Lavadora.modelo),
            selectinload(Alquiler.lavadora).selectinload(Lavadora.capacidad),
            selectinload(Alquiler.lavadora).selectinload(Lavadora.estado_lavadora_rel),
            selectinload(Alquiler.estado_alquiler_rel),
            selectinload(Alquiler.repartidor).selectinload(Repartidor.usuario).selectinload(Usuario.persona),
            selectinload(Alquiler.cronometro),
        )
        .where(Alquiler.id_solicitud_alquiler == sol.id_solicitud_alquiler)
    )
    alquiler = alq_result.scalar_one_or_none()

    alq_data = None
    if alquiler:
        a_lav = alquiler.lavadora
        a_marca = a_lav.marca.nombre if a_lav and a_lav.marca else ""
        a_modelo = a_lav.modelo.nombre if a_lav and a_lav.modelo else ""
        a_cap = a_lav.capacidad if a_lav else None
        a_rep = alquiler.repartidor
        a_rep_p = a_rep.usuario.persona if a_rep and a_rep.usuario else None
        a_cron = alquiler.cronometro
        a_estado = alquiler.estado_alquiler_rel.codigo if alquiler.estado_alquiler_rel else ""
        a_estados = {
            "PROGRAMADO": "programada", "EN_CAMINO": "en_camino",
            "ENTREGADO": "lavadora_entregada", "EN_USO": "en_uso",
            "FINALIZACION_SOLICITADA": "finalizacion_solicitada",
            "RECOGIDO": "recogida", "EN_INSPECCION": "en_inspeccion",
            "LIQUIDADO": "finalizada", "FACTURADO": "finalizada", "CANCELADO": "cancelado",
        }
        alq_data = {
            "uuid": alquiler.uuid,
            "fechaInicio": alquiler.fecha_inicio.isoformat() if alquiler.fecha_inicio else None,
            "fechaFin": alquiler.fecha_fin.isoformat() if alquiler.fecha_fin else None,
            "minutosFacturados": alquiler.minutos_facturados or 0,
            "valorTotal": float(alquiler.valor_total) if alquiler.valor_total else 0,
            "estadoCodigo": a_estado,
            "estadoNombre": alquiler.estado_alquiler_rel.nombre if alquiler.estado_alquiler_rel else "",
            "status": a_estados.get(a_estado, a_estado.lower()),
            "lavadoraUuid": a_lav.uuid if a_lav else "",
            "lavadoraMarca": a_marca,
            "lavadoraModelo": a_modelo,
            "lavadoraCapacidad": f"{a_cap.capacidad_kg} kg" if a_cap else "",
            "lavadoraCodigoInterno": a_lav.codigo_interno if a_lav else "",
            "lavadoraEstado": a_lav.estado_lavadora_rel.nombre if a_lav and a_lav.estado_lavadora_rel else "",
            "repartidorNombre": f"{a_rep_p.nombres} {a_rep_p.apellidos}" if a_rep_p else "",
            "repartidorTelefono": a_rep_p.telefono if a_rep_p else "",
            "cronometro": {
                "activo": bool(a_cron.activo) if a_cron else False,
                "minutosTranscurridos": a_cron.minutos_transcurridos if a_cron else 0,
                "minutosFacturables": a_cron.minutos_facturables if a_cron else 0,
                "valorAcumulado": float(a_cron.valor_acumulado) if a_cron and a_cron.valor_acumulado else 0,
            } if a_cron else None,
        }

    return ApiResponse(success=True, message="OK", data={
        "uuid": sol.uuid,
        "tipo": "solicitud",
        "serviceCode": sol.uuid[:8].upper(),
        "empresa": {"uuid": empresa.uuid if empresa else "", "nombre": empresa.nombre_comercial if empresa else ""},
        "direccion": sol.direccion_entrega,
        "lavadoraMarca": marca,
        "lavadoraModelo": modelo,
        "lavadoraCapacidad": f"{cap_obj.capacidad_kg} kg" if cap_obj else "",
        "lavadoraCapacidadDesc": cap_obj.descripcion if cap_obj else "",
        "repartidorNombre": f"{rep_persona.nombres} {rep_persona.apellidos}" if rep_persona else "",
        "repartidorTelefono": rep_persona.telefono if rep_persona else "",
        "fechaSolicitud": sol.fecha_solicitud.isoformat() if sol.fecha_solicitud else None,
        "fechaProgramada": sol.fecha_programada.isoformat() if sol.fecha_programada else None,
        "estadoCodigo": sol_estado,
        "estadoNombre": sol.estado_solicitud_rel.nombre if sol.estado_solicitud_rel else "",
        "observaciones": sol.observaciones or "",
        "status": sol_estados_map.get(sol_estado, sol_estado.lower()),
        "alquiler": alq_data,
    })


@router.get("/mis-servicios/{uuid}/cronometro", response_model=ApiResponse)
async def mis_servicio_cronometro(
    uuid: str,
    current_user: Usuario = Depends(require_role("CLIENTE")),
    db: AsyncSession = Depends(get_db),
):
    ce_result = await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_usuario == current_user.id_usuario, ClienteEmpresa.estado == 1)
    )
    cliente_empresas = ce_result.scalars().all()
    ce_ids = [ce.id_cliente_empresa for ce in cliente_empresas]

    sol_result = await db.execute(
        select(SolicitudAlquiler).where(SolicitudAlquiler.uuid == uuid, SolicitudAlquiler.id_cliente_empresa.in_(ce_ids))
    )
    sol = sol_result.scalar_one_or_none()
    if not sol:
        return ApiResponse(success=False, message="Servicio no encontrado")

    alq_result = await db.execute(select(Alquiler).where(Alquiler.id_solicitud_alquiler == sol.id_solicitud_alquiler))
    alquiler = alq_result.scalar_one_or_none()
    if not alquiler:
        return ApiResponse(success=True, message="OK", data={"activo": False, "minutosTranscurridos": 0, "minutosFacturables": 0, "valorAcumulado": 0})

    cron_result = await db.execute(select(CronometroAlquiler).where(CronometroAlquiler.id_alquiler == alquiler.id_alquiler))
    cron = cron_result.scalar_one_or_none()

    if not cron:
        return ApiResponse(success=True, message="OK", data={"activo": False, "minutosTranscurridos": 0, "minutosFacturables": 0, "valorAcumulado": 0})

    return ApiResponse(success=True, message="OK", data={
        "activo": bool(cron.activo),
        "minutosTranscurridos": cron.minutos_transcurridos,
        "minutosFacturables": cron.minutos_facturables,
        "valorAcumulado": float(cron.valor_acumulado) if cron.valor_acumulado else 0,
        "fechaInicio": cron.fecha_inicio.isoformat() if cron.fecha_inicio else None,
        "fechaFin": cron.fecha_fin.isoformat() if cron.fecha_fin else None,
    })


@router.get("/mis-historial", response_model=ApiResponse)
async def mis_historial(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    current_user: Usuario = Depends(require_role("CLIENTE")),
    db: AsyncSession = Depends(get_db),
):
    ce_result = await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_usuario == current_user.id_usuario, ClienteEmpresa.estado == 1)
    )
    cliente_empresas = ce_result.scalars().all()
    ce_ids = [ce.id_cliente_empresa for ce in cliente_empresas]

    if not ce_ids:
        return ApiResponse(success=True, message="OK", data=[], total=0)

    alq_query = (
        select(Alquiler)
        .options(
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.empresa),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.capacidad),
            selectinload(Alquiler.solicitud)
            .selectinload(SolicitudAlquiler.estado_solicitud_rel),
            selectinload(Alquiler.lavadora)
            .selectinload(Lavadora.marca),
            selectinload(Alquiler.lavadora)
            .selectinload(Lavadora.modelo),
            selectinload(Alquiler.lavadora)
            .selectinload(Lavadora.capacidad),
            selectinload(Alquiler.estado_alquiler_rel),
            selectinload(Alquiler.repartidor)
            .selectinload(Repartidor.usuario)
            .selectinload(Usuario.persona),
            selectinload(Alquiler.liquidaciones),
        )
        .where(Alquiler.id_cliente_empresa.in_(ce_ids), Alquiler.estado == 1)
        .order_by(Alquiler.created_at.desc())
    )
    alq_result = await db.execute(alq_query)
    alquileres = alq_result.scalars().unique().all()

    alq_estados = {
        "PROGRAMADO": "programada", "EN_CAMINO": "en_camino",
        "ENTREGADO": "lavadora_entregada", "EN_USO": "en_uso",
        "FINALIZACION_SOLICITADA": "finalizacion_solicitada",
        "RECOGIDO": "recogida", "EN_INSPECCION": "en_inspeccion",
        "LIQUIDADO": "finalizado", "FACTURADO": "finalizado", "CANCELADO": "cancelado",
    }

    items = []
    for a in alquileres:
        sol = a.solicitud
        empresa = sol.empresa if sol else None
        lav = a.lavadora
        marca = lav.marca.nombre if lav and lav.marca else ""
        modelo = lav.modelo.nombre if lav and lav.modelo else ""
        cap_obj = lav.capacidad if lav else None
        rep = a.repartidor
        rep_p = rep.usuario.persona if rep and rep.usuario else None
        a_estado = a.estado_alquiler_rel.codigo if a.estado_alquiler_rel else ""

        items.append({
            "uuid": a.uuid,
            "tipo": "alquiler",
            "serviceCode": sol.uuid[:8].upper() if sol else "",
            "empresaNombre": empresa.nombre_comercial if empresa else "",
            "empresaUuid": empresa.uuid if empresa else "",
            "direccion": sol.direccion_entrega if sol else "",
            "lavadoraMarca": marca,
            "lavadoraModelo": modelo,
            "capacidad": f"{cap_obj.capacidad_kg} kg" if cap_obj else "",
            "repartidorNombre": f"{rep_p.nombres} {rep_p.apellidos}" if rep_p else "",
            "fechaInicio": a.fecha_inicio.isoformat() if a.fecha_inicio else None,
            "fechaFin": a.fecha_fin.isoformat() if a.fecha_fin else None,
            "minutosFacturados": a.minutos_facturados or 0,
            "valorTotal": float(a.valor_total) if a.valor_total else 0,
            "estadoCodigo": a_estado,
            "estadoNombre": a.estado_alquiler_rel.nombre if a.estado_alquiler_rel else "",
            "estadoColor": a.estado_alquiler_rel.color if a.estado_alquiler_rel else "",
            "status": alq_estados.get(a_estado, a_estado.lower()),
        })

    sol_query = (
        select(SolicitudAlquiler)
        .options(
            selectinload(SolicitudAlquiler.empresa),
            selectinload(SolicitudAlquiler.estado_solicitud_rel),
        )
        .where(
            SolicitudAlquiler.id_cliente_empresa.in_(ce_ids),
            SolicitudAlquiler.estado == 1,
        )
        .order_by(SolicitudAlquiler.created_at.desc())
    )
    sol_result = await db.execute(sol_query)
    solicitudes = sol_result.scalars().unique().all()

    sol_estados = {
        "CANCELADA": "cancelado", "RECHAZADA": "rechazada",
    }
    for sol in solicitudes:
        s_estado = sol.estado_solicitud_rel.codigo if sol.estado_solicitud_rel else ""
        if s_estado in sol_estados:
            items.append({
                "uuid": sol.uuid,
                "tipo": "solicitud",
                "serviceCode": sol.uuid[:8].upper(),
                "empresaNombre": sol.empresa.nombre_comercial if sol.empresa else "",
                "empresaUuid": sol.empresa.uuid if sol.empresa else "",
                "direccion": sol.direccion_entrega,
                "lavadoraMarca": "",
                "lavadoraModelo": "",
                "capacidad": "",
                "repartidorNombre": "",
                "fechaInicio": sol.fecha_solicitud.isoformat() if sol.fecha_solicitud else None,
                "fechaFin": None,
                "minutosFacturados": 0,
                "valorTotal": 0,
                "estadoCodigo": s_estado,
                "estadoNombre": sol.estado_solicitud_rel.nombre if sol.estado_solicitud_rel else "",
                "estadoColor": sol.estado_solicitud_rel.color if sol.estado_solicitud_rel else "",
                "status": sol_estados.get(s_estado, s_estado.lower()),
            })

    items.sort(key=lambda x: x.get("fechaInicio") or "", reverse=True)
    total = len(items)
    start = (page - 1) * per_page
    items = items[start:start + per_page]

    return ApiResponse(success=True, message="OK", data=items, total=total)


@router.post("/solicitudes", response_model=ApiResponse)
async def create_solicitud(
    payload: dict,
    current_user: Usuario = Depends(require_role("CLIENTE")),
    db: AsyncSession = Depends(get_db),
):
    import uuid as uuid_mod

    empresa_uuid = payload.get("empresa_uuid")
    capacidad_kg = payload.get("capacidad_kg")
    fecha_programada = payload.get("fecha_programada")
    direccion_entrega = payload.get("direccion_entrega")
    observaciones = payload.get("observaciones", "")

    if not all([empresa_uuid, capacidad_kg, fecha_programada, direccion_entrega]):
        return ApiResponse(success=False, message="Faltan campos obligatorios")

    empresa = (await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid, Empresa.estado == 1))).scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    cliente_emp = (await db.execute(
        select(ClienteEmpresa).where(
            ClienteEmpresa.id_empresa == empresa.id_empresa,
            ClienteEmpresa.id_usuario == current_user.id_usuario,
            ClienteEmpresa.estado == 1,
        )
    )).scalar_one_or_none()
    if not cliente_emp:
        cliente_emp = ClienteEmpresa(
            uuid=str(uuid_mod.uuid4()),
            id_empresa=empresa.id_empresa,
            id_usuario=current_user.id_usuario,
            fecha_registro=datetime.now(timezone.utc).date(),
            estado=1,
        )
        db.add(cliente_emp)
        await db.flush()

    cap_lav = (await db.execute(
        select(CapacidadLavadora).where(
            CapacidadLavadora.capacidad_kg == capacidad_kg,
            CapacidadLavadora.estado == 1,
        )
    )).scalar_one_or_none()
    if not cap_lav:
        return ApiResponse(success=False, message="Capacidad no encontrada")

    sucursal = (await db.execute(
        select(Sucursal).where(Sucursal.id_empresa == empresa.id_empresa, Sucursal.estado == 1).limit(1)
    )).scalar_one_or_none()
    if not sucursal:
        return ApiResponse(success=False, message="La empresa no tiene sucursales disponibles")

    estado_pendiente = (await db.execute(
        select(EstadoSolicitud).where(EstadoSolicitud.codigo == "PENDIENTE")
    )).scalar_one_or_none()

    sol = SolicitudAlquiler(
        uuid=str(uuid_mod.uuid4()),
        id_empresa=empresa.id_empresa,
        id_cliente_empresa=cliente_emp.id_cliente_empresa,
        id_sucursal=sucursal.id_sucursal,
        id_capacidad_lavadora=cap_lav.id_capacidad_lavadora,
        id_estado_solicitud=estado_pendiente.id_estado_solicitud if estado_pendiente else 1,
        fecha_solicitud=datetime.now(timezone.utc),
        fecha_programada=datetime.fromisoformat(fecha_programada.replace("Z", "+00:00")) if fecha_programada else None,
        observaciones=observaciones,
        direccion_entrega=direccion_entrega,
        estado=1,
    )
    db.add(sol)
    await db.commit()
    await db.refresh(sol)

    await create_notification_and_push(
        db, empresa.id_usuario,
        titulo="Nueva solicitud de servicio",
        mensaje=f"El cliente ha creado una solicitud de alquiler para capacidad {cap_lav.capacidad_kg}kg.",
        tipo="SOLICITUD",
        icono="file-document-outline",
        color="#12A594",
        data={"solicitud_uuid": sol.uuid},
    )

    return ApiResponse(success=True, message="Solicitud creada exitosamente", data={
        "uuid": sol.uuid,
        "fecha_solicitud": sol.fecha_solicitud.isoformat() if sol.fecha_solicitud else None,
        "estado": sol.estado,
    })


@router.post("/solicitudes/{uuid}/aceptar", response_model=ApiResponse)
async def aceptar_solicitud(
    uuid: str,
    current_user: Usuario = Depends(require_role("ADMIN_EMPRESA", "SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    sol = (await db.execute(
        select(SolicitudAlquiler)
        .options(selectinload(SolicitudAlquiler.estado_solicitud_rel))
        .where(SolicitudAlquiler.uuid == uuid)
    )).scalar_one_or_none()
    if not sol:
        return ApiResponse(success=False, message="Solicitud no encontrada")

    empresa = (await db.execute(
        select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
    )).scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    if current_user.rol.codigo == "ADMIN_EMPRESA" and empresa.id_usuario != current_user.id_usuario:
        return ApiResponse(success=False, message="No tiene acceso a esta solicitud")

    sol_estado = sol.estado_solicitud_rel.codigo if sol.estado_solicitud_rel else ""
    if sol_estado != "PENDIENTE":
        return ApiResponse(success=False, message="La solicitud no esta en estado PENDIENTE")

    aceptada = (await db.execute(
        select(EstadoSolicitud).where(EstadoSolicitud.codigo == "ACEPTADA")
    )).scalar_one_or_none()
    if not aceptada:
        return ApiResponse(success=False, message="Estado ACEPTADA no encontrado en el sistema")

    sol.id_estado_solicitud = aceptada.id_estado_solicitud
    sol.updated_at = datetime.now(timezone.utc)

    lavadora = (await db.execute(
        select(Lavadora).where(
            Lavadora.id_empresa == sol.id_empresa,
            Lavadora.id_capacidad_lavadora == sol.id_capacidad_lavadora,
            Lavadora.estado == 1,
            Lavadora.disponible == 1,
        ).limit(1)
    )).scalar_one_or_none()
    if not lavadora:
        return ApiResponse(success=False, message="No hay lavadoras disponibles de la capacidad solicitada")

    repartidor = (await db.execute(
        select(Repartidor).where(
            Repartidor.id_empresa == sol.id_empresa,
            Repartidor.estado == 1,
            Repartidor.disponible == 1,
        ).limit(1)
    )).scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="No hay repartidores disponibles en la empresa")

    pendiente_alq = (await db.execute(
        select(EstadoAlquiler).where(EstadoAlquiler.codigo == "PENDIENTE")
    )).scalar_one_or_none()
    if not pendiente_alq:
        return ApiResponse(success=False, message="Estado PENDIENTE de alquiler no encontrado en el sistema")

    alquiler = Alquiler(
        uuid=generate_uuid(),
        id_solicitud_alquiler=sol.id_solicitud_alquiler,
        id_lavadora=lavadora.id_lavadora,
        id_cliente_empresa=sol.id_cliente_empresa,
        id_repartidor=repartidor.id_repartidor,
        id_estado_alquiler=pendiente_alq.id_estado_alquiler,
        fecha_inicio=None,
        fecha_fin=None,
        minutos_facturados=0,
        valor_total=0,
        observaciones=sol.observaciones,
        estado=1,
    )
    db.add(alquiler)
    await db.flush()

    lavadora.disponible = 0
    en_uso_estado = (await db.execute(
        select(EstadoLavadora).where(EstadoLavadora.codigo == "EN_USO")
    )).scalar_one_or_none()
    if en_uso_estado:
        lavadora.id_estado_lavadora = en_uso_estado.id_estado_lavadora

    repartidor.disponible = 0

    ruta = RutaGPS(
        uuid=generate_uuid(),
        id_alquiler=alquiler.id_alquiler,
        id_repartidor=repartidor.id_repartidor,
        id_empresa=sol.id_empresa,
        latitud_destino=sol.latitud,
        longitud_destino=sol.longitud,
        latitud_cliente=sol.latitud,
        longitud_cliente=sol.longitud,
        estado="PENDIENTE",
    )
    db.add(ruta)
    await db.flush()

    cliente_user = (await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == sol.id_cliente_empresa)
    )).scalar_one_or_none()

    if cliente_user:
        await create_notification_and_push(
            db, cliente_user.id_usuario,
            titulo="Solicitud aceptada",
            mensaje=f"Tu solicitud ha sido aceptada. Se ha asignado un repartidor y una lavadora.",
            tipo="SERVICIO",
            icono="check-circle",
            color="#28A745",
            data={"solicitud_uuid": sol.uuid, "alquiler_uuid": alquiler.uuid, "ruta_uuid": ruta.uuid},
        )

    return ApiResponse(success=True, message="Solicitud aceptada exitosamente", data={
        "solicitud_uuid": sol.uuid,
        "alquiler_uuid": alquiler.uuid,
        "ruta_uuid": ruta.uuid,
        "repartidor": {
            "uuid": repartidor.uuid,
            "id_repartidor": repartidor.id_repartidor,
        },
        "lavadora": {
            "uuid": lavadora.uuid,
            "codigo_interno": lavadora.codigo_interno,
        },
    })


@router.post("/solicitudes/{uuid}/rechazar", response_model=ApiResponse)
async def rechazar_solicitud(
    uuid: str,
    current_user: Usuario = Depends(require_role("ADMIN_EMPRESA", "SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    sol = (await db.execute(
        select(SolicitudAlquiler)
        .options(selectinload(SolicitudAlquiler.estado_solicitud_rel))
        .where(SolicitudAlquiler.uuid == uuid)
    )).scalar_one_or_none()
    if not sol:
        return ApiResponse(success=False, message="Solicitud no encontrada")

    empresa = (await db.execute(
        select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
    )).scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    if current_user.rol.codigo == "ADMIN_EMPRESA" and empresa.id_usuario != current_user.id_usuario:
        return ApiResponse(success=False, message="No tiene acceso a esta solicitud")

    sol_estado = sol.estado_solicitud_rel.codigo if sol.estado_solicitud_rel else ""
    if sol_estado != "PENDIENTE":
        return ApiResponse(success=False, message="La solicitud no esta en estado PENDIENTE")

    rechazada = (await db.execute(
        select(EstadoSolicitud).where(EstadoSolicitud.codigo == "RECHAZADA")
    )).scalar_one_or_none()
    if not rechazada:
        return ApiResponse(success=False, message="Estado RECHAZADA no encontrado en el sistema")

    sol.id_estado_solicitud = rechazada.id_estado_solicitud
    sol.updated_at = datetime.now(timezone.utc)
    await db.flush()

    cliente_user = (await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == sol.id_cliente_empresa)
    )).scalar_one_or_none()

    if cliente_user:
        await create_notification_and_push(
            db, cliente_user.id_usuario,
            titulo="Solicitud rechazada",
            mensaje=f"Tu solicitud ha sido rechazada por la empresa.",
            tipo="SERVICIO",
            icono="close-circle",
            color="#D64545",
            data={"solicitud_uuid": sol.uuid},
        )

    return ApiResponse(success=True, message="Solicitud rechazada", data={
        "solicitud_uuid": sol.uuid,
    })


@router.post("/{uuid}/solicitar-finalizacion", response_model=ApiResponse)
async def solicitar_finalizacion(
    uuid: str,
    current_user: Usuario = Depends(require_role("CLIENTE")),
    db: AsyncSession = Depends(get_db),
):
    alquiler = (await db.execute(
        select(Alquiler)
        .options(selectinload(Alquiler.estado_alquiler_rel))
        .where(Alquiler.uuid == uuid, Alquiler.estado == 1)
    )).scalar_one_or_none()
    if not alquiler:
        return ApiResponse(success=False, message="Alquiler no encontrado")

    if alquiler.id_cliente_empresa is None:
        return ApiResponse(success=False, message="Alquiler sin cliente asociado")

    ce = (await db.execute(
        select(ClienteEmpresa).where(
            ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa,
            ClienteEmpresa.id_usuario == current_user.id_usuario,
        )
    )).scalar_one_or_none()
    if not ce:
        return ApiResponse(success=False, message="No tiene acceso a este alquiler")

    estado_actual = alquiler.estado_alquiler_rel.codigo if alquiler.estado_alquiler_rel else ""
    if estado_actual != "ACTIVO":
        return ApiResponse(
            success=False,
            message=f"No se puede solicitar finalizacion. Estado actual: {estado_actual}. Se requiere ACTIVO.",
        )

    estado_finalizacion = (await db.execute(
        select(EstadoAlquiler).where(EstadoAlquiler.codigo == "FINALIZACION")
    )).scalar_one_or_none()
    if not estado_finalizacion:
        return ApiResponse(success=False, message="Estado FINALIZACION no encontrado en el sistema")

    estado_anterior = alquiler.estado_alquiler_rel.nombre if alquiler.estado_alquiler_rel else ""
    alquiler.id_estado_alquiler = estado_finalizacion.id_estado_alquiler
    alquiler.updated_at = datetime.now(timezone.utc)
    await db.flush()

    sol = (await db.execute(
        select(SolicitudAlquiler)
        .where(SolicitudAlquiler.id_solicitud_alquiler == alquiler.id_solicitud_alquiler)
    )).scalar_one_or_none()

    if sol:
        empresa = (await db.execute(
            select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
        )).scalar_one_or_none()
        if empresa:
            await create_notification_and_push(
                db, empresa.id_usuario,
                titulo="Solicitud de recogida",
                mensaje=f"El cliente solicito la recogida de la lavadora. Alquiler #{alquiler.uuid[:8].upper()}.",
                tipo="SERVICIO",
                icono="package-return",
                color="#FF9800",
                data={"alquiler_uuid": alquiler.uuid},
            )

    await db.commit()

    return ApiResponse(success=True, message="Finalizacion solicitada exitosamente", data={
        "alquiler_uuid": alquiler.uuid,
        "estado_anterior": estado_anterior,
        "estado_actual": estado_finalizacion.nombre,
        "mensaje": "La empresa ha sido notificada para coordinar la recogida de la lavadora.",
    })


@router.post("/{uuid}/programar-recogida", response_model=ApiResponse)
async def programar_recogida(
    uuid: str,
    current_user: Usuario = Depends(require_role("ADMIN_EMPRESA", "SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    alquiler = (await db.execute(
        select(Alquiler)
        .options(selectinload(Alquiler.estado_alquiler_rel))
        .where(Alquiler.uuid == uuid, Alquiler.estado == 1)
    )).scalar_one_or_none()
    if not alquiler:
        return ApiResponse(success=False, message="Alquiler no encontrado")

    sol = (await db.execute(
        select(SolicitudAlquiler)
        .where(SolicitudAlquiler.id_solicitud_alquiler == alquiler.id_solicitud_alquiler)
    )).scalar_one_or_none()
    if not sol:
        return ApiResponse(success=False, message="Solicitud asociada no encontrada")

    empresa = (await db.execute(
        select(Empresa).where(Empresa.id_empresa == sol.id_empresa)
    )).scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    if current_user.rol.codigo == "ADMIN_EMPRESA" and empresa.id_usuario != current_user.id_usuario:
        return ApiResponse(success=False, message="No tiene acceso a este alquiler")

    estado_codigo = alquiler.estado_alquiler_rel.codigo if alquiler.estado_alquiler_rel else ""
    if estado_codigo != "FINALIZACION":
        return ApiResponse(
            success=False,
            message=f"Estado actual invalido: {estado_codigo}. Se requiere FINALIZACION.",
        )

    repartidor = (await db.execute(
        select(Repartidor).where(
            Repartidor.id_empresa == empresa.id_empresa,
            Repartidor.estado == 1,
            Repartidor.disponible == 1,
        ).limit(1)
    )).scalar_one_or_none()
    if not repartidor:
        return ApiResponse(success=False, message="No hay repartidores disponibles en la empresa")

    repartidor.disponible = 0

    ruta = (await db.execute(
        select(RutaGPS).where(RutaGPS.id_alquiler == alquiler.id_alquiler)
    )).scalar_one_or_none()

    if ruta:
        ruta.id_repartidor = repartidor.id_repartidor
        ruta.estado = "PENDIENTE"
        ruta.latitud_destino = sol.latitud
        ruta.longitud_destino = sol.longitud
        ruta.latitud_cliente = sol.latitud
        ruta.longitud_cliente = sol.longitud
        ruta.fecha_inicio = None
        ruta.fecha_fin = None
        ruta.ultima_actualizacion = datetime.now(timezone.utc)
    else:
        ruta = RutaGPS(
            uuid=generate_uuid(),
            id_alquiler=alquiler.id_alquiler,
            id_repartidor=repartidor.id_repartidor,
            id_empresa=empresa.id_empresa,
            latitud_destino=sol.latitud,
            longitud_destino=sol.longitud,
            latitud_cliente=sol.latitud,
            longitud_cliente=sol.longitud,
            estado="PENDIENTE",
        )
        db.add(ruta)

    await db.flush()

    cliente_emp = (await db.execute(
        select(ClienteEmpresa).where(ClienteEmpresa.id_cliente_empresa == alquiler.id_cliente_empresa)
    )).scalar_one_or_none()

    if cliente_emp:
        await create_notification_and_push(
            db, cliente_emp.id_usuario,
            titulo="Recogida programada",
            mensaje=f"La empresa ha programado la recogida de tu lavadora. Un repartidor pasara pronto.",
            tipo="SERVICIO",
            icono="truck-delivery",
            color="#12A594",
            data={"alquiler_uuid": alquiler.uuid, "ruta_uuid": ruta.uuid},
        )

    await db.commit()

    return ApiResponse(success=True, message="Recogida programada exitosamente", data={
        "alquiler_uuid": alquiler.uuid,
        "ruta_uuid": ruta.uuid,
        "repartidor_uuid": repartidor.uuid,
        "estado_ruta": ruta.estado,
        "mensaje": "La recogida ha sido programada. El repartidor fue asignado y el cliente notificado.",
    })
