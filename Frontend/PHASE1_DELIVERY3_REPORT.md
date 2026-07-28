# FASE 1 - ENTREGA 3: INFORME TECNICO
## Modulo Solicitud de Servicio - Flujo de 5 Pasos

**Fecha:** 25 de julio de 2026
**Proyecto:** Servilavadora S.A.S. - Frontend Movil
**Estado:** Completado

---

## 1. RESUMEN EJECUTIVO

Se implemento el modulo completo de Solicitud de Servicio con un flujo de 5 pasos para que los clientes puedan solicitar el alquiler de una lavadora. El modulo incluye seleccion de capacidad, direccion, fecha/hora, resumen y confirmacion con animacion.

**Caracteristicas principales:**
- Flujo de 5 pasos con barra de progreso y labels
- Dos modos: "Ahora" (servicio inmediato) y "Reservar" (hasta 5 dias)
- Seleccion de capacidad con precios y disponibilidad
- Direccion guardada + direccion personalizada
- Selector de fecha (grid de 5 dias) + horarios con ocupacion
- Metodos de pago (Efectivo, Nequi, Daviplata, Transferencia)
- Resumen editable con navegacion por secciones
- Observaciones opcionales (max 500 caracteres)
- Vista de confirmacion con animacion de escala/fade
- Navegacion preparada para modulo "Mis Servicios"

---

## 2. PANTALLA MODIFICADA

### 2.1 request-service.jsx (Solicitud de Servicio)
**Lineas:** 810
**Ubicacion:** `app/(modals)/request-service.jsx`

#### Estructura del Flujo

| Paso | Label | Descripcion |
|------|-------|-------------|
| 0 | Capacidad | Seleccion de tipo de lavadora |
| 1 | Direccion | Direccion del servicio |
| 2 | Fecha y hora | Fecha + horario + metodo de pago |
| 3 | Resumen | Revision de detalles + observaciones |
| 4 | Confirmacion | Vista de exito con animacion |

#### Parametros de Navegacion

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| companyId | String | ID de la empresa seleccionada |
| capacityId | String | ID de la capacidad pre-seleccionada (opcional) |
| requestType | String | `"now"` = servicio inmediato, `"reservar"` = reserva futura |

#### Funcionalidades por Paso

**Paso 0 - Capacidad:**
- Resumen de empresa (logo, nombre, calificacion, resenas)
- Lista de capacidades disponibles con filtro `available > 0`
- Tarjeta con icono, tipo, kg, precio/hora, disponibilidad
- Seleccion por radio button

**Paso 1 - Direccion:**
- Direcciones guardadas (Casa, Trabajo) con radio button
- Boton "Agregar otra direccion"
- Formulario de direccion personalizada (direccion + detalles)
- Validacion: direccion requerida

**Paso 2 - Fecha y Hora:**
- Modo `reservar`: Grid de 5 dias (fecha + dia + mes) + badge "Hoy"
- Modo `now`: Banner "Servicio para hoy" con fecha actual
- Grid de horarios (08:00 - 18:00) con slots ocupados deshabilitados
- Seccion de metodo de pago (4 opciones)
- Nota: "El pago se realizara al finalizar el servicio"
- Validacion: fecha + hora requeridas

**Paso 3 - Resumen:**
- Tarjeta de resumen con 4 secciones editables:
  - Empresa y capacidad (navega a paso 0)
  - Direccion (navega a paso 1)
  - Fecha y hora (navega a paso 2)
  - Metodo de pago (solo visual)
- Campo de observaciones (textarea, max 500 chars)
- Contador de caracteres

**Paso 4 - Confirmacion:**
- Animacion de circulo verde con check (spring)
- Animacion de fade para contenido
- Mensaje de exito con detalles del servicio
- Boton "Ir a mis servicios" (navega a servicios)
- Boton "Volver al inicio" (placeholder)

---

## 3. COMPONENTES INTERNOS

### 3.1 AnimatedStep
- Componente wrapper para animaciones de entrada/salida
- Opacity + translateY (30px)
- Duration: 300ms
- Solo renderiza cuando `visible` es true

### 3.2 ConfirmedView
- Vista de confirmacion post-solicitud
- Animacion secuencial: spring (scale) + timing (fade)
- Detalles del servicio en tarjeta
- Botones de navegacion

### 3.3 CapacityCard (inline)
- Tarjeta de capacidad con seleccion
- Radio button visual
- Precio y disponibilidad

---

## 4. ESTADOS Y VALIDACIONES

### 4.1 Estados del Componente

| Estado | Tipo | Descripcion |
|--------|------|-------------|
| step | Number (0-4) | Paso actual del flujo |
| selectedCapacity | Object | Capacidad seleccionada |
| selectedAddress | Object | Direccion guardada seleccionada |
| customAddress | String | Direccion personalizada |
| customAddressDetails | String | Detalles de direccion personalizada |
| showCustomAddress | Boolean | Mostrar formulario de direccion |
| selectedDate | Object | Fecha seleccionada |
| selectedTime | String | Horario seleccionado |
| paymentMethod | String | Metodo de pago (default: 'cash') |
| observations | String | Observaciones del cliente |
| confirmed | Boolean | Solicitud confirmada |
| errors | Object | Errores de validacion |

### 4.2 Validaciones

| Paso | Campo | Regla |
|------|-------|-------|
| 0 | capacity | Requerido |
| 1 | address | Requerido (guardada o personalizada) |
| 2 | date | Requerido |
| 2 | time | Requerido |
| 3 | observations | Maximo 500 caracteres |

### 4.3 Boton Deshabilitado

El boton "Continuar" se deshabilita cuando:
- Paso 0: `!selectedCapacity`
- Paso 1: `!finalAddress`
- Paso 2: `!selectedDate || !selectedTime`

---

## 5. DATOS MOCK

### 5.1 TIME_SLOTS
```javascript
['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
```

### 5.2 PAYMENT_METHODS
```javascript
[
  { key: 'cash', label: 'Efectivo', icon: 'cash' },
  { key: 'nequi', label: 'Nequi', icon: 'cellphone' },
  { key: 'daviplata', label: 'Daviplata', icon: 'cellphone' },
  { key: 'transfer', label: 'Transferencia', icon: 'bank-transfer' },
]
```

### 5.3 savedAddresses
```javascript
[
  { id: 1, label: 'Casa', address: 'Calle 123 #45-67, Barrio Centro', icon: 'home-outline', details: 'Apartamento 502, Torre A' },
  { id: 2, label: 'Trabajo', address: 'Av. El Dorado #50-20, Chapinero', icon: 'briefcase-outline', details: 'Oficina 301, Piso 3' },
]
```

### 5.4 Horarios Ocupados (Hardcoded)
- 12:00
- 15:00

---

## 6. NAVEGACION

### 6.1 Entrada
```
company-detail.jsx
  -> request-service?companyId={id}&capacityId={capId}&requestType=now|reservar
```

### 6.1 Salida
```
request-service.jsx
  -> (app)/services    (post-confirmacion: "Ir a mis servicios")
  -> router.back()     (boton cerrar / "Volver al inicio")
```

---

## 7. COMPONENTES REUTILIZADOS

| Componente | Archivo | Uso |
|------------|---------|-----|
| AppButton | src/components/ui/AppButton.jsx | Reservado para futura integracion |
| formatCurrency | src/utils/formatters.js | Precio de capacidades |
| formatMinutes | src/utils/formatters.js | Tiempo estimado |
| companies | src/constants/mockData.js | Datos de empresa |
| getLogoBg | src/constants/mockData.js | Color de logo |
| colors | src/theme/index.js | Colores del tema |
| radii | src/theme/index.js | Bordes redondeados |
| shadows | src/theme/index.js | Sombras |

---

## 8. ESTILO VISUAL

### 8.1 Paleta de Colores Utilizada
- `colors.accent` (#12A594): Seleccion, progreso, botones principales
- `colors.accentTint`: Fondos de seccion
- `colors.accentDark`: Texto de acento
- `colors.blue900` (#132A45): Titulos, texto principal
- `colors.gray50-600`: Fondos, textos secundarios
- `colors.error`: Mensajes de error

### 8.2 Tipografia
- `Poppins_600SemiBold`: Titulos de paso, nombre de empresa
- `Inter_600SemiBold`: Labels, valores de resumen
- `Inter_400Regular`: Descripciones, textos secundarios
- `Inter_500Medium`: Errores, badges

### 8.3 Dimensiones Clave
- Header: Platform-aware (iOS: 56px, Android: 20px padding)
- Capacity card: Full width con radio button
- Date cards: `(SCREEN_WIDTH - 48 - 32) / 5`
- Time cards: `(SCREEN_WIDTH - 48 - 32) / 3`
- Payment cards: `(SCREEN_WIDTH - 48 - 24) / 2`
- Bottom nav: Fixed, paddingHorizontal: 24

---

## 9. PENDIENTES PARA FUTURA INTEGRACION

### 9.1 Navegacion
- [ ] Conectar "Ir a mis servicios" con modulo de servicios del cliente
- [ ] Conectar "Volver al inicio" con navegacion correcta
- [ ] Conectar Capacidades en company-detail con navigation a request-service

### 9.2 Backend
- [ ] Implementar endpoint de creacion de solicitud
- [ ] Implementar validacion de horarios ocupados
- [ ] Implementar persistencia de direcciones guardadas
- [ ] Implementar creacion de solicitud con todos los campos

### 9.3 Datos
- [ ] Reemplazar savedAddresses con datos del usuario
- [ ] Reemplazar horarios ocupados con datos de la empresa
- [ ] Conectar capacidades disponibles con inventario real

---

## 10. VERIFICACION

### 10.1 Pantallas NO Modificadas
- Home (app/(app)/index.jsx) - NO MODIFICADA
- Companies (app/(app)/companies.jsx) - NO MODIFICADA
- Services (app/(app)/services.jsx) - NO MODIFICADA
- Profile (app/(app)/profile.jsx) - NO MODIFICADA
- History (app/(app)/history.jsx) - NO MODIFICADA
- Company Detail (app/(modals)/company-detail.jsx) - NO MODIFICADA
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

---

**Elaborado por:** Opencode (Asistente Tecnico)
**Fecha:** 25/07/2026
