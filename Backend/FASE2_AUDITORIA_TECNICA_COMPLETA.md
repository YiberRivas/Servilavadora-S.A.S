# AUDITORIA TECNICA COMPLETA DEL BACKEND
# Servilavadora S.A.S.

**Fecha:** 25/07/2026
**Tipo:** Solo lectura - Sin modificaciones
**Objetivo:** Estado actual completo del backend antes de integracion con app movil

---

## 1. ARQUITECTURA DEL PROYECTO

### 1.1 Estructura de carpetas

```
Backend/
├── .env                          # Variables de entorno reales
├── .env.example                  # Template de variables
├── run.py                        # Entry point Uvicorn
├── requirements.txt              # 12 dependencias
├── Database.sql                  # Schema MySQL crudo (2196 lineas)
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
    │   ├── auth.py               # Login, Token (34 lineas)
    │   ├── empresa.py            # Empresa, Sucursal, Plan (132 lineas)
    │   ├── usuario.py            # Persona, Usuario, Rol (84 lineas)
    │   └── modulos.py            # Todos los modulos (299 lineas)
    ├── routers/                  # 18 archivos
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

### 1.2 Organizacion de modulos

| Capa | Directorio | Estado | Archivos |
|------|-----------|--------|----------|
| Configuracion | `app/config.py` | Implementado | 1 |
| Base de datos | `app/database.py` | Implementado | 1 |
| Modelos | `app/models/` | Implementado | 1 (monolitico) |
| Schemas | `app/schemas/` | Implementado | 5 |
| Routers | `app/routers/` | Implementado | 18 |
| Security | `app/security/` | Implementado | 2 |
| Services | `app/services/` | VACIO | 0 |
| Repositories | `app/repositories/` | VACIO | 0 |
| Utils | `app/utils/` | Implementado | 2 |
| WebSockets | `app/websockets/` | Implementado | 1 |
| Dependencies | `app/dependencies.py` | Implementado | 1 |

### 1.3 Separacion por capas

```
[HTTP Request]
      │
      ▼
[Routers] ──── Logica de negocio inline (sin services)
      │
      ▼
[Dependencies] ──── Auth + Roles
      │
      ▼
[Schemas] ──── Validacion Pydantic
      │
      ▼
[Models] ──── SQLAlchemy ORM
      │
      ▼
[Database] ──── Async Session
```

**Problema:** Las capas `services/` y `repositories/` existen pero estan vacias. Toda la logica de negocio esta embebida directamente en los handlers de los routers.

### 1.4 Nivel de mantenibilidad

| Aspecto | Calificacion | Justificacion |
|---------|-------------|---------------|
| Estructura de carpetas | 7/10 | Organizada pero con directorios vacios |
| Separacion de concerns | 4/10 | Logica en routers, sin services |
| Nombrado consistente | 8/10 | Convenciones claras y consistentes |
| Documentacion inline | 5/10 | Docstrings minimos |
| Facilidad de testing | 3/10 | Sin tests, logica acoplada |
| Facilidad de escalar | 4/10 | Monolitico, sin modularizacion por dominio |

---

## 2. BASE DE DATOS

### 2.1 Tablas existentes (47)

| # | Tabla | Dominio | Registros seed |
|---|-------|---------|----------------|
| 1 | `pais` | Geografia | 5 |
| 2 | `departamento` | Geografia | 12 |
| 3 | `municipio` | Geografia | 15 |
| 4 | `barrio` | Geografia | 20 |
| 5 | `direccion` | Geografia | 25 |
| 6 | `tipo_documento` | Identidad | 3 |
| 7 | `genero` | Identidad | 3 |
| 8 | `persona` | Identidad | 25 |
| 9 | `rol` | Acceso | 4 |
| 10 | `permiso` | Acceso | 23 |
| 11 | `rol_permiso` | Acceso | ~46 |
| 12 | `estado_usuario` | Acceso | 4 |
| 13 | `usuario` | Acceso | 25 |
| 14 | `sesion` | Acceso | - |
| 15 | `refresh_token` | Acceso | - |
| 16 | `estado_empresa` | Negocio | 4 |
| 17 | `archivo` | Negocio | 20 |
| 18 | `empresa` | Negocio | 10 |
| 19 | `empresa_archivo` | Negocio | 20 |
| 20 | `configuracion_empresa` | Negocio | 10 |
| 21 | `configuracion_global` | Negocio | - |
| 22 | `sucursal` | Negocio | 20 |
| 23 | `empleado_empresa` | Negocio | 20 |
| 24 | `repartidor` | Negocio | 15 |
| 25 | `capacidad_lavadora` | Lavadoras | 8 |
| 26 | `marca_lavadora` | Lavadoras | 7 |
| 27 | `modelo_lavadora` | Lavadoras | 8 |
| 28 | `estado_lavadora` | Lavadoras | 5 |
| 29 | `lavadora` | Lavadoras | 30 |
| 30 | `fotografia_lavadora` | Lavadoras | 20 |
| 31 | `mantenimiento_lavadora` | Lavadoras | 20 |
| 32 | `historial_lavadora` | Lavadoras | 25 |
| 33 | `movimiento_lavadora` | Lavadoras | 20 |
| 34 | `estado_solicitud` | Alquiler | 5 |
| 35 | `solicitud_alquiler` | Alquiler | 25 |
| 36 | `asignacion_solicitud` | Alquiler | 15 |
| 37 | `cliente_empresa` | Alquiler | 20 |
| 38 | `estado_alquiler` | Alquiler | - |
| 39 | `alquiler` | Alquiler | 20 |
| 40 | `cronometro_alquiler` | Alquiler | 20 |
| 41 | `historial_alquiler` | Alquiler | - |
| 42 | `evidencia_entrega` | Alquiler | 10 |
| 43 | `devolucion_lavadora` | Alquiler | 15 |
| 44 | `evidencia_devolucion` | Alquiler | 10 |
| 45 | `cola_espera` | Alquiler | 15 |
| 46 | `metodo_pago` | Pagos | 6 |
| 47 | `estado_pago` | Pagos | 4 |
| 48 | `liquidacion_alquiler` | Pagos | 20 |
| 49 | `pago_cliente` | Pagos | 20 |
| 50 | `estado_factura` | Pagos | - |
| 51 | `factura` | Pagos | 20 |
| 52 | `plan` | Suscripciones | 3 |
| 53 | `suscripcion` | Suscripciones | 20 |
| 54 | `tarifa_empresa` | Suscripciones | 20 |
| 55 | `ruta` | Rutas | 20 |
| 56 | `historial_ruta` | Rutas | 20 |
| 57 | `notificacion` | Notificaciones | 25 |
| 58 | `auditoria` | Auditoria | 25 |
| 59 | `pago_empresa` | Pagos | 20 |
| 60 | `soporte_ticket` | Soporte | 20 |
| 61 | `soporte_respuesta` | Soporte | 25 |

### 2.2 Relaciones

| Tipo | Relacion | Tabla Origen | Tabla Destino |
|------|----------|-------------|---------------|
| 1:N | pais -> departamento | `pais` | `departamento` |
| 1:N | departamento -> municipio | `departamento` | `municipio` |
| 1:N | municipio -> barrio | `municipio` | `barrio` |
| 1:N | barrio -> direccion | `barrio` | `direccion` |
| 1:N | tipo_documento -> persona | `tipo_documento` | `persona` |
| 1:N | genero -> persona | `genero` | `persona` |
| 1:1 | persona -> usuario | `persona` | `usuario` |
| 1:N | rol -> usuario | `rol` | `usuario` |
| M:N | rol <-> permiso | `rol_permiso` | - |
| 1:N | estado_usuario -> usuario | `estado_usuario` | `usuario` |
| 1:N | usuario -> sesion | `usuario` | `sesion` |
| 1:N | usuario -> refresh_token | `usuario` | `refresh_token` |
| 1:N | usuario -> notificacion | `usuario` | `notificacion` |
| 1:N | estado_empresa -> empresa | `estado_empresa` | `empresa` |
| 1:N | empresa -> sucursal | `empresa` | `sucursal` |
| 1:N | empresa -> empleado_empresa | `empresa` | `empleado_empresa` |
| 1:N | empresa -> repartidor | `empresa` | `repartidor` |
| 1:N | empresa -> lavadora | `empresa` | `lavadora` |
| 1:1 | empresa -> configuracion_empresa | `empresa` | `configuracion_empresa` |
| 1:N | empresa -> empresa_archivo | `empresa` | `empresa_archivo` |
| 1:N | empresa -> suscripcion | `empresa` | `suscripcion` |
| 1:N | empresa -> tarifa_empresa | `empresa` | `tarifa_empresa` |
| 1:N | empresa -> ruta | `empresa` | `ruta` |
| 1:N | empresa -> pago_empresa | `empresa` | `pago_empresa` |
| 1:N | empresa -> solicitud_alquiler | `empresa` | `solicitud_alquiler` |
| 1:N | empresa -> cola_espera | `empresa` | `cola_espera` |
| 1:N | empresa -> soporte_ticket | `empresa` | `soporte_ticket` |
| 1:N | sucursal -> lavadora | `sucursal` | `lavadora` |
| 1:N | sucursal -> solicitud_alquiler | `sucursal` | `solicitud_alquiler` |
| 1:N | marca_lavadora -> modelo_lavadora | `marca_lavadora` | `modelo_lavadora` |
| 1:N | capacidad_lavadora -> lavadora | `capacidad_lavadora` | `lavadora` |
| 1:N | estado_lavadora -> lavadora | `estado_lavadora` | `lavadora` |
| 1:N | lavadora -> fotografia_lavadora | `lavadora` | `fotografia_lavadora` |
| 1:N | lavadora -> mantenimiento_lavadora | `lavadora` | `mantenimiento_lavadora` |
| 1:N | lavadora -> historial_lavadora | `lavadora` | `historial_lavadora` |
| 1:N | lavadora -> movimiento_lavadora | `lavadora` | `movimiento_lavadora` |
| 1:N | lavadora -> alquiler | `lavadora` | `alquiler` |
| 1:N | estado_solicitud -> solicitud_alquiler | `estado_solicitud` | `solicitud_alquiler` |
| 1:N | solicitud_alquiler -> asignacion_solicitud | `solicitud_alquiler` | `asignacion_solicitud` |
| 1:N | solicitud_alquiler -> alquiler | `solicitud_alquiler` | `alquiler` |
| 1:N | cliente_empresa -> solicitud_alquiler | `cliente_empresa` | `solicitud_alquiler` |
| 1:N | estado_alquiler -> alquiler | `estado_alquiler` | `alquiler` |
| 1:1 | alquiler -> cronometro_alquiler | `alquiler` | `cronometro_alquiler` |
| 1:N | alquiler -> historial_alquiler | `alquiler` | `historial_alquiler` |
| 1:N | alquiler -> evidencia_entrega | `alquiler` | `evidencia_entrega` |
| 1:N | alquiler -> devolucion_lavadora | `alquiler` | `devolucion_lavadora` |
| 1:N | alquiler -> liquidacion_alquiler | `alquiler` | `liquidacion_alquiler` |
| 1:N | alquiler -> historial_ruta | `alquiler` | `historial_ruta` |
| 1:N | devolucion_lavadora -> evidencia_devolucion | `devolucion_lavadora` | `evidencia_devolucion` |
| 1:N | liquidacion_alquiler -> pago_cliente | `liquidacion_alquiler` | `pago_cliente` |
| 1:N | liquidacion_alquiler -> factura | `liquidacion_alquiler` | `factura` |
| 1:N | metodo_pago -> pago_cliente | `metodo_pago` | `pago_cliente` |
| 1:N | estado_pago -> pago_cliente | `estado_pago` | `pago_cliente` |
| 1:N | estado_factura -> factura | `estado_factura` | `factura` |
| 1:N | plan -> suscripcion | `plan` | `suscripcion` |
| 1:N | suscripcion -> pago_empresa | `suscripcion` | `pago_empresa` |
| 1:N | ruta -> historial_ruta | `ruta` | `historial_ruta` |
| 1:N | usuario -> auditoria | `usuario` | `auditoria` |
| 1:N | soporte_ticket -> soporte_respuesta | `soporte_ticket` | `soporte_respuesta` |

### 2.3 Claves foraneas

Todas las FK estan implementadas en los modelos SQLAlchemy. No hay FK faltantes en comparacion con el schema SQL.

### 2.4 Indices

**NO hay indices explicitos** definidos en los modelos SQLAlchemy. Solo existen:
- `UniqueConstraint` en `rol_permiso` (`id_rol`, `id_permiso`)
- `UniqueConstraint` en `cliente_empresa` (`id_empresa`, `id_usuario`)
- Indices implicitos en columnas `uuid` (|unique=True) y otras columnas con constraint unico

**Faltan indices en:**
- `persona.correo` (busquedas por email)
- `usuario.username` (busquedas por login)
- `empresa.nit` (busquedas por NIT)
- `solicitud_alquiler.id_empresa` (listados por empresa)
- `alquiler.id_cliente_empresa` (historial del cliente)
- `alquiler.id_estado_alquiler` (filtros por estado)
- `notificacion.id_usuario` (notificaciones del usuario)

### 2.5 Alembic

**NO existe.** No hay:
- `alembic/` directorio
- `alembic.ini`
- Ningun archivo de migracion
- `alembic` en `requirements.txt`

El schema se gestiona via `Database.sql` (SQL crudo de 2196 lineas).

### 2.6 Estado de las migraciones

**Inexistente.** Cualquier cambio de schema requiere ejecutar `Database.sql` manualmente o modificar la BD directamente.

---

## 3. MODELOS SQLALCHEMY

### 3.1 Modelos existentes (47 clases)

Todos los modelos estan en un solo archivo: `app/models/base.py` (1078 lineas).

Todos heredan de `Base(DeclarativeBase)` y usan:
- `BigInteger` auto-increment para PK internos
- `String(36)` para UUID externos
- `SmallInteger` para soft delete (`estado=1` activo, `estado=0` inactivo)
- `DateTime` con `server_default=func.now()` para timestamps

### 3.2 Relaciones OneToMany

| Padre | Hijo | FK | Cascade |
|-------|------|----|---------| 
| Pais | Departamento | `id_pais` | No definido |
| Departamento | Municipio | `id_departamento` | No definido |
| Municipio | Barrio | `id_municipio` | No definido |
| Barrio | Direccion | `id_barrio` | No definido |
| TipoDocumento | Persona | `id_tipo_documento` | No definido |
| Genero | Persona | `id_genero` | No definido |
| Rol | Usuario | `id_rol` | No definido |
| EstadoUsuario | Usuario | `id_estado_usuario` | No definido |
| Empresa | Sucursal | `id_empresa` | No definido |
| Empresa | Lavadora | `id_empresa` | No definido |
| Empresa | SolicitudAlquiler | `id_empresa` | No definido |
| Lavadora | Alquiler | `id_lavadora` | No definido |
| SolicitudAlquiler | Alquiler | `id_solicitud_alquiler` | No definido |
| Alquiler | CronometroAlquiler | `id_alquiler` | No definido |
| Alquiler | HistorialAlquiler | `id_alquiler` | No definido |
| Alquiler | DevolucionLavadora | `id_alquiler` | No definido |
| Alquiler | LiquidacionAlquiler | `id_alquiler` | No definido |

### 3.3 Relaciones ManyToMany

| Entidad A | Entidad B | Tabla pivote |
|-----------|-----------|-------------|
| Rol | Permiso | `rol_permiso` |

### 3.4 Cascadas

**NO hay cascadas definidas** en ninguna relacion. Todos los `relationship()` usan configuracion por defecto (sin `cascade`, `passive_deletes`, etc.).

**Riesgo:** Eliminar un registro padre puede causar errores de FK si hay hijos dependientes.

---

## 4. SCHEMAS PYDANTIC

### 4.1 Schemas Create

| Schema | Archivo | Campos requeridos |
|--------|---------|-------------------|
| `EmpresaCreate` | empresa.py | nit, razon_social, representante_legal, correo, id_estado_empresa |
| `SucursalCreate` | empresa.py | nombre, id_direccion |
| `UsuarioCreate` | usuario.py | username, password, id_persona, id_rol, id_estado_usuario |
| `ClienteCreate` | modulos.py | id_empresa, id_usuario, fecha_registro |
| `RepartidorCreate` | modulos.py | id_empresa, id_usuario |
| `RutaCreate` | modulos.py | id_empresa, nombre, origen, destino |
| `TicketCreate` | modulos.py | asunto, descripcion |
| `ArchivoCreate` | modulos.py | nombre_original, nombre_servidor, ruta |
| `MantenimientoCreate` | modulos.py | id_lavadora, fecha, tipo |
| `ColaEsperaCreate` | modulos.py | id_empresa, id_cliente_empresa, id_capacidad_lavadora |
| `TarifaCreate` | modulos.py | id_empresa, id_capacidad_lavadora, valor_hora, valor_minuto |
| `SuscripcionCreate` | modulos.py | id_empresa, id_plan, fecha_inicio, fecha_fin, valor |
| `PagoEmpresaCreate` | modulos.py | id_empresa, id_suscripcion, id_metodo_pago, valor |
| `LoginRequest` | auth.py | username, password |
| `RefreshRequest` | auth.py | refresh_token |
| `PasswordChangeRequest` | auth.py | current_password, new_password |

### 4.2 Schemas Update

| Schema | Archivo | Campos |
|--------|---------|--------|
| `EmpresaUpdate` | empresa.py | Todos Optional |
| `UsuarioUpdate` | usuario.py | username, id_rol, id_estado_usuario, estado |
| `ClienteUpdate` | modulos.py | observaciones, estado |
| `RepartidorUpdate` | modulos.py | licencia, vence_licencia, disponible, estado |
| `RutaUpdate` | modulos.py | nombre, origen, destino, distancia_km, tiempo_estimado_minutos, activa |
| `TicketUpdate` | modulos.py | prioridad, estado |
| `TarifaUpdate` | modulos.py | valor_hora, valor_minuto, activa |
| `SuscripcionUpdate` | modulos.py | activa, pagada, fecha_fin |

### 4.3 Schemas Response

| Schema | Archivo | Uso |
|--------|---------|-----|
| `ApiResponse` | common.py | TODOS los endpoints |
| `PaginatedResponse` | common.py | Listas paginadas |
| `TokenResponse` | auth.py | Login |
| `UserBasicResponse` | auth.py | /auth/me |
| `EmpresaResponse` | empresa.py | Detalle empresa |
| `SucursalResponse` | empresa.py | Listado sucursales |
| `PlanResponse` | empresa.py | Listado planes |
| `SuscripcionResponse` | empresa.py | Listado suscripciones |
| `PagoEmpresaResponse` | empresa.py | Listado pagos |
| `UsuarioResponse` | usuario.py | Detalle usuario |
| `RolResponse` | usuario.py | Listado roles |
| `PermisoResponse` | usuario.py | Listado permisos |
| `ClienteResponse` | modulos.py | Detalle cliente |
| `RepartidorResponse` | modulos.py | Detalle repartidor |
| `RutaResponse` | modulos.py | Detalle ruta |
| `NotificacionResponse` | modulos.py | Listado notificaciones |
| `TicketResponse` | modulos.py | Detalle ticket |
| `TicketRespuestaResponse` | modulos.py | Detalle respuesta |
| `ArchivoResponse` | modulos.py | Detalle archivo |
| `MantenimientoResponse` | modulos.py | Detalle mantenimiento |
| `ColaEsperaResponse` | modulos.py | Detalle cola |
| `TarifaResponse` | modulos.py | Detalle tarifa |
| `HistorialLavadoraResponse` | modulos.py | Historial lavadora |
| `HistorialAlquilerResponse` | modulos.py | Historial alquiler |

### 4.4 Validaciones

**Estado: MINIMO**

- Solo validacion de tipos Pydantic (`str`, `int`, `float`, `Optional[...]`)
- `Query(1, ge=1)` y `Query(20, ge=1, le=100)` en paginacion
- `class Config: from_attributes = True` en response models
- **NO hay:** `@field_validator`, `@model_validator`, validacion de email, NIT, password, telefono, longitudes maximas

---

## 5. CRUD

### 5.1 CRUD existentes

| Modulo | GET list | GET one | POST create | PUT update | DELETE |
|--------|----------|---------|-------------|------------|--------|
| Auth | - | /me | login, refresh | change-password | logout |
| Usuarios | /usuarios | /usuarios/{uuid} | /usuarios | /usuarios/{uuid} | /usuarios/{uuid} |
| Empresas | /empresas | /empresas/{uuid} | /empresas | /empresas/{uuid} | /empresas/{uuid} |
| Lavadoras | /lavadoras | - | - | - | - |
| Alquileres | /alquileres | - | - | - | - |
| Clientes | /clientes | /clientes/{uuid} | /clientes | /clientes/{uuid} | /clientes/{uuid} |
| Repartidores | /repartidores | /repartidores/{uuid} | /repartidores | /repartidores/{uuid} | /repartidores/{uuid} |
| Rutas | /rutas | - | /rutas | /rutas/{uuid} | /rutas/{uuid} |
| Notificaciones | /notificaciones | - | - | leer, leer-todas | - |
| Tickets | /tickets | /tickets/{uuid} | /tickets | /tickets/{uuid} | - |
| Archivos | /archivos | - | /archivos | - | /archivos/{uuid} |
| Mantenimientos | /mantenimientos | - | /mantenimientos | - | /mantenimientos/{uuid} |
| Cola Espera | /cola-espera | - | /cola-espera | atender | /cola-espera/{uuid} |
| Tarifas | /tarifas | - | /tarifas | /tarifas/{uuid} | /tarifas/{uuid} |
| Suscripciones | /suscripciones | - | /suscripciones | /suscripciones/{uuid} | - |
| Dashboard | /dashboard | - | - | - | - |
| Configuraciones | /configuraciones | - | - | - | - |
| Historial | historial/{uuid} | - | - | - | - |

### 5.2 CRUD faltantes

| Modulo | Necesario para |
|--------|---------------|
| Registro de cliente | App movil |
| Forgot/Reset password | App movil |
| Perfil del cliente | App movil |
| Direcciones del cliente | App movil |
| Metodos de pago del cliente | App movil |
| Solicitudes del cliente | App movil |
| Servicio activo del cliente | App movil |
| Reportes de problemas | App movil |
| Facturas del cliente | App movil |
| Calificaciones | App movil |
| Favoritos | App movil |
| FAQ | App movil |
| Configuracion de app | App movil |
| Empresas publicas | App movil |
| Servicios (CRUD) | App movil |

---

## 6. REPOSITORIES

**Estado: VACIO**

El directorio `app/repositories/` existe pero contiene solo `__init__.py` vacio. No hay implementacion de patron repositorio.

---

## 7. SERVICES

**Estado: VACIO**

El directorio `app/services/` existe pero contiene solo `__init__.py` vacio. No hay implementacion de capa de servicios.

---

## 8. ROUTERS

### 8.1 Inventario completo

| # | Router | Prefijo | Lineas | Endpoints |
|---|--------|---------|--------|-----------|
| 1 | auth.py | /api/auth | 183 | 5 |
| 2 | usuarios.py | /api/usuarios | 210 | 6 |
| 3 | empresas.py | /api/empresas | 411 | 11 |
| 4 | lavadoras.py | /api/lavadoras | 138 | 4 |
| 5 | alquileres.py | /api/alquileres | 151 | 4 |
| 6 | dashboard.py | /api/dashboard | 92 | 1 |
| 7 | configuraciones.py | /api/configuraciones | 47 | 2 |
| 8 | clientes.py | /api/clientes | 167 | 5 |
| 9 | repartidores.py | /api/repartidores | 170 | 5 |
| 10 | rutas.py | /api/rutas | 102 | 4 |
| 11 | notificaciones.py | /api/notificaciones | 102 | 4 |
| 12 | tickets.py | /api/tickets | 169 | 5 |
| 13 | archivos.py | /api/archivos | 83 | 3 |
| 14 | mantenimientos.py | /api/mantenimientos | 92 | 3 |
| 15 | cola_espera.py | /api/cola-espera | 104 | 4 |
| 16 | tarifas.py | /api/tarifas | 106 | 4 |
| 17 | suscripciones.py | /api/suscripciones | 148 | 6 |
| 18 | historial.py | /api/historial | 101 | 3 |

**Total: 2,234 lineas, 67 endpoints HTTP + 1 WebSocket + 1 Health = 69 endpoints**

### 8.2 Distribucion de autenticacion

| Patron de auth | Endpoints |
|----------------|-----------|
| Solo SUPER_ADMIN | 40 |
| SUPER_ADMIN + ADMIN_EMPRESA | 28 |
| Cualquier autenticado | 7 |
| Publico (sin auth) | 2 |

### 8.3 Metodos HTTP

| Metodo | Cantidad |
|--------|----------|
| GET | 46 |
| POST | 15 |
| PUT | 14 |
| DELETE | 13 |
| PATCH | 0 |

---

## 9. DEPENDENCIAS

### 9.1 Dependencias implementadas

| Dependencia | Archivo | Funcion |
|-------------|---------|---------|
| `security` | dependencies.py | `HTTPBearer()` - extrae token Bearer |
| `get_current_user` | dependencies.py | Valida JWT, carga usuario con eager loads, retorna `Usuario` ORM |
| `require_role(*roles)` | dependencies.py | Factory que valida `current_user.rol.codigo in roles` |
| `get_db` | database.py | Generador async de sesion de BD |

### 9.2 Dependencias faltantes

| Dependencia | Uso necesario |
|-------------|---------------|
| `get_current_cliente` | Filtrar datos por cliente autenticado |
| `get_current_empresa` | Filtrar datos por empresa del admin |
| `require_empresa_active` | Validar que la empresa este activa |
| `validate_pagination` | Parametros de paginacion centralizados |
| `rate_limit` | Proteccion contra abuso |

---

## 10. SEGURIDAD

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| JWT | Implementado | python-jose, HS256, access 30min, refresh 7d |
| Refresh Token | Implementado | Almacenado en BD, revocable en logout |
| OAuth2 | NO implementado | Solo Bearer token manual |
| Password Hash | Implementado | bcrypt via passlib |
| Roles | Implementado | 4 roles: SUPER_ADMIN, ADMIN_EMPRESA, REPARTIDOR, CLIENTE |
| Permisos | Parcial | Tabla existe pero NO se validan en routers |
| Middleware auth | Implementado | Via FastAPI dependencies (DI pattern) |
| Rate Limit | NO implementado | Sin limitacion de peticiones |
| CORS | Implementado | `allow_origins=["*"]` (abierto) |
| Validaciones | Basicas | Solo tipos Pydantic, sin custom validators |
| CSRF | NO implementado | |
| Secret Key | Hardcodeada | En `security/jwt.py` y `config.py` |
| Bloqueo intentos | Parcial | Campo existe pero no se valida en login |

---

## 11. MIDDLEWARES

| Middleware | Estado | Detalle |
|-----------|--------|---------|
| CORSMiddleware | Implementado | `allow_origins=["*"]` |
| Authentication | Via DI | `HTTPBearer()` + `get_current_user` |
| Authorization | Via DI | `require_role(*roles)` |
| Rate Limiting | NO implementado | |
| Request Logging | NO implementado | |
| Compression | NO implementado | |
| Security Headers | NO implementado | |
| Custom Middleware | NO implementado | |

---

## 12. CONFIGURACION

**Archivo:** `app/config.py` (22 lineas)

| Campo | Tipo | Default | Descripcion |
|-------|------|---------|-------------|
| `DATABASE_URL` | str | `mysql+aiomysql://root:123456@...` | URL de conexion BD |
| `SECRET_KEY` | str | `servilavadora-super-secret-key-...` | Clave JWT |
| `ALGORITHM` | str | `HS256` | Algoritmo JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | int | `30` | Duracion access token |
| `REFRESH_TOKEN_EXPIRE_DAYS` | int | `7` | Duracion refresh token |
| `APP_NAME` | str | `Servilavadora S.A.S.` | Nombre de la app |
| `DEBUG` | bool | `True` | Modo debug |

Usa `pydantic-settings` con `@lru_cache()` para cacheo.

---

## 13. VARIABLES DE ENTORNO

**Archivo:** `.env`

```
DATABASE_URL=mysql+aiomysql://root:12345@localhost:3306/servilavadora_sas
SECRET_KEY=servilavadora-super-secret-key-change-in-production-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
APP_NAME=Servilavadora S.A.S.
DEBUG=false
```

**Problemas:**
- Password de BD (`12345`) en texto plano
- Secret key hardcodeada (no se genera en部署)
- `.env` podria estar en el repositorio
- Sin variables para email, FCM, Redis, etc.

---

## 14. LOGGING

**Archivo:** `app/utils/logging.py` (16 lineas)

- Formato: `%(asctime)s | %(levelname)-8s | %(name)s | %(message)s`
- Suprime logs de SQLAlchemy y Uvicorn access
- Funcion `get_logger(name)` para loggers nombrados

**Uso:** 24 statements de log en 13 archivos (solo nivel INFO y ERROR).

**Falta:**
- File-based logging
- Log rotation
- Structured/JSON logging
- Request/response logging
- Nivel DEBUG para desarrollo
- Logs de auditoria detallados

---

## 15. MANEJO DE ERRORES

**Estado: MINIMO**

- `dependencies.py` lanza `HTTPException` (401, 403) para auth
- Routers retornan `ApiResponse(success=False, message="...")` en vez de HTTP status codes
- `get_db()` hace rollback en excepciones
- `decode_token()` retorna None en errores JWT
- WebSocket maneja `WebSocketDisconnect` y exceptions genericas

**Falta:**
- `@app.exception_handler()` global
- Custom exception classes
- Manejo de errores de BD (duplicados, FK violations)
- Manejo de errores de validacion consistentes
- Logging de errores

---

## 16. EXCEPCIONES

**NO existen custom exceptions.** No hay archivo de excepciones ni clases personalizadas.

Todos los errores se manejan via:
- `HTTPException` (solo en dependencies)
- `ApiResponse(success=False)` (en routers)
- `try/except` generico (en WebSocket)

---

## 17. SWAGGER

**Estado: Implicito (default FastAPI)**

- URL: `http://localhost:8000/docs` (Swagger UI)
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

**NO hay configuracion explicita** de `docs_url`, `redoc_url`, ni `openapi_url` en `main.py`.

**Falta:**
- Descripciones de endpoints
- Ejemplos de request/response
- Tags con descripciones
- Esquemas de error documentados
- Deshabilitar docs en produccion

---

## 18. DOCUMENTACION

| Tipo | Estado | Detalle |
|------|--------|---------|
| Docstrings en codigo | Minimal | Algunos routers tienen docstring corto |
| Comentarios | Minimos | Pocos comentarios explicativos |
| README | No revisado | |
| API docs (Swagger) | Implicito | Default FastAPI |
| Diagramas ER | No existen | |
| Arquitectura | Informes previos | FASE2_ENTREGA1_AUDITORIA_BACKEND.md |

---

## 19. DOCKER

**NO existe.** No hay:
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- Ninguna referencia a Docker en el codigo

---

## 20. DOCKER COMPOSE

**NO existe.**

---

## 21. TESTS

**NO existen.** No hay:
- Directorio `tests/`
- Archivos `test_*.py`
- `pytest.ini` o `pyproject.toml`
- `pytest` en `requirements.txt`
- Ningun tipo de test (unitario, integracion, e2e)

---

## 22. COBERTURA

**0%** - No existen tests.

---

## 23. RENDIMIENTO

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Async completo | Implementado | FastAPI + SQLAlchemy async + aiomysql |
| Connection pooling | Configurado | pool_size=10, max_overflow=20, pool_recycle=3600 |
| pool_pre_ping | NO configurado | Conexiones no se validan antes de usar |
| Caching | NO implementado | Sin Redis, Memcached, ni HTTP caching |
| Background tasks | NO implementado | Sin `BackgroundTasks` |
| Compresion | NO implementada | |
| Rate limiting | NO implementado | |
| Query optimization | Parcial | Usan `selectinload` en algunos endpoints |
| N+1 queries | Posible | En endpoints que cargan relaciones sin eager loading |

---

## 24. VALIDACIONES

**Estado: MINIMO**

| Tipo | Estado |
|------|--------|
| Tipo de dato | Implementado (Pydantic types) |
| Campos requeridos | Implementado (Pydantic required) |
| Paginacion | Implementado (`Query(1, ge=1)`) |
| Email format | NO implementado |
| NIT format | NO implementado |
| Password strength | NO implementado |
| Phone format | NO implementado |
| String length | NO implementado |
| Custom error messages | NO implementado |
| Cross-field validation | NO implementado |

---

## 25. INTEGRACION CON LA WEB

### 25.1 Endpoints que usa la Web (23 de 67)

| # | Metodo | Endpoint | Pagina Web |
|---|--------|----------|-----------|
| 1 | POST | `/auth/login` | Login |
| 2 | POST | `/auth/refresh` | api.js (auto) |
| 3 | GET | `/auth/me` | AuthContext |
| 4 | POST | `/auth/logout` | AuthContext |
| 5 | GET | `/dashboard` | Dashboard, Estadisticas |
| 6 | GET | `/empresas` | Empresas |
| 7 | POST | `/empresas` | Empresas |
| 8 | PUT | `/empresas/{uuid}` | Empresas |
| 9 | DELETE | `/empresas/{uuid}` | Empresas |
| 10 | GET | `/empresas/pendientes` | Dashboard, AprobarEmpresas |
| 11 | PUT | `/empresas/{uuid}/aprobar` | AprobarEmpresas |
| 12 | PUT | `/empresas/{uuid}/rechazar` | AprobarEmpresas |
| 13 | GET | `/usuarios` | Usuarios |
| 14 | POST | `/usuarios` | Usuarios |
| 15 | PUT | `/usuarios/{uuid}` | Usuarios |
| 16 | DELETE | `/usuarios/{uuid}` | Usuarios |
| 17 | GET | `/usuarios/roles/all` | Usuarios |
| 18 | GET | `/empresas/planes/all` | Planes |
| 19 | GET | `/empresas/pagos/all` | Dashboard, Planes, Estadisticas |
| 20 | GET | `/configuraciones/all` | Configuraciones |
| 21 | GET | `/notificaciones` | AdminLayout |
| 22 | GET | `/notificaciones/no-leidas/count` | AdminLayout |
| 23 | PUT | `/notificaciones/leer-todas` | AdminLayout |

### 25.2 Modulos conectados

| Modulo | Web lo usa |
|--------|-----------|
| Auth | Completo |
| Usuarios | Completo |
| Empresas | Completo |
| Dashboard | Completo |
| Notificaciones | Completo |
| Configuraciones | Solo lectura |
| Planes | Solo lectura |
| Pagos | Solo lectura |

### 25.3 Partes que NO usa la Web

| Endpoint | Modulo |
|----------|--------|
| `/lavadoras` (4 endpoints) | Lavadoras |
| `/alquileres` (4 endpoints) | Alquileres |
| `/clientes` (5 endpoints) | Clientes |
| `/repartidores` (5 endpoints) | Repartidores |
| `/rutas` (4 endpoints) | Rutas |
| `/tickets` (5 endpoints) | Tickets |
| `/archivos` (3 endpoints) | Archivos |
| `/mantenimientos` (3 endpoints) | Mantenimientos |
| `/cola-espera` (4 endpoints) | Cola de Espera |
| `/tarifas` (4 endpoints) | Tarifas |
| `/suscripciones` (6 endpoints) | Suscripciones |
| `/historial` (3 endpoints) | Historial |
| `/ws/cronometro` | WebSocket |

**44 endpoints NO son consumidos por la Web.**

---

## 26. PREPARACION PARA LA APP MOVIL

| Pantalla | Backend | Estado |
|----------|---------|--------|
| Login | POST /auth/login | **LISTO** |
| Registro | POST /auth/register | **NO EXISTE** |
| Forgot Password | POST /auth/forgot-password | **NO EXISTE** |
| Home (empresas destacadas) | GET /empresas/publicas | **NO EXISTE** |
| Empresas | GET /empresas (con auth) | **PARCIAL** (solo SUPER_ADMIN) |
| Detalle Empresa | GET /empresas/{uuid} (con auth) | **PARCIAL** (solo SUPER_ADMIN) |
| Servicios | GET /servicios | **NO EXISTE** |
| Solicitar Servicio | POST /solicitudes | **NO EXISTE** |
| Mis Servicios | GET /alquileres (con auth) | **PARCIAL** (solo SUPER_ADMIN) |
| Servicio Activo | GET /cliente/servicio-activo | **NO EXISTE** |
| Reportar Problema | POST /cliente/reportes | **NO EXISTE** |
| Historial | GET /historial (con auth) | **PARCIAL** (solo SUPER_ADMIN) |
| Perfil | GET/PUT /cliente/perfil | **NO EXISTE** |
| Direcciones | CRUD /cliente/direcciones | **NO EXISTE** |
| Metodos de Pago | CRUD /cliente/metodos-pago | **NO EXISTE** |
| Facturas | GET /cliente/facturas | **NO EXISTE** |
| Calificaciones | POST /cliente/calificaciones | **NO EXISTE** |
| FAQ | GET /faq | **NO EXISTE** |
| Soporte | POST /tickets | **PARCIAL** |
| Configuracion | GET /config/app | **NO EXISTE** |

### Resumen

| Estado | Cantidad |
|--------|----------|
| **LISTO** | 1 |
| **PARCIAL** | 5 |
| **NO EXISTE** | 14 |

---

## 27. WEBSOCKETS

| Endpoint | Estado | Funcion |
|----------|--------|---------|
| `ws://host/ws/cronometro/{alquiler_uuid}?token=...` | **Implementado** | Timer en tiempo real cada 10s |
| Seguimiento de repartidor | **NO existe** | Deberia ser: `ws://host/ws/tracking/{alquiler_uuid}` |
| Notificaciones en tiempo real | **NO existe** | Deberia ser: `ws://host/ws/notificaciones/{user_uuid}` |
| Chat cliente-empresa | **NO existe** | Deberia ser: `ws://host/ws/chat/{ticket_uuid}` |

---

## 28. NOTIFICACIONES PUSH

**NO implementado.** No hay:
- Firebase Admin SDK
- FCM token en modelos
- Endpoint para registrar tokens
- Envio de notificaciones push
- `firebase-admin` en requirements.txt

Solo existen notificaciones in-app (tabla `notificacion`).

---

## 29. SUBIDA DE IMAGENES

**NO implementada.** No hay:
- `UploadFile` en ningun router
- `File(...)` en ningun schema
- Endpoint de subida de archivos
- Validacion de tipo/size de archivo
- Storage local o cloud

Solo existe CRUD de metadatos de archivos (`archivos.py`).

---

## 30. ARCHIVOS PDF

**NO implementados.** No hay:
- Libreria de generacion (reportlab, weasyprint, fpdf)
- Endpoint de generacion de PDF
- Endpoint de descarga de PDF

Solo existe campo `pdf` (String) en el modelo `Factura`.

---

## 31. ESTADO GENERAL DEL BACKEND

### Por modulo

| Modulo | Estado | Nota |
|--------|--------|------|
| Auth (login/refresh/logout) | **COMPLETADO** | Funcional para web |
| Auth (registro) | **PENDIENTE** | No existe |
| Auth (forgot password) | **PENDIENTE** | No existe |
| Usuarios (CRUD admin) | **COMPLETADO** | Funcional |
| Empresas (CRUD admin) | **COMPLETADO** | Funcional |
| Empresas (publicas) | **PENDIENTE** | No existe |
| Lavadoras (lectura) | **PARCIAL** | Solo listado, sin CRUD completo |
| Alquileres (admin) | **PARCIAL** | Solo listado, sin gestion |
| Clientes (CRUD) | **COMPLETADO** | Funcional |
| Repartidores (CRUD) | **COMPLETADO** | Funcional |
| Rutas (CRUD) | **COMPLETADO** | Funcional |
| Tickets (CRUD) | **COMPLETADO** | Funcional |
| Archivos (metadata) | **PARCIAL** | Sin subida real |
| Mantenimientos | **COMPLETADO** | Funcional |
| Cola de Espera | **COMPLETADO** | Funcional |
| Tarifas (CRUD) | **COMPLETADO** | Funcional |
| Suscripciones (CRUD) | **COMPLETADO** | Funcional |
| Historial | **PARCIAL** | Solo consultas admin |
| Dashboard | **COMPLETADO** | Funcional |
| Configuraciones | **PARCIAL** | Solo lectura |
| Notificaciones (in-app) | **COMPLETADO** | Funcional |
| Notificaciones (push) | **PENDIENTE** | No existe |
| WebSocket (cronometro) | **COMPLETADO** | Funcional |
| WebSocket (tracking) | **PENDIENTE** | No existe |
| Perfil del cliente | **PENDIENTE** | No existe |
| Direcciones del cliente | **PENDIENTE** | No existe |
| Metodos de pago cliente | **PENDIENTE** | No existe |
| Solicitudes del cliente | **PENDIENTE** | No existe |
| Servicio activo | **PENDIENTE** | No existe |
| Reportes de problemas | **PENDIENTE** | No existe |
| Facturas del cliente | **PENDIENTE** | No existe |
| Calificaciones | **PENDIENTE** | No existe |
| Subida de archivos | **PENDIENTE** | No existe |
| Generacion de PDF | **PENDIENTE** | No existe |
| FAQ | **PENDIENTE** | No existe |
| Tests | **PENDIENTE** | No existe |
| Docker | **PENDIENTE** | No existe |
| Alembic | **PENDIENTE** | No existe |

### Resumen general

| Estado | Modulos |
|--------|---------|
| **COMPLETADO** | 12 |
| **PARCIAL** | 6 |
| **PENDIENTE** | 20 |

---

## 32. ROADMAP

### Fase 0: Fundamentos Criticos (Seguridad)
1. Mover secret key a variables de entorno y generar aleatoriamente
2. Configurar CORS con origenes especificos
3. Agregar `pool_pre_ping=True` al engine de BD
4. Implementar rate limiting basico
5. Implementar validacion de `intentos_fallidos` en login

### Fase 1: Autenticacion Mobile
6. Implementar POST /api/auth/register (registro de clientes)
7. Implementar POST /api/auth/forgot-password
8. Implementar POST /api/auth/reset-password
9. Crear router `/api/cliente/` con dependencia `require_role(CLIENTE)`

### Fase 2: Perfil y Direcciones
10. Implementar GET /api/cliente/perfil
11. Implementar PUT /api/cliente/perfil
12. Implementar CRUD /api/cliente/direcciones
13. Implementar GET/POST/DELETE /api/cliente/metodos-pago

### Fase 3: Empresas Publicas
14. Crear router `/api/empresas/publicas/` (sin auth)
15. Implementar GET /api/empresas/publicas (con filtros de ubicacion)
16. Implementar GET /api/empresas/publicas/{uuid}
17. Implementar GET /api/empresas/publicas/{uuid}/capacidades

### Fase 4: Solicitudes de Alquiler
18. Implementar POST /api/solicitudes (cliente crea solicitud)
19. Implementar GET /api/solicitudes (mis solicitudes)
20. Implementar GET /api/solicitudes/{uuid}
21. Implementar PUT /api/solicitudes/{uuid}/cancelar
22. Implementar PUT /api/solicitudes/{uuid}/aceptar (empresa)
23. Implementar PUT /api/solicitudes/{uuid}/asignar (empresa asigna lavadora+repartidor)

### Fase 5: Servicio Activo
24. Implementar GET /api/cliente/servicio-activo
25. Adaptar WebSocket para que el cliente pueda conectarse
26. Implementar POST /api/cliente/servicio-activo/finalizar

### Fase 6: Post-Servicio
27. Implementar POST /api/cliente/reportes (reportar problema)
28. Implementar GET /api/cliente/facturas
29. Implementar POST /api/cliente/calificaciones

### Fase 7: Complementos
30. Implementar favoritos (GET/POST/DELETE)
31. Implementar FAQ (GET /api/faq)
32. Implementar configuracion de app (GET /api/config/app)
33. Implementar contenido legal (GET /api/content/tyc, /politica)

### Fase 8: Infraestructura
34. Instalar y configurar Alembic
35. Crear migraciones iniciales
36. Crear Dockerfile
37. Crear docker-compose.yml (app + MySQL)
38. Agregar indices en columnas de busqueda frecuente

### Fase 9: Calidad
39. Implementar tests unitarios (minimo 60% cobertura)
40. Implementar tests de integracion
41. Implementar custom exception classes
42. Implementar global exception handler
43. Implementar custom validators (email, NIT, password, phone)
44. Implementar logging estructurado

### Fase 10: Features Avanzadas
45. Implementar subida de archivos (UploadFile)
46. Implementar generacion de PDF (facturas)
47. Implementar notificaciones push (FCM)
48. Implementar WebSocket de tracking de repartidor
49. Implementar WebSocket de notificaciones en tiempo real
50. Implementar BackgroundTasks para procesos pesados

---

## 33. INFORME FINAL

### Resumen Ejecutivo

El backend de Servilavadora S.A.S. es una plataforma funcional para el panel de administracion web, construida con **FastAPI + SQLAlchemy 2.0 (async) + MySQL 9.3**. Actualmente opera con **67 endpoints HTTP + 1 WebSocket**, **47 modelos de BD**, y una base de datos con **~918 registros** de prueba.

### Fortalezas

1. **Arquitectura async completa** - Todo el stack es asincrono (FastAPI + SQLAlchemy + aiomysql)
2. **JWT con refresh tokens** - Implementacion solida de autenticacion con revocacion
3. **Multi-tenant por empresa** - Aislamiento de datos por empresa
4. **Soft deletes** - Ningun registro se elimina fisicamente
5. **Respuestas estandarizadas** - `ApiResponse` y `PaginatedResponse` consistentes
6. **Seed completo** - Base de datos de prueba con ~918 registros
7. **WebSocket funcional** - Timer en tiempo real para alquileres

### Debilidades

1. **Sin capa de servicios/repositories** - Logica en routers
2. **Sin tests** - 0% de cobertura
3. **Sin Docker** - No containerizado
4. **Sin Alembic** - Migraciones manuales via SQL
5. **Sin validaciones custom** - Solo tipos Pydantic
6. **Sin rate limiting** - Vulnerable a abuso
7. **Secret key hardcodeada** - Riesgo de seguridad
8. **CORS abierto** - Permite cualquier origen
9. **44 endpoints sin usar por la Web** - Sin consumo mobile
10. **20 modulos pendientes** para la app movil

### Numeros Clave

| Metrica | Valor |
|---------|-------|
| Modelos SQLAlchemy | 47 |
| Tablas MySQL | 47 |
| Routers | 18 |
| Endpoints HTTP | 67 |
| Endpoints WebSocket | 1 |
| Schemas Pydantic | 35 |
| Lineas de codigo Python | ~5,200+ |
| Endpoints consumidos por Web | 23 |
| Endpoints sin uso web | 44 |
| Modulos completados | 12 |
| Modulos parciales | 6 |
| Modulos pendientes | 20 |
| Cobertura de tests | 0% |

### Conclusion

El backend tiene una base solida para la administracion web pero requiere **desarrollo significativo** para soportar la app movil. El roadmap priorizado de 50 tareas cubre desde seguridad critica hasta features avanzadas. Las fases 1-6 (autenticacion mobile, perfil, empresas, solicitudes, servicio activo, post-servicio) son bloqueantes para el inicio de la integracion.

---

**FIN DEL INFORME**
