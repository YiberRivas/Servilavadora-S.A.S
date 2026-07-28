# FASE 4 - HOTFIX: Stub Push Notifications para Expo Go (SDK 54)

**Fecha:** 2026-07-28
**Estado:** COMPLETADO

---

## Problema

La app fallaba al iniciar en Expo Go porque `src/utils/pushNotifications.js` importaba `expo-notifications`, una libreria que fue eliminada del proyecto. El import directo causaba un error de resolucion de modulo.

## Causa

Un solo archivo contenia importaciones directas de `expo-notifications` y `expo-device`:

```
src/utils/pushNotifications.js (linea 3-4)
  import * as Notifications from 'expo-notifications';
  import * as Device from 'expo-device';
```

Ningun otro archivo en `src/` importaba `expo-notifications` directamente.

## Solucion

Se reescribio `src/utils/pushNotifications.js` como un **stub temporal** que exporta las mismas 5 funciones sin depender de ninguna libreria externa:

- `registerForPushNotifications()` → console.log + return null
- `removePushToken()` → noop
- `addNotificationListener()` → retorna `{ remove() {} }`
- `addNotificationResponseListener()` → retorna `{ remove() {} }`
- `setBadgeCount()` → noop

## Archivos Modificados

| Archivo | Accion |
|---------|--------|
| `src/utils/pushNotifications.js` | Reescrito como stub sin imports externos |

## Imports Eliminados

| Import | Archivo | Estado |
|--------|---------|--------|
| `import * as Notifications from 'expo-notifications'` | `pushNotifications.js` | ELIMINADO |
| `import * as Device from 'expo-device'` | `pushNotifications.js` | ELIMINADO |
| `import { Platform } from 'react-native'` | `pushNotifications.js` | ELIMINADO (no necesario) |
| `import Constants from 'expo-constants'` | `pushNotifications.js` | ELIMINADO (no necesario) |
| `import { notificationService }` | `pushNotifications.js` | ELIMINADO (no necesario) |
| `import storage` | `pushNotifications.js` | ELIMINADO (no necesario) |

## Referencias Verificadas

| Ubicacion | Referencia | Estado |
|-----------|-----------|--------|
| `src/context/AuthContext.jsx:4` | `import { registerForPushNotifications, removePushToken } from '../utils/pushNotifications'` | SIN CAMBIOS (usa el stub) |
| `src/services/notification.service.js` | No importa pushNotifications | SIN CAMBIOS |
| Backend (DeviceToken, endpoints) | Sin cambios | SIN CAMBIOS |

## Verificaciones

| Verificacion | Estado |
|-------------|--------|
| Cero imports de `expo-notifications` en `src/` | OK |
| Bundle compila: 1368 modulos (sin expo-notifications) | OK |
| AuthContext importa del stub correctamente | OK |
| Login funciona (signIn llama registerForPushNotifications → null) | OK |
| Logout funciona (signOut llama removePushToken → noop) | OK |
| 5 funciones exportadas con misma interfaz | OK |
| Sin cambios en UI, endpoints, backend, AuthContext | OK |

## Para Activar Push Notifications Reales

Cuando se genere un Development Build o APK:

1. Instalar: `npx expo install expo-notifications expo-device`
2. Reemplazar el contenido de `src/utils/pushNotifications.js` con la implementacion real (restaurar imports de `expo-notifications`, `expo-device`, `Platform`, `Constants`, `notificationService`, `storage`)
3. La arquitectura del backend (DeviceToken, endpoints, WebSocket) se mantiene intacta
