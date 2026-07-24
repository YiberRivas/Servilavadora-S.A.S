from sqlalchemy import (
    Column, BigInteger, String, Text, Integer, Date, DateTime, Numeric,
    SmallInteger, JSON, Enum as SAEnum, UniqueConstraint, ForeignKey, Index,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Pais(Base):
    __tablename__ = "pais"
    id_pais = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    codigo_iso2 = Column(String(2), nullable=False, unique=True)
    codigo_iso3 = Column(String(3), nullable=False, unique=True)
    indicativo = Column(String(10))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    departamentos = relationship("Departamento", back_populates="pais")


class Departamento(Base):
    __tablename__ = "departamento"
    id_departamento = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_pais = Column(BigInteger, ForeignKey("pais.id_pais"), nullable=False)
    nombre = Column(String(120), nullable=False)
    codigo_dane = Column(String(10))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    pais = relationship("Pais", back_populates="departamentos")
    municipios = relationship("Municipio", back_populates="departamento")


class Municipio(Base):
    __tablename__ = "municipio"
    id_municipio = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_departamento = Column(BigInteger, ForeignKey("departamento.id_departamento"), nullable=False)
    nombre = Column(String(120), nullable=False)
    codigo_dane = Column(String(10))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    departamento = relationship("Departamento", back_populates="municipios")
    barrios = relationship("Barrio", back_populates="municipio")


class Barrio(Base):
    __tablename__ = "barrio"
    id_barrio = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_municipio = Column(BigInteger, ForeignKey("municipio.id_municipio"), nullable=False)
    nombre = Column(String(150), nullable=False)
    codigo_postal = Column(String(15))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    municipio = relationship("Municipio", back_populates="barrios")
    direcciones = relationship("Direccion", back_populates="barrio")


class Direccion(Base):
    __tablename__ = "direccion"
    id_direccion = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_barrio = Column(BigInteger, ForeignKey("barrio.id_barrio"))
    direccion = Column(String(255), nullable=False)
    complemento = Column(String(150))
    referencia = Column(Text)
    codigo_plus = Column(String(30))
    latitud = Column(Numeric(10, 8))
    longitud = Column(Numeric(11, 8))
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    barrio = relationship("Barrio", back_populates="direcciones")


class TipoDocumento(Base):
    __tablename__ = "tipo_documento"
    id_tipo_documento = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(10), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    personas = relationship("Persona", back_populates="tipo_documento")


class Genero(Base):
    __tablename__ = "genero"
    id_genero = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nombre = Column(String(50), nullable=False)
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    personas = relationship("Persona", back_populates="genero")


class Persona(Base):
    __tablename__ = "persona"
    id_persona = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_tipo_documento = Column(BigInteger, ForeignKey("tipo_documento.id_tipo_documento"), nullable=False)
    numero_documento = Column(String(30), nullable=False, unique=True)
    nombres = Column(String(120), nullable=False)
    apellidos = Column(String(120), nullable=False)
    id_genero = Column(BigInteger, ForeignKey("genero.id_genero"))
    fecha_nacimiento = Column(Date)
    correo = Column(String(150), nullable=False, unique=True)
    telefono = Column(String(30))
    id_direccion = Column(BigInteger, ForeignKey("direccion.id_direccion"))
    foto = Column(String(255))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    tipo_documento = relationship("TipoDocumento", back_populates="personas")
    genero = relationship("Genero", back_populates="personas")
    direccion = relationship("Direccion")
    usuario = relationship("Usuario", back_populates="persona", uselist=False)


class Rol(Base):
    __tablename__ = "rol"
    id_rol = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(50), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    es_sistema = Column(SmallInteger, nullable=False, default=0)
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    usuarios = relationship("Usuario", back_populates="rol")
    permisos = relationship("Permiso", secondary="rol_permiso", back_populates="roles")


class Permiso(Base):
    __tablename__ = "permiso"
    id_permiso = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    modulo = Column(String(100), nullable=False)
    codigo = Column(String(100), nullable=False, unique=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(String(255))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    roles = relationship("Rol", secondary="rol_permiso", back_populates="permisos")


class RolPermiso(Base):
    __tablename__ = "rol_permiso"
    id_rol_permiso = Column(BigInteger, primary_key=True, autoincrement=True)
    id_rol = Column(BigInteger, ForeignKey("rol.id_rol"), nullable=False)
    id_permiso = Column(BigInteger, ForeignKey("permiso.id_permiso"), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (UniqueConstraint("id_rol", "id_permiso", name="uk_rol_permiso"),)


class EstadoUsuario(Base):
    __tablename__ = "estado_usuario"
    id_estado_usuario = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    usuarios = relationship("Usuario", back_populates="estado_usuario")


class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_persona = Column(BigInteger, ForeignKey("persona.id_persona"), nullable=False)
    id_rol = Column(BigInteger, ForeignKey("rol.id_rol"), nullable=False)
    id_estado_usuario = Column(BigInteger, ForeignKey("estado_usuario.id_estado_usuario"), nullable=False)
    username = Column(String(80), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    ultimo_login = Column(DateTime)
    intentos_fallidos = Column(Integer, nullable=False, default=0)
    cambiar_password = Column(SmallInteger, nullable=False, default=0)
    doble_factor = Column(SmallInteger, nullable=False, default=0)
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    persona = relationship("Persona", back_populates="usuario")
    rol = relationship("Rol", back_populates="usuarios")
    estado_usuario = relationship("EstadoUsuario", back_populates="usuarios")
    sesiones = relationship("Sesion", back_populates="usuario")
    refresh_tokens = relationship("RefreshToken", back_populates="usuario")
    notificaciones = relationship("Notificacion", back_populates="usuario")


class Sesion(Base):
    __tablename__ = "sesion"
    id_sesion = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    token = Column(String(500))
    ip = Column(String(50))
    user_agent = Column(Text)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_expiracion = Column(DateTime)
    fecha_cierre = Column(DateTime)
    activa = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    usuario = relationship("Usuario", back_populates="sesiones")


class RefreshToken(Base):
    __tablename__ = "refresh_token"
    id_refresh_token = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    token = Column(String(500), nullable=False)
    fecha_expiracion = Column(DateTime, nullable=False)
    revocado = Column(SmallInteger, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    usuario = relationship("Usuario", back_populates="refresh_tokens")


class EstadoEmpresa(Base):
    __tablename__ = "estado_empresa"
    id_estado_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    empresas = relationship("Empresa", back_populates="estado_empresa_rel")


class Archivo(Base):
    __tablename__ = "archivo"
    id_archivo = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nombre_original = Column(String(255), nullable=False)
    nombre_servidor = Column(String(255), nullable=False)
    extension = Column(String(20))
    mime_type = Column(String(100))
    peso = Column(BigInteger)
    ruta = Column(String(500), nullable=False)
    hash_sha256 = Column(String(255))
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())


class Empresa(Base):
    __tablename__ = "empresa"
    id_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nit = Column(String(20), nullable=False, unique=True)
    razon_social = Column(String(200), nullable=False)
    nombre_comercial = Column(String(200))
    representante_legal = Column(String(200), nullable=False)
    correo = Column(String(150), nullable=False)
    telefono = Column(String(30))
    celular = Column(String(30))
    sitio_web = Column(String(200))
    logo = Column(String(255))
    descripcion = Column(Text)
    id_direccion = Column(BigInteger, ForeignKey("direccion.id_direccion"))
    id_estado_empresa = Column(BigInteger, ForeignKey("estado_empresa.id_estado_empresa"), nullable=False)
    fecha_registro = Column(DateTime, nullable=False)
    fecha_aprobacion = Column(DateTime)
    observaciones = Column(Text)
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    estado_empresa_rel = relationship("EstadoEmpresa", back_populates="empresas")
    direccion = relationship("Direccion")
    sucursales = relationship("Sucursal", back_populates="empresa")
    empleados = relationship("EmpleadoEmpresa", back_populates="empresa")
    repartidores = relationship("Repartidor", back_populates="empresa")
    lavadoras = relationship("Lavadora", back_populates="empresa")
    configuracion = relationship("ConfiguracionEmpresa", back_populates="empresa", uselist=False)
    archivos = relationship("EmpresaArchivo", back_populates="empresa")
    suscripciones = relationship("Suscripcion", back_populates="empresa")
    tarifas = relationship("TarifaEmpresa", back_populates="empresa")
    rutas = relationship("Ruta", back_populates="empresa")
    pagos = relationship("PagoEmpresa", back_populates="empresa")
    solicitudes = relationship("SolicitudAlquiler", back_populates="empresa")
    cola_espera = relationship("ColaEspera", back_populates="empresa")
    tickets_soporte = relationship("SoporteTicket", back_populates="empresa")


class EmpresaArchivo(Base):
    __tablename__ = "empresa_archivo"
    id_empresa_archivo = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_archivo = Column(BigInteger, ForeignKey("archivo.id_archivo"), nullable=False)
    tipo_documento = Column(String(100), nullable=False)
    aprobado = Column(SmallInteger, default=0)
    fecha_aprobacion = Column(DateTime)
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    empresa = relationship("Empresa", back_populates="archivos")
    archivo = relationship("Archivo")


class ConfiguracionEmpresa(Base):
    __tablename__ = "configuracion_empresa"
    id_configuracion_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False, unique=True)
    permite_reservas = Column(SmallInteger, default=1)
    tiempo_maximo_reserva = Column(Integer, default=30)
    moneda = Column(String(10), default="COP")
    zona_horaria = Column(String(100), default="America/Bogota")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="configuracion")


class ConfiguracionGlobal(Base):
    __tablename__ = "configuracion_global"
    id_configuracion_global = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    clave = Column(String(150), nullable=False, unique=True)
    valor = Column(Text)
    descripcion = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Sucursal(Base):
    __tablename__ = "sucursal"
    id_sucursal = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    nombre = Column(String(150), nullable=False)
    telefono = Column(String(30))
    correo = Column(String(150))
    id_direccion = Column(BigInteger, ForeignKey("direccion.id_direccion"), nullable=False)
    principal = Column(SmallInteger, default=0)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="sucursales")
    direccion = relationship("Direccion")
    lavadoras = relationship("Lavadora", back_populates="sucursal")
    solicitudes = relationship("SolicitudAlquiler", back_populates="sucursal")


class EmpleadoEmpresa(Base):
    __tablename__ = "empleado_empresa"
    id_empleado_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    cargo = Column(String(120), nullable=False)
    salario = Column(Numeric(12, 2))
    fecha_ingreso = Column(Date, nullable=False)
    fecha_retiro = Column(Date)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="empleados")
    usuario = relationship("Usuario")


class Repartidor(Base):
    __tablename__ = "repartidor"
    id_repartidor = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    licencia = Column(String(50))
    vence_licencia = Column(Date)
    disponible = Column(SmallInteger, default=1)
    latitud = Column(Numeric(10, 8))
    longitud = Column(Numeric(11, 8))
    ultima_conexion = Column(DateTime)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="repartidores")
    usuario = relationship("Usuario")


class CapacidadLavadora(Base):
    __tablename__ = "capacidad_lavadora"
    id_capacidad_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    capacidad_kg = Column(Numeric(4, 1), nullable=False, unique=True)
    descripcion = Column(String(100))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    lavadoras = relationship("Lavadora", back_populates="capacidad")
    solicitudes = relationship("SolicitudAlquiler", back_populates="capacidad")
    tarifas = relationship("TarifaEmpresa", back_populates="capacidad")
    cola_espera = relationship("ColaEspera", back_populates="capacidad")


class MarcaLavadora(Base):
    __tablename__ = "marca_lavadora"
    id_marca_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(String(255))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    modelos = relationship("ModeloLavadora", back_populates="marca")
    lavadoras = relationship("Lavadora", back_populates="marca")


class ModeloLavadora(Base):
    __tablename__ = "modelo_lavadora"
    id_modelo_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_marca_lavadora = Column(BigInteger, ForeignKey("marca_lavadora.id_marca_lavadora"), nullable=False)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    marca = relationship("MarcaLavadora", back_populates="modelos")
    lavadoras = relationship("Lavadora", back_populates="modelo")


class EstadoLavadora(Base):
    __tablename__ = "estado_lavadora"
    id_estado_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    lavadoras = relationship("Lavadora", back_populates="estado_lavadora_rel")


class Lavadora(Base):
    __tablename__ = "lavadora"
    id_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_sucursal = Column(BigInteger, ForeignKey("sucursal.id_sucursal"), nullable=False)
    id_marca_lavadora = Column(BigInteger, ForeignKey("marca_lavadora.id_marca_lavadora"), nullable=False)
    id_modelo_lavadora = Column(BigInteger, ForeignKey("modelo_lavadora.id_modelo_lavadora"), nullable=False)
    id_capacidad_lavadora = Column(BigInteger, ForeignKey("capacidad_lavadora.id_capacidad_lavadora"), nullable=False)
    id_estado_lavadora = Column(BigInteger, ForeignKey("estado_lavadora.id_estado_lavadora"), nullable=False)
    codigo_interno = Column(String(50), nullable=False, unique=True)
    numero_serie = Column(String(100), nullable=False, unique=True)
    color = Column(String(60))
    fecha_compra = Column(Date)
    valor_compra = Column(Numeric(12, 2))
    observaciones = Column(Text)
    disponible = Column(SmallInteger, default=1)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="lavadoras")
    sucursal = relationship("Sucursal", back_populates="lavadoras")
    marca = relationship("MarcaLavadora", back_populates="lavadoras")
    modelo = relationship("ModeloLavadora", back_populates="lavadoras")
    capacidad = relationship("CapacidadLavadora", back_populates="lavadoras")
    estado_lavadora_rel = relationship("EstadoLavadora", back_populates="lavadoras")
    fotografias = relationship("FotografiaLavadora", back_populates="lavadora")
    historial = relationship("HistorialLavadora", back_populates="lavadora")
    mantenimientos = relationship("MantenimientoLavadora", back_populates="lavadora")
    movimientos = relationship("MovimientoLavadora", back_populates="lavadora")
    alquileres = relationship("Alquiler", back_populates="lavadora")


class FotografiaLavadora(Base):
    __tablename__ = "fotografia_lavadora"
    id_fotografia_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_lavadora = Column(BigInteger, ForeignKey("lavadora.id_lavadora"), nullable=False)
    nombre_archivo = Column(String(255), nullable=False)
    ruta = Column(String(500), nullable=False)
    principal = Column(SmallInteger, default=0)
    created_at = Column(DateTime, server_default=func.now())

    lavadora = relationship("Lavadora", back_populates="fotografias")


class MantenimientoLavadora(Base):
    __tablename__ = "mantenimiento_lavadora"
    id_mantenimiento_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_lavadora = Column(BigInteger, ForeignKey("lavadora.id_lavadora"), nullable=False)
    fecha = Column(Date, nullable=False)
    tipo = Column(String(100), nullable=False)
    descripcion = Column(Text)
    costo = Column(Numeric(12, 2))
    realizado_por = Column(String(150))
    proximo_mantenimiento = Column(Date)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    lavadora = relationship("Lavadora", back_populates="mantenimientos")


class HistorialLavadora(Base):
    __tablename__ = "historial_lavadora"
    id_historial_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_lavadora = Column(BigInteger, ForeignKey("lavadora.id_lavadora"), nullable=False)
    evento = Column(String(120), nullable=False)
    descripcion = Column(Text)
    usuario = Column(String(150))
    fecha_evento = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    lavadora = relationship("Lavadora", back_populates="historial")


class MovimientoLavadora(Base):
    __tablename__ = "movimiento_lavadora"
    id_movimiento_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_lavadora = Column(BigInteger, ForeignKey("lavadora.id_lavadora"), nullable=False)
    id_estado_anterior = Column(BigInteger, ForeignKey("estado_lavadora.id_estado_lavadora"))
    id_estado_nuevo = Column(BigInteger, ForeignKey("estado_lavadora.id_estado_lavadora"), nullable=False)
    motivo = Column(String(255))
    fecha_movimiento = Column(DateTime, nullable=False)
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    lavadora = relationship("Lavadora", back_populates="movimientos")
    estado_anterior = relationship("EstadoLavadora", foreign_keys=[id_estado_anterior])
    estado_nuevo = relationship("EstadoLavadora", foreign_keys=[id_estado_nuevo])


class EstadoSolicitud(Base):
    __tablename__ = "estado_solicitud"
    id_estado_solicitud = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    solicitudes = relationship("SolicitudAlquiler", back_populates="estado_solicitud_rel")


class SolicitudAlquiler(Base):
    __tablename__ = "solicitud_alquiler"
    id_solicitud_alquiler = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_cliente_empresa = Column(BigInteger, ForeignKey("cliente_empresa.id_cliente_empresa"), nullable=False)
    id_sucursal = Column(BigInteger, ForeignKey("sucursal.id_sucursal"), nullable=False)
    id_capacidad_lavadora = Column(BigInteger, ForeignKey("capacidad_lavadora.id_capacidad_lavadora"), nullable=False)
    id_estado_solicitud = Column(BigInteger, ForeignKey("estado_solicitud.id_estado_solicitud"), nullable=False)
    fecha_solicitud = Column(DateTime, nullable=False)
    fecha_programada = Column(DateTime)
    observaciones = Column(Text)
    direccion_entrega = Column(String(255), nullable=False)
    latitud = Column(Numeric(10, 8))
    longitud = Column(Numeric(11, 8))
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="solicitudes")
    cliente_empresa = relationship("ClienteEmpresa", back_populates="solicitudes")
    sucursal = relationship("Sucursal", back_populates="solicitudes")
    capacidad = relationship("CapacidadLavadora", back_populates="solicitudes")
    estado_solicitud_rel = relationship("EstadoSolicitud", back_populates="solicitudes")
    asignaciones = relationship("AsignacionSolicitud", back_populates="solicitud")
    alquileres = relationship("Alquiler", back_populates="solicitud")


class AsignacionSolicitud(Base):
    __tablename__ = "asignacion_solicitud"
    id_asignacion_solicitud = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_solicitud_alquiler = Column(BigInteger, ForeignKey("solicitud_alquiler.id_solicitud_alquiler"), nullable=False)
    id_lavadora = Column(BigInteger, ForeignKey("lavadora.id_lavadora"), nullable=False)
    id_repartidor = Column(BigInteger, ForeignKey("repartidor.id_repartidor"), nullable=False)
    fecha_asignacion = Column(DateTime, nullable=False)
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    solicitud = relationship("SolicitudAlquiler", back_populates="asignaciones")
    lavadora = relationship("Lavadora")
    repartidor = relationship("Repartidor")


class ClienteEmpresa(Base):
    __tablename__ = "cliente_empresa"
    id_cliente_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    fecha_registro = Column(Date, nullable=False)
    observaciones = Column(Text)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("id_empresa", "id_usuario"),)

    empresa = relationship("Empresa")
    usuario = relationship("Usuario")
    solicitudes = relationship("SolicitudAlquiler", back_populates="cliente_empresa")
    cola_espera = relationship("ColaEspera", back_populates="cliente_empresa")


class EstadoAlquiler(Base):
    __tablename__ = "estado_alquiler"
    id_estado_alquiler = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    alquileres = relationship("Alquiler", back_populates="estado_alquiler_rel")


class Alquiler(Base):
    __tablename__ = "alquiler"
    id_alquiler = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_solicitud_alquiler = Column(BigInteger, ForeignKey("solicitud_alquiler.id_solicitud_alquiler"), nullable=False)
    id_lavadora = Column(BigInteger, ForeignKey("lavadora.id_lavadora"), nullable=False)
    id_cliente_empresa = Column(BigInteger, ForeignKey("cliente_empresa.id_cliente_empresa"), nullable=False)
    id_repartidor = Column(BigInteger, ForeignKey("repartidor.id_repartidor"), nullable=False)
    id_estado_alquiler = Column(BigInteger, ForeignKey("estado_alquiler.id_estado_alquiler"), nullable=False)
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    minutos_facturados = Column(Integer, default=0)
    valor_total = Column(Numeric(12, 2), default=0)
    observaciones = Column(Text)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    solicitud = relationship("SolicitudAlquiler", back_populates="alquileres")
    lavadora = relationship("Lavadora", back_populates="alquileres")
    cliente_empresa = relationship("ClienteEmpresa")
    repartidor = relationship("Repartidor")
    estado_alquiler_rel = relationship("EstadoAlquiler", back_populates="alquileres")
    cronometro = relationship("CronometroAlquiler", back_populates="alquiler", uselist=False)
    historial = relationship("HistorialAlquiler", back_populates="alquiler")
    evidencias_entrega = relationship("EvidenciaEntrega", back_populates="alquiler")
    devoluciones = relationship("DevolucionLavadora", back_populates="alquiler")
    liquidaciones = relationship("LiquidacionAlquiler", back_populates="alquiler")
    historial_ruta = relationship("HistorialRuta", back_populates="alquiler")


class CronometroAlquiler(Base):
    __tablename__ = "cronometro_alquiler"
    id_cronometro_alquiler = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_alquiler = Column(BigInteger, ForeignKey("alquiler.id_alquiler"), nullable=False)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime)
    minutos_transcurridos = Column(Integer, default=0)
    minutos_facturables = Column(Integer, default=0)
    valor_acumulado = Column(Numeric(12, 2), default=0)
    activo = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    alquiler = relationship("Alquiler", back_populates="cronometro")


class HistorialAlquiler(Base):
    __tablename__ = "historial_alquiler"
    id_historial_alquiler = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_alquiler = Column(BigInteger, ForeignKey("alquiler.id_alquiler"), nullable=False)
    evento = Column(String(150), nullable=False)
    descripcion = Column(Text)
    fecha_evento = Column(DateTime, nullable=False)
    usuario_responsable = Column(String(150))
    created_at = Column(DateTime, server_default=func.now())

    alquiler = relationship("Alquiler", back_populates="historial")


class EvidenciaEntrega(Base):
    __tablename__ = "evidencia_entrega"
    id_evidencia_entrega = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_alquiler = Column(BigInteger, ForeignKey("alquiler.id_alquiler"), nullable=False)
    id_archivo = Column(BigInteger, ForeignKey("archivo.id_archivo"), nullable=False)
    descripcion = Column(String(255))
    fecha_registro = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    alquiler = relationship("Alquiler", back_populates="evidencias_entrega")
    archivo = relationship("Archivo")


class DevolucionLavadora(Base):
    __tablename__ = "devolucion_lavadora"
    id_devolucion_lavadora = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_alquiler = Column(BigInteger, ForeignKey("alquiler.id_alquiler"), nullable=False)
    id_repartidor = Column(BigInteger, ForeignKey("repartidor.id_repartidor"), nullable=False)
    fecha_devolucion = Column(DateTime, nullable=False)
    estado_lavadora = Column(String(100))
    observaciones = Column(Text)
    requiere_mantenimiento = Column(SmallInteger, default=0)
    created_at = Column(DateTime, server_default=func.now())

    alquiler = relationship("Alquiler", back_populates="devoluciones")
    repartidor = relationship("Repartidor")
    evidencias = relationship("EvidenciaDevolucion", back_populates="devolucion")


class EvidenciaDevolucion(Base):
    __tablename__ = "evidencia_devolucion"
    id_evidencia_devolucion = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_devolucion_lavadora = Column(BigInteger, ForeignKey("devolucion_lavadora.id_devolucion_lavadora"), nullable=False)
    id_archivo = Column(BigInteger, ForeignKey("archivo.id_archivo"), nullable=False)
    descripcion = Column(String(255))
    fecha_registro = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    devolucion = relationship("DevolucionLavadora", back_populates="evidencias")
    archivo = relationship("Archivo")


class ColaEspera(Base):
    __tablename__ = "cola_espera"
    id_cola_espera = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_cliente_empresa = Column(BigInteger, ForeignKey("cliente_empresa.id_cliente_empresa"), nullable=False)
    id_capacidad_lavadora = Column(BigInteger, ForeignKey("capacidad_lavadora.id_capacidad_lavadora"), nullable=False)
    fecha_solicitud = Column(DateTime, nullable=False)
    prioridad = Column(Integer, default=1)
    observaciones = Column(Text)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="cola_espera")
    cliente_empresa = relationship("ClienteEmpresa", back_populates="cola_espera")
    capacidad = relationship("CapacidadLavadora", back_populates="cola_espera")


class MetodoPago(Base):
    __tablename__ = "metodo_pago"
    id_metodo_pago = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nombre = Column(String(80), nullable=False)
    descripcion = Column(String(255))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    pagos_cliente = relationship("PagoCliente", back_populates="metodo_pago")
    pagos_empresa = relationship("PagoEmpresa", back_populates="metodo_pago")


class EstadoPago(Base):
    __tablename__ = "estado_pago"
    id_estado_pago = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    pagos_cliente = relationship("PagoCliente", back_populates="estado_pago_rel")
    pagos_empresa = relationship("PagoEmpresa", back_populates="estado_pago_rel")


class LiquidacionAlquiler(Base):
    __tablename__ = "liquidacion_alquiler"
    id_liquidacion_alquiler = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_alquiler = Column(BigInteger, ForeignKey("alquiler.id_alquiler"), nullable=False)
    tiempo_real_minutos = Column(Integer, nullable=False)
    tiempo_facturado_minutos = Column(Integer, nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    descuentos = Column(Numeric(12, 2), default=0)
    recargos = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2), nullable=False)
    fecha_liquidacion = Column(DateTime, nullable=False)
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    alquiler = relationship("Alquiler", back_populates="liquidaciones")
    pagos_cliente = relationship("PagoCliente", back_populates="liquidacion")
    facturas = relationship("Factura", back_populates="liquidacion")


class PagoCliente(Base):
    __tablename__ = "pago_cliente"
    id_pago_cliente = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_liquidacion_alquiler = Column(BigInteger, ForeignKey("liquidacion_alquiler.id_liquidacion_alquiler"), nullable=False)
    id_metodo_pago = Column(BigInteger, ForeignKey("metodo_pago.id_metodo_pago"), nullable=False)
    id_estado_pago = Column(BigInteger, ForeignKey("estado_pago.id_estado_pago"), nullable=False)
    numero_transaccion = Column(String(100))
    valor = Column(Numeric(12, 2), nullable=False)
    fecha_pago = Column(DateTime, nullable=False)
    referencia = Column(String(255))
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    liquidacion = relationship("LiquidacionAlquiler", back_populates="pagos_cliente")
    metodo_pago = relationship("MetodoPago", back_populates="pagos_cliente")
    estado_pago_rel = relationship("EstadoPago", back_populates="pagos_cliente")


class EstadoFactura(Base):
    __tablename__ = "estado_factura"
    id_estado_factura = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    codigo = Column(String(30), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(255))
    color = Column(String(20))
    estado = Column(SmallInteger, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    facturas = relationship("Factura", back_populates="estado_factura_rel")


class Factura(Base):
    __tablename__ = "factura"
    id_factura = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_liquidacion_alquiler = Column(BigInteger, ForeignKey("liquidacion_alquiler.id_liquidacion_alquiler"), nullable=False)
    id_estado_factura = Column(BigInteger, ForeignKey("estado_factura.id_estado_factura"), nullable=False)
    numero_factura = Column(String(50), nullable=False, unique=True)
    subtotal = Column(Numeric(12, 2), nullable=False)
    descuentos = Column(Numeric(12, 2), default=0)
    impuestos = Column(Numeric(12, 2), default=0)
    total = Column(Numeric(12, 2), nullable=False)
    fecha_emision = Column(DateTime, nullable=False)
    pdf = Column(String(255))
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    liquidacion = relationship("LiquidacionAlquiler", back_populates="facturas")
    estado_factura_rel = relationship("EstadoFactura", back_populates="facturas")


class Plan(Base):
    __tablename__ = "plan"
    id_plan = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)
    precio_mensual = Column(Numeric(12, 2), nullable=False)
    cantidad_sucursales = Column(Integer)
    cantidad_repartidores = Column(Integer)
    cantidad_lavadoras = Column(Integer)
    soporte_prioritario = Column(SmallInteger, default=0)
    estado = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    suscripciones = relationship("Suscripcion", back_populates="plan")


class Suscripcion(Base):
    __tablename__ = "suscripcion"
    id_suscripcion = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_plan = Column(BigInteger, ForeignKey("plan.id_plan"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    valor = Column(Numeric(12, 2), nullable=False)
    pagada = Column(SmallInteger, default=0)
    activa = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="suscripciones")
    plan = relationship("Plan", back_populates="suscripciones")
    pagos = relationship("PagoEmpresa", back_populates="suscripcion")


class TarifaEmpresa(Base):
    __tablename__ = "tarifa_empresa"
    id_tarifa_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_capacidad_lavadora = Column(BigInteger, ForeignKey("capacidad_lavadora.id_capacidad_lavadora"), nullable=False)
    valor_hora = Column(Numeric(12, 2), nullable=False)
    valor_minuto = Column(Numeric(12, 2), nullable=False)
    activa = Column(SmallInteger, default=1)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="tarifas")
    capacidad = relationship("CapacidadLavadora", back_populates="tarifas")


class Ruta(Base):
    __tablename__ = "ruta"
    id_ruta = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    nombre = Column(String(150), nullable=False)
    origen = Column(String(255), nullable=False)
    destino = Column(String(255), nullable=False)
    distancia_km = Column(Numeric(8, 2))
    tiempo_estimado_minutos = Column(Integer)
    latitud_origen = Column(Numeric(10, 8))
    longitud_origen = Column(Numeric(11, 8))
    latitud_destino = Column(Numeric(10, 8))
    longitud_destino = Column(Numeric(11, 8))
    activa = Column(SmallInteger, default=1)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="rutas")
    historial = relationship("HistorialRuta", back_populates="ruta")


class HistorialRuta(Base):
    __tablename__ = "historial_ruta"
    id_historial_ruta = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_ruta = Column(BigInteger, ForeignKey("ruta.id_ruta"), nullable=False)
    id_repartidor = Column(BigInteger, ForeignKey("repartidor.id_repartidor"), nullable=False)
    id_alquiler = Column(BigInteger, ForeignKey("alquiler.id_alquiler"))
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    kilometros_recorridos = Column(Numeric(8, 2))
    tiempo_real_minutos = Column(Integer)
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    ruta = relationship("Ruta", back_populates="historial")
    repartidor = relationship("Repartidor")
    alquiler = relationship("Alquiler", back_populates="historial_ruta")


class Notificacion(Base):
    __tablename__ = "notificacion"
    id_notificacion = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    titulo = Column(String(200), nullable=False)
    mensaje = Column(Text, nullable=False)
    tipo = Column(String(50))
    leida = Column(SmallInteger, default=0)
    fecha_lectura = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario", back_populates="notificaciones")


class Auditoria(Base):
    __tablename__ = "auditoria"
    id_auditoria = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"))
    modulo = Column(String(100), nullable=False)
    accion = Column(String(100), nullable=False)
    tabla_afectada = Column(String(100))
    registro_uuid = Column(String(36))
    ip = Column(String(50))
    descripcion = Column(Text)
    datos_anteriores = Column(JSON)
    datos_nuevos = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")


class PagoEmpresa(Base):
    __tablename__ = "pago_empresa"
    id_pago_empresa = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"), nullable=False)
    id_suscripcion = Column(BigInteger, ForeignKey("suscripcion.id_suscripcion"), nullable=False)
    id_metodo_pago = Column(BigInteger, ForeignKey("metodo_pago.id_metodo_pago"), nullable=False)
    id_estado_pago = Column(BigInteger, ForeignKey("estado_pago.id_estado_pago"), nullable=False)
    valor = Column(Numeric(12, 2), nullable=False)
    numero_transaccion = Column(String(100))
    fecha_pago = Column(DateTime)
    comprobante = Column(String(255))
    observaciones = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="pagos")
    suscripcion = relationship("Suscripcion", back_populates="pagos")
    metodo_pago = relationship("MetodoPago", back_populates="pagos_empresa")
    estado_pago_rel = relationship("EstadoPago", back_populates="pagos_empresa")


class SoporteTicket(Base):
    __tablename__ = "soporte_ticket"
    id_soporte_ticket = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_empresa = Column(BigInteger, ForeignKey("empresa.id_empresa"))
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"))
    asunto = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=False)
    prioridad = Column(SAEnum("BAJA", "MEDIA", "ALTA", "CRITICA", name="prioridad_enum"), default="MEDIA")
    estado = Column(SAEnum("ABIERTO", "PROCESO", "CERRADO", name="estado_ticket_enum"), default="ABIERTO")
    fecha_cierre = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    empresa = relationship("Empresa", back_populates="tickets_soporte")
    usuario = relationship("Usuario")
    respuestas = relationship("SoporteRespuesta", back_populates="ticket")


class SoporteRespuesta(Base):
    __tablename__ = "soporte_respuesta"
    id_soporte_respuesta = Column(BigInteger, primary_key=True, autoincrement=True)
    uuid = Column(String(36), nullable=False, unique=True)
    id_soporte_ticket = Column(BigInteger, ForeignKey("soporte_ticket.id_soporte_ticket"), nullable=False)
    id_usuario = Column(BigInteger, ForeignKey("usuario.id_usuario"), nullable=False)
    respuesta = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    ticket = relationship("SoporteTicket", back_populates="respuestas")
    usuario = relationship("Usuario")
