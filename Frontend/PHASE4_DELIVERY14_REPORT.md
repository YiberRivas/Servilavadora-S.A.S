# FASE 4 - ENTREGA 14: SISTEMA COMPLETO DE RUTAS EN TIEMPO REAL (GPS + MAPAS)

**Fecha:** 2026-07-27
**Estado:** COMPLETADA
**Entregable:** Sistema completo de GPS tracking entre cliente y repartidor

---

## 1. RESUMEN EJECUTIVO

Se implementa el sistema de rutas GPS en tiempo real para el seguimiento entre cliente y repartidor. Incluye modelo de base de datos, endpoints REST, WebSocket en tiempo real, 3 pantallas frontend con Google Maps, integracion con Expo Location, y notificaciones automaticas.

### Backend

**Nuevos modelos** (`Backend/app/models/base.py`):
- `RutaGPS` (tabla `ruta_gps`) — Relacion 1:1 con alquiler. Almacena estado, coordenadas actuales/destino/cliente, velocidad, heading, precision, distancia restante, tiempo estimado.
- `UbicacionRuta` (tabla `ubicacion_ruta`) — Puntos GPS historicos (cada 5 segundos). Almacena latitud, longitud, precision, heading, velocidad, timestamp.

**Nuevos schemas** (`Backend/app/schemas/modulos.py`):
- `RutaGPSCreate` — Crear ruta GPS
- `RutaGPSUpdate` — Actualizar ubicacion
- `RutaGPSResponse` — Respuesta de ruta
- `UbicacionRutaResponse` — Respuesta de ubicacion

**Router ampliado** (`Backend/app/routers/rutas.py`):
- Endpoints existentes de CRUD admin se mantienen intactos
- Nuevos endpoints GPS:

| Endpoint | Metodo | Rol | Descripcion |
|----------|--------|-----|-------------|
| `/api/rutas/mia` | GET | CLIENTE, REPARTIDOR | Obtiene ruta activa del usuario |
| `/api/rutas/{uuid}` | GET | CLIENTE, REPARTIDOR | Detalle de ruta con validacion de acceso |
| `/api/rutas/{uuid}/historial` | GET | CLIENTE, REPARTIDOR | Historial completo de puntos GPS |
| `/api/rutas/{uuid}/iniciar` | POST | REPARTIDOR | Inicia ruta, cambia estado a EN_CURSO |
| `/api/rutas/{uuid}/finalizar` | POST | REPARTIDOR | Finaliza ruta, limpia distancia/tiempo |
| `/api/rutas/{uuid}/ubicacion` | PUT | REPARTIDOR | Actualiza ubicacion + recalcula distancia/tiempo |

**WebSocket** (`Backend/app/websockets/rutas.py`):
- `ws://host/ws/rutas/{uuid}?token=JWT` — Transmite en tiempo real cada 5 segundos:
  - latitud/longitud actual
  - velocidad, heading
  - distancia restante, tiempo estimado
  - estado de la ruta
  - nombre del repartidor
- Autenticacion JWT via query parameter
- Reconexion automatica en frontend
- Patron identico al WebSocket del cronometro

**Seguridad:**
- JWT validation en todos los endpoints y WebSocket
- Validacion de rol (REPARTIDOR, CLIENTE)
- Validacion de pertenencia (repartidor asignado, cliente propietario)
- Acceso denegado si no es propietario

**Integracion con notificaciones:**
- Repartidor inicia recorrido -> notificacion al cliente ("Repartidor en camino")
- Repartidor a menos de 500m -> notificacion al cliente ("Repartidor cerca")
- Repartidor finaliza ruta -> notificacion al cliente ("Servicio finalizado")

### Frontend

**Nuevo servicio** (`Frontend/src/services/routes.service.js`):
- `getMyRoute()` — Ruta activa del usuario
- `getRoute(uuid)` — Detalle de ruta
- `getHistory(uuid)` — Historial de recorrido
- `startRoute(uuid)` — Iniciar ruta
- `finishRoute(uuid)` — Finalizar ruta
- `updateLocation(uuid, data)` — Actualizar ubicacion
- `connect(uuid, onMessage, onError)` — WebSocket con auto-reconnect
- `disconnect()` — Cerrar conexion

**Endpoints actualizados** (`Frontend/src/api/endpoints.js`):
- `rutas.mia` — GET ruta activa
- `rutas.detail(uuid)` — GET detalle
- `rutas.historial(uuid)` — GET historial
- `rutas.iniciar(uuid)` — POST iniciar
- `rutas.finalizar(uuid)` — POST finalizar
- `rutas.ubicacion(uuid)` — PUT ubicacion
- `ws.ruta(uuid)` — WebSocket URL

**3 pantallas nuevas:**

| Pantalla | Ruta | Rol | Funcionalidad |
|----------|------|-----|---------------|
| `route-tracking.jsx` | `(modals)/route-tracking` | CLIENTE | Mapa con ubicacion repartidor + cliente, distancia, tiempo est., velocidad, estado en vivo via WebSocket |
| `driver-navigation.jsx` | `(modals)/driver-navigation` | REPARTIDOR | Mapa con destino, botones iniciar/finalizar, envio GPS cada 5s via watchPositionAsync |
| `route-history.jsx` | `(modals)/route-history` | AMBOS | Mapa con ruta recorrida, kilometros, tiempo total, vel. promedio, puntos GPS, fechas |

### Dependencias instaladas

- `react-native-maps` 1.20.1 — Google Maps en React Native
- `expo-location` ~19.0.8 — GPS y ubicacion en tiempo real

### Migracion SQL

`Backend/migrations/013_gps_routing.sql`:
- Tabla `ruta_gps` — 20 campos, indexes en alquiler, repartidor, estado
- Tabla `ubicacion_ruta` — 10 campos, indexes en ruta_gps y timestamp

---

## 2. ARCHIVOS CREADOS

| Archivo | Descripcion |
|---------|-------------|
| `Backend/migrations/013_gps_routing.sql` | Migracion SQL para tablas GPS |
| `Backend/app/websockets/rutas.py` | WebSocket de rutas en tiempo real |
| `Frontend/src/services/routes.service.js` | Service API + WebSocket para rutas |
| `Frontend/app/(modals)/route-tracking.jsx` | Pantalla cliente - seguimiento |
| `Frontend/app/(modals)/driver-navigation.jsx` | Pantalla repartidor - navegacion |
| `Frontend/app/(modals)/route-history.jsx` | Pantalla historial de recorrido |

## 3. ARCHIVOS MODIFICADOS

| Archivo | Cambio |
|---------|--------|
| `Backend/app/models/base.py` | +modelos RutaGPS, UbicacionRuta; +relationship en Alquiler |
| `Backend/app/schemas/modulos.py` | +schemas RutaGPSCreate, RutaGPSUpdate, RutaGPSResponse, UbicacionRutaResponse |
| `Backend/app/routers/rutas.py` | +6 endpoints GPS, +notificaciones, +haversine, +fix ApiResponse import |
| `Backend/app/main.py` | +import ws_rutas, +app.include_router(ws_rutas.router) |
| `Frontend/src/api/endpoints.js` | +6 endpoints rutas GPS, +ws.ruta |
| `Frontend/src/services/index.js` | +routesService export |
| `Frontend/app.json` | +expo-location plugin |
| `Frontend/package.json` | +react-native-maps, +expo-location |

## 4. FLUJO COMPLETO DEL SEGUIMIENTO

### Crear ruta GPS (desde backend/admin)
1. Se crea `RutaGPS` vinculada al `alquiler` (1:1)
2. Estado inicial: `PENDIENTE`

### Repartidor inicia ruta
1. POST `/api/rutas/{uuid}/iniciar`
2. Estado cambia a `EN_CURSO`
3. Se registra `fecha_inicio`
4. Se envia notificacion push al cliente ("Repartidor en camino")

### Repartidor envia ubicacion
1. `expo-location` watchPositionAsync cada 5 segundos
2. PUT `/api/rutas/{uuid}/ubicacion` con lat, lng, precision, heading, velocidad
3. Backend recalcula distancia restante (haversine) y tiempo estimado
4. Backend guarda punto en `ubicacion_ruta`
5. Si distancia <= 500m -> notificacion "Repartidor cerca"
6. WebSocket transmite actualizacion a todos conectados

### Cliente recibe actualizaciones
1. WebSocket `ws://host/ws/rutas/{uuid}?token=JWT`
2. Mapa se actualiza con nueva posicion del repartidor
3. Distancia, tiempo y velocidad se actualizan en tiempo real

### Repartidor finaliza ruta
1. POST `/api/rutas/{uuid}/finalizar`
2. Estado cambia a `FINALIZADA`
3. Se registra `fecha_fin`
4. Se envia notificacion push al cliente ("Servicio finalizado")

### Ver historial
1. GET `/api/rutas/{uuid}/historial`
2. Backend retorna todos los puntos GPS, distancia total, tiempo total, vel. promedio
3. Frontend muestra mapa con polilinea completa

---

## 5. GOOGLE MAPS + EXPO LOCATION

### react-native-maps
- Provider: `PROVIDER_GOOGLE`
- Componentes: `MapView`, `Marker`, `Polyline`
- Marcadores: repartidor (verde), cliente (azul), destino (amarillo)
- Polyline: ruta entre repartidor y destino

### expo-location
- `requestForegroundPermissionsAsync()` — Permisos de ubicacion
- `watchPositionAsync()` — Actualizacion cada 5 segundos / 5 metros
- `accuracy: Location.Accuracy.High` — Precision alta
- Cleanup en unmount: `locationSub.remove()`

---

## 6. VALIDACIONES DE SEGURIDAD

- JWT via Bearer token en headers HTTP
- JWT via query parameter `?token=` en WebSocket
- Validacion de rol: solo REPARTIDOR puede iniciar/finalizar/actualizar
- Validacion de pertenencia: repartidor asignado a la ruta
- Validacion de pertenencia: cliente propietario del alquiler
- Acceso denegado con mensaje claro si no cumple permisos

---

## 7. MEJORAS DE RENDIMIENTO

- `React.memo` implicito en componentes funcionales
- `useCallback` en todas las funciones de carga y handlers
- Cleanup de WebSocket en unmount
- Cleanup de Expo Location en unmount
- Animaciones con `useNativeDriver: true`
- Reconexion automatica de WebSocket con delay de 3 segundos
- Polilinea calculada con `useMemo`

---

## 8. BUGS CORREGIDOS

- `rutas.py` original no importaba `ApiResponse` (usado sin import) — corregido
- `rutas.py` original tenia `SolicitudAlquiler` importado sin usar — eliminado
- `main.py` tenia conflicto de nombres `rutas` (router + websocket) — renombrado a `ws_rutas`
- WebSocket `rutas.py` tenia imports muertos (`json`, `selectinload`, `generate_uuid`, etc.) — limpiados

---

## 9. CHECKLIST DE VERIFICACION

- [x] Modelo RutaGPS con relacion 1:1 con alquiler
- [x] Modelo UbicacionRuta para historial completo
- [x] Migracion SQL creada
- [x] Schemas Pydantic para request/response
- [x] Endpoint GET /api/rutas/mia (cliente + repartidor)
- [x] Endpoint GET /api/rutas/{uuid} con validacion de acceso
- [x] Endpoint GET /api/rutas/{uuid}/historial con estadisticas
- [x] Endpoint POST /api/rutas/{uuid}/iniciar (solo repartidor)
- [x] Endpoint POST /api/rutas/{uuid}/finalizar (solo repartidor)
- [x] Endpoint PUT /api/rutas/{uuid}/ubicacion (solo repartidor)
- [x] WebSocket ws/rutas/{uuid} en tiempo real (cada 5s)
- [x] Autenticacion JWT en todos los endpoints
- [x] Validacion de rol y pertenencia
- [x] Service frontend con 8 metodos + WebSocket
- [x] Endpoints.js actualizado
- [x] route-tracking.jsx — pantalla cliente con mapa
- [x] driver-navigation.jsx — pantalla repartidor con GPS
- [x] route-history.jsx — pantalla historial con estadisticas
- [x] Integracion con notificaciones push
- [x] Integracion con Expo Location
- [x] Integracion con Google Maps
- [x] Cleanup de WebSocket y Location en unmount
- [x] Animaciones con cleanup
- [x] Codigo muerto eliminado
- [x] Plugins Expo configurados

---

## 10. PASOS PARA PROBAR

### Backend
1. Ejecutar migracion SQL `013_gps_routing.sql`
2. Reiniciar backend: `uvicorn app.main:app --reload`
3. Probar con Postman/Thunder Client:
   - Login como repartidor (pedro.lopez@mail.co / 123456)
   - Crear ruta GPS con alquiler existente
   - Iniciar ruta: POST /api/rutas/{uuid}/iniciar
   - Actualizar ubicacion: PUT /api/rutas/{uuid}/ubicacion
   - Finalizar: POST /api/rutas/{uuid}/finalizar

### Frontend
1. `cd Frontend && npx expo start`
2. Como cliente: Mis Servicios -> Servicio activo -> Ver ruta
3. Como repartidor: Mis Servicios -> Servicio activo -> Navegar
4. Verificar mapa con marcadores
5. Verificar actualizaciones en tiempo real

---

## 11. COMPATIBILIDAD

- Expo SDK 54
- React Native 0.81.5
- react-native-maps 1.20.1
- expo-location ~19.0.8
- FastAPI + SQLAlchemy async
- MySQL (migracion SQL compatible)
- Sistema de autenticacion JWT existente
- Sistema de notificaciones push (D12)
- Sistema de pagos (D13)
- Sistema de cronometro WebSocket existente

---

**Siguiente entrega:** Pendiente (definir alcance)
