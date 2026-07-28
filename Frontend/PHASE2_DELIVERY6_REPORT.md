# FASE 2 - Delivery 6: Mis Servicios, Historial y Servicio Activo

## Resumen

Conexion de los modulos **Mis Servicios**, **Historial de Servicios** y **Servicio Activo** al Backend, eliminando todas las dependencias de datos mock.

---

## Backend - Nuevos Endpoints

### Archivo: `Backend/app/routers/alquileres.py`

Se agregaron 4 endpoints nuevos para clientes:

| Endpoint | Metodo | Descripcion |
|---|---|---|
| `GET /api/alquileres/mis-servicios` | CLIENTE | Lista todas las solicitudes + alquileres del cliente con filtros, paginacion y timeline |
| `GET /api/alquileres/mis-servicios/{uuid}` | CLIENTE | Detalle completo de un servicio (solicitud + alquiler asociado + cronometro) |
| `GET /api/alquileres/mis-servicios/{uuid}/cronometro` | CLIENTE | Datos del cronometro de un alquiler activo |
| `GET /api/alquileres/mis-historial` | CLIENTE | Historial completo (alquileres finalizados + solicitudes canceladas/rechazadas) |

**Detalles de implementacion:**
- Filtrado por `ClienteEmpresa.id_usuario` para aislar datos por cliente
- Carga optimizada con `selectinload` para relaciones (empresa, lavadora, marca, modelo, capacidad, repartidor, persona, cronometro, liquidaciones)
- Mapeo de estados backend a frontend (`EN_USO` -> `en_uso`, `PROGRAMADO` -> `programada`, etc.)
- Timeline construida automaticamente segun el estado
- Campo `status` normalizado para compatibilidad con `SERVICE_STATUS_CONFIG` del frontend

---

## Frontend - Archivos Modificados

### 1. `src/api/endpoints.js`
- Agregados endpoints: `misServicios`, `misServicioDetail(uuid)`, `misServicioCronometro(uuid)`, `misHistorial`
- Corregido WebSocket URL: `localhost` -> `192.168.1.53`

### 2. `src/services/request.service.js`
- Reescrito completamente con ApiResponse parsing correcto (`response.data.success/data/total`)
- Nuevos metodos: `listMisServicios()`, `getMisServicioDetail(uuid)`, `getCronometro(uuid)`
- Metodos existentes preservados para uso del Web-Super-Admin

### 3. `src/services/history.service.js`
- Reescrito con ApiResponse parsing correcto
- Nuevo metodo: `getMisHistorial()`

### 4. `app/(app)/my-services.jsx`
- Eliminada dependencia de `myServices` mock
- Eliminado timer artificial de 1200ms - ahora carga real
- Eliminado `setTimeout` en `onRefresh` - ahora llama al backend real
- `SERVICE_STATUS` reemplazado por `SERVICE_STATUS_CONFIG` desde `constants/index.js`
- `getLogoBg` importado desde `constants/data/home.js` en vez de `mockData`
- `ServiceCard` adaptado: `companyName` -> `empresaNombre`, `companyId` -> `index`, campos del backend
- Detail modal adaptado: campos del backend, timeline real, acciones condicionales por backend
- Agregado estado de error con boton reintentar
- `handleNavigateActive` pasa `serviceId` via params
- `handleNavigateCompany` usa `empresaUuid` en vez de `companyId`

### 5. `app/(app)/history.jsx`
- Eliminadas dependencias: `historyServices`, `historyStats`, `historyDetail`, `historyInvoice`, `historyReview`
- Eliminado timer artificial - carga real desde backend
- `historyStats` calculado en `useMemo` desde datos reales del backend
- `HistoryCard` adaptado: `empresaNombre`, `fechaInicio`, `fechaFin`, `minutosFacturados`, `valorTotal`
- Detail modal simplificado: sin facturas ni resenas (no hay endpoints para eso aun)
- Agregados `RefreshControl`, loading state y error state con reintentar

### 6. `app/(modals)/active-service.jsx`
- Reescrito completamente eliminando todas las dependencias mock
- Carga datos del servicio + cronometro desde backend (`getMisServicioDetail` + `getCronometro`)
- Cronometro sincronizado con `minutosTranscurridos` del backend
- `isActive` real desde `cronometro.activo` del backend
- Precio por hora calculado desde `valorAcumulado / horas` o default 4000
- Eliminadas referencias a `activeService.capacity.pricePerHour`
- Eliminada referencia a `companies` mock
- Repartidor condicional: solo se muestra si existe en el backend
- Agregados loading spinner y error state
- Estructura WebSocket preparada (sin implementar)

---

## Datos Eliminados (Mock)

| Archivo | Que se elimino |
|---|---|
| `my-services.jsx` | `myServices`, `SERVICE_STATUS`, `getLogoBg` de mockData |
| `history.jsx` | `historyServices`, `historyStats`, `historyDetail`, `historyInvoice`, `historyReview`, `getLogoBg` de mockData |
| `active-service.jsx` | `activeService`, `washingMachine`, `deliveryPerson`, `companies` de mockData |
| `request.service.js` | Sin cambios negativos, solo se agrego ApiResponse parsing |
| `history.service.js` | Sin cambios negativos, solo se agrego ApiResponse parsing |

---

## Endpoints del Backend Consumidos

| Endpoint | Consumido por | Metodo HTTP |
|---|---|---|
| `GET /api/alquileres/mis-servicios` | my-services.jsx | `requestService.listMisServicios()` |
| `GET /api/alquileres/mis-servicios/{uuid}` | active-service.jsx | `requestService.getMisServicioDetail()` |
| `GET /api/alquileres/mis-servicios/{uuid}/cronometro` | active-service.jsx | `requestService.getCronometro()` |
| `GET /api/alquileres/mis-historial` | history.jsx | `historyService.getMisHistorial()` |

---

## Notas Tecnicas

- Los endpoints `mis-servicios`, `mis-servicios/{uuid}`, `mis-servicios/{uuid}/cronometro` y `mis-historial` requieren rol **CLIENTE**
- Los endpoints `GET /api/alquileres` (list) y `GET /api/alquileres/solicitudes` siguen requiriendo **SUPER_ADMIN** para el Web-Super-Admin
- El WebSocket del cronometro (`ws://192.168.1.53:8000/ws/cronometro/{uuid}`) esta configurado en endpoints.js pero sin implementacion en frontend aun
- Se agregaron imports necesarios: `selectinload`, `ClienteEmpresa`, `AsignacionSolicitud`, `Lavadora`, `MarcaLavadora`, `ModeloLavadora`, `CapacidadLavadora`, `Repartidor`, `Persona`, `TarifaEmpresa`
- El backend fue verificado con `python -c "from app.main import app"` exitosamente

---

## Siguiente Delivery

- **Delivery 7**: WebSocket del cronometro (conectar `active-service.jsx` al WebSocket para tiempo real)
- **Delivery 8**: Solicitar servicio (connect `request-service.jsx` al backend)
- **Delivery 9**: Reportar problema (connect `report-problem.jsx` al backend)
