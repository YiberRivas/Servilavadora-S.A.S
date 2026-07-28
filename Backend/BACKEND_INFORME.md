# Informe del Backend - Servilavadora S.A.S.

**Fecha:** 25/07/2026
**Stack:** FastAPI + SQLAlchemy 2.0 (async) + MySQL 9.3.0 + aiomysql
**Estado:** Funcional, corriendo en `127.0.0.1:8000`

---

## 1. Arquitectura General

```
Backend/
├── run.py                    ← Uvicorn entry point
├── requirements.txt          ← Dependencias Python
├── .env                      ← Variables de entorno
├── Database.sql              ← Schema MySQL (2196 lineas)
├── seed_completo.py          ← Seed completo (918 registros)
└── app/
    ├── main.py               ← FastAPI app factory (66 lineas)
    ├── config.py             ← Pydantic settings (22 lineas)
    ├── database.py           ← Async SQLAlchemy engine (35 lineas)
    ├── dependencies.py       ← Auth + Role dependencies (62 lineas)
    ├── models/base.py        ← 47 modelos SQLAlchemy (1078 lineas)
    ├── schemas/              ← 5 archivos Pydantic v2
    ├── routers/              ← 18 routers (~65 endpoints HTTP)
    ├── security/             ← JWT + bcrypt (39 lineas)
    ├── utils/                ← UUID + logging
    └── websockets/           ← Cronometro en tiempo real (118 lineas)
```

---

## 2. Modelos de Base de Datos

**47 clases SQLAlchemy** mapeando **47 tablas MySQL**. Todos los IDs son `BigInteger` auto-increment internamente y `UUID` string externamente. Soft deletes en todas las tablas principales (`estado=0`).

### Jerarquia Geografica (5 tablas)
- `pais` → `departamento` → `municipio` → `barrio` → `direccion`

### Identidad y Acceso (9 tablas)
- `tipo_documento`, `genero`, `persona`, `rol`, `permiso`, `rol_permiso`
- `estado_usuario`, `usuario`, `sesion`, `refresh_token`

### Entidades del Negocio (10 tablas)
- `estado_empresa`, `archivo`, `empresa`, `empresa_archivo`
- `configuracion_empresa`, `configuracion_global`
- `sucursal`, `empleado_empresa`, `repartidor`

### Lavadoras (9 tablas)
- `capacidad_lavadora`, `marca_lavadora`, `modelo_lavadora`, `estado_lavadora`
- `lavadora`, `fotografia_lavadora`, `mantenimiento_lavadora`
- `historial_lavadora`, `movimiento_lavadora`

### Flujo de Alquiler (11 tablas)
- `estado_solicitud`, `solicitud_alquiler`, `asignacion_solicitud`
- `cliente_empresa`, `estado_alquiler`, `alquiler`
- `cronometro_alquiler`, `historial_alquiler`
- `evidencia_entrega`, `devolucion_lavadora`, `evidencia_devolucion`
- `cola_espera`

### Facturacion y Pagos (5 tablas)
- `metodo_pago`, `estado_pago`, `liquidacion_alquiler`
- `pago_cliente`, `estado_factura`, `factura`

### Suscripciones y Tarifas (3 tablas)
- `plan`, `suscripcion`, `tarifa_empresa`

### Rutas y Tracking (2 tablas)
- `ruta`, `historial_ruta`

### Notificaciones, Auditoria, Soporte (5 tablas)
- `notificacion`, `auditoria`, `pago_empresa`
- `soporte_ticket`, `soporte_respuesta`

---

## 3. Endpoints HTTP (~65 endpoints)

### Auth (`/api/auth`) - 5 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/login` | Login con username + password |
| POST | `/refresh` | Renovar access token |
| POST | `/logout` | Revocar refresh tokens |
| GET | `/me` | Obtener usuario actual |
| POST | `/change-password` | Cambiar contrasena |

### Usuarios (`/api/usuarios`) - 6 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar usuarios (paginado) |
| GET | `/{uuid}` | Obtener usuario |
| POST | `/` | Crear usuario |
| PUT | `/{uuid}` | Actualizar usuario |
| DELETE | `/{uuid}` | Eliminar usuario (soft delete) |
| GET | `/roles/all` | Listar roles |

### Empresas (`/api/empresas`) - 11 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar empresas |
| GET | `/pendientes` | Empresas pendientes de aprobacion |
| GET | `/{uuid}` | Obtener empresa |
| POST | `/` | Crear empresa |
| PUT | `/{uuid}` | Actualizar empresa |
| PUT | `/{uuid}/aprobar` | Aprobar empresa |
| PUT | `/{uuid}/rechazar` | Rechazar empresa |
| DELETE | `/{uuid}` | Eliminar empresa |
| GET | `/{uuid}/sucursales` | Listar sucursales |
| GET | `/planes/all` | Listar planes |
| GET | `/pagos/all` | Listar pagos de empresa |

### Lavadoras (`/api/lavadoras`) - 4 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar lavadoras |
| GET | `/estados/all` | Listar estados |
| GET | `/marcas/all` | Listar marcas |
| GET | `/capacidades/all` | Listar capacidades |

### Alquileres (`/api/alquileres`) - 4 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar alquileres |
| GET | `/solicitudes` | Listar solicitudes |
| GET | `/estados/all` | Estados de alquiler |
| GET | `/estados-solicitud/all` | Estados de solicitud |

### Dashboard (`/api/dashboard`) - 1 endpoint
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Estadisticas agregadas |

### Clientes (`/api/clientes`) - 5 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar clientes |
| GET | `/{uuid}` | Obtener cliente |
| POST | `/` | Crear cliente |
| PUT | `/{uuid}` | Actualizar cliente |
| DELETE | `/{uuid}` | Eliminar cliente |

### Repartidores (`/api/repartidores`) - 5 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar repartidores |
| GET | `/{uuid}` | Obtener repartidor |
| POST | `/` | Crear repartidor |
| PUT | `/{uuid}` | Actualizar repartidor |
| DELETE | `/{uuid}` | Eliminar repartidor |

### Rutas (`/api/rutas`) - 4 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar rutas |
| POST | `/` | Crear ruta |
| PUT | `/{uuid}` | Actualizar ruta |
| DELETE | `/{uuid}` | Eliminar ruta |

### Notificaciones (`/api/notificaciones`) - 4 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar notificaciones |
| GET | `/no-leidas/count` | Contar no leidas |
| PUT | `/{uuid}/leer` | Marcar como leida |
| PUT | `/leer-todas` | Marcar todas leidas |

### Tickets (`/api/tickets`) - 5 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar tickets |
| GET | `/{uuid}` | Obtener ticket |
| POST | `/` | Crear ticket |
| PUT | `/{uuid}` | Actualizar ticket |
| POST | `/{uuid}/respuestas` | Crear respuesta |

### Archivos (`/api/archivos`) - 3 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar archivos |
| POST | `/` | Subir archivo |
| DELETE | `/{uuid}` | Eliminar archivo |

### Mantenimientos (`/api/mantenimientos`) - 3 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar mantenimientos |
| POST | `/` | Crear mantenimiento |
| DELETE | `/{uuid}` | Eliminar mantenimiento |

### Cola de Espera (`/api/cola-espera`) - 4 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar cola |
| POST | `/` | Agregar a cola |
| PUT | `/{uuid}/atender` | Atender item |
| DELETE | `/{uuid}` | Eliminar de cola |

### Tarifas (`/api/tarifas`) - 4 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar tarifas |
| POST | `/` | Crear tarifa |
| PUT | `/{uuid}` | Actualizar tarifa |
| DELETE | `/{uuid}` | Eliminar tarifa |

### Suscripciones (`/api/suscripciones`) - 6 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/` | Listar suscripciones |
| POST | `/` | Crear suscripcion |
| PUT | `/{uuid}` | Actualizar suscripcion |
| GET | `/metodos-pago/all` | Metodos de pago |
| GET | `/estados-pago/all` | Estados de pago |
| POST | `/pagos` | Crear pago de empresa |

### Historial (`/api/historial`) - 3 endpoints
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/alquileres/{uuid}` | Historial de alquiler |
| GET | `/lavadoras/{uuid}` | Historial de lavadora |
| GET | `/auditoria` | Log de auditoria |

---

## 4. Autenticacion y Autorizacion

### Flujo de Login
1. Usuario envia `username` + `password`
2. Se valida con `bcrypt`
3. Se verifica que este activo y no bloqueado (< 5 intentos fallidos)
4. Se genera `access_token` (30 min) + `refresh_token` (7 dias)
5. Se guarda session y refresh token en BD
6. Se retorna token + info del usuario

### JWT
- **Biblioteca:** `python-jose` con HS256
- **Secret:** `"servilavadora-super-secret-key-change-in-production-2026"`
- **Access token:** 30 minutos
- **Refresh token:** 7 dias

### Roles (4)
| Codigo | Nivel | Acceso |
|--------|-------|--------|
| `SUPER_ADMIN` | 1 | Todo el sistema |
| `ADMIN_EMPRESA` | 2 | Gestion de su empresa |
| `REPARTIDOR` | 3 | Entregas asignadas |
| `CLIENTE` | 4 | Solicitudes propias |

### Patron de Autorizacion
```python
# En los routers:
Depends(require_role(RoleCode.SUPER_ADMIN))
Depends(require_role(RoleCode.SUPER_ADMIN, RoleCode.ADMIN_EMPRESA))
```

---

## 5. WebSocket - Cronometro en Tiempo Real

**Endpoint:** `ws://host/ws/cronometro/{alquiler_uuid}?token=...`

**Funcionamiento:**
1. Valida JWT del query parameter
2. Busca el alquiler por UUID
3. Cada 10 segundos:
   - Calcula tiempo transcurrido desde `fecha_inicio`
   - Busca tarifa de la empresa (`valor_minuto`)
   - Actualiza `minutos_transcurridos` y `valor_acumulado` en BD
   - Envia JSON con: `alquiler_uuid`, `minutos_transcurridos`, `valor_acumulado`, `valor_minuto`, `activo`

**Caso de uso:** Timer de facturacion en tiempo real para alquileres activos.

---

## 6. Configuracion de Base de Datos

| Parametro | Valor |
|-----------|-------|
| Motor | MySQL 9.3.0 |
| Driver | aiomysql 0.2.0 |
| URL | `mysql+aiomysql://root:123456@localhost:3306/servilavadora_sas` |
| Pool size | 10 |
| Max overflow | 20 |
| Pool recycle | 3600s (1 hora) |
| Session | `async_sessionmaker` con `expire_on_commit=False` |

---

## 7. Dependencias Principales

| Paquete | Version | Uso |
|---------|---------|-----|
| fastapi | 0.115.12 | Framework web async |
| sqlalchemy | 2.0.41 | ORM async |
| aiomysql | 0.2.0 | Driver MySQL async |
| pydantic | 2.11.3 | Validacion de schemas |
| pydantic-settings | 2.9.1 | Configuracion .env |
| python-jose | 3.4.0 | JWT |
| passlib | 1.7.4 | bcrypt passwords |
| uvicorn | 0.34.3 | ASGI server |
| python-multipart | 0.0.20 | File uploads |
| websockets | 15.0.1 | WebSocket support |

---

## 8. Problemas Detectados

### 8.1 Codigo Monolitico
- **`models/base.py`** tiene 1078 lineas con 47 modelos en un solo archivo
- **`routers/empresas.py`** tiene 411 lineas con 11 endpoints

### 8.2 Sin Capa de Servicios
- Los directorios `services/` y `repositories/` existen pero estan vacios
- Toda la logica de negocio esta en los routers

### 8.3 Sin Tests
- No hay directorio `tests/`
- No hay `pytest` en dependencias
- No hay tests unitarios ni de integracion

### 8.4 Seguridad
- CORS abierto (`allow_origins=["*"]`)
- Secret key hardcodeada en `security/jwt.py`
- Password de MySQL en `.env` pero tambien en `database.py`

### 8.5 Archivos Grandes
- `seed_completo.py` tiene 691 lineas
- `Database.sql` tiene 2196 lineas
- `schemas/modulos.py` tiene 299 lineas

### 8.6 Codigo Duplicado
- `seed_full.py` parece duplicado de `seed_completo.py`
- Multiples scripts de fix (`fix_users.py`, `check_schema.py`)

---

## 9. Resumen Ejecutivo

| Aspecto | Estado |
|---------|--------|
| **Endpoints HTTP** | ~65 |
| **Endpoints WebSocket** | 1 (cronometro) |
| **Modelos SQLAlchemy** | 47 |
| **Tablas MySQL** | 47 |
| **Routers** | 18 |
| **Roles** | 4 (SUPER_ADMIN, ADMIN_EMPRESA, REPARTIDOR, CLIENTE) |
| **Auth** | JWT (access 30min + refresh 7d) + bcrypt |
| **Arquitectura** | Flat (logica en routers, sin services/repositories) |
| **Tests** | Ninguno |
| **Documentacion** | Auto-generada por FastAPI (`/docs`) |
