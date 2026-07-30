# INFORME TECNICO - PROYECTO SERVILAVADORA S.A.S.

> Plataforma de alquiler de lavadoras a domicilio
> Fecha de corte: Julio 29, 2026
> Proposito: Documentar el estado actual del proyecto para continuar el desarrollo con una IA asistente

---

## 1. RESUMEN EJECUTIVO

Servilavadora S.A.S. es una plataforma mobile que conecta clientes que necesitan alquilar lavadoras con empresas que prestan este servicio. El proyecto consta de un backend API (FastAPI) y un frontend mobile (React Native/Expo). La plataforma maneja el ciclo completo: solicitud de servicio, asignacion de lavadora y repartidor, navegacion GPS en tiempo real, cronometro de uso, facturacion y pagos.

**Estado actual:** Fase 5.6 completada. Flujo de alquiler completo implementado (backend). Frontend conectado a API. Bugs criticos resueltos.

---

## 2. STACK TECNOLOGICO

### Backend
- **Lenguaje:** Python 3.14
- **Framework:** FastAPI 0.115.12
- **ORM:** SQLAlchemy 2.0.41 (async)
- **Driver DB:** aiomysql 0.2.0
- **Base de datos:** MySQL 9.3.0 (puerto 3306)
- **Auth:** JWT (python-jose HS256) + bcrypt (passlib)
- **WebSockets:** FastAPI WebSockets 15.0.1
- **Validacion:** Pydantic v2
- **Servidor:** uvicorn

### Frontend
- **Framework:** React Native 0.81.5 + Expo SDK 54
- **Routing:** Expo Router 6 (file-based)
- **UI:** React Native Paper 5 (Material Design 3)
- **HTTP:** Axios (con interceptors para token refresh)
- **State:** React Context (AuthContext)
- **Storage:** @react-native-async-storage/async-storage
- **Maps:** react-native-maps (MapView, Marker, Polyline)
- **Location:** expo-location (watchPositionAsync)

### Configuracion de red
- **Backend:** `http://<IP_LOCAL>:8000` (debe actualizarse al cambiar de red)
- **Frontend:** Configurado en `Frontend/app.json` (extra.apiBaseUrl) y `Frontend/src/config/env.js`
- **IMPORTANTE:** La IP hardcodeada debe cambiarse cuando se cambie de red WiFi/datos

### Credenciales de prueba
| Usuario | Contrasena | Rol |
|---------|-----------|-----|
| juan.perez@mail.co | 123456 | SUPER_ADMIN |
| pedro.lopez@mail.co | 123456 | ADMIN_EMPRESA |
| santiago.morales@mail.co | 123456 | CLIENTE |
| laura.hernandez@mail.co | 123456 | REPARTIDOR |
| diego.gonzalez@mail.co | 123456 | REPARTIDOR |

---

## 3. BASE DE DATOS

### Archivos SQL
- `Backend/Database.sql` - Schema completo (64 tablas, ~75KB limpio de comentarios)
- `Backend/migrations/012_notifications_system.sql` - Tablas notificacion + device_token
- `Backend/migrations/013_gps_routing.sql` - Tablas ruta_gps + ubicacion_ruta

### Modelos SQLAlchemy (64 modelos)
Definidos en `Backend/app/models/base.py`. Todos usan BigInteger PK, UUID unico, y timestamps created_at/updated_at.

#### Geografia (5 modelos)
Pais, Departamento, Municipio, Barrio, Direccion

#### Identidad (3 modelos)
TipoDocumento, Genero, Persona

#### Autenticacion/RBAC (7 modelos)
Rol, Permiso, RolPermiso, EstadoUsuario, Usuario, Sesion, RefreshToken

#### Empresas (9 modelos)
EstadoEmpresa, Archivo, Empresa, EmpresaArchivo, ConfiguracionEmpresa, ConfiguracionGlobal, Sucursal, EmpleadoEmpresa, Repartidor

#### Lavadoras (9 modelos)
CapacidadLavadora, MarcaLavadora, ModeloLavadora, EstadoLavadora, Lavadora, FotografiaLavadora, MantenimientoLavadora, HistorialLavadora, MovimientoLavadora

#### Alquileres (12 modelos)
EstadoSolicitud, SolicitudAlquiler, AsignacionSolicitud, ClienteEmpresa, EstadoAlquiler, Alquiler, CronometroAlquiler, HistorialAlquiler, EvidenciaEntrega, DevolucionLavadora, EvidenciaDevolucion, ColaEspera

#### Pagos/Facturacion (7 modelos)
MetodoPago, EstadoPago, LiquidacionAlquiler, PagoCliente, EstadoFactura, Factura, PagoEmpresa

#### Suscripciones (2 modelos)
Plan, Suscripcion

#### Tarifas (1 modelo)
TarifaEmpresa

#### Rutas/GPS (4 modelos)
Ruta, HistorialRuta, RutaGPS, UbicacionRuta

#### Notificaciones (2 modelos)
Notificacion, DeviceToken

#### Auditoria/Soporte (3 modelos)
Auditoria, SoporteTicket, SoporteRespuesta

### Estados del Alquiler (codigos en BD)
| Codigo | Nombre |
|--------|--------|
| PENDIENTE | Pendiente |
| CAMINO | En Camino |
| ACTIVO | Activo |
| FINALIZACION | Solicitud Finalizacion |
| FINALIZADO | Finalizado |
| CANCELADO | Cancelado |

### Estados de la Solicitud
PENDIENTE, ACEPTADA, RECHAZADA, EN_CURSO, COMPLETADA

---

## 4. BACKEND - ENDPOINTS (115 total)

### Autenticacion (7 endpoints)
- POST `/auth/login` - Login
- POST `/auth/register` - Registro
- POST `/auth/refresh` - Refrescar token
- POST `/auth/logout` - Cerrar sesion
- GET `/auth/me` - Usuario actual
- GET `/auth/profile` - Perfil completo
- POST `/auth/change-password` - Cambiar contrasena

### Usuarios (6 endpoints)
- CRUD completo + listar roles

### Clientes (5 endpoints)
- CRUD de asociaciones cliente-empresa

### Empresas (11 endpoints)
- CRUD + aprobar/rechazar + sucursales + planes + pagos

### Lavadoras (4 endpoints)
- Listar + estados + marcas + capacidades

### Alquileres (13 endpoints)
- CRUD + mis-servicios + mis-historial + cronometro
- POST `/solicitudes/{uuid}/aceptar` - Aceptar solicitud (crea Alquiler + RutaGPS)
- POST `/solicitudes/{uuid}/rechazar` - Rechazar solicitud
- POST `/{uuid}/solicitar-finalizacion` - Cliente solicita devolucion
- POST `/{uuid}/programar-recogida` - Empresa programa recogida

### Rutas GPS (12 endpoints)
- CRUD de rutas admin
- GET `/mia` - Ruta actual del usuario
- GET `/{uuid}` - Detalle de ruta
- GET `/{uuid}/historial` - Historial de ubicaciones
- POST `/{uuid}/iniciar` - Iniciar ruta (PENDIENTE -> EN_CURSO, Alquiler -> CAMINO)
- POST `/{uuid}/entregar` - Entregar lavadora (Alquiler -> ACTIVO)
- POST `/{uuid}/finalizar` - Finalizar ruta (EN_CURSO -> FINALIZADA)
- PUT `/{uuid}/ubicacion` - Actualizar ubicacion GPS
- POST `/{uuid}/recoger-lavadora` - Recoger lavadora y finalizar servicio

### Repartidor (3 endpoints - app del repartidor)
- GET `/repartidor/dashboard` - Estadisticas del repartidor
- GET `/repartidor/asignaciones` - Asignaciones actuales
- GET `/repartidor/historial` - Historial de entregas

### Pagos (6 endpoints)
- CRUD + confirmar + cancelar

### Suscripciones (6 endpoints)
- CRUD + metodos de pago + estados + pagos

### Notificaciones (8 endpoints)
- CRUD + no-leidas/count + leer-todas + device tokens

### Tickets (5 endpoints)
- CRUD + respuestas

### Otros
- Historial (3), Mantenimientos (3), Cola Espera (4), Tarifas (4), Archivos (3), Configuraciones (2), Dashboard (1), Public (2)

### WebSockets (2)
- `/ws/rutas/{uuid}` - Tracking GPS en tiempo real (5 segundos)
- `/ws/cronometro/{uuid}` - Cronometro en tiempo real (10 segundos)

---

## 5. FRONTEND - PANTALLAS

### Autenticacion (5 pantallas)
- Onboarding (3 slides)
- Login
- Registro
- Olvide contrasena

### Cliente - Tabs (8 pantallas)
- Inicio (dashboard con categorias y empresas)
- Mis Servicios (lista de servicios activos con filtros)
- Empresas (directorio de empresas)
- Historial (servicios completados)
- Perfil (info, stats, FAQ)
- Alertas (notificaciones)

### Repartidor - Tabs (4 pantallas)
- Inicio (dashboard con estadisticas)
- Mis Entregas (asignaciones actuales)
- Historial (entregas completadas)
- Perfil

### Modales (12 pantallas)
- Detalle de empresa
- Solicitar servicio
- Servicio activo (timeline + cronometro)
- Reportar problema
- Metodos de pago
- Historial de pagos
- Detalle de pago
- Suscripciones
- Checkout
- Navegacion del repartidor
- Tracking de ruta (cliente)
- Historial de ruta

### Servicios Frontend (10 archivos)
- auth.service, companies.service, profile.service, services.service, request.service, payment.service, history.service, notification.service, routes.service, repartidor.service

---

## 6. FLUJO COMPLETO DEL ALQUILER

```
1. CLIENTE crea solicitud
   POST /alquileres/solicitudes
   -> SolicitudAlquiler (PENDIENTE)
   -> Notificacion a empresa

2. EMPRESA acepta solicitud
   POST /alquileres/solicitudes/{uuid}/aceptar
   -> SolicitudAlquiler (ACEPTADA)
   -> Alquiler (PENDIENTE)
   -> RutaGPS (PENDIENTE)
   -> Lavadora marcada no disponible
   -> Repartidor marcado no disponible
   -> Notificacion a cliente

3. REPARTIDOR inicia ruta
   POST /rutas/{uuid}/iniciar
   -> RutaGPS (EN_CURSO)
   -> Alquiler (CAMINO)
   -> GPS tracking activo
   -> Notificacion a cliente

4. REPARTIDOR entrega lavadora
   POST /rutas/{uuid}/entregar
   -> Alquiler (ACTIVO)
   -> Cronometro inicia
   -> Notificacion a cliente

5. CLIENTE solicita devolucion
   POST /alquileres/{uuid}/solicitar-finalizacion
   -> Alquiler (FINALIZACION)
   -> Notificacion a empresa

6. EMPRESA programa recogida
   POST /alquileres/{uuid}/programar-recogida
   -> RutaGPS (PENDIENTE) reutilizada o nueva
   -> Repartidor asignado
   -> Notificacion a cliente

7. REPARTIDOR inicia ruta de recogida
   POST /rutas/{uuid}/iniciar
   -> RutaGPS (EN_CURSO)
   -> GPS tracking activo

8. REPARTIDOR recoge lavadora
   POST /rutas/{uuid}/recoger-lavadora
   -> Alquiler (FINALIZADO)
   -> RutaGPS (FINALIZADA)
   -> Lavadora liberada (disponible=1)
   -> Repartidor liberado (disponible=1)
   -> Cronometro detenido
   -> Tarifa calculada (valor_total)
   -> Notificacion a cliente
```

---

## 7. ARCHIVOS CLAVE DEL PROYECTO

### Backend
```
Backend/
  app/
    main.py                    - FastAPI app, routers, middleware CORS
    database.py                - Engine async, session factory
    config.py                  - Settings via pydantic-settings
    security/jwt.py            - Token generation/decode
    dependencies.py            - get_current_user, require_role
    models/base.py             - 64 modelos SQLAlchemy
    schemas/common.py          - ApiResponse, PaginatedResponse
    schemas/modulos.py         - Schemas Pydantic
    routers/
      auth.py                  - Autenticacion
      usuarios.py              - CRUD usuarios
      empresas.py              - CRUD empresas
      lavadoras.py             - CRUD lavadoras
      alquileres.py            - Alquileres + solicitudes + flujo completo
      rutas.py                 - Rutas GPS + flujo del repartidor
      repartidor.py            - Dashboard del repartidor
      pagos.py                 - Pagos
      suscripciones.py         - Suscripciones
      notificaciones.py        - Notificaciones
      tickets.py               - Tickets soporte
      historial.py             - Auditoria
      tarifas.py               - Tarifas
      clientes.py              - Clientes
      archivos.py              - Archivos
      configuraciones.py       - Config global
      cola_espera.py           - Cola de espera
      mantenimientos.py        - Mantenimientos lavadoras
      dashboard.py             - Dashboard admin
      public.py                - Datos publicos (sin auth)
    utils/
      uuid.py                  - Generador UUID
      logging.py               - Logger configurado
      push_notifications.py    - Push notifications (expo)
    websockets/
      cronometro.py            - WS cronometro en tiempo real
      rutas.py                 - WS tracking GPS
  migrations/
    012_notifications_system.sql
    013_gps_routing.sql
  Database.sql                 - Schema completo limpio
```

### Frontend
```
Frontend/
  app/
    _layout.jsx                - Root layout (PaperProvider + AuthProvider)
    index.jsx                  - Splash screen
    (auth)/
      login.jsx                - Login
      register.jsx             - Registro
      onboarding.jsx           - Onboarding
      forgot-password.jsx      - Recuperar contrasena
    (app)/                     - Tabs del cliente
      index.jsx                - Inicio
      my-services.jsx          - Mis servicios
      companies.jsx            - Empresas
      history.jsx              - Historial
      profile.jsx              - Perfil
      notifications.jsx        - Notificaciones
    (driver)/                  - Tabs del repartidor
      _layout.jsx              - 4 tabs
      index.jsx                - Dashboard repartidor
      assignments.jsx          - Mis entregas
      history.jsx              - Historial
      profile.jsx              - Perfil
    (modals)/                  - 12 modales
      driver-navigation.jsx    - Navegacion GPS repartidor
      route-tracking.jsx       - Tracking cliente
      company-detail.jsx       - Detalle empresa
      request-service.jsx      - Solicitar servicio
      active-service.jsx       - Servicio activo
      ... (7 modales mas)
  src/
    api/client.js              - Axios con interceptors
    api/endpoints.js           - ~100 endpoints
    context/AuthContext.jsx     - Estado de autenticacion
    services/                  - 10 servicios API
    constants/                 - Configs, filtros, mock data
    theme/index.js             - Design system
    storage/index.js           - AsyncStorage wrapper
    config/env.js              - URL del backend
```

---

## 8. FASES COMPLETADAS

### Fase 1 - Frontend Basico (Pantallas con mock data)
- 28 pantallas implementadas
- Onboarding, login, registro
- Tabs cliente, tabs repartidor
- 12 modales
- Design system completo

### Fase 2 - Backend + Conexion
- API completa (115 endpoints)
- JWT auth con refresh tokens
- WebSocket cronometro y GPS
- CRUD completo de todos los modulos
- Conectado frontend a backend

### Fase 3 - Auditoria y Optimizacion
- Auditoria general del codigo
- 3 bugs criticos corregidos
- Imports muertos eliminados
- React.memo implementado
- Animaciones optimizadas

### Fase 4 - Notificaciones y Pagos
- Sistema de notificaciones in-app
- Push notifications (expo-notifications -> stub)
- Device tokens
- Sistema de pagos (6 endpoints)
- Sistema de suscripciones (6 endpoints)
- GPS routing en tiempo real

### Fase 5 - Modulo Repartidor y Flujo de Alquiler
- Fase 5.1: Aceptar/Rechazar solicitud (endpoint + asignacion automatica)
- Fase 5.2: Inicio de ruta (cambia alquiler a CAMINO)
- Fase 5.3: Entrega de lavadora (cambia alquiler a ACTIVO)
- Fase 5.3.1: Actualizar driver-navigation (botones condicionales por estado)
- Fase 5.4: Solicitar finalizacion (cliente pide devolucion)
- Fase 5.5: Programar recogida (empresa asigna repartidor)
- Fase 5.6: Recoger lavadora (finaliza servicio, libera recursos, calcula tarifa)

### Bugs corregidos en sesion actual
- Dashboard repartidor 500 (ApiResponse sin message + subqueries anidadas + func.SECOND)
- Mis Entregas 500 (ApiResponse sin message)
- Historial repartidor 500 (ApiResponse sin message + subquery anidada)
- Mi Ruta cliente 500 (MultipleResultsFound en ClienteEmpresa)
- Missing text import en rutas.py
- Backend sin importar TarifaEmpresa

---

## 9. LO QUE FALTA POR HACER

### Backend - Pendiente
1. **Liquidacion automatica** - Crear LiquidacionAlquiler al finalizar alquiler (el modelo existe pero nadie lo crea)
2. **Facturacion** - Generar Factura desde LiquidacionAlquiler
3. **Evidencia de entrega** - Upload de fotos al entregar/recoger lavadora
4. **Devolucion formal** - Crear registro en DevolucionLavadora al recoger
5. **Historial de alquileres** - Crear registros en HistorialAlquiler en cada cambio de estado
6. **Dashboard empresa** - Endpoint con estadisticas para ADMIN_EMPRESA
7. **Filtros avanzados** - Busqueda por fecha, estado, monto en listados
8. **Reportes** - Exportar datos, reportes financieros
9. **Gestion de lavadoras** - CRUD completo (crear, editar, eliminar lavadoras)
10. **Gestion de sucursales** - CRUD completo
11. **Gestion de empleados** - CRUD completo
12. **Cola de espera** - Logica de notificacion cuando hay disponibilidad
13. **Mantenimientos** - Programacion y seguimiento
14. **Multi-empresa** - Verificar aislamiento de datos en todos los endpoints
15. **Rate limiting** - Proteccion contra abuso
16. **Auditoria real** - Registrar acciones en tabla auditoria
17. **Tests** - Unit tests y integration tests

### Frontend - Pendiente
1. ** Pantalla de empresa admin** - Panel de control para ADMIN_EMPRESA
2. ** CRUD de lavadoras** - Gestionar lavadoras desde el admin
3. ** Gestion de repartidores** - Asignar y gestionar repartidores
4. ** Checkout real** - Pago integrado (Nequi, Daviplata, etc.)
5. ** Mapa interactivo** - Ver lavadoras disponibles en mapa
6. ** Calificaciones** - Sistema de rating post-servicio
7. ** Chat cliente-repartidor** - Comunicacion en tiempo real
8. ** Modo oscuro** - Theme dark
9. ** Internacionalizacion** - Multi-idioma
10. ** Offline mode** - Funcionalidad sin conexion
11. ** Push notifications reales** - Migrar de stub a expo-notifications real
12. ** Camara** - Evidencia fotografica de entrega/devolucion
13. ** Notificaciones avanzadas** - Filtros, preferencias, silenciar
14. ** Onboarding personalizado** - Por rol (cliente, repartidor, admin)

### Infraestructura
1. **Despliegue** - Docker, CI/CD
2. **Produccion** - Variables de entorno seguras, HTTPS
3. **Monitoreo** - Logs centralizados, alertas
4. **Backup** - Estrategia de respaldos
5. **Documentacion API** - OpenAPI/Swagger actualizado
6. **Migraciones** - Flyway o Alembic para gestionar cambios de schema

---

## 10. CONVENCIONES DE CODIGO

### Backend
- Responses: `ApiResponse(success, message, data)` - SIEMPRE incluir `message`
- Auth: `Depends(get_current_user)` o `Depends(require_role("ROL"))`
- Soft deletes: `estado = 0` (nunca borrar registros)
- UUIDs: `generate_uuid()` para nuevos registros
- Timestamps: `datetime.now(timezone.utc)` para fechas
- Async: todas las queries usan `await db.execute()`

### Frontend
- Services: Archivos en `src/services/` con metodos que llaman a `apiClient`
- Screens: Componentes funcionales con hooks
- Navigation: Expo Router file-based (`router.push`, `router.replace`)
- Theme: Usar tokens de `src/theme/index.js` (colors, radii, shadows)
- State: React Context para auth, useState para local

---

## 10. COMO CONTINUAR EL DESARROLLO

Para la siguiente IA que continue este proyecto:

1. **Leer este informe completo** antes de hacer cualquier cambio
2. **Verificar la IP del backend** - Cambiar en `Frontend/app.json` y `Frontend/src/config/env.js`
3. **Iniciar el backend:** `cd Backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
4. **Iniciar el frontend:** `cd Frontend && npx expo start`
5. **Credenciales de prueba:** Ver seccion 2 de este informe
6. **Endpoints registrados:** Verificar con `http://localhost:8000/docs` (Swagger)
7. **Base de datos:** Verificar estado con `Database.sql` y migraciones en `Backend/migrations/`
8. **No modificar modelos** sin crear migracion primero
9. **No borrar registros** - Solo soft deletes (estado=0)
10. **Siempre retornar ApiResponse con message** - Pydantic lo requiere

### Orden logico para continuar
1. Completar gestion de lavadoras (CRUD admin)
2. Completar gestion de sucursales y empleados
3. Implementar LiquidacionAlquiler automatica
4. Implementar Factura desde Liquidacion
5. Crear DevolucionLavadora al recoger
6. Dashboard de empresa (ADMIN_EMPRESA)
7. Checkout de pago real
8. Evidencia fotografica (camara)
9. Tests unitarios
10. Despliegue Docker
