# FASE 1 - ENTREGA 5: INFORME TECNICO
## Modulo Mi Servicio Activo

**Fecha:** 25 de julio de 2026
**Proyecto:** Servilavadora S.A.S. - Frontend Movil
**Estado:** Completado

---

## 1. RESUMEN EJECUTIVO

Se implemento el modulo Mi Servicio Activo, el cual permite al cliente administrar su alquiler de lavadora mientras lo esta utilizando. El modulo incluye informacion del servicio, detalles de la lavadora, cronometro en tiempo real, centro de ayuda, informacion del repartidor y solicitud de finalizacion.

**Caracteristicas principales:**
- Informacion completa del servicio activo
- Tarjeta profesional de la lavadora asignada
- Cronometro en tiempo real con pausa/reanudacion
- Valor acumulado calculado automaticamente
- Centro de ayuda con 4 opciones
- Informacion del repartidor con boton de llamada
- Solicitud de finalizacion con confirmacion

---

## 2. PANTALLAS CREADAS

### 2.1 active-service.jsx (Mi Servicio Activo)
**Ubicacion:** `app/(modals)/active-service.jsx`
**Lineas:** ~280

#### Secciones Implementadas

| Seccion | Descripcion |
|---------|-------------|
| Header | Titulo + boton retroceso |
| Informacion del servicio | Empresa, codigo, estado, fecha, hora inicio, tiempo estimado |
| Mi lavadora | Marca, modelo, capacidad, codigo interno, estado, empresa, features |
| Cronometro | Tiempo transcurrido, tiempo facturable, valor acumulado, pausa/reanudacion |
| Centro de ayuda | Reportar inconveniente, llamar empresa, enviar mensaje, instrucciones |
| Repartidor | Foto placeholder, nombre, telefono, estado, boton llamada |
| Solicitar finalizacion | Boton + nota explicativa |

#### Funcionalidades

**Cronometro:**
- Incrementa cada segundo
- Pausa/reanudacion con boton
- Calculo de valor acumulado: `(minutos / 60) * precioPorHora`
- Formato HH:MM:SS o MM:SS
- Animacion de pulso en indicador de estado

**Centro de Ayuda:**
- Reportar inconveniente: navega a `/(modals)/report-problem`
- Llamar empresa: Alert con confirmacion
- Enviar mensaje: Alert "Proximamente"
- Instrucciones de uso: Alert con informacion basica

**Solicitar Finalizacion:**
- Alert de confirmacion
- Mensaje: "La empresa asignara un repartidor para recoger la lavadora"
- No finaliza el servicio

### 2.2 report-problem.jsx (Reportar Inconveniente)
**Ubicacion:** `app/(modals)/report-problem.jsx`
**Lineas:** ~230

#### Problemas Disponibles

| ID | Problema | Icono |
|----|----------|-------|
| no_enciende | No enciende | power |
| hace_ruido | Hace ruido inusual | volume-high |
| pierde_agua | Pierde agua | water |
| no_centrifuga | No centrifuga | rotate-3d-variant |
| problema_electrico | Problema electrico | flash |
| golpes | Golpes en la lavadora | car-crash |
| otro | Otro problema | help-circle |

#### Funcionalidades

- Seleccion de problema con radio button
- Campo de descripcion (solo para "Otro")
- Adjuntar fotos (placeholder con 4 slots)
- Soporte para video (placeholder)
- Validacion: problema requerido, descripcion requerida para "Otro"
- Vista de exito con animacion
- Navegacion de regreso a servicio activo

---

## 3. DATOS MOCK AGREGADOS

### 3.1 activeService
```javascript
{
  id: 'SOL-2026-001',
  companyId: 1,
  companyName: 'Lavadoras del Norte',
  status: 'en_uso',
  statusLabel: 'En uso',
  date: '25/07/2026',
  startTime: '14:30',
  estimatedEndTime: '16:30',
  estimatedMinutes: 120,
  capacity: { id: 2, type: 'Lavadora Automatica', kg: 10, pricePerHour: 4000 },
  address: 'Calle 123 #45-67, Barrio Centro, Apartamento 502',
}
```

### 3.2 washingMachine
```javascript
{
  id: 'LAV-001',
  brand: 'Samsung',
  model: 'EcoBubble WF10T5040KW',
  capacity: '10 kg',
  internalCode: 'LN-AUT-012',
  status: 'Operativa',
  statusColor: '#28a745',
  companyId: 1,
  companyName: 'Lavadoras del Norte',
  features: ['EcoBubble', 'Digital Inverter', 'Ciclo rapido'],
  lastMaintenance: '20/07/2026',
}
```

### 3.3 deliveryPerson
```javascript
{
  id: 'RP-001',
  name: 'Carlos Martinez',
  phone: '310 456 7890',
  status: 'En camino',
  statusColor: '#17a2b8',
  photo: null,
  vehicle: 'Moto - ABC 123',
  rating: 4.8,
}
```

### 3.4 reportProblems
```javascript
[
  { id: 'no_enciende', label: 'No enciende', icon: 'power' },
  { id: 'hace_ruido', label: 'Hace ruido inusual', icon: 'volume-high' },
  { id: 'pierde_agua', label: 'Pierde agua', icon: 'water' },
  { id: 'no_centrifuga', label: 'No centrifuga', icon: 'rotate-3d-variant' },
  { id: 'problema_electrico', label: 'Problema electrico', icon: 'flash' },
  { id: 'golpes', label: 'Golpes en la lavadora', icon: 'car-crash' },
  { id: 'otro', label: 'Otro problema', icon: 'help-circle' },
]
```

---

## 4. NAVEGACION

### 4.1 Entrada
```
 services.jsx (futuro: "Mi servicio activo")
  -> active-service?serviceId={id}
```

### 4.2 Salida
```
active-service.jsx
  -> report-problem   (centro de ayuda: "Reportar inconveniente")
  -> router.back()    (boton retroceso / "Volver a mi servicio")
```

### 4.3 Registro en _layout.jsx
```javascript
<Stack.Screen name="active-service" />
<Stack.Screen name="report-problem" />
```

---

## 5. COMPONENTES REUTILIZADOS

| Componente | Archivo | Uso |
|------------|---------|-----|
| AppButton | src/components/ui/AppButton.jsx | Botones de accion |
| formatCurrency | src/utils/formatters.js | Formateo de precios |
| activeService | src/constants/mockData.js | Datos del servicio activo |
| washingMachine | src/constants/mockData.js | Datos de la lavadora |
| deliveryPerson | src/constants/mockData.js | Datos del repartidor |
| reportProblems | src/constants/mockData.js | Lista de problemas |
| companies | src/constants/mockData.js | Datos de empresa |
| colors | src/theme/index.js | Colores del tema |
| radii | src/theme/index.js | Bordes redondeados |
| shadows | src/theme/index.js | Sombras |

---

## 6. COMPONENTES NUEVOS

| Componente | Archivo | Descripcion |
|------------|---------|-------------|
| ActiveServiceScreen | app/(modals)/active-service.jsx | Pantalla principal del servicio activo |
| ReportProblemScreen | app/(modals)/report-problem.jsx | Pantalla de reporte de inconvenientes |

---

## 7. CODIGO ELIMINADO

Ninguno. Solo se agrego codigo nuevo.

---

## 8. CODIGO REUTILIZADO

- `formatCurrency` de `src/utils/formatters.js` para el valor acumulado
- `companies` de `src/constants/mockData.js` para obtener datos de la empresa
- `colors`, `radii`, `shadows` de `src/theme/index.js` para estilos
- `AppButton` de `src/components/ui/AppButton.jsx` para botones de accion

---

## 9. PREPARACION PARA WEBSOCKETS Y FASTAPI

### 9.1 Cronometro
- Interfaz preparada para recibir tiempo real via WebSocket
- Estados `elapsedSeconds` e `isPaused` listos para sincronizacion
- Calculo de valor acumulado basado en precio por hora

### 9.2 Reporte de Problemas
- Estructura de datos preparada para envio a API
- Endpoint futuro: `POST /api/v1/problems`
- Payload: `{ serviceId, problemType, description, photos[] }`

### 9.3 Solicitud de Finalizacion
- Endpoint futuro: `POST /api/v1/services/{id}/finish-request`
- Payload: `{ serviceId, clientId, address }`
- Respuesta esperada: `{ success, message, estimatedPickup }`

### 9.4 Datos Pendientes
- [ ] Conectar cronometro con WebSocket para tiempo real
- [ ] Obtener datos de servicio activo desde API
- [ ] Obtener datos de lavadora desde API
- [ ] Obtener datos de repartidor desde API
- [ ] Enviar reporte de problema a API
- [ ] Enviar solicitud de finalizacion a API

---

## 10. VERIFICACION

### 10.1 Pantallas NO Modificadas
- Home (app/(app)/index.jsx) - NO MODIFICADA
- Companies (app/(app)/companies.jsx) - NO MODIFICADA
- Services (app/(app)/services.jsx) - NO MODIFICADA
- Profile (app/(app)/profile.jsx) - NO MODIFICADA
- History (app/(app)/history.jsx) - NO MODIFICADA
- Company Detail (app/(modals)/company-detail.jsx) - NO MODIFICADA
- Request Service (app/(modals)/request-service.jsx) - NO MODIFICADA
- Login (app/(auth)/login.jsx) - NO MODIFICADA
- Register (app/(auth)/register.jsx) - NO MODIFICADA
- Forgot Password (app/(auth)/forgot-password.jsx) - NO MODIFICADA

### 10.2 Restricciones Cumplidas
- Sin consumo de API: CUMPLIDO
- Sin cambios visuales en otras pantallas: CUMPLIDO
- Sin nuevas pantallas fuera del alcance: CUMPLIDO
- Sin TypeScript: CUMPLIDO
- Sin emojis: CUMPLIDO
- Diseno compacto: CUMPLIDO
- Respuestas en espanol: CUMPLIDO
- Sin Google Maps: CUMPLIDO
- Sin modificar Base de Datos: CUMPLIDO
- Sin WebSockets: CUMPLIDO (solo interfaz preparada)

---

**Elaborado por:** Opencode (Asistente Tecnico)
**Fecha:** 25/07/2026
