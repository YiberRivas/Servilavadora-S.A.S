# HOME - AUDITORIA

**Fecha:** 2026-07-28
**Pantalla:** Inicio (Home) - `(app)/index.jsx`
**Estado:** COMPLETADO

---

## Backend

| Tipo | Endpoint | Estado |
|------|----------|--------|
| Utilizado | `GET /api/public/empresas` | Correcto |
| Disponible | `GET /api/public/empresas/{uuid}` | Disponible (usado por company-detail) |
| Sin usar | `GET /api/empresas` | Requiere auth (no aplica para Home publico) |

---

## Frontend

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `app/(app)/index.jsx` | Reescritura completa: conexion a API, estados, pull-to-refresh |

### Archivos revisados (sin cambios)

| Archivo | Verificacion |
|---------|-------------|
| `app/(app)/_layout.jsx` | OK - tabs configurados correctamente |
| `app/(app)/companies.jsx` | OK - ya usa API, tiene loading/error/empty/refresh |
| `app/(modals)/company-detail.jsx` | OK - lee param `id`, llama `companiesService.get(id)` |
| `src/services/companies.service.js` | OK - `list()` y `get(uuid)` correctos |
| `src/api/endpoints.js` | OK - `public.empresas` y `public.empresaDetail(uuid)` definidos |
| `src/constants/data/home.js` | OK - `homeCategories` es data estatica UI (no mock) |

### Bugs encontrados

| # | Bug | Severidad | Estado |
|---|-----|-----------|--------|
| 1 | `companies` importado de mockData (8 empresas hardcodeadas) | Critico | Corregido |
| 2 | Navegacion usa `company.id` en vez de `company.uuid` | Critico | Corregido |
| 3 | `item.location.split('-')[0]` - campo `location` no existe en API | Critico | Corregido |
| 4 | `item.rating` - campo `rating` no existe en API | Critico | Corregido |
| 5 | `companyGradients[index]` y `companyLabels[index]` hardcodeados | Alto | Corregido |
| 6 | Sin estado de carga (loading) | Alto | Corregido |
| 7 | Sin estado de error | Alto | Corregido |
| 8 | Sin estado vacio | Medio | Corregido |
| 9 | Sin pull-to-refresh | Medio | Corregido |
| 10 | Trust bar hardcodeado (+320, +18K, 4.8) | Medio | Corregido |
| 11 | `import { companies }` de mockData - import muerto despues del cambio | Bajo | Eliminado |
| 12 | `import { Ionicons }` no utilizado | Bajo | Eliminado |

### Codigo eliminado

- `import { companies, homeCategories } from '../../src/constants/mockData'` → reemplazado por import especifico de `homeCategories` + `companiesService`
- `import { Ionicons } from '@expo/vector-icons'` → no utilizado
- `const companyGradients = [...]` → reemplazado por `getLogoBg(uuid)`
- `const companyLabels = ['LN', 'EL', 'LR']` → reemplazado por `item.name.charAt(0)`
- `item.location.split('-')[0].trim()` → reemplazado por `item.neighborhood || item.city`
- `item.rating` → eliminado (API no provee rating)
- Trust bar hardcodeado → dinamico basado en datos de API

### Optimizaciones realizadas

- `renderCompany` envuelto en `useCallback`
- `handleCompanyPress` envuelto en `useCallback`
- `loadCompanies` envuelto en `useCallback`
- `totalLavadoras` calculado con `useMemo`
- FlatList: `removeClippedSubviews={true}`, `maxToRenderPerBatch={5}`, `windowSize={5}`
- `keyExtractor` usa `item.id` (uuid) en vez de index

---

## API

| Verificacion | Estado |
|-------------|--------|
| Consumo correcto de `/api/public/empresas` | OK |
| Mapeo de campos: `uuid` → `id`, `nombre_comercial` → `name` | OK |
| Mapeo de campos: `neighborhood`, `city` | OK |
| Mapeo de campos: `tarifa_min`, `tarifa_max` | OK |
| Mapeo de campos: `verified`, `permite_reservas` | OK |
| Mapeo de campos: `total_lavadoras`, `lavadoras_disponibles` | OK |
| Mapeo de campos: `capacities` | OK |
| Datos mock eliminados | 8 empresas hardcodeadas eliminadas |
| Rating del backend | No provisto por API (mostrar "Sin calificacion" o similar) |

---

## Navegacion

| Verificacion | Estado |
|-------------|--------|
| Home → Company Detail | OK - envia `params: { id: company.uuid }` |
| Company Detail recibe `id` | OK - `useLocalSearchParams()` |
| Company Detail llama API | OK - `companiesService.get(id)` |
| Home → Services (categorias) | OK - navega a `/(app)/services` |
| Home → Companies (Ver todo) | OK - navega a `/(app)/companies` |
| Home → Services (search pill) | OK - navega a `/(app)/services` |

---

## Rendimiento

| Mejora | Aplicada |
|--------|----------|
| `useCallback` en `renderCompany` | Si |
| `useCallback` en `handleCompanyPress` | Si |
| `useCallback` en `loadCompanies` | Si |
| `useMemo` en `totalLavadoras` | Si |
| `removeClippedSubviews` en FlatList | Si |
| `maxToRenderPerBatch` en FlatList | Si |
| `windowSize` en FlatList | Si |

---

## Checklist

| Item | Estado |
|------|--------|
| Empresas desde API | OK |
| Buscador | OK (navega a services) |
| Filtros | OK (en companies.jsx) |
| Pull Refresh | OK |
| Loading | OK (SkeletonCard) |
| Empty State | OK |
| Error State | OK con boton Reintentar |
| Navegacion | OK |
| Optimizacion | OK |
| Sin codigo muerto | OK |
| Sin modificar diseno | OK |
| Compatible con Expo SDK 54 | OK |
