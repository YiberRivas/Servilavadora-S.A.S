# FASE 2 - ENTREGA 1
# AUDITORIA TECNICA DEL BACKEND

**Proyecto:** Servilavadora S.A.S.
**Fecha:** 25/07/2026
**Objetivo:** Auditoria completa del backend antes de iniciar integracion con app movil
**Restriccion:** Solo lectura. Sin modificaciones al codigo.

---

## 1. RESUMEN EJECUTIVO

El backend es una plataforma de alquiler de lavadoras construida con **FastAPI + SQLAlchemy 2.0 (async) + MySQL 9.3**. Actualmente esta orientado completamente al panel de administracion web (Web-Super-Admin).

### Numeros clave:
| Metrica | Valor |
|---------|-------|
| Modelos SQLAlchemy | 47 |
| Tablas MySQL | 47 |
| Routers | 18 |
| Endpoints HTTP | 67 |
| Endpoints WebSocket | 1 |
| Schemas Pydantic | 35 |
| Lineas de codigo Python | ~5,200+ |
| Roles del sistema | 4 |
| Registros en seed | ~918 |

### Diagnostico general:
- **Funcionalidad completa** para el panel de administracion web
- **Sin capa de servicios ni repositorios** (logica en routers)
- **Sin tests** unitarios ni de integracion
- **CORS abierto** (adecuado para desarrollo, no para produccion)
- **Secret key hardcodeada** en el codigo fuente
- **Compatibilidad con app movil:** Requiere desarrollo significativo

---

## 2. ARQUITECTURA GENERAL

### Stack tecnologico:
| Componente | Tecnologia | Version |
|------------|-----------|---------|
| Framework | FastAPI | 0.115.12 |
| ORM | SQLAlchemy (async) | 2.0.41 |
| Database Driver | aiomysql | 0.2.0 |
| Base de datos | MySQL | 9.3.0 |
| Auth JWT | python-jose | 3.4.0 |
| Password Hash | passlib (bcrypt) | 1.7.4 |
| Validacion | Pydantic | 2.11.3 |
| Server | Uvicorn | 0.34.2 |
| WebSocket | websockets | 15.0.1 |

### Patron arquitectonico:
```
FastAPI App
├── Routers (logica de negocio inline)
├── Schemas (validacion Pydantic)
├── Models (SQLAlchemy ORM)
├── Dependencies (auth + roles)
├── Security (JWT + bcrypt)
├── WebSocket (cronometro)
└── Utils (UUID + logging)
```

**Nota:** Los directorios `services/` y `repositories/` existen pero estan vacios. Toda la logica de negocio esta embebida en los routers.

---

## 3. INVENTARIO DE CARPETAS

```
Backend/
├── .env                          # Variables de entorno (produccion real)
├── .env.example                  # Template de variables
├── run.py                        # Entry point Uvicorn
├── requirements.txt              # Dependencias Python
├── Database.sql                  # Schema MySQL (2196 lineas)
├── seed.py                       # Seed minimo (1 admin)
├── seed_completo.py              # Seed completo (~918 registros)
├── seed_full.py                  # Seed variante
├── fix_users.py                  # Script de reparacion
├── check_schema.py               # Utilidad de inspeccion
├── server_out.log                # Log de salida
├── server_error.log              # Log de errores
└── app/
    ├── main.py                   # App factory FastAPI (66 lineas)
    ├── config.py                 # Settings Pydantic (22 lineas)
    ├── database.py               # Engine async + session (35 lineas)
    ├── dependencies.py           # Auth dependencies (62 lineas)
    ├── models/
    │   └── base.py               # 47 modelos SQLAlchemy (1078 lineas)
    ├── schemas/
    │   ├── common.py             # ApiResponse, PaginatedResponse (31 lineas)
    │   ├── auth.py               # Login, Token, Password (34 lineas)
    │   ├── empresa.py            # Empresa, Sucursal, Plan (132 lineas)
    │   ├── usuario.py            # Persona, Usuario, Rol (84 lineas)
    │   └── modulos.py            # Todos los modulos (299 lineas)
    ├── routers/                  # 18 archivos (~2,234 lineas total)
    ├── security/
    │   ├── jwt.py                # JWT creation/decode (28 lineas)
    │   └── password.py           # Bcrypt hash (11 lineas)
    ├── services/                 # VACIO
    ├── repositories/             # VACIO
    ├── utils/
    │   ├── uuid.py               # UUID4 generator (5 lineas)
    │   └── logging.py            # Config logging (16 lineas)
    └── websockets/
        └── cronometro.py         # Timer real-time (118 lineas)
```

---

## 4. INVENTARIO DE MODELOS (47 clases)

### 4.1 Jerarquia Geografica (5 tablas)

#### Pais
- **Tabla:** `pais`
- **Campos:** `id_pais` (PK, BigInt), `uuid` (String 36, unique), `nombre` (String 100), `codigo_iso2` (String 2, unique), `codigo_iso3` (String 3, unique), `indicativo` (String 10), `estado` (SmallInt, default 1), `created_at`, `updated_at`
- **Relaciones:** 1:N con Departamento

#### Departamento
- **Tabla:** `departamento`
- **Campos:** `id_departamento` (PK), `uuid`, `id_pais` (FK), `nombre` (String 120), `codigo_dane` (String 10), `estado`, `created_at`, `updated_at`
- **FK:** `pais.id_pais`
- **Relaciones:** N:1 Pais, 1:N Municipio

#### Municipio
- **Tabla:** `municipio`
- **Campos:** `id_municipio` (PK), `uuid`, `id_departamento` (FK), `nombre` (String 120), `codigo_dane`, `estado`, `created_at`, `updated_at`
- **FK:** `departamento.id_departamento`
- **Relaciones:** N:1 Departamento, 1:N Barrio

#### Barrio
- **Tabla:** `barrio`
- **Campos:** `id_barrio` (PK), `uuid`, `id_municipio` (FK), `nombre` (String 150), `codigo_postal`, `estado`, `created_at`, `updated_at`
- **FK:** `municipio.id_municipio`
- **Relaciones:** N:1 Municipio, 1:N Direccion

#### Direccion
- **Tabla:** `direccion`
- **Campos:** `id_direccion` (PK), `uuid`, `id_barrio` (FK, nullable), `direccion` (String 255), `complemento` (String 150), `referencia` (Text), `codigo_plus` (String 30), `latitud` (Numeric 10,8), `longitud` (Numeric 11,8), `created_at`, `updated_at`
- **FK:** `barrio.id_barrio`
- **Relaciones:** N:1 Barrio

### 4.2 Identidad y Acceso (8 tablas)

#### TipoDocumento
- **Tabla:** `tipo_documento`
- **Campos:** `id_tipo_documento` (PK), `uuid`, `codigo` (String 10, unique), `nombre` (String 100), `descripcion`, `estado`, `created_at`, `updated_at`
- **Relaciones:** 1:N Persona

#### Genero
- **Tabla:** `genero`
- **Campos:** `id_genero` (PK), `uuid`, `nombre` (String 50), `estado`, `created_at`, `updated_at`
- **Relaciones:** 1:N Persona

#### Persona
- **Tabla:** `persona`
- **Campos:** `id_persona` (PK), `uuid`, `id_tipo_documento` (FK), `numero_documento` (String 30, unique), `nombres` (String 120), `apellidos` (String 120), `id_genero` (FK, nullable), `fecha_nacimiento` (Date), `correo` (String 150, unique), `telefono` (String 30), `id_direccion` (FK, nullable), `foto` (String 255), `estado`, `created_at`, `updated_at`
- **FK:** `tipo_documento`, `genero`, `direccion`
- **Relaciones:** N:1 TipoDocumento, N:1 Genero, 1:1 Usuario
- **Unique:** `numero_documento`, `correo`

#### Rol
- **Tabla:** `rol`
- **Campos:** `id_rol` (PK), `uuid`, `codigo` (String 50, unique), `nombre` (String 100), `descripcion`, `es_sistema` (SmallInt, default 0), `estado`, `created_at`, `updated_at`
- **Relaciones:** 1:N Usuario, M:N Permiso (via `rol_permiso`)

#### Permiso
- **Tabla:** `permiso`
- **Campos:** `id_permiso` (PK), `uuid`, `modulo` (String 100), `codigo` (String 100, unique), `nombre` (String 150), `descripcion`, `estado`, `created_at`, `updated_at`
- **Relaciones:** M:N Rol

#### RolPermiso (Tabla pivote)
- **Tabla:** `rol_permiso`
- **Campos:** `id_rol_permiso` (PK), `id_rol` (FK), `id_permiso` (FK), `created_at`
- **UniqueConstraint:** `(id_rol, id_permiso)`

#### EstadoUsuario
- **Tabla:** `estado_usuario`
- **Campos:** `id_estado_usuario` (PK), `uuid`, `codigo` (String 30, unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### Usuario
- **Tabla:** `usuario`
- **Campos:** `id_usuario` (PK), `uuid`, `id_persona` (FK), `id_rol` (FK), `id_estado_usuario` (FK), `username` (String 80, unique), `password_hash` (String 255), `ultimo_login` (DateTime), `intentos_fallidos` (Int, default 0), `cambiar_password` (SmallInt, default 0), `doble_factor` (SmallInt, default 0), `estado`, `created_at`, `updated_at`
- **FK:** `persona`, `rol`, `estado_usuario`
- **Relaciones:** 1:1 Persona, N:1 Rol, 1:N sesiones, 1:N refresh_tokens, 1:N notificaciones

#### Sesion
- **Tabla:** `sesion`
- **Campos:** `id_sesion` (PK), `uuid`, `id_usuario` (FK), `token` (String 500), `ip` (String 50), `user_agent` (Text), `fecha_inicio`, `fecha_expiracion`, `fecha_cierre`, `activa` (SmallInt, default 1), `created_at`

#### RefreshToken
- **Tabla:** `refresh_token`
- **Campos:** `id_refresh_token` (PK), `uuid`, `id_usuario` (FK), `token` (String 500), `fecha_expiracion`, `revocado` (SmallInt, default 0), `created_at`

### 4.3 Entidades del Negocio (8 tablas)

#### EstadoEmpresa
- **Tabla:** `estado_empresa`
- **Campos:** `id_estado_empresa` (PK), `uuid`, `codigo` (unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### Archivo
- **Tabla:** `archivo`
- **Campos:** `id_archivo` (PK), `uuid`, `nombre_original` (String 255), `nombre_servidor` (String 255), `extension`, `mime_type`, `peso` (BigInt), `ruta` (String 500), `hash_sha256`, `estado`, `created_at`

#### Empresa
- **Tabla:** `empresa`
- **Campos:** `id_empresa` (PK), `uuid`, `nit` (String 20, unique), `razon_social` (String 200), `nombre_comercial` (String 200), `representante_legal` (String 200), `correo` (String 150), `telefono`, `celular`, `sitio_web`, `logo` (String 255), `descripcion` (Text), `id_direccion` (FK), `id_estado_empresa` (FK), `fecha_registro`, `fecha_aprobacion`, `observaciones` (Text), `estado`, `created_at`, `updated_at`
- **Relaciones:** 1:N sucursales, empleados, repartidores, lavadoras, archivos, suscripciones, tarifas, rutas, pagos, solicitudes, cola_espera, tickets
- **Unique:** `nit`

#### EmpresaArchivo
- **Tabla:** `empresa_archivo`
- **Campos:** `id_empresa_archivo` (PK), `uuid`, `id_empresa` (FK), `id_archivo` (FK), `tipo_documento` (String 100), `aprobado` (SmallInt, default 0), `fecha_aprobacion`, `observaciones`, `created_at`

#### ConfiguracionEmpresa
- **Tabla:** `configuracion_empresa`
- **Campos:** `id_configuracion_empresa` (PK), `uuid`, `id_empresa` (FK, unique), `permite_reservas` (SmallInt, default 1), `tiempo_maximo_reserva` (Int, default 30), `moneda` (String 10, default "COP"), `zona_horaria` (String 100, default "America/Bogota"), `created_at`, `updated_at`

#### ConfiguracionGlobal
- **Tabla:** `configuracion_global`
- **Campos:** `id_configuracion_global` (PK), `uuid`, `clave` (String 150, unique), `valor` (Text), `descripcion`, `created_at`, `updated_at`

#### Sucursal
- **Tabla:** `sucursal`
- **Campos:** `id_sucursal` (PK), `uuid`, `id_empresa` (FK), `nombre` (String 150), `telefono`, `correo`, `id_direccion` (FK), `principal` (SmallInt, default 0), `estado`, `created_at`, `updated_at`
- **FK:** `empresa`, `direccion`

#### EmpleadoEmpresa
- **Tabla:** `empleado_empresa`
- **Campos:** `id_empleado_empresa` (PK), `uuid`, `id_empresa` (FK), `id_usuario` (FK), `cargo` (String 120), `salario` (Numeric 12,2), `fecha_ingreso` (Date), `fecha_retiro` (Date), `estado`, `created_at`, `updated_at`

#### Repartidor
- **Tabla:** `repartidor`
- **Campos:** `id_repartidor` (PK), `uuid`, `id_empresa` (FK), `id_usuario` (FK), `licencia` (String 50), `vence_licencia` (Date), `disponible` (SmallInt, default 1), `latitud` (Numeric 10,8), `longitud` (Numeric 11,8), `ultima_conexion` (DateTime), `estado`, `created_at`, `updated_at`

### 4.4 Lavadoras (8 tablas)

#### CapacidadLavadora
- **Tabla:** `capacidad_lavadora`
- **Campos:** `id_capacidad_lavadora` (PK), `uuid`, `capacidad_kg` (Numeric 4,1, unique), `descripcion`, `estado`, `created_at`

#### MarcaLavadora
- **Tabla:** `marca_lavadora`
- **Campos:** `id_marca_lavadora` (PK), `uuid`, `nombre` (String 100, unique), `descripcion`, `estado`, `created_at`, `updated_at`

#### ModeloLavadora
- **Tabla:** `modelo_lavadora`
- **Campos:** `id_modelo_lavadora` (PK), `uuid`, `id_marca_lavadora` (FK), `nombre`, `descripcion`, `estado`, `created_at`, `updated_at`

#### EstadoLavadora
- **Tabla:** `estado_lavadora`
- **Campos:** `id_estado_lavadora` (PK), `uuid`, `codigo` (unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### Lavadora
- **Tabla:** `lavadora`
- **Campos:** `id_lavadora` (PK), `uuid`, `id_empresa` (FK), `id_sucursal` (FK), `id_marca_lavadora` (FK), `id_modelo_lavadora` (FK), `id_capacidad_lavadora` (FK), `id_estado_lavadora` (FK), `codigo_interno` (String 50, unique), `numero_serie` (String 100, unique), `color` (String 60), `fecha_compra` (Date), `valor_compra` (Numeric 12,2), `observaciones` (Text), `disponible` (SmallInt, default 1), `estado`, `created_at`, `updated_at`
- **FK:** `empresa`, `sucursal`, `marca_lavadora`, `modelo_lavadora`, `capacidad_lavadora`, `estado_lavadora`
- **Unique:** `codigo_interno`, `numero_serie`

#### FotografiaLavadora
- **Tabla:** `fotografia_lavadora`
- **Campos:** `id_fotografia_lavadora` (PK), `uuid`, `id_lavadora` (FK), `nombre_archivo` (String 255), `ruta` (String 500), `principal` (SmallInt, default 0), `created_at`

#### MantenimientoLavadora
- **Tabla:** `mantenimiento_lavadora`
- **Campos:** `id_mantenimiento_lavadora` (PK), `uuid`, `id_lavadora` (FK), `fecha` (Date), `tipo` (String 100), `descripcion` (Text), `costo` (Numeric 12,2), `realizado_por` (String 150), `proximo_mantenimiento` (Date), `created_at`, `updated_at`

#### HistorialLavadora
- **Tabla:** `historial_lavadora`
- **Campos:** `id_historial_lavadora` (PK), `uuid`, `id_lavadora` (FK), `evento` (String 120), `descripcion` (Text), `usuario` (String 150), `fecha_evento`, `created_at`

#### MovimientoLavadora
- **Tabla:** `movimiento_lavadora`
- **Campos:** `id_movimiento_lavadora` (PK), `uuid`, `id_lavadora` (FK), `id_estado_anterior` (FK), `id_estado_nuevo` (FK), `motivo` (String 255), `fecha_movimiento`, `observaciones`, `created_at`

### 4.5 Flujo de Alquiler (11 tablas)

#### EstadoSolicitud
- **Tabla:** `estado_solicitud`
- **Campos:** `id_estado_solicitud` (PK), `uuid`, `codigo` (unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### SolicitudAlquiler
- **Tabla:** `solicitud_alquiler`
- **Campos:** `id_solicitud_alquiler` (PK), `uuid`, `id_empresa` (FK), `id_cliente_empresa` (FK), `id_sucursal` (FK), `id_capacidad_lavadora` (FK), `id_estado_solicitud` (FK), `fecha_solicitud`, `fecha_programada`, `observaciones` (Text), `direccion_entrega` (String 255), `latitud`, `longitud`, `estado`, `created_at`, `updated_at`
- **FK:** `empresa`, `cliente_empresa`, `sucursal`, `capacidad_lavadora`, `estado_solicitud`
- **Relaciones:** 1:N asignaciones, alquileres

#### AsignacionSolicitud
- **Tabla:** `asignacion_solicitud`
- **Campos:** `id_asignacion_solicitud` (PK), `uuid`, `id_solicitud_alquiler` (FK), `id_lavadora` (FK), `id_repartidor` (FK), `fecha_asignacion`, `observaciones`, `created_at`
- **FK:** `solicitud_alquiler`, `lavadora`, `repartidor`

#### ClienteEmpresa
- **Tabla:** `cliente_empresa`
- **Campos:** `id_cliente_empresa` (PK), `uuid`, `id_empresa` (FK), `id_usuario` (FK), `fecha_registro` (Date), `observaciones`, `estado`, `created_at`, `updated_at`
- **UniqueConstraint:** `(id_empresa, id_usuario)`

#### EstadoAlquiler
- **Tabla:** `estado_alquiler`
- **Campos:** `id_estado_alquiler` (PK), `uuid`, `codigo` (unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### Alquiler
- **Tabla:** `alquiler`
- **Campos:** `id_alquiler` (PK), `uuid`, `id_solicitud_alquiler` (FK), `id_lavadora` (FK), `id_cliente_empresa` (FK), `id_repartidor` (FK), `id_estado_alquiler` (FK), `fecha_inicio`, `fecha_fin`, `minutos_facturados` (Int, default 0), `valor_total` (Numeric 12,2, default 0), `observaciones`, `estado`, `created_at`, `updated_at`
- **Relaciones:** 1:1 cronometro, 1:N historial, evidencias_entrega, devoluciones, liquidaciones, historial_ruta

#### CronometroAlquiler
- **Tabla:** `cronometro_alquiler`
- **Campos:** `id_cronometro_alquiler` (PK), `uuid`, `id_alquiler` (FK, unique), `fecha_inicio`, `fecha_fin`, `minutos_transcurridos` (Int, default 0), `minutos_facturables` (Int, default 0), `valor_acumulado` (Numeric 12,2, default 0), `activo` (SmallInt, default 1), `created_at`, `updated_at`

#### HistorialAlquiler
- **Tabla:** `historial_alquiler`
- **Campos:** `id_historial_alquiler` (PK), `uuid`, `id_alquiler` (FK), `evento` (String 150), `descripcion` (Text), `fecha_evento`, `usuario_responsable` (String 150), `created_at`

#### EvidenciaEntrega
- **Tabla:** `evidencia_entrega`
- **Campos:** `id_evidencia_entrega` (PK), `uuid`, `id_alquiler` (FK), `id_archivo` (FK), `descripcion`, `fecha_registro`, `created_at`

#### DevolucionLavadora
- **Tabla:** `devolucion_lavadora`
- **Campos:** `id_devolucion_lavadora` (PK), `uuid`, `id_alquiler` (FK), `id_repartidor` (FK), `fecha_devolucion`, `estado_lavadora` (String 100), `observaciones` (Text), `requiere_mantenimiento` (SmallInt, default 0), `created_at`

#### EvidenciaDevolucion
- **Tabla:** `evidencia_devolucion`
- **Campos:** `id_evidencia_devolucion` (PK), `uuid`, `id_devolucion_lavadora` (FK), `id_archivo` (FK), `descripcion`, `fecha_registro`, `created_at`

#### ColaEspera
- **Tabla:** `cola_espera`
- **Campos:** `id_cola_espera` (PK), `uuid`, `id_empresa` (FK), `id_cliente_empresa` (FK), `id_capacidad_lavadora` (FK), `fecha_solicitud`, `prioridad` (Int), `observaciones`, `estado`, `created_at`

### 4.6 Facturacion y Pagos (6 tablas)

#### MetodoPago
- **Tabla:** `metodo_pago`
- **Campos:** `id_metodo_pago` (PK), `uuid`, `nombre` (String 50), `descripcion`, `icono`, `estado`, `created_at`, `updated_at`

#### EstadoPago
- **Tabla:** `estado_pago`
- **Campos:** `id_estado_pago` (PK), `uuid`, `codigo` (unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### LiquidacionAlquiler
- **Tabla:** `liquidacion_alquiler`
- **Campos:** `id_liquidacion_alquiler` (PK), `uuid`, `id_alquiler` (FK), `subtotal` (Numeric 12,2), `descuentos` (Numeric 12,2), `recargos` (Numeric 12,2), `total` (Numeric 12,2), `created_at`, `updated_at`

#### PagoCliente
- **Tabla:** `pago_cliente`
- **Campos:** `id_pago_cliente` (PK), `uuid`, `id_liquidacion_alquiler` (FK), `id_metodo_pago` (FK), `id_estado_pago` (FK), `valor` (Numeric 12,2), `numero_transaccion`, `fecha_pago`, `comprobante`, `observaciones`, `created_at`

#### EstadoFactura
- **Tabla:** `estado_factura`
- **Campos:** `id_estado_factura` (PK), `uuid`, `codigo` (unique), `nombre`, `descripcion`, `color`, `estado`, `created_at`, `updated_at`

#### Factura
- **Tabla:** `factura`
- **Campos:** `id_factura` (PK), `uuid`, `id_liquidacion_alquiler` (FK), `numero_factura` (String 50, unique), `subtotal` (Numeric 12,2), `impuestos` (Numeric 12,2), `total` (Numeric 12,2), `id_estado_factura` (FK), `fecha_emision`, `created_at`

### 4.7 Suscripciones y Tarifas (3 tablas)

#### Plan
- **Tabla:** `plan`
- **Campos:** `id_plan` (PK), `uuid`, `nombre` (String 100), `descripcion` (Text), `precio_mensual` (Numeric 12,2), `cantidad_sucursales`, `cantidad_repartidores`, `cantidad_lavadoras`, `soporte_prioritario` (SmallInt, default 0), `estado`, `created_at`, `updated_at`

#### Suscripcion
- **Tabla:** `suscripcion`
- **Campos:** `id_suscripcion` (PK), `uuid`, `id_empresa` (FK), `id_plan` (FK), `fecha_inicio` (Date), `fecha_fin` (Date), `valor` (Numeric 12,2), `pagada` (SmallInt, default 0), `activa` (SmallInt, default 1), `created_at`, `updated_at`

#### TarifaEmpresa
- **Tabla:** `tarifa_empresa`
- **Campos:** `id_tarifa_empresa` (PK), `uuid`, `id_empresa` (FK), `id_capacidad_lavadora` (FK), `valor_hora` (Numeric 12,2), `valor_minuto` (Numeric 12,2), `fecha_inicio` (Date), `fecha_fin` (Date), `activa` (SmallInt, default 1), `created_at`, `updated_at`

### 4.8 Rutas y Tracking (2 tablas)

#### Ruta
- **Tabla:** `ruta`
- **Campos:** `id_ruta` (PK), `uuid`, `id_empresa` (FK), `nombre` (String 150), `origen` (String 255), `destino` (String 255), `distancia_km` (Numeric 8,2), `tiempo_estimado_minutos`, `latitud_origen`, `longitud_origen`, `latitud_destino`, `longitud_destino`, `activa` (SmallInt, default 1), `created_at`, `updated_at`

#### HistorialRuta
- **Tabla:** `historial_ruta`
- **Campos:** `id_historial_ruta` (PK), `uuid`, `id_ruta` (FK), `id_repartidor` (FK), `id_alquiler` (FK), `kilometros_recorridos` (Numeric 8,2), `tiempo_real_minutos`, `fecha_registro`, `created_at`

### 4.9 Notificaciones, Auditoria, Soporte (5 tablas)

#### Notificacion
- **Tabla:** `notificacion`
- **Campos:** `id_notificacion` (PK), `uuid`, `id_usuario` (FK), `titulo` (String 200), `mensaje` (Text), `tipo` (String 50), `leida` (SmallInt, default 0), `fecha_lectura`, `created_at`

#### Auditoria
- **Tabla:** `auditoria`
- **Campos:** `id_auditoria` (PK), `uuid`, `id_usuario` (FK), `modulo` (String 100), `accion` (String 100), `tabla_afectada` (String 100), `registro_id`, `datos_anteriores` (JSON), `datos_nuevos` (JSON), `ip_origen`, `created_at`

#### PagoEmpresa
- **Tabla:** `pago_empresa`
- **Campos:** `id_pago_empresa` (PK), `uuid`, `id_empresa` (FK), `id_suscripcion` (FK), `id_metodo_pago` (FK), `id_estado_pago` (FK), `valor` (Numeric 12,2), `numero_transaccion`, `fecha_pago`, `comprobante`, `observaciones`, `created_at`

#### SoporteTicket
- **Tabla:** `soporte_ticket`
- **Campos:** `id_soporte_ticket` (PK), `uuid`, `id_empresa` (FK), `id_usuario` (FK), `asunto` (String 200), `descripcion` (Text), `prioridad` (Enum: BAJA, MEDIA, ALTA, CRITICA), `estado` (Enum: ABIERTO, EN_PROCESO, CERRADO), `fecha_cierre`, `created_at`

#### SoporteRespuesta
- **Tabla:** `soporte_respuesta`
- **Campos:** `id_soporte_respuesta` (PK), `uuid`, `id_soporte_ticket` (FK), `id_usuario` (FK), `respuesta` (Text), `created_at`

---

## 5. INVENTARIO DE SCHEMAS (35 clases Pydantic)

### schemas/common.py
| Schema | Campos | Uso |
|--------|--------|-----|
| `ApiResponse` | `success`, `message`, `data` | Respuesta estandar de TODOS los endpoints |
| `ApiError` | `success=False`, `message`, `errors` | Errores |
| `PaginationParams` | `page`, `per_page` | Parametros de paginacion |
| `PaginatedResponse` | `success`, `message`, `data`, `total`, `page`, `per_page`, `total_pages` | Lista paginada |

### schemas/auth.py
| Schema | Campos | Uso |
|--------|--------|-----|
| `LoginRequest` | `username`, `password` | POST /auth/login |
| `TokenResponse` | `access_token`, `refresh_token`, `token_type` | Respuesta de login |
| `RefreshRequest` | `refresh_token` | POST /auth/refresh |
| `PasswordChangeRequest` | `current_password`, `new_password` | POST /auth/change-password |
| `UserBasicResponse` | `uuid`, `username`, `nombre_completo`, `rol`, `estado` | GET /auth/me |

### schemas/empresa.py
| Schema | Campos | Uso |
|--------|--------|-----|
| `EmpresaCreate` | 12 campos (nit, razon_social, etc.) | POST /empresas |
| `EmpresaUpdate` | 11 campos (todos Optional) | PUT /empresas/{uuid} |
| `EmpresaResponse` | 17 campos | Respuesta de empresa |
| `EmpresaFilter` | `search`, `id_estado_empresa`, `page`, `per_page` | GET /empresas query |
| `SucursalCreate` | 5 campos | POST /sucursales |
| `SucursalResponse` | 8 campos | Respuesta de sucursal |
| `PlanResponse` | 10 campos | GET /empresas/planes/all |
| `SuscripcionResponse` | 9 campos | GET /suscripciones |
| `PagoEmpresaResponse` | 12 campos | GET /empresas/pagos/all |

### schemas/usuario.py
| Schema | Campos | Uso |
|--------|--------|-----|
| `PersonaBase` | 9 campos | Base para creacion de persona |
| `PersonaCreate` | Hereda PersonaBase | Crear persona |
| `PersonaResponse` | 11 campos | Respuesta de persona |
| `UsuarioCreate` | 5 campos | POST /usuarios |
| `UsuarioUpdate` | 4 campos | PUT /usuarios/{uuid} |
| `UsuarioResponse` | 12 campos + persona + rol_nombre + estado_nombre | Respuesta de usuario |
| `RolResponse` | 6 campos | GET /usuarios/roles/all |
| `PermisoResponse` | 5 campos | Permisos |

### schemas/modulos.py
| Schema | Campos | Uso |
|--------|--------|-----|
| `ClienteCreate` | 4 campos | POST /clientes |
| `ClienteUpdate` | 2 campos | PUT /clientes/{uuid} |
| `ClienteResponse` | 10 campos | Respuesta de cliente |
| `RepartidorCreate` | 4 campos | POST /repartidores |
| `RepartidorUpdate` | 4 campos | PUT /repartidores/{uuid} |
| `RepartidorResponse` | 9 campos | Respuesta de repartidor |
| `RutaCreate` | 10 campos | POST /rutas |
| `RutaUpdate` | 6 campos | PUT /rutas/{uuid} |
| `RutaResponse` | 10 campos | Respuesta de ruta |
| `NotificacionResponse` | 7 campos | GET /notificaciones |
| `TicketCreate` | 4 campos | POST /tickets |
| `TicketUpdate` | 2 campos | PUT /tickets/{uuid} |
| `TicketResponse` | 10 campos | Respuesta de ticket |
| `TicketRespuestaCreate` | 1 campo | POST /tickets/{uuid}/respuestas |
| `TicketRespuestaResponse` | 4 campos | Respuesta de respuesta |
| `ArchivoCreate` | 7 campos | POST /archivos |
| `ArchivoResponse` | 9 campos | Respuesta de archivo |
| `MantenimientoCreate` | 7 campos | POST /mantenimientos |
| `MantenimientoResponse` | 9 campos | Respuesta de mantenimiento |
| `ColaEsperaCreate` | 5 campos | POST /cola-espera |
| `ColaEsperaResponse` | 8 campos | Respuesta de cola |
| `TarifaCreate` | 6 campos | POST /tarifas |
| `TarifaUpdate` | 3 campos | PUT /tarifas/{uuid} |
| `TarifaResponse` | 7 campos | Respuesta de tarifa |
| `SuscripcionCreate` | 5 campos | POST /suscripciones |
| `SuscripcionUpdate` | 3 campos | PUT /suscripciones/{uuid} |
| `PagoEmpresaCreate` | 7 campos | POST /suscripciones/pagos |
| `HistorialLavadoraResponse` | 6 campos | GET /historial/lavadoras/{uuid} |
| `HistorialAlquilerResponse` | 6 campos | GET /historial/alquileres/{uuid} |

---

## 6. INVENTARIO DE ROUTERS

| # | Router | Prefijo | Tags | Lineas | Endpoints |
|---|--------|---------|------|--------|-----------|
| 1 | auth.py | /api/auth | Autenticacion | 183 | 5 |
| 2 | usuarios.py | /api/usuarios | Usuarios | 210 | 6 |
| 3 | empresas.py | /api/empresas | Empresas | 411 | 11 |
| 4 | lavadoras.py | /api/lavadoras | Lavadoras | 138 | 4 |
| 5 | alquileres.py | /api/alquileres | Alquileres | 151 | 4 |
| 6 | dashboard.py | /api/dashboard | Dashboard | 92 | 1 |
| 7 | configuraciones.py | /api/configuraciones | Configuraciones | 47 | 2 |
| 8 | clientes.py | /api/clientes | Clientes | 167 | 5 |
| 9 | repartidores.py | /api/repartidores | Repartidores | 170 | 5 |
| 10 | rutas.py | /api/rutas | Rutas | 102 | 4 |
| 11 | notificaciones.py | /api/notificaciones | Notificaciones | 102 | 4 |
| 12 | tickets.py | /api/tickets | Tickets Soporte | 169 | 5 |
| 13 | archivos.py | /api/archivos | Archivos | 83 | 3 |
| 14 | mantenimientos.py | /api/mantenimientos | Mantenimientos | 92 | 3 |
| 15 | cola_espera.py | /api/cola-espera | Cola de Espera | 104 | 4 |
| 16 | tarifas.py | /api/tarifas | Tarifas | 106 | 4 |
| 17 | suscripciones.py | /api/suscripciones | Suscripciones | 148 | 6 |
| 18 | historial.py | /api/historial | Historial | 101 | 3 |

**Total: 18 routers, ~2,234 lineas, 67 endpoints HTTP + 1 WebSocket + 1 Health Check = 69 endpoints**

---

## 7. INVENTARIO DE ENDPOINTS (67 HTTP + 1 WS)

### 7.1 Autenticacion (`/api/auth`) - 5 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 1 | POST | `/login` | `login` | Login con username+password | Publico | `LoginRequest` | `ApiResponse` (tokens + user) |
| 2 | POST | `/refresh` | `refresh_token` | Renovar access token | Publico | `RefreshRequest` | `ApiResponse` (nuevos tokens) |
| 3 | POST | `/logout` | `logout` | Revocar refresh tokens | Cualquier auth | - | `ApiResponse` |
| 4 | GET | `/me` | `get_me` | Obtener usuario actual | Cualquier auth | - | `ApiResponse` (user info) |
| 5 | POST | `/change-password` | `change_password` | Cambiar contrasena | Cualquier auth | `PasswordChangeRequest` | `ApiResponse` |

### 7.2 Usuarios (`/api/usuarios`) - 6 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 6 | GET | `/` | `list_usuarios` | Listar usuarios (paginado) | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 7 | GET | `/{uuid}` | `get_usuario` | Obtener usuario | SUPER_ADMIN | - | `ApiResponse` |
| 8 | POST | `/` | `create_usuario` | Crear usuario | SUPER_ADMIN | `UsuarioCreate` | `ApiResponse` |
| 9 | PUT | `/{uuid}` | `update_usuario` | Actualizar usuario | SUPER_ADMIN | `UsuarioUpdate` | `ApiResponse` |
| 10 | DELETE | `/{uuid}` | `delete_usuario` | Eliminar usuario (soft) | SUPER_ADMIN | - | `ApiResponse` |
| 11 | GET | `/roles/all` | `list_roles` | Listar roles | SUPER_ADMIN | - | `ApiResponse` |

### 7.3 Empresas (`/api/empresas`) - 11 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 12 | GET | `/` | `list_empresas` | Listar empresas | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 13 | GET | `/pendientes` | `list_empresas_pendientes` | Empresas pendientes | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 14 | GET | `/{uuid}` | `get_empresa` | Obtener empresa | SUPER_ADMIN | - | `ApiResponse` |
| 15 | POST | `/` | `create_empresa` | Crear empresa | SUPER_ADMIN | `EmpresaCreate` | `ApiResponse` |
| 16 | PUT | `/{uuid}` | `update_empresa` | Actualizar empresa | SUPER_ADMIN | `EmpresaUpdate` | `ApiResponse` |
| 17 | PUT | `/{uuid}/aprobar` | `aprobar_empresa` | Aprobar empresa | SUPER_ADMIN | - | `ApiResponse` |
| 18 | PUT | `/{uuid}/rechazar` | `rechazar_empresa` | Rechazar empresa | SUPER_ADMIN | Query(observaciones) | `ApiResponse` |
| 19 | DELETE | `/{uuid}` | `delete_empresa` | Eliminar empresa (soft) | SUPER_ADMIN | - | `ApiResponse` |
| 20 | GET | `/{uuid}/sucursales` | `list_sucursales` | Sucursales de empresa | SUPER_ADMIN | - | `ApiResponse` |
| 21 | GET | `/planes/all` | `list_planes` | Listar planes | SUPER_ADMIN | - | `ApiResponse` |
| 22 | GET | `/pagos/all` | `list_pagos_empresa` | Pagos de empresas | SUPER_ADMIN | Query params | `PaginatedResponse` |

### 7.4 Lavadoras (`/api/lavadoras`) - 4 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 23 | GET | `/` | `list_lavadoras` | Listar lavadoras | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 24 | GET | `/estados/all` | `list_estados_lavadora` | Estados de lavadora | SUPER_ADMIN | - | `ApiResponse` |
| 25 | GET | `/marcas/all` | `list_marcas` | Marcas de lavadora | SUPER_ADMIN | - | `ApiResponse` |
| 26 | GET | `/capacidades/all` | `list_capacidades` | Capacidades | SUPER_ADMIN | - | `ApiResponse` |

### 7.5 Alquileres (`/api/alquileres`) - 4 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 27 | GET | `/` | `list_alquileres` | Listar alquileres | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 28 | GET | `/solicitudes` | `list_solicitudes` | Listar solicitudes | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 29 | GET | `/estados/all` | `list_estados_alquiler` | Estados de alquiler | SUPER_ADMIN | - | `ApiResponse` |
| 30 | GET | `/estados-solicitud/all` | `list_estados_solicitud` | Estados de solicitud | SUPER_ADMIN | - | `ApiResponse` |

### 7.6 Dashboard (`/api/dashboard`) - 1 endpoint

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 31 | GET | `/` | `get_dashboard` | KPIs agregados | SUPER_ADMIN | - | `ApiResponse` |

### 7.7 Configuraciones (`/api/configuraciones`) - 2 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 32 | GET | `/` | `get_configuraciones` | Config global (dict) | SUPER_ADMIN | - | `ApiResponse` |
| 33 | GET | `/all` | `get_all_configuraciones` | Config global (lista) | SUPER_ADMIN | - | `ApiResponse` |

### 7.8 Clientes (`/api/clientes`) - 5 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 34 | GET | `/` | `list_clientes` | Listar clientes | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 35 | GET | `/{uuid}` | `get_cliente` | Obtener cliente | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |
| 36 | POST | `/` | `create_cliente` | Crear cliente | SUPER_ADMIN, ADMIN_EMPRESA | `ClienteCreate` | `ApiResponse` |
| 37 | PUT | `/{uuid}` | `update_cliente` | Actualizar cliente | SUPER_ADMIN, ADMIN_EMPRESA | `ClienteUpdate` | `ApiResponse` |
| 38 | DELETE | `/{uuid}` | `delete_cliente` | Eliminar cliente (soft) | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |

### 7.9 Repartidores (`/api/repartidores`) - 5 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 39 | GET | `/` | `list_repartidores` | Listar repartidores | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 40 | GET | `/{uuid}` | `get_repartidor` | Obtener repartidor | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |
| 41 | POST | `/` | `create_repartidor` | Crear repartidor | SUPER_ADMIN, ADMIN_EMPRESA | `RepartidorCreate` | `ApiResponse` |
| 42 | PUT | `/{uuid}` | `update_repartidor` | Actualizar repartidor | SUPER_ADMIN, ADMIN_EMPRESA | `RepartidorUpdate` | `ApiResponse` |
| 43 | DELETE | `/{uuid}` | `delete_repartidor` | Eliminar repartidor (soft) | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |

### 7.10 Rutas (`/api/rutas`) - 4 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 44 | GET | `/` | `list_rutas` | Listar rutas | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 45 | POST | `/` | `create_ruta` | Crear ruta | SUPER_ADMIN, ADMIN_EMPRESA | `RutaCreate` | `ApiResponse` |
| 46 | PUT | `/{uuid}` | `update_ruta` | Actualizar ruta | SUPER_ADMIN, ADMIN_EMPRESA | `RutaUpdate` | `ApiResponse` |
| 47 | DELETE | `/{uuid}` | `delete_ruta` | Eliminar ruta (soft) | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |

### 7.11 Notificaciones (`/api/notificaciones`) - 4 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 48 | GET | `/` | `list_notificaciones` | Mis notificaciones | Cualquier auth | Query params | `PaginatedResponse` |
| 49 | GET | `/no-leidas/count` | `count_no_leidas` | Contar no leidas | Cualquier auth | - | `ApiResponse` |
| 50 | PUT | `/{uuid}/leer` | `marcar_leida` | Marcar leida | Cualquier auth | - | `ApiResponse` |
| 51 | PUT | `/leer-todas` | `marcar_todas_leidas` | Marcar todas leidas | Cualquier auth | - | `ApiResponse` |

### 7.12 Tickets (`/api/tickets`) - 5 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 52 | GET | `/` | `list_tickets` | Listar tickets | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 53 | GET | `/{uuid}` | `get_ticket` | Obtener ticket | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |
| 54 | POST | `/` | `create_ticket` | Crear ticket | Cualquier auth | `TicketCreate` | `ApiResponse` |
| 55 | PUT | `/{uuid}` | `update_ticket` | Actualizar ticket | SUPER_ADMIN | `TicketUpdate` | `ApiResponse` |
| 56 | POST | `/{uuid}/respuestas` | `create_respuesta` | Responder ticket | Cualquier auth | `TicketRespuestaCreate` | `ApiResponse` |

### 7.13 Archivos (`/api/archivos`) - 3 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 57 | GET | `/` | `list_archivos` | Listar archivos | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 58 | POST | `/` | `create_archivo` | Registrar archivo | SUPER_ADMIN | `ArchivoCreate` | `ApiResponse` |
| 59 | DELETE | `/{uuid}` | `delete_archivo` | Eliminar archivo (soft) | SUPER_ADMIN | - | `ApiResponse` |

### 7.14 Mantenimientos (`/api/mantenimientos`) - 3 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 60 | GET | `/` | `list_mantenimientos` | Listar mantenimientos | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 61 | POST | `/` | `create_mantenimiento` | Crear mantenimiento | SUPER_ADMIN, ADMIN_EMPRESA | `MantenimientoCreate` | `ApiResponse` |
| 62 | DELETE | `/{uuid}` | `delete_mantenimiento` | Eliminar mantenimiento | SUPER_ADMIN | - | `ApiResponse` |

### 7.15 Cola de Espera (`/api/cola-espera`) - 4 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 63 | GET | `/` | `list_cola` | Listar cola | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 64 | POST | `/` | `create_cola` | Agregar a cola | SUPER_ADMIN, ADMIN_EMPRESA | `ColaEsperaCreate` | `ApiResponse` |
| 65 | PUT | `/{uuid}/atender` | `atender_cola` | Atender item | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |
| 66 | DELETE | `/{uuid}` | `remove_cola` | Eliminar de cola | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |

### 7.16 Tarifas (`/api/tarifas`) - 4 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 67 | GET | `/` | `list_tarifas` | Listar tarifas | SUPER_ADMIN, ADMIN_EMPRESA | Query params | `PaginatedResponse` |
| 68 | POST | `/` | `create_tarifa` | Crear tarifa | SUPER_ADMIN, ADMIN_EMPRESA | `TarifaCreate` | `ApiResponse` |
| 69 | PUT | `/{uuid}` | `update_tarifa` | Actualizar tarifa | SUPER_ADMIN, ADMIN_EMPRESA | `TarifaUpdate` | `ApiResponse` |
| 70 | DELETE | `/{uuid}` | `delete_tarifa` | Eliminar tarifa (soft) | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |

### 7.17 Suscripciones (`/api/suscripciones`) - 6 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 71 | GET | `/` | `list_suscripciones` | Listar suscripciones | SUPER_ADMIN | Query params | `PaginatedResponse` |
| 72 | POST | `/` | `create_suscripcion` | Crear suscripcion | SUPER_ADMIN | `SuscripcionCreate` | `ApiResponse` |
| 73 | PUT | `/{uuid}` | `update_suscripcion` | Actualizar suscripcion | SUPER_ADMIN | `SuscripcionUpdate` | `ApiResponse` |
| 74 | GET | `/metodos-pago/all` | `list_metodos_pago` | Metodos de pago | SUPER_ADMIN | - | `ApiResponse` |
| 75 | GET | `/estados-pago/all` | `list_estados_pago` | Estados de pago | SUPER_ADMIN | - | `ApiResponse` |
| 76 | POST | `/pagos` | `create_pago_empresa` | Crear pago empresa | SUPER_ADMIN | `PagoEmpresaCreate` | `ApiResponse` |

### 7.18 Historial (`/api/historial`) - 3 endpoints

| # | Metodo | Ruta | Handler | Descripcion | Auth | Request | Response |
|---|--------|------|---------|-------------|------|---------|----------|
| 77 | GET | `/alquileres/{uuid}` | `historial_alquiler` | Historial de alquiler | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |
| 78 | GET | `/lavadoras/{uuid}` | `historial_lavadora` | Historial de lavadora | SUPER_ADMIN, ADMIN_EMPRESA | - | `ApiResponse` |
| 79 | GET | `/auditoria` | `historial_auditoria` | Log de auditoria | SUPER_ADMIN | Query params | `PaginatedResponse` |

### 7.19 Health Check

| # | Metodo | Ruta | Handler | Descripcion | Auth |
|---|--------|------|---------|-------------|------|
| 80 | GET | `/api/health` | inline | Health check | Publico |

### 7.20 WebSocket

| # | Endpoint | Handler | Descripcion | Auth |
|---|----------|---------|-------------|------|
| 81 | `ws://host/ws/cronometro/{alquiler_uuid}?token=...` | `websocket_cronometro` | Timer en tiempo real | JWT via query param |

---

## 8. INVENTARIO DE SERVICIOS

**Estado:** Los directorios `app/services/` y `app/repositories/` existen pero estan **VACIOS**. No hay implementacion de capa de servicios ni repositorios.

Toda la logica de negocio esta embebida directamente en los handlers de los routers.

---

## 9. SEGURIDAD

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| JWT | Implementado | python-jose, HS256, access 30min, refresh 7d |
| Refresh Token | Implementado | Almacenado en BD, revocable |
| OAuth2 | No implementado | Solo Bearer token manual |
| Hash de contrasenas | Implementado | bcrypt via passlib |
| Bcrypt | Implementado | `CryptContext(schemes=["bcrypt"])` |
| Roles | Implementado | 4 roles: SUPER_ADMIN, ADMIN_EMPRESA, REPARTIDOR, CLIENTE |
| Permisos | Implementado en BD | Tabla `permiso` + `rol_permiso` (M2M) |
| Uso de permisos | NO implementado | Ningun router valida permisos, solo roles |
| Middleware de autenticacion | Implementado | `HTTPBearer()` + `get_current_user` |
| Middleware de autorizacion | Implementado | `require_role(*roles)` |
| Rate Limit | NO implementado | No hay limitacion de peticiones |
| CORS | Implementado | `allow_origins=["*"]` (abierto) |
| Validaciones | Implementadas | Pydantic v2 en todos los schemas |
| Proteccion CSRF | NO implementada | |
| Secret Key | Hardcodeada | `"servilavadora-super-secret-key-change-in-production-2026"` |
| Bloqueo por intentos | Parcial | Campo `intentos_fallidos` existe pero no se valida en login |

---

## 10. BASE DE DATOS

### Configuracion:
- **Motor:** MySQL 9.3.0
- **Driver:** aiomysql 0.2.0 (async)
- **URL:** `mysql+aiomysql://root:12345@localhost:3306/servilavadora_sas`
- **Pool size:** 10
- **Max overflow:** 20
- **Pool recycle:** 3600s

### Diagrama logico textual:

```
Pais (1) ──< (N) Departamento
Departamento (1) ──< (N) Municipio
Municipio (1) ──< (N) Barrio
Barrio (1) ──< (N) Direccion

TipoDocumento (1) ──< (N) Persona
Genero (1) ──< (N) Persona
Direccion (1) ── (0..1) Persona
Persona (1) ── (0..1) Usuario

Rol (M) ──── (N) Permiso  [via rol_permiso]
Rol (1) ──< (N) Usuario
EstadoUsuario (1) ──< (N) Usuario
Usuario (1) ──< (N) Sesion
Usuario (1) ──< (N) RefreshToken
Usuario (1) ──< (N) Notificacion
Usuario (1) ──< (N) Auditoria

EstadoEmpresa (1) ──< (N) Empresa
Direccion (1) ──< (0..N) Empresa
Empresa (1) ──< (N) Sucursal
Empresa (1) ──< (N) EmpleadoEmpresa
Empresa (1) ──< (N) Repartidor
Empresa (1) ──< (N) Lavadora
Empresa (1) ── (0..1) ConfiguracionEmpresa
Empresa (1) ──< (N) EmpresaArchivo
Empresa (1) ──< (N) Suscripcion
Empresa (1) ──< (N) TarifaEmpresa
Empresa (1) ──< (N) Ruta
Empresa (1) ──< (N) PagoEmpresa
Empresa (1) ──< (N) SolicitudAlquiler
Empresa (1) ──< (N) ColaEspera
Empresa (1) ──< (N) SoporteTicket

Sucursal (1) ──< (N) Lavadora
Sucursal (1) ──< (N) SolicitudAlquiler

MarcaLavadora (1) ──< (N) ModeloLavadora
CapacidadLavadora (1) ──< (N) Lavadora
EstadoLavadora (1) ──< (N) Lavadora
Lavadora (1) ──< (N) FotografiaLavadora
Lavadora (1) ──< (N) MantenimientoLavadora
Lavadora (1) ──< (N) HistorialLavadora
Lavadora (1) ──< (N) MovimientoLavadora
Lavadora (1) ──< (N) Alquiler

ClienteEmpresa (1) ──< (N) SolicitudAlquiler
EstadoSolicitud (1) ──< (N) SolicitudAlquiler
SolicitudAlquiler (1) ──< (N) AsignacionSolicitud
SolicitudAlquiler (1) ──< (N) Alquiler

EstadoAlquiler (1) ──< (N) Alquiler
Alquiler (1) ── (0..1) CronometroAlquiler
Alquiler (1) ──< (N) HistorialAlquiler
Alquiler (1) ──< (N) EvidenciaEntrega
Alquiler (1) ──< (N) DevolucionLavadora
Alquiler (1) ──< (N) LiquidacionAlquiler
Alquiler (1) ──< (N) HistorialRuta

DevolucionLavadora (1) ──< (N) EvidenciaDevolucion

MetodoPago (1) ──< (N) PagoCliente
EstadoPago (1) ──< (N) PagoCliente
LiquidacionAlquiler (1) ──< (N) PagoCliente
LiquidacionAlquiler (1) ──< (N) Factura
EstadoFactura (1) ──< (N) Factura

Plan (1) ──< (N) Suscripcion
Suscripcion (1) ──< (N) PagoEmpresa
```

---

## 11. COMPATIBILIDAD CON LA APP MOVIL

### Analisis por pantalla:

| Pantalla | Backend Soporte | Estado | APIs Necesarias |
|----------|----------------|--------|-----------------|
| Login | POST /auth/login | **Completo** | Ya existe |
| Registro | POST /auth/register | **No existe** | Falta endpoint de registro |
| Forgot Password | POST /auth/forgot-password | **No existe** | Falta endpoint de recuperacion |
| Home | GET /companies (featured) | **Parcial** | Falta endpoint de empresas destacadas |
| Empresas | GET /companies | **Parcial** | Solo accedido por SUPER_ADMIN |
| Detalle Empresa | GET /companies/{id} | **Parcial** | Solo accedido por SUPER_ADMIN |
| Servicios | No existe modulo servicios | **No existe** | Falta CRUD de servicios |
| Solicitar Servicio | No existe modulo solicitudes cliente | **No existe** | Falta crear solicitud como cliente |
| Mis Servicios | GET /alquileres | **Parcial** | Solo accedido por SUPER_ADMIN |
| Servicio Activo | Cronometro WebSocket | **Parcial** | WebSocket existe pero no hay GET de servicio activo |
| Reportar Problema | No existe modulo reportes | **No existe** | Falta crear reporte |
| Historial | GET /historial | **Parcial** | Solo accedido por SUPER_ADMIN |
| Perfil | No existe modulo perfil cliente | **No existe** | Falta GET/PUT perfil |
| Direcciones | No existe modulo direcciones | **No existe** | Falta CRUD de direcciones |
| Metodos de Pago | No existe modulo pagos cliente | **No existe** | Falta gestion de metodos de pago |
| Configuracion | No existe | **No existe** | Falta |
| FAQ | No existe | **No existe** | Falta |
| Soporte | POST /tickets | **Parcial** | Existe pero orientado a admin |

### Resumen de compatibilidad:

| Estado | Cantidad |
|--------|----------|
| **Completo** | 1 (Login) |
| **Parcial** | 7 (Home, Empresas, Detalle, Mis Servicios, Servicio Activo, Historial, Soporte) |
| **No existe** | 8 (Registro, Forgot Password, Servicios, Solicitar, Reportar, Perfil, Direcciones, Config/FAQ) |

---

## 12. APIs FALTANTES PARA LA APP MOVIL

### Prioridad ALTA

| # | Nombre | Ruta | Metodo | Request | Response | Descripcion |
|---|--------|------|--------|---------|----------|-------------|
| 1 | Registro de cliente | POST /api/auth/register | POST | `RegisterRequest` (nombres, apellidos, documento, correo, telefono, username, password) | `ApiResponse` (user + tokens) | Crear cuenta de cliente |
| 2 | Forgot password | POST /api/auth/forgot-password | POST | `ForgotPasswordRequest` (email) | `ApiResponse` | Enviar email de recuperacion |
| 3 | Reset password | POST /api/auth/reset-password | POST | `ResetPasswordRequest` (token, new_password) | `ApiResponse` | Cambiar contrasena con token |
| 4 | Mi perfil (GET) | GET /api/cliente/perfil | GET | - | `ApiResponse` (perfil) | Obtener perfil del cliente autenticado |
| 5 | Mi perfil (PUT) | PUT /api/cliente/perfil | PUT | `ClientePerfilUpdate` | `ApiResponse` | Actualizar perfil del cliente |
| 6 | Mis direcciones (GET) | GET /api/cliente/direcciones | GET | - | `PaginatedResponse` | Listar direcciones del cliente |
| 7 | Mis direcciones (POST) | POST /api/cliente/direcciones | POST | `DireccionCreate` | `ApiResponse` | Crear direccion |
| 8 | Mis direcciones (PUT) | PUT /api/cliente/direcciones/{uuid} | PUT | `DireccionUpdate` | `ApiResponse` | Actualizar direccion |
| 9 | Mis direcciones (DELETE) | DELETE /api/cliente/direcciones/{uuid} | DELETE | - | `ApiResponse` | Eliminar direccion |
| 10 | Empresas destacadas | GET /api/empresas/publicas | GET | Query params (lat, lng, limit) | `ApiResponse` | Empresas verificadas y abiertas |
| 11 | Detalle empresa publico | GET /api/empresas/publicas/{uuid} | GET | - | `ApiResponse` | Detalle de empresa para cliente |
| 12 | Capacidades de empresa | GET /api/empresas/publicas/{uuid}/capacidades | GET | - | `ApiResponse` | Capacidades disponibles |
| 13 | Crear solicitud | POST /api/solicitudes | POST | `SolicitudCreate` (empresa, capacidad, direccion, fecha, hora) | `ApiResponse` | Cliente crea solicitud de alquiler |
| 14 | Mis solicitudes | GET /api/solicitudes | GET | Query params (estado, page) | `PaginatedResponse` | Solicitudes del cliente |
| 15 | Detalle solicitud | GET /api/solicitudes/{uuid} | GET | - | `ApiResponse` | Detalle de solicitud |
| 16 | Cancelar solicitud | PUT /api/solicitudes/{uuid}/cancelar | PUT | - | `ApiResponse` | Cliente cancela su solicitud |
| 17 | Servicio activo | GET /api/cliente/servicio-activo | GET | - | `ApiResponse` | Servicio activo del cliente |
| 18 | Solicitar finalizacion | POST /api/cliente/servicio-activo/finalizar | POST | `FinalizarRequest` (notas) | `ApiResponse` | Cliente solicita finalizar |
| 19 | Reportar problema | POST /api/cliente/reportes | POST | `ReporteCreate` (tipo, descripcion, fotos) | `ApiResponse` | Reportar inconveniente |
| 20 | Mis reportes | GET /api/cliente/reportes | GET | Query params | `PaginatedResponse` | Reportes del cliente |

### Prioridad MEDIA

| # | Nombre | Ruta | Metodo | Request | Response | Descripcion |
|---|--------|------|--------|---------|----------|-------------|
| 21 | Mis facturas | GET /api/cliente/facturas | GET | Query params | `PaginatedResponse` | Facturas del cliente |
| 22 | Detalle factura | GET /api/cliente/facturas/{uuid} | GET | - | `ApiResponse` | Detalle de factura |
| 23 | Calificar servicio | POST /api/cliente/calificaciones | POST | `CalificacionCreate` (alquiler_uuid, rating, comentario) | `ApiResponse` | Calificar servicio completado |
| 24 | Mis calificaciones | GET /api/cliente/calificaciones | GET | Query params | `PaginatedResponse` | Calificaciones del cliente |
| 25 | Metodos de pago | GET /api/cliente/metodos-pago | GET | - | `ApiResponse` | Metodos de pago del cliente |
| 26 | Agregar metodo de pago | POST /api/cliente/metodos-pago | POST | `MetodoPagoCreate` | `ApiResponse` | Agregar metodo de pago |
| 27 | Eliminar metodo de pago | DELETE /api/cliente/metodos-pago/{uuid} | DELETE | - | `ApiResponse` | Eliminar metodo de pago |
| 28 | Notificaciones push | POST /api/notificaciones/registrar | POST | `PushTokenRegister` (token, platform) | `ApiResponse` | Registrar token FCM |

### Prioridad BAJA

| # | Nombre | Ruta | Metodo | Request | Response | Descripcion |
|---|--------|------|--------|---------|----------|-------------|
| 29 | FAQ | GET /api/faq | GET | - | `ApiResponse` | Preguntas frecuentes |
| 30 | Configuracion app | GET /api/config/app | GET | - | `ApiResponse` | Config de la app |
| 31 | Terminos y condiciones | GET /api/content/tyc | GET | - | `ApiResponse` | Texto legal |
| 32 | Politica de datos | GET /api/content/politica | GET | - | `ApiResponse` | Politica de tratamiento |
| 33 | Favoritos | GET /api/cliente/favoritos | GET | - | `ApiResponse` | Empresas favoritas |
| 34 | Agregar favorito | POST /api/cliente/favoritos | POST | `{ empresa_uuid }` | `ApiResponse` | Agregar a favoritos |
| 35 | Eliminar favorito | DELETE /api/cliente/favoritos/{uuid} | DELETE | - | `ApiResponse` | Eliminar de favoritos |

---

## 13. WEBSOCKETS

| Endpoint | Estado | Funcionamiento |
|----------|--------|----------------|
| `ws://host/ws/cronometro/{alquiler_uuid}?token=...` | **Implementado** | Timer en tiempo real cada 10 segundos, calcula valor acumulado |
| Seguimiento en tiempo real (repartidor) | **No implementado** | |
| Estado del servicio | **No implementado** | |
| Notificaciones push | **No implementado** | |
| Chat cliente-empresa | **No implementado** | |
| Eventos generales | **No implementado** | |

---

## 14. RIESGOS ENCONTRADOS

### Criticos
1. **Secret key hardcodeada** en `security/jwt.py` y `config.py` - compromete toda la seguridad JWT
2. **CORS abierto** (`allow_origins=["*"]`) - permite cualquier origen
3. **Sin rate limiting** - vulnerable a fuerza bruta y DDoS
4. **Password de BD en `.env`** expuesto en repositorio

### Altos
5. **Sin capa de servicios** - logica de negocio en routers dificulta mantenimiento
6. **Sin tests** - sin cobertura de calidad
7. **`intentos_fallidos` no se valida** en login - campo existe pero no se usa
8. **Sin registro de cliente** - la app movil no puede crear cuentas
9. **Sin endpoint de forgot password** - la app movil no puede recuperar contrasenas

### Medios
10. **`models/base.py` monolitico** (1078 lineas, 47 modelos en 1 archivo)
11. **`routers/empresas.py` grande** (411 lineas, 11 endpoints)
12. **Permisos no se validan** - tabla existe pero ningun router la consulta
13. **3 scripts de seed** (`seed.py`, `seed_full.py`, `seed_completo.py`) - redundancia
14. **Hardcoded values** en WebSocket (pool de conexiones en memoria)
15. **Sin paginacion consistente** - algunos endpoints usan `page/per_page`, otros no

### Bajos
16. **`check_schema.py` y `fix_users.py`** - scripts de desarrollo en produccion
17. **Logs en archivos** (`server_out.log`, `server_error.log`) sin rotacion
18. **`echo=False`** en engine - dificulta debugging de queries
19. **Sin health check detallado** - solo retorna `{"status": "ok"}`

---

## 15. RECOMENDACIONES

### Criticas (deben resolverse antes de integracion)
1. Mover secret key a variables de entorno y rotarla
2. Implementar CORS con origenes especificos
3. Crear endpoint de registro de clientes
4. Crear endpoint de forgot/reset password
5. Crear endpoints de perfil del cliente (GET/PUT)
6. Crear endpoints de direcciones del cliente (CRUD)
7. Crear endpoints de empresas publicas (solo lectura para clientes)

### Altas (requeridas para funcionalidad completa)
8. Crear modulo de solicitudes para clientes (crear, listar, cancelar)
9. Crear modulo de servicio activo (obtener, finalizar)
10. Crear modulo de reportes de problemas
11. Crear modulo de facturas del cliente
12. Crear modulo de calificaciones
13. Implementar validacion de `intentos_fallidos` en login
14. Agregar rate limiting basico

### Medias (mejoras de calidad)
15. Implementar capa de servicios (extraer logica de routers)
16. Dividir `models/base.py` en archivos por dominio
17. Agregar tests unitarios y de integracion
18. Implementar validacion de permisos (no solo roles)
19. Agregar paginacion consistente en todos los endpoints
20. Implementar subida de archivos real (UploadFile)

### Bajas (optimizaciones futuras)
21. Dockerizar la aplicacion
22. Configurar HTTPS
23. Implementar monitoreo y metricas
24. Agregar logging estructurado
25. Configurar CI/CD
26. Implementar backup automatizado de BD

---

## 16. ESTADO GENERAL DEL BACKEND

| Aspecto | Calificacion | Nota |
|---------|-------------|------|
| Funcionalidad web | 9/10 | Completa para panel admin |
| Funcionalidad movil | 2/10 | Requiere desarrollo significativo |
| Seguridad | 4/10 | JWT funciona pero hay vulnerabilidades |
| Arquitectura | 5/10 | Funcional pero sin separacion de capas |
| Calidad de codigo | 6/10 | Ordenado pero monolitico |
| Documentacion | 7/10 | Auto-doc de FastAPI + informes |
| Testing | 0/10 | No existe |
| Preparacion produccion | 3/10 | Sin Docker, HTTPS, monitoreo |

**Estado general: FUNCIONAL PARA WEB, REQUIERE DESARROLLO PARA MOVIL**

El backend cumple bien su proposito actual (panel de administracion web). Sin embargo, para la integracion con la app movil necesita desarrollo considerable en modulos de cliente, autenticacion mobile, y endpoints publicos.

---

## 17. PLAN DE INTEGRACION FRONTEND <-> FASTAPI

### Fase 1: Fundamentos de autenticacion mobile
1. Implementar POST /api/auth/register (registro de clientes)
2. Implementar POST /api/auth/forgot-password (recuperacion)
3. Implementar POST /api/auth/reset-password (cambio con token)
4. Modificar login para retornar info de perfil del cliente
5. Implementar validacion de intentos fallidos

### Fase 2: Perfil y direcciones del cliente
6. Crear router `/api/cliente/` con dependencia `require_role(CLIENTE)`
7. Implementar GET/PUT /api/cliente/perfil
8. Implementar CRUD /api/cliente/direcciones
9. Implementar GET/POST/DELETE /api/cliente/metodos-pago

### Fase 3: Empresas y capacidades (publico)
10. Crear router `/api/empresas/publicas/` (sin auth o auth ligera)
11. Implementar GET /api/empresas/publicas (con filtros de ubicacion)
12. Implementar GET /api/empresas/publicas/{uuid} (detalle)
13. Implementar GET /api/empresas/publicas/{uuid}/capacidades

### Fase 4: Solicitudes de alquiler
14. Implementar POST /api/solicitudes (cliente crea solicitud)
15. Implementar GET /api/solicitudes (mis solicitudes)
16. Implementar GET /api/solicitudes/{uuid} (detalle)
17. Implementar PUT /api/solicitudes/{uuid}/cancelar

### Fase 5: Servicio activo
18. Implementar GET /api/cliente/servicio-activo
19. Adaptar WebSocket para que el cliente pueda conectarse
20. Implementar POST /api/cliente/servicio-activo/finalizar

### Fase 6: Post-servicio
21. Implementar POST /api/cliente/reportes (reportar problema)
22. Implementar GET /api/cliente/facturas
23. Implementar POST /api/cliente/calificaciones

### Fase 7: Complementos
24. Implementar favoritos
25. Implementar FAQ estatico
26. Implementar notificaciones push (FCM)
27. Implementar configuracion de app

---

**FIN DEL INFORME**
