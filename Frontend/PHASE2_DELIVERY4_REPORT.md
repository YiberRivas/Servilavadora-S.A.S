# Fase 2 - Entrega 4: Modulo de Autenticacion Completo

## Objetivo
Conectar el modulo de autenticacion (Login, Logout, Session Persistence, Refresh Token) al Backend FastAPI. Corregir bugs criticos en el parsing de respuestas `ApiResponse`.

---

## Bugs Corregidos (2)

### 1. `Frontend/src/services/auth.service.js`
- **Bug**: Extraia `response.data` directamente, pero el backend envuelve en `ApiResponse` (`{ success, message, data }`)
- **Fix**: Extraer `response.data.data` para acceder a tokens y usuario
- **Detalle**: `login()`, `getMe()`, `refreshToken()`, `changePassword()` ahora parsean correctamente
- Agregado manejo de errores con `success: false` del backend
- `logout()` ahora llama al backend antes de limpiar storage local

### 2. `Frontend/src/api/interceptors.js`
- **Bug**: Misma falla en el refresh interceptor — accedia `data.access_token` en vez de `response.data.access_token`
- **Fix**: Renombrado `data` a `response`, extraer `response.data.access_token`
- Agregado chequeo de `response.success` antes de usar tokens

---

## Archivos Modificados (7)

### 1. `Frontend/src/services/auth.service.js`
- Reescrito completamente
- `login(username, password)` → extrae `response.data.data`, guarda tokens y usuario
- `logout()` → llama `POST /api/auth/logout` antes de limpiar storage
- `getMe()` → extrae `response.data.data`
- `refreshToken()` → extrae tokens desde `response.data`
- `register()` → mantiene estructura pero endpoint no existe aun en backend

### 2. `Frontend/src/api/interceptors.js`
- Fix del refresh interceptor (lineas 59-73)
- Extrae `response.data.access_token` y `response.data.refresh_token`
- Verifica `response.success` antes de procesar

### 3. `Frontend/src/context/AuthContext.jsx`
- Importado `authService`
- `loadSession()` ahora valida token via `authService.getMe()` — si falla, limpia storage
- `signOut()` ahora llama `authService.logout()` para revocar tokens en backend
- Manejo de errores robusto con try/catch en ambos flujos

### 4. `Frontend/app/(auth)/login.jsx`
- Eliminado mock `signIn({ id: 1, name: 'Juan Perez' }, 'mock_token_123')`
- Conectado a `authService.login(username, password)` real
- Campo cambiado de "Correo electronico" a "Usuario" (backend usa `username`)
- Eliminada validacion de email regex (no aplica para username)
- Agregado manejo de errores del backend: credenciales invalidas, usuario bloqueado, desactivado
- Icono cambiado de `email-outline` a `account-outline`

### 5. `Frontend/app/(auth)/register.jsx`
- Deshabilitado el registro real (backend no tiene endpoint publico)
- `handleRegister()` muestra snackbar: "El registro no esta disponible aun"
- Eliminado mock `setTimeout` de registro
- Mantenida la interfaz para uso futuro

### 6. `Frontend/app/(auth)/forgot-password.jsx`
- Agregado TODO: "Conectar a endpoint de recuperacion cuando este disponible en backend"
- `handleSend()` muestra snackbar informativo en vez de simular envio

### 7. `Frontend/app/index.jsx` (Splash)
- Verifica `storage.getAccessToken()` en vez de solo `hasLaunchedBefore`
- Si hay token → va directo a `/(app)`
- Si no hay token → verifica `hasLaunchedBefore` para decidir entre `welcome` y `(auth)/login`

### 8. `Frontend/app/welcome.jsx`
- `handleExplore()` ahora navega a `/(auth)/login` en vez de `/(app)`
- Flujo correcto: welcome → login → (app)

---

## Flujo de Autenticacion Resultante

```
Splash → ¿Token valido? → (app)
       → Sin token → welcome (primera vez) → login
       → Sin token → login (no primera vez)
       
Login → authService.login() → backend valida → guarda tokens → AuthContext actualiza → (app)
Login → credenciales invalidas → muestra error en UI

App abierta → AuthContext.loadSession() → authService.getMe() → token valido → sesion activa
App abierta → AuthContext.loadSession() → getMe() falla → limpia storage → login

Token expira → interceptor detecta 401 → refresh token → renueva access → reintenta request
Token expira → refresh falla → limpia todo → login

Logout → authService.logout() → revoca tokens en backend → limpica storage → login
```

---

## Endpoints Backend Utilizados

| Endpoint | Metodo | Auth | Estado |
|----------|--------|------|--------|
| `/api/auth/login` | POST | No | Conectado |
| `/api/auth/refresh` | POST | No | Conectado (interceptor) |
| `/api/auth/logout` | POST | Si | Conectado |
| `/api/auth/me` | GET | Si | Conectado |
| `/api/auth/change-password` | POST | Si | Disponible (no conectado en UI) |
| `/api/auth/register` | POST | No | **No existe en backend** |

---

## Pendiente para Siguientes Entregas

1. **Endpoint de registro publico** — El backend no tiene `POST /api/auth/register`. Los usuarios son creados por SUPER_ADMIN via `POST /api/usuarios`. Se necesita crear endpoint publico para que clientes se registren.
2. **Endpoint de recuperar contrasena** — No existe endpoint de forgot-password en backend.
3. **Cambio de contrasena** — `authService.changePassword()` esta listo pero no conectado a UI.
4. **Google Auth** — Boton "Continuar con Google" visible en login pero sin funcionalidad.
5. **Recordarme** — Checkbox "Recordarme" visible pero sin logica implementada.

---

## Credenciales de Prueba

| Usuario | Contrasena | Rol |
|---------|-----------|-----|
| `admin` | `123456` | SUPER_ADMIN |
| `adminempresa` | `123456` | ADMIN_EMPRESA |
| `adminlimpieza` | `123456` | ADMIN_EMPRESA |
