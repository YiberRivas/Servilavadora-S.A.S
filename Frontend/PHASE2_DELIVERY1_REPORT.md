# Fase 2 - Entrega 1: Preparacion de Infraestructura API

## Objetivo
Preparar el Frontend (React Native Expo Router) para consumir el Backend FastAPI sin modificar el diseno visual ni la experiencia del usuario.

---

## Arquitectura Propuesta

```
src/
├── api/
│   ├── index.js            # Barrel export
│   ├── client.js           # Instancia Axios configurada
│   ├── endpoints.js        # Centralizacion de rutas del backend
│   └── interceptors.js     # Request/Response interceptors
├── storage/
│   └── index.js            # Modulo centralizado de AsyncStorage
├── services/
│   ├── index.js            # Barrel export
│   ├── auth.service.js     # Autenticacion
│   ├── companies.service.js # Empresas
│   ├── profile.service.js  # Perfil de usuario
│   ├── services.service.js # Lavadoras y servicios
│   ├── request.service.js  # Solicitudes de alquiler
│   ├── payment.service.js  # Pagos
│   └── history.service.js  # Historial
├── context/
│   └── AuthContext.jsx     # (Modificado) Usa storage/ centralizado
├── hooks/
│   └── useAuth.js          # (Sin cambios)
├── components/
│   ├── shared.jsx          # (Corregido import)
│   └── ui/                 # (Sin cambios)
├── constants/
│   └── ...                 # (Sin cambios)
├── theme/
│   └── ...                 # (Sin cambios)
└── utils/
    └── ...                 # (Sin cambios)
```

---

## Archivos Creados (11)

### 1. `src/api/client.js`
- Instancia unica de Axios
- baseURL: `http://localhost:8000`
- timeout: 30000ms
- headers: Content-Type, Accept
- CancelToken para cancelar peticiones

### 2. `src/api/endpoints.js`
- 76 endpoints centralizados organizados por modulo
- Funciones para endpoints con parametros dinamicos (uuid)
- WebSocket endpoint para cronometro

### 3. `src/api/interceptors.js`
- **Request interceptor**: Agrega Authorization Bearer token automaticamente
- **Response interceptor**: Detecta 401, intenta refresh token, reintenta peticion, cierra sesion si falla
- Cola de peticiones pendientes durante refresh

### 4. `src/api/index.js`
- Barrel export para modulo api

### 5. `src/storage/index.js`
- Wrapper centralizado de AsyncStorage
- Metodos: getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, setTokens, getUser, setUser, getPreferences, setPreferences, clearAll, clearAuth
- Keys namespaced: `@servilavadora:*`

### 6. `src/services/auth.service.js`
- login(), register(), logout(), getMe(), changePassword(), refreshToken()

### 7. `src/services/companies.service.js`
- list(), get(), getSucursales(), getPlanes(), create(), update()

### 8. `src/services/profile.service.js`
- getProfile(), updateProfile(), getAddresses(), addAddress(), updateAddress(), deleteAddress()

### 9. `src/services/services.service.js`
- listWashingMachines(), getWashingMachineStates(), getBrands(), getCapacities(), getTarifas()

### 10. `src/services/request.service.js`
- listRequests(), listAlquileres(), getEstadosAlquiler(), getEstadosSolicitud(), createRequest(), updateRequest()

### 11. `src/services/payment.service.js`
- getPaymentMethods(), getPaymentStates(), createPayment(), getPayments()

### 12. `src/services/history.service.js`
- getAlquilerHistory(), getLavadoraHistory(), getAuditHistory()

### 13. `src/services/index.js`
- Barrel export para todos los services

---

## Archivos Modificados (6)

### 1. `src/context/AuthContext.jsx`
- **Cambio**: Reemplazado `AsyncStorage` directo por `storage/` centralizado
- **Impacto**: Ninguno visual. Mismas funciones (signIn, signOut, loadSession)
- **Detalles**: signIn ahora acepta refreshToken como parametro opcional

### 2. `src/components/shared.jsx`
- **Cambio**: Corregido import `../../theme` → `../theme`
- **Cambio**: Agregado `TouchableOpacity` al import de react-native

### 3. `app/(app)/index.jsx`
- **Cambio**: Agregado `Image` al import de react-native (faltaba)

### 4. `app/(app)/history.jsx`
- **Cambio**: Agregado `Alert` al import de react-native (faltaba)
- **Cambio**: Eliminado import no utilizado `companies`

### 5. `app/(app)/my-services.jsx`
- **Cambio**: Agregado `Alert` al import de react-native (faltaba)
- **Cambio**: Eliminado import no utilizado `companies`

### 6. `app/(app)/companies.jsx`
- **Cambio**: Eliminado import no utilizado `formatCurrency`

### 7. `app/(modals)/request-service.jsx`
- **Cambio**: Eliminado import no utilizado `formatMinutes`

### 8. `app/(modals)/company-detail.jsx`
- **Cambio**: Eliminados imports no utilizados `getInitials` y `AppButton`

---

## Archivos NO Modificados

- `src/constants/mockData.js` - Sin cambios
- `src/constants/data/*.js` - Sin cambios (7 archivos)
- `src/constants/index.js` - Sin cambios
- `src/theme/index.js` - Sin cambios
- `src/utils/formatters.js` - Sin cambios
- `src/components/ui/*` - Sin cambios
- `app/_layout.jsx` - Sin cambios
- `app/(auth)/*` - Sin cambios (excepto login.jsx sin cambios)
- `app/(app)/*` - Solo imports corregidos
- `app/(modals)/*` - Solo imports corregidos

---

## Endpoints Centralizados (76)

| Modulo | Endpoints | Metodo |
|--------|-----------|--------|
| Health | 1 | GET |
| Auth | 5 | POST, GET |
| Usuarios | 6 | GET, POST, PUT, DELETE |
| Empresas | 10 | GET, POST, PUT, DELETE |
| Lavadoras | 4 | GET |
| Alquileres | 4 | GET |
| Dashboard | 1 | GET |
| Configuraciones | 2 | GET |
| Clientes | 5 | GET, POST, PUT, DELETE |
| Repartidores | 5 | GET, POST, PUT, DELETE |
| Rutas | 4 | GET, POST, PUT, DELETE |
| Notificaciones | 4 | GET, PUT |
| Tickets | 5 | GET, POST, PUT |
| Archivos | 3 | GET, POST, DELETE |
| Mantenimientos | 3 | GET, POST, DELETE |
| Cola de Espera | 4 | GET, POST, PUT, DELETE |
| Tarifas | 4 | GET, POST, PUT, DELETE |
| Suscripciones | 6 | GET, POST, PUT |
| Historial | 3 | GET |
| WebSocket | 1 | WS |
| **Total** | **76** | |

---

## Interceptores

### Request Interceptor
```
1. Obtiene access token de storage
2. Si existe, agrega header Authorization: Bearer <token>
3. Retorna config modificada
```

### Response Interceptor
```
1. Si respuesta es exitosa, la retorna
2. Si error 401 y no es retry:
   a. Marca peticion como retry
   b. Obtiene refresh token
   c. POST /api/auth/refresh con refresh_token
   d. Guarda nuevos tokens
   e. Reintenta peticion original
3. Si refresh falla:
   a. Limpia todo el storage
   b. Redirige a login
   c. Rechaza promesa
```

---

## Storage Centralizado

| Key | AsyncStorage Key | Tipo |
|-----|-----------------|------|
| Access Token | `@servilavadora:access_token` | string |
| Refresh Token | `@servilavadora:refresh_token` | string |
| Usuario | `@servilavadora:user` | JSON |
| Preferencias | `@servilavadora:preferences` | JSON |

---

## Servicios Creados (7)

| Service | Funciones | Modulo Backend |
|---------|-----------|----------------|
| auth | login, register, logout, getMe, changePassword, refreshToken | /api/auth/* |
| companies | list, get, getSucursales, getPlanes, create, update | /api/empresas/* |
| profile | getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress | /api/clientes/*, /api/auth/me |
| services | listWashingMachines, getWashingMachineStates, getBrands, getCapacities, getTarifas | /api/lavadoras/*, /api/tarifas/* |
| request | listRequests, listAlquileres, getEstadosAlquiler, getEstadosSolicitud, createRequest, updateRequest | /api/alquileres/* |
| payment | getPaymentMethods, getPaymentStates, createPayment, getPayments | /api/suscripciones/* |
| history | getAlquilerHistory, getLavadoraHistory, getAuditHistory | /api/historial/* |

---

## Errores Corregidos (4 Criticos + 5 Menores)

### Criticos (runtime crash)
1. `app/(app)/index.jsx` - Faltaba `Image` en import de react-native
2. `app/(app)/history.jsx` - Faltaba `Alert` en import de react-native
3. `app/(app)/my-services.jsx` - Faltaba `Alert` en import de react-native
4. `src/components/shared.jsx` - Faltaba `TouchableOpacity` en import de react-native

### Menores (dead code)
5. `app/(modals)/request-service.jsx` - Import no utilizado `formatMinutes`
6. `app/(modals)/company-detail.jsx` - Imports no utilizados `getInitials`, `AppButton`
7. `app/(app)/my-services.jsx` - Import no utilizado `companies`
8. `app/(app)/history.jsx` - Import no utilizado `companies`
9. `app/(app)/companies.jsx` - Import no utilizado `formatCurrency`

### Correccion de ruta
10. `src/components/shared.jsx` - Ruta de import `../../theme` corregida a `../theme`

---

## Verificacion de Restricciones

| Restriccion | Estado |
|-------------|--------|
| No modificar diseno visual | CUMPLE |
| No cambiar estilos | CUMPLE |
| No cambiar navegacion | CUMPLE |
| No eliminar componentes existentes | CUMPLE |
| No romper compatibilidad | CUMPLE |
| No usar MockData nuevo | CUMPLE |
| No implementar funcionalidades | CUMPLE |
| Solo preparar infraestructura | CUMPLE |

---

## Preparado Para

1. **Login real** → `authService.login()` + `AuthContext.signIn()`
2. **Carga de empresas** → `companiesService.list()` reemplaza mockData
3. **Perfil de usuario** → `profileService.getProfile()`
4. **Solicitudes de alquiler** → `requestService.createRequest()`
5. **Servicio activo** → `requestService.listAlquileres()` + WebSocket
6. **Historial** → `historyService.getAlquilerHistory()`
7. **Pagos** → `paymentService.getPaymentMethods()`

---

## Siguiente Fase
**Fase 2 - Entrega 2**: Implementar consumo real de API en modulos de autenticacion (Login, Registro, Forgot Password).
