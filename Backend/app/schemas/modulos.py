from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class ClienteCreate(BaseModel):
    id_empresa: int
    id_usuario: int
    fecha_registro: date
    observaciones: Optional[str] = None


class ClienteUpdate(BaseModel):
    observaciones: Optional[str] = None
    estado: Optional[int] = None


class ClienteResponse(BaseModel):
    uuid: str
    id_empresa: int
    id_usuario: int
    fecha_registro: str
    observaciones: Optional[str] = None
    estado: int
    nombre_completo: Optional[str] = None
    correo: Optional[str] = None
    telefono: Optional[str] = None
    numero_documento: Optional[str] = None

    class Config:
        from_attributes = True


class RepartidorCreate(BaseModel):
    id_empresa: int
    id_usuario: int
    licencia: Optional[str] = None
    vence_licencia: Optional[date] = None


class RepartidorUpdate(BaseModel):
    licencia: Optional[str] = None
    vence_licencia: Optional[date] = None
    disponible: Optional[int] = None
    estado: Optional[int] = None


class RutaCreate(BaseModel):
    id_empresa: int
    nombre: str
    origen: str
    destino: str
    distancia_km: Optional[float] = None
    tiempo_estimado_minutos: Optional[int] = None
    latitud_origen: Optional[float] = None
    longitud_origen: Optional[float] = None
    latitud_destino: Optional[float] = None
    longitud_destino: Optional[float] = None


class RutaUpdate(BaseModel):
    nombre: Optional[str] = None
    origen: Optional[str] = None
    destino: Optional[str] = None
    distancia_km: Optional[float] = None
    tiempo_estimado_minutos: Optional[int] = None
    activa: Optional[int] = None


class RutaResponse(BaseModel):
    uuid: str
    id_empresa: int
    nombre: str
    origen: str
    destino: str
    distancia_km: Optional[float] = None
    tiempo_estimado_minutos: Optional[int] = None
    activa: int

    class Config:
        from_attributes = True


class NotificacionResponse(BaseModel):
    uuid: str
    titulo: str
    mensaje: str
    tipo: Optional[str] = None
    leida: int
    fecha_lectura: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class TicketCreate(BaseModel):
    id_empresa: Optional[int] = None
    asunto: str
    descripcion: str
    prioridad: str = "MEDIA"


class TicketUpdate(BaseModel):
    prioridad: Optional[str] = None
    estado: Optional[str] = None


class TicketResponse(BaseModel):
    uuid: str
    asunto: str
    descripcion: str
    prioridad: str
    estado: str
    fecha_cierre: Optional[str] = None
    created_at: str
    empresa_nombre: Optional[str] = None
    usuario_nombre: Optional[str] = None
    total_respuestas: int = 0

    class Config:
        from_attributes = True


class TicketRespuestaCreate(BaseModel):
    respuesta: str


class TicketRespuestaResponse(BaseModel):
    uuid: str
    respuesta: str
    usuario_nombre: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class ArchivoCreate(BaseModel):
    nombre_original: str
    nombre_servidor: str
    extension: Optional[str] = None
    mime_type: Optional[str] = None
    peso: Optional[int] = None
    ruta: str
    hash_sha256: Optional[str] = None


class ArchivoResponse(BaseModel):
    uuid: str
    nombre_original: str
    nombre_servidor: str
    extension: Optional[str] = None
    mime_type: Optional[str] = None
    peso: Optional[int] = None
    ruta: str
    estado: int
    created_at: str

    class Config:
        from_attributes = True


class MantenimientoCreate(BaseModel):
    id_lavadora: int
    fecha: str
    tipo: str
    descripcion: Optional[str] = None
    costo: Optional[float] = None
    realizado_por: Optional[str] = None
    proximo_mantenimiento: Optional[str] = None


class MantenimientoResponse(BaseModel):
    uuid: str
    id_lavadora: int
    fecha: str
    tipo: str
    descripcion: Optional[str] = None
    costo: Optional[float] = None
    realizado_por: Optional[str] = None
    proximo_mantenimiento: Optional[str] = None
    lavadora_codigo: Optional[str] = None

    class Config:
        from_attributes = True


class ColaEsperaCreate(BaseModel):
    id_empresa: int
    id_cliente_empresa: int
    id_capacidad_lavadora: int
    prioridad: int = 1
    observaciones: Optional[str] = None


class ColaEsperaResponse(BaseModel):
    uuid: str
    id_empresa: int
    id_cliente_empresa: int
    id_capacidad_lavadora: int
    fecha_solicitud: str
    prioridad: int
    observaciones: Optional[str] = None
    estado: int

    class Config:
        from_attributes = True


class TarifaCreate(BaseModel):
    id_empresa: int
    id_capacidad_lavadora: int
    valor_hora: float
    valor_minuto: float
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None


class TarifaUpdate(BaseModel):
    valor_hora: Optional[float] = None
    valor_minuto: Optional[float] = None
    activa: Optional[int] = None


class TarifaResponse(BaseModel):
    uuid: str
    id_empresa: int
    id_capacidad_lavadora: int
    valor_hora: float
    valor_minuto: float
    activa: int
    capacidad_kg: Optional[float] = None

    class Config:
        from_attributes = True


class SuscripcionCreate(BaseModel):
    id_empresa: int
    id_plan: int
    fecha_inicio: str
    fecha_fin: str
    valor: float


class SuscripcionUpdate(BaseModel):
    activa: Optional[int] = None
    pagada: Optional[int] = None
    fecha_fin: Optional[str] = None


class PagoEmpresaCreate(BaseModel):
    id_empresa: int
    id_suscripcion: int
    id_metodo_pago: int
    valor: float
    numero_transaccion: Optional[str] = None
    comprobante: Optional[str] = None
    observaciones: Optional[str] = None


class HistorialLavadoraResponse(BaseModel):
    uuid: str
    id_lavadora: int
    evento: str
    descripcion: Optional[str] = None
    usuario: Optional[str] = None
    fecha_evento: str

    class Config:
        from_attributes = True


class HistorialAlquilerResponse(BaseModel):
    uuid: str
    id_alquiler: int
    evento: str
    descripcion: Optional[str] = None
    fecha_evento: str
    usuario_responsable: Optional[str] = None

    class Config:
        from_attributes = True


class RutaGPSCreate(BaseModel):
    alquiler_uuid: str
    latitud_destino: float
    longitud_destino: float
    latitud_cliente: Optional[float] = None
    longitud_cliente: Optional[float] = None


class RutaGPSUpdate(BaseModel):
    latitud: float
    longitud: float
    precision: Optional[float] = None
    heading: Optional[float] = None
    velocidad: Optional[float] = None
    timestamp: str
