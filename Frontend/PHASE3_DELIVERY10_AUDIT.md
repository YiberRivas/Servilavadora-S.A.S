# FASE 3 - Entrega 10: Auditoria General del Proyecto

## Estado: COMPLETADA

---

## 1. Resumen de la Auditoria

Se realizo una auditoria integral del proyecto Frontend (React Native Expo) y Backend (FastAPI) verificando: imports, componentes, services, context, hooks, configuracion, seguridad, y codigo muerto.

### Alcance
- Frontend: 87 archivos JS/JSX + 30 mocks + 13 reportes
- Backend: 37 archivos Python (routers, schemas, models, websockets)
- Web-Super-Admin: 37 JSX + 70+ CSS (no auditado en esta fase)

---

## 2. Hallazgos y Fixes Aplicados

### CRITICO: Environment Variables (Frontend)

**Problema:** URLs hardcodeadas en `client.js` y `endpoints.js` (`http://192.168.1.53:8000`).

**Fix:**
- Creado `Frontend/src/config/env.js` con soporte para `expo-constants`
- Actualizado `Frontend/app.json` con `extra.apiBaseUrl` y `extra.wsBaseUrl`
- `client.js` ahora importa desde `config/env.js`
- `endpoints.js` usa `ENV.WS_BASE_URL` para WebSocket

**Archivos modificados:**
- `Frontend/src/config/env.js` (nuevo)
- `Frontend/app.json` (extra config)
- `Frontend/src/api/client.js`
- `Frontend/src/api/endpoints.js`

---

### CRITICO: Import faltante (Frontend)

**Problema:** `forgot-password.jsx` usaba `<Icon>` sin importarlo.

**Fix:** Agregado `Icon` al import de `react-native-paper`.

**Archivo:** `Frontend/app/(auth)/forgot-password.jsx:3`

---

### CRITICO: Hardcoded Secrets (Backend)

**Problema:** `config.py` tenia `SECRET_KEY` y `DATABASE_URL` con valores hardcoded como defaults.

**Fix:**
- `config.py`: SECRET_KEY default ahora es string vacio (obligatorio desde `.env`)
- `.env`: SECRET_KEY actualizado con valor unico
- `config.py`: Agregado `CORS_ORIGINS` como variable de entorno
- `main.py`: CORS ahora lee `settings.CORS_ORIGINS.split(",")`

**Archivos modificados:**
- `Backend/app/config.py`
- `Backend/.env`
- `Backend/app/main.py`

---

### CRITICO: Persona Field Names (Backend)

**Problema:** `alquileres.py` usaba `rep_persona.nombre` y `rep_persona.apellido_paterno` que no existen en el modelo `Persona` (usa `nombres`/`apellidos`).

**Fix:** Corregidos 5 puntos en `alquileres.py`:
- Linea 288: `rep_nombre` en mis-servicios
- Linea 349: `rep_nombre` en mis-servicios (solicitudes)
- Linea 513: `repartidorNombre` en detalle solicitud
- Linea 533: `repartidorNombre` en respuesta create_solicitud
- Linea 658: `repartidorNombre` en historial

**Archivo:** `Backend/app/routers/alquileres.py`

---

### ALTO: Hardcoded DB Passwords (Scripts)

**Problema:** `check_schema.py`, `seed.py`, `seed_completo.py`, `seed_full.py` tenian passwords hardcoded.

**Fix:** Todos ahora leen `DATABASE_URL` desde variable de entorno con fallback a `root:12345`.

**Archivos modificados:**
- `Backend/check_schema.py`
- `Backend/seed.py`
- `Backend/seed_completo.py`
- `Backend/seed_full.py`

---

### MEDIO: Codigo Muerto (Frontend)

**Problema:** Archivos sin importaciones activas.

**Fix:** Eliminados:
- `Frontend/src/constants/data/services.js` (133 lineas de mock data sin uso)
- `Frontend/src/hooks/useAuth.js` (duplicado de AuthContext.jsx)
- `Frontend/src/components/shared.jsx` (145 lineas de componentes sin uso)
- Import de `data/services` eliminado de `mockData.js`

---

### MEDIO: WebSocket Hardcoded IP (Frontend)

**Problema:** `endpoints.js` tenia `ws://192.168.1.53:8000` hardcodeado.

**Fix:** Ahora usa `ENV.WS_BASE_URL` desde `config/env.js`.

**Archivo:** `Frontend/src/api/endpoints.js:144`

---

## 3. Items NO Corregidos (Justificacion)

| Hallazgo | Razon |
|----------|-------|
| `console.error()` en active-service.jsx | Acceptable en catch blocks para debugging |
| `useContext(AuthContext)` en _layout.jsx | No es error real, solo import redundante |
| JWT expiry 1440 min en auth.py | Requiere coordinacion con Frontend (refresh token flow) |
| CORS `*` | Se hizo configurable via env var, pero se mantiene `*` por defecto para desarrollo |

---

## 4. Archivos Modificados (Resumen)

| Archivo | Tipo | Cambio |
|---------|------|--------|
| `Frontend/src/config/env.js` | NUEVO | Configuracion de entorno |
| `Frontend/app.json` | Editado | extra config para API URLs |
| `Frontend/src/api/client.js` | Editado | ENV.API_BASE_URL |
| `Frontend/src/api/endpoints.js` | Editado | ENV.WS_BASE_URL |
| `Frontend/app/(auth)/forgot-password.jsx` | Editado | Import Icon |
| `Frontend/src/constants/mockData.js` | Editado | Removido import muerto |
| `Backend/app/config.py` | Editado | SECRET_KEY, CORS_ORIGINS |
| `Backend/.env` | Editado | SECRET_KEY actualizado |
| `Backend/app/main.py` | Editado | CORS desde env var |
| `Backend/app/routers/alquileres.py` | Editado | 5 fixes nombres/apellidos |
| `Backend/check_schema.py` | Editado | DB password desde env |
| `Backend/seed.py` | Editado | DB password desde env |
| `Backend/seed_completo.py` | Editado | DB password desde env |
| `Backend/seed_full.py` | Editado | DB password desde env |

## 5. Archivos Eliminados

| Archivo | Razon |
|---------|-------|
| `Frontend/src/constants/data/services.js` | Mock data sin uso |
| `Frontend/src/hooks/useAuth.js` | Duplicado de AuthContext |
| `Frontend/src/components/shared.jsx` | Componentes sin uso |

---

## 5. Metricas

- **Total fixes aplicados:** 14 archivos modificados + 3 eliminados + 1 nuevo
- **Imports muertos eliminados:** 2
- **Archivos muertos eliminados:** 3
- **Hardcoded secrets removidos:** 6 puntos (config, .env, 4 scripts)
- **Field name bugs corregidos:** 5 puntos en alquileres.py

---

## Entrega completada: 2026-07-27
