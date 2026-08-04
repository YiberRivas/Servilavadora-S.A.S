from typing import Optional
from pydantic import BaseModel


class PagoCreate(BaseModel):
    id_liquidacion_alquiler: int
    id_metodo_pago: int
    valor: float
    numero_transaccion: Optional[str] = None
    referencia: Optional[str] = None
    observaciones: Optional[str] = None


class DeviceTokenRequest(BaseModel):
    expo_push_token: str
    dispositivo: Optional[str] = None
