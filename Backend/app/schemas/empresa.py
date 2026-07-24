from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class EmpresaCreate(BaseModel):
    nit: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    representante_legal: str
    correo: str
    telefono: Optional[str] = None
    celular: Optional[str] = None
    sitio_web: Optional[str] = None
    descripcion: Optional[str] = None
    id_estado_empresa: int
    id_direccion: Optional[int] = None


class EmpresaUpdate(BaseModel):
    nit: Optional[str] = None
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    representante_legal: Optional[str] = None
    correo: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    sitio_web: Optional[str] = None
    descripcion: Optional[str] = None
    id_estado_empresa: Optional[int] = None
    observaciones: Optional[str] = None


class EmpresaResponse(BaseModel):
    uuid: str
    nit: str
    razon_social: str
    nombre_comercial: Optional[str] = None
    representante_legal: str
    correo: str
    telefono: Optional[str] = None
    celular: Optional[str] = None
    sitio_web: Optional[str] = None
    logo: Optional[str] = None
    descripcion: Optional[str] = None
    id_estado_empresa: int
    fecha_registro: datetime
    fecha_aprobacion: Optional[datetime] = None
    observaciones: Optional[str] = None
    estado: int
    estado_nombre: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EmpresaFilter(BaseModel):
    search: Optional[str] = None
    id_estado_empresa: Optional[int] = None
    page: int = 1
    per_page: int = 20


class SucursalCreate(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[str] = None
    id_direccion: int
    principal: int = 0


class SucursalResponse(BaseModel):
    uuid: str
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[str] = None
    id_direccion: int
    principal: int
    estado: int
    id_empresa: int

    class Config:
        from_attributes = True


class PlanResponse(BaseModel):
    uuid: str
    nombre: str
    descripcion: Optional[str] = None
    precio_mensual: float
    cantidad_sucursales: Optional[int] = None
    cantidad_repartidores: Optional[int] = None
    cantidad_lavadoras: Optional[int] = None
    soporte_prioritario: int
    estado: int

    class Config:
        from_attributes = True


class SuscripcionResponse(BaseModel):
    uuid: str
    id_empresa: int
    id_plan: int
    fecha_inicio: str
    fecha_fin: str
    valor: float
    pagada: int
    activa: int
    plan_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class PagoEmpresaResponse(BaseModel):
    uuid: str
    id_empresa: int
    id_suscripcion: int
    id_metodo_pago: int
    id_estado_pago: int
    valor: float
    numero_transaccion: Optional[str] = None
    fecha_pago: Optional[datetime] = None
    comprobante: Optional[str] = None
    observaciones: Optional[str] = None
    metodo_pago_nombre: Optional[str] = None
    estado_pago_nombre: Optional[str] = None

    class Config:
        from_attributes = True
