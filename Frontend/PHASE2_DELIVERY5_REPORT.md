# Fase 2 - Entrega 5: Modulo Perfil Conectado al Backend

## Objetivo
Eliminar el uso de MockData del modulo Perfil y conectarlo completamente al Backend FastAPI.

---

## Archivos Creados (1)

### 1. `Frontend/PHASE2_DELIVERY5_REPORT.md`
- Este informe tecnico

---

## Archivos Modificados (5)

### 1. `Backend/app/routers/auth.py`
- Agregado endpoint `GET /api/auth/profile` (linea 169-229)
- Retorna datos completos del usuario: uuid, username, nombre_completo, nombres, apellidos, correo, telefono, numero_documento, foto, rol, rol_nombre, direccion (con barrio, municipio, departamento), estado, created_at
- Consulta con `selectinload` para: persona, rol, y cadena de relaciones direccion → barrio → municipio → departamento
- Endpoint autenticado (requiere token valido)

### 2. `Frontend/src/api/endpoints.js`
- Agregado `profile: ${API_PREFIX}/auth/profile` en bloque `auth`

### 3. `Frontend/src/services/profile.service.js`
- Reescrito completamente
- `getProfile()` → `GET /api/auth/profile` (extrae `response.data.data`)
- `updateProfile()` → `PUT /api/clientes/{uuid}` (preparado para uso futuro)
- Eliminados: `getAddresses()`, `addAddress()`, `updateAddress()`, `deleteAddress()` (endpoints no existen)

### 4. `Frontend/app/(app)/profile.jsx`
- Eliminados imports de mockData: `clientProfile`, `clientAddresses`, `paymentMethods`, `clientStats`, `faqItems`
- Agregado import de `profileService`
- Agregados imports: `RefreshControl`, `ActivityIndicator`, `Image`
- Eliminado import no usado: `Platform`
- Agregados estados: `profile`, `loading`, `error`, `refreshing`
- Funcion `loadProfile()` consume `profileService.getProfile()`
- Eliminadas funciones no usadas: `handleDeleteAddress`
- Eliminado state no usado: `privacyProfileVisible`
- **Loading**: ActivityIndicator centrado en pantalla
- **Error**: Icono de error + mensaje + boton Reintentar
- **Pull to Refresh**: RefreshControl en ScrollView
- **Hero Section**: Muestra datos reales del backend (nombre, correo, telefono, direccion, fecha, rol)
- **Avatar**: Si `profile.foto` existe, muestra Image; si no, muestra inicial con placeholder actual
- **Direcciones**: Si `profile.direccion` existe, la muestra; si no, muestra "No registrada" con icono
- **Metodos de pago**: Se mantienen como datos estaticos locales (sin backend)
- **Estadisticas**: Se muestran en 0 (pendiente de endpoint de estadisticas)
- **FAQ**: Se mantiene como datos estaticos locales
- **Configuracion, Soporte, Seguridad**: Sin cambios (mantienen UI original)

### 5. `Frontend/src/context/AuthContext.jsx`
- Agregada funcion `updateUser(newData)` que actualiza el contexto y storage local
- Expuesta via AuthContext.Provider para uso desde profile

---

## Endpoints Backend Utilizados

| Endpoint | Metodo | Auth | Estado |
|----------|--------|------|--------|
| `GET /api/auth/profile` | GET | Si | **Nuevo** - Conectado |
| `PUT /api/clientes/{uuid}` | PUT | Si | Preparado (no conectado en UI) |

---

## Datos Mostrados Desde Backend

| Campo | Fuente | Estado |
|-------|--------|--------|
| Nombre completo | `persona.nombres + apellidos` | Conectado |
| Correo | `persona.correo` | Conectado |
| Telefono | `persona.telefono` | Conectado |
| Numero documento | `persona.numero_documento` | Disponible (no visible en UI) |
| Foto | `persona.foto` | Conectado (placeholder si null) |
| Direccion | `persona.direccion.direccion` | Conectado ("No registrada" si null) |
| Barrio | `direccion.barrio.nombre` | Conectado |
| Municipio | `barrio.municipio.nombre` | Conectado |
| Departamento | `municipio.departamento.nombre` | Disponible (no visible en UI) |
| Rol | `usuario.rol.nombre` | Conectado |
| Estado | `usuario.estado` | Conectado ("Activa"/"Inactiva") |
| Fecha registro | `usuario.created_at` | Conectado |

---

## Verificaciones

- Perfil carga desde API: Verificado
- Avatar funciona (placeholder + imagen): Verificado
- Loading funciona: Verificado
- Error funciona con boton Reintentar: Verificado
- Pull refresh funciona: Verificado
- AuthContext actualizado con `updateUser()`: Verificado
- No hay imports sin usar: Verificado
- No hay codigo muerto: Verificado
- No cambia el diseno: Verificado

---

## Bugs Encontrados

1. **`/api/auth/me` no retornaba datos suficientes** — Solo retornaba uuid, username, nombre_completo, rol, correo. Faltaba telefono, foto, direccion, etc. **Solucion**: Creado nuevo endpoint `GET /api/auth/profile` con datos completos.

---

## Funcionalidades Pendientes

1. **Edicion de perfil** — `PUT /api/clientes/{uuid}` preparado pero la UI muestra "Proximamente"
2. **Estadisticas del usuario** — Se muestran en 0, pendiente de endpoint dedicado
3. **Metodos de pago** — Se mantienen como datos estaticos, pendiente de modulo de pagos
4. **Foto de perfil** — Backend soporta `persona.foto` pero no hay endpoint de subida de archivos

---

## Credenciales de Prueba

| Usuario | Contrasena | Rol |
|---------|-----------|-----|
| `juan.perez@mail.co` | `123456` | SUPER_ADMIN |
| `pedro.lopez@mail.co` | `123456` | ADMIN_EMPRESA |
| `santiago.morales@mail.co` | `123456` | CLIENTE |
