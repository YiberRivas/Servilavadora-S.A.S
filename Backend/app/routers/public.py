from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.base import (
    Empresa, EstadoEmpresa, Sucursal, Lavadora,
    CapacidadLavadora, TarifaEmpresa, ConfiguracionEmpresa,
    Direccion, Barrio, Municipio,
)

router = APIRouter(prefix="/public", tags=["Publico"])


async def _get_empresa_completa(empresa_uuid: str, db: AsyncSession):
    result = await db.execute(
        select(Empresa)
        .options(
            selectinload(Empresa.estado_empresa_rel),
            selectinload(Empresa.direccion).selectinload(Direccion.barrio).selectinload(Barrio.municipio),
            selectinload(Empresa.configuracion),
            selectinload(Empresa.sucursales),
        )
        .where(Empresa.uuid == empresa_uuid, Empresa.estado == 1)
    )
    return result.scalar_one_or_none()


async def _build_empresa_data(empresa, db: AsyncSession):
    barrio = None
    municipio = None
    if empresa.direccion and empresa.direccion.barrio:
        barrio = empresa.direccion.barrio
        if barrio.municipio:
            municipio = barrio.municipio

    lavadoras_result = await db.execute(
        select(
            func.count(Lavadora.id_lavadora).label("total"),
            func.sum(
                case(
                    (Lavadora.disponible == 1, 1),
                    else_=0,
                )
            ).label("disponibles"),
        )
        .where(Lavadora.id_empresa == empresa.id_empresa, Lavadora.estado == 1)
    )
    lav_stats = lavadoras_result.one()
    total_lav = lav_stats.total or 0
    lav_disp = lav_stats.disponibles or 0

    capacidades_result = await db.execute(
        select(
            CapacidadLavadora.capacidad_kg,
            func.count(Lavadora.id_lavadora).label("total"),
            func.sum(
                case(
                    (Lavadora.disponible == 1, 1),
                    else_=0,
                )
            ).label("disponibles"),
        )
        .join(Lavadora, Lavadora.id_capacidad_lavadora == CapacidadLavadora.id_capacidad_lavadora)
        .where(Lavadora.id_empresa == empresa.id_empresa, Lavadora.estado == 1)
        .group_by(CapacidadLavadora.id_capacidad_lavadora, CapacidadLavadora.capacidad_kg)
        .order_by(CapacidadLavadora.capacidad_kg)
    )
    cap_rows = capacidades_result.all()

    tarifas_result = await db.execute(
        select(
            CapacidadLavadora.capacidad_kg,
            TarifaEmpresa.valor_hora,
        )
        .join(CapacidadLavadora, CapacidadLavadora.id_capacidad_lavadora == TarifaEmpresa.id_capacidad_lavadora)
        .where(TarifaEmpresa.id_empresa == empresa.id_empresa, TarifaEmpresa.activa == 1)
    )
    tarifas_map = {float(t.capacidad_kg): float(t.valor_hora) for t in tarifas_result.all()}

    capacities = []
    for row in cap_rows:
        kg = float(row.capacidad_kg)
        precio = tarifas_map.get(kg, 0)

        capacities.append({
            "kg": int(kg),
            "type": f"Lavadora {int(kg)}kg",
            "available": int(row.disponibles or 0),
            "price": int(precio),
        })

    tarifas_precios = [c["price"] for c in capacities if c["price"] > 0]
    tarifa_min = min(tarifas_precios) if tarifas_precios else 0
    tarifa_max = max(tarifas_precios) if tarifas_precios else 0

    config = empresa.configuracion if hasattr(empresa, "configuracion") else None
    permite_reservas = True
    if config:
        permite_reservas = bool(config.permite_reservas) if config.permite_reservas is not None else True

    verified = False
    if empresa.estado_empresa_rel:
        verified = empresa.estado_empresa_rel.codigo == "ACTIVO"

    return {
        "uuid": empresa.uuid,
        "nombre_comercial": empresa.nombre_comercial or empresa.razon_social,
        "descripcion": empresa.descripcion or "",
        "logo": empresa.logo,
        "correo": empresa.correo,
        "telefono": empresa.telefono,
        "celular": empresa.celular,
        "sitio_web": empresa.sitio_web,
        "neighborhood": barrio.nombre if barrio else "",
        "city": municipio.nombre if municipio else "",
        "direccion_completa": empresa.direccion.direccion if empresa.direccion else "",
        "latitud": float(empresa.direccion.latitud) if empresa.direccion and empresa.direccion.latitud else None,
        "longitud": float(empresa.direccion.longitud) if empresa.direccion and empresa.direccion.longitud else None,
        "permite_reservas": permite_reservas,
        "verified": verified,
        "total_lavadoras": total_lav,
        "lavadoras_disponibles": int(lav_disp),
        "capacities": capacities,
        "tarifa_min": tarifa_min,
        "tarifa_max": tarifa_max,
    }


@router.get("/empresas")
async def list_empresas_public(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Empresa)
        .options(
            selectinload(Empresa.estado_empresa_rel),
            selectinload(Empresa.direccion).selectinload(Direccion.barrio).selectinload(Barrio.municipio),
            selectinload(Empresa.configuracion),
        )
        .join(EstadoEmpresa, Empresa.id_estado_empresa == EstadoEmpresa.id_estado_empresa)
        .where(Empresa.estado == 1, EstadoEmpresa.codigo == "ACTIVO")
        .order_by(Empresa.nombre_comercial)
    )
    empresas = result.scalars().all()

    data = []
    for emp in empresas:
        data.append(await _build_empresa_data(emp, db))

    return {"success": True, "message": "OK", "data": data}


@router.get("/empresas/{empresa_uuid}")
async def get_empresa_public(empresa_uuid: str, db: AsyncSession = Depends(get_db)):
    empresa = await _get_empresa_completa(empresa_uuid, db)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    data = await _build_empresa_data(empresa, db)

    sucursales = []
    if empresa.sucursales:
        for s in empresa.sucursales:
            if s.estado == 1:
                dir_text = ""
                if s.direccion:
                    dir_text = s.direccion.direccion
                sucursales.append({
                    "uuid": s.uuid,
                    "nombre": s.nombre,
                    "direccion": dir_text,
                    "telefono": s.telefono,
                    "correo": s.correo,
                    "principal": bool(s.principal),
                })
    data["sucursales"] = sucursales

    return {"success": True, "message": "OK", "data": data}
