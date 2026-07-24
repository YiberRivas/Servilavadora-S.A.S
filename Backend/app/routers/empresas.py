from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.database import get_db
from app.models.base import (
    Usuario, Empresa, EstadoEmpresa, Sucursal, ConfiguracionEmpresa,
    Suscripcion, Plan, PagoEmpresa, MetodoPago, EstadoPago,
    EmpresaArchivo, Archivo,
)
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.empresa import (
    EmpresaCreate, EmpresaUpdate, EmpresaResponse, EmpresaFilter,
    SucursalCreate, SucursalResponse,
)
from app.dependencies import get_current_user, require_role
from app.utils.logging import get_logger
from app.utils.uuid import generate_uuid
from math import ceil

logger = get_logger(__name__)
router = APIRouter(prefix="/empresas", tags=["Empresas"])


@router.get("", response_model=PaginatedResponse)
async def list_empresas(
    search: str = Query(None),
    id_estado_empresa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Empresa).join(EstadoEmpresa, Empresa.id_estado_empresa == EstadoEmpresa.id_estado_empresa)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Empresa.razon_social.ilike(search_term),
                Empresa.nombre_comercial.ilike(search_term),
                Empresa.nit.ilike(search_term),
                Empresa.correo.ilike(search_term),
            )
        )
    if id_estado_empresa:
        query = query.where(Empresa.id_estado_empresa == id_estado_empresa)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Empresa.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    empresas = result.scalars().all()

    data = []
    for e in empresas:
        suscripcion_result = await db.execute(
            select(Suscripcion).join(Plan).where(
                Suscripcion.id_empresa == e.id_empresa,
                Suscripcion.activa == 1,
            ).order_by(Suscripcion.created_at.desc()).limit(1)
        )
        suscripcion = suscripcion_result.scalar_one_or_none()

        pagos_count = (await db.execute(
            select(func.count()).where(PagoEmpresa.id_empresa == e.id_empresa)
        )).scalar() or 0

        data.append({
            "uuid": e.uuid,
            "nit": e.nit,
            "razon_social": e.razon_social,
            "nombre_comercial": e.nombre_comercial,
            "representante_legal": e.representante_legal,
            "correo": e.correo,
            "telefono": e.telefono,
            "celular": e.celular,
            "sitio_web": e.sitio_web,
            "logo": e.logo,
            "id_estado_empresa": e.id_estado_empresa,
            "estado_nombre": e.estado_empresa_rel.nombre if e.estado_empresa_rel else "",
            "estado_color": e.estado_empresa_rel.color if e.estado_empresa_rel else "",
            "fecha_registro": e.fecha_registro.isoformat() if e.fecha_registro else None,
            "fecha_aprobacion": e.fecha_aprobacion.isoformat() if e.fecha_aprobacion else None,
            "observaciones": e.observaciones,
            "estado": e.estado,
            "plan_nombre": suscripcion.plan.nombre if suscripcion and suscripcion.plan else "Sin plan",
            "total_pagos": pagos_count,
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/pendientes", response_model=PaginatedResponse)
async def list_empresas_pendientes(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = select(Empresa).join(EstadoEmpresa).where(EstadoEmpresa.codigo == "PENDIENTE")

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Empresa.fecha_registro.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    empresas = result.scalars().all()

    data = []
    for e in empresas:
        data.append({
            "uuid": e.uuid,
            "nit": e.nit,
            "razon_social": e.razon_social,
            "nombre_comercial": e.nombre_comercial,
            "representante_legal": e.representante_legal,
            "correo": e.correo,
            "telefono": e.telefono,
            "fecha_registro": e.fecha_registro.isoformat() if e.fecha_registro else None,
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )


@router.get("/{empresa_uuid}", response_model=ApiResponse)
async def get_empresa(
    empresa_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid))
    empresa = result.scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    return ApiResponse(
        success=True,
        message="OK",
        data={
            "uuid": empresa.uuid,
            "nit": empresa.nit,
            "razon_social": empresa.razon_social,
            "nombre_comercial": empresa.nombre_comercial,
            "representante_legal": empresa.representante_legal,
            "correo": empresa.correo,
            "telefono": empresa.telefono,
            "celular": empresa.celular,
            "sitio_web": empresa.sitio_web,
            "logo": empresa.logo,
            "descripcion": empresa.descripcion,
            "id_estado_empresa": empresa.id_estado_empresa,
            "estado_nombre": empresa.estado_empresa_rel.nombre if empresa.estado_empresa_rel else "",
            "fecha_registro": empresa.fecha_registro.isoformat() if empresa.fecha_registro else None,
            "fecha_aprobacion": empresa.fecha_aprobacion.isoformat() if empresa.fecha_aprobacion else None,
            "observaciones": empresa.observaciones,
            "estado": empresa.estado,
        },
    )


@router.post("", response_model=ApiResponse)
async def create_empresa(
    data: EmpresaCreate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Empresa).where(Empresa.nit == data.nit))
    if existing.scalar_one_or_none():
        return ApiResponse(success=False, message="El NIT ya esta registrado")

    new_empresa = Empresa(
        uuid=generate_uuid(),
        nit=data.nit,
        razon_social=data.razon_social,
        nombre_comercial=data.nombre_comercial,
        representante_legal=data.representante_legal,
        correo=data.correo,
        telefono=data.telefono,
        celular=data.celular,
        sitio_web=data.sitio_web,
        descripcion=data.descripcion,
        id_estado_empresa=data.id_estado_empresa,
        id_direccion=data.id_direccion,
        fecha_registro=datetime.now(timezone.utc),
    )
    db.add(new_empresa)
    await db.flush()

    logger.info("Empresa creada: %s", data.razon_social)
    return ApiResponse(success=True, message="Empresa creada", data={"uuid": new_empresa.uuid})


@router.put("/{empresa_uuid}", response_model=ApiResponse)
async def update_empresa(
    empresa_uuid: str,
    data: EmpresaUpdate,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid))
    empresa = result.scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(empresa, key, value)

    await db.flush()
    logger.info("Empresa actualizada: %s", empresa_uuid)
    return ApiResponse(success=True, message="Empresa actualizada")


@router.put("/{empresa_uuid}/aprobar", response_model=ApiResponse)
async def aprobar_empresa(
    empresa_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid))
    empresa = result.scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    estado_result = await db.execute(
        select(EstadoEmpresa).where(EstadoEmpresa.codigo == "ACTIVA")
    )
    estado = estado_result.scalar_one_or_none()
    if not estado:
        return ApiResponse(success=False, message="Estado no encontrado")

    empresa.id_estado_empresa = estado.id_estado_empresa
    empresa.fecha_aprobacion = datetime.now(timezone.utc)
    await db.flush()

    logger.info("Empresa aprobada: %s", empresa_uuid)
    return ApiResponse(success=True, message="Empresa aprobada")


@router.put("/{empresa_uuid}/rechazar", response_model=ApiResponse)
async def rechazar_empresa(
    empresa_uuid: str,
    observaciones: str = Query(None),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid))
    empresa = result.scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    estado_result = await db.execute(
        select(EstadoEmpresa).where(EstadoEmpresa.codigo == "RECHAZADA")
    )
    estado = estado_result.scalar_one_or_none()
    if not estado:
        return ApiResponse(success=False, message="Estado no encontrado")

    empresa.id_estado_empresa = estado.id_estado_empresa
    empresa.observaciones = observaciones
    await db.flush()

    logger.info("Empresa rechazada: %s", empresa_uuid)
    return ApiResponse(success=True, message="Empresa rechazada")


@router.delete("/{empresa_uuid}", response_model=ApiResponse)
async def delete_empresa(
    empresa_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid))
    empresa = result.scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    empresa.estado = 0
    await db.flush()
    logger.info("Empresa desactivada: %s", empresa_uuid)
    return ApiResponse(success=True, message="Empresa desactivada")


@router.get("/{empresa_uuid}/sucursales", response_model=ApiResponse)
async def list_sucursales(
    empresa_uuid: str,
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    empresa_result = await db.execute(select(Empresa).where(Empresa.uuid == empresa_uuid))
    empresa = empresa_result.scalar_one_or_none()
    if not empresa:
        return ApiResponse(success=False, message="Empresa no encontrada")

    result = await db.execute(
        select(Sucursal).where(Sucursal.id_empresa == empresa.id_empresa)
    )
    sucursales = result.scalars().all()

    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {
                "uuid": s.uuid,
                "nombre": s.nombre,
                "telefono": s.telefono,
                "correo": s.correo,
                "principal": s.principal,
                "estado": s.estado,
            }
            for s in sucursales
        ],
    )


@router.get("/planes/all", response_model=ApiResponse)
async def list_planes(
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Plan).where(Plan.estado == 1))
    planes = result.scalars().all()

    return ApiResponse(
        success=True,
        message="OK",
        data=[
            {
                "uuid": p.uuid,
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "precio_mensual": float(p.precio_mensual),
                "cantidad_sucursales": p.cantidad_sucursales,
                "cantidad_repartidores": p.cantidad_repartidores,
                "cantidad_lavadoras": p.cantidad_lavadoras,
                "soporte_prioritario": p.soporte_prioritario,
            }
            for p in planes
        ],
    )


@router.get("/pagos/all", response_model=PaginatedResponse)
async def list_pagos_empresa(
    id_empresa: int = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: Usuario = Depends(require_role("SUPER_ADMIN")),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(PagoEmpresa)
        .join(Empresa, PagoEmpresa.id_empresa == Empresa.id_empresa)
        .join(MetodoPago, PagoEmpresa.id_metodo_pago == MetodoPago.id_metodo_pago)
        .join(EstadoPago, PagoEmpresa.id_estado_pago == EstadoPago.id_estado_pago)
    )
    if id_empresa:
        query = query.where(PagoEmpresa.id_empresa == id_empresa)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(PagoEmpresa.created_at.desc())
    query = query.offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    pagos = result.scalars().all()

    data = []
    for pg in pagos:
        empresa = await db.execute(select(Empresa).where(Empresa.id_empresa == pg.id_empresa))
        emp = empresa.scalar_one_or_none()
        data.append({
            "uuid": pg.uuid,
            "id_empresa": pg.id_empresa,
            "empresa_nombre": emp.razon_social if emp else "",
            "valor": float(pg.valor),
            "numero_transaccion": pg.numero_transaccion,
            "fecha_pago": pg.fecha_pago.isoformat() if pg.fecha_pago else None,
            "metodo_pago_nombre": pg.metodo_pago.nombre if pg.metodo_pago else "",
            "estado_pago_nombre": pg.estado_pago_rel.nombre if pg.estado_pago_rel else "",
            "estado_pago_color": pg.estado_pago_rel.color if pg.estado_pago_rel else "",
        })

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=ceil(total / per_page) if per_page > 0 else 0,
    )
