from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel


class PersonaBase(BaseModel):
    numero_documento: str
    nombres: str
    apellidos: str
    correo: str
    telefono: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    id_tipo_documento: int
    id_genero: Optional[int] = None
    id_direccion: Optional[int] = None


class PersonaCreate(PersonaBase):
    pass


class PersonaResponse(PersonaBase):
    uuid: str
    estado: int
    created_at: datetime

    class Config:
        from_attributes = True


class UsuarioCreate(BaseModel):
    username: str
    password: str
    id_persona: int
    id_rol: int
    id_estado_usuario: int


class UsuarioUpdate(BaseModel):
    username: Optional[str] = None
    id_rol: Optional[int] = None
    id_estado_usuario: Optional[int] = None
    estado: Optional[int] = None


class UsuarioResponse(BaseModel):
    uuid: str
    username: str
    id_rol: int
    id_estado_usuario: int
    estado: int
    ultimo_login: Optional[datetime] = None
    cambiar_password: int
    doble_factor: int
    created_at: datetime
    persona: Optional[PersonaResponse] = None
    rol_nombre: Optional[str] = None
    estado_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class RolResponse(BaseModel):
    uuid: str
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    es_sistema: int
    estado: int

    class Config:
        from_attributes = True


class PermisoResponse(BaseModel):
    uuid: str
    modulo: str
    codigo: str
    nombre: str
    descripcion: Optional[str] = None

    class Config:
        from_attributes = True
