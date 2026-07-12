# DESCRIPCIÓN FUNCIONAL - PROCESO DE SOLICITUD DE SERVICIOS
## ServiLavadora S.A.S - Para Modelado 3D

---

## RESUMEN EJECUTIVO

La aplicación es un **marketplace de lavanderías** que conecta clientes con empresas de lavado. El proceso principal permite a un cliente **buscar, comparar y reservar servicios de lavado**, hacer seguimiento en tiempo real, y pagar al finalizar.

---

## FLUJO PRINCIPAL DEL CLIENTE (5 pantallas)

### PANTALLA 1: SPLASH / BIENVENIDA

**Objetivo:** Presentar la marca y guiar al usuario.

**Elementos visuales:**
- Fondo blanco limpio
- Logo centrado de la empresa (imagen PNG)
- Texto "Servi**Lavadora**" con tipografía Poppins Bold
- Animación de fade-in + scale-up del logo
- Después de 2 segundos, redirige automáticamente

**Estados de navegación:**
- Si es la primera vez → Pantalla de Onboarding
- Si ya ha entrado antes → Pantalla de Login
- Si tiene sesión activa → Pantalla Principal (Home)

---

### PANTALLA 2: ONBOARDING (Primera vez)

**Objetivo:** Explicar cómo funciona la plataforma.

**Elementos visuales:**
- Fondo blanco
- Botón "Saltar" arriba a la derecha
- Carrusel horizontal de 3-4 slides con:
  - Ícono grande centrado (Material Community Icons)
  - Título en Poppins SemiBold
  - Descripción en Inter Regular
- Puntos indicadores animados abajo (se expanden el activo)
- Botón "Siguiente" / "Comenzar" abajo

**Contenido de los slides:**
1. "Busca servicios" - Encuentra lavanderías cerca de ti
2. "Compara precios" - Revisa calificaciones y tarifas
3. "Reserva rápido" - Agenda en minutos desde tu celular
4. "Disfruta" - Recibe tu ropa limpia y fresca

---

### PANTALLA 3: LOGIN

**Objetivo:** Autenticar al usuario.

**Layout:** Dividido en dos secciones verticales:

**Sección superior (Hero) - 40% de la pantalla:**
- Fondo azul oscuro (#132A45) con formas decorativas abstractas
  - Rectángulo diagonal rotado 16° con opacidad baja
  - Rectángulo angular rotado -7°
  - Círculo con blur
- Logo de la empresa centrado
- Texto "Bienvenido a ServiLavadora" en Poppins SemiBold blanco
- Lista de 3 beneficios con checkmarks
- Fila de 3 pills de confianza (320+ empresas, 4.8/5, Reserva rápida)
- Curva decorativa blanca separando las secciones

**Sección inferior (Formulario) - 60% de la pantalla:**
- Fondo blanco
- Botón "Continuar con Google" (borde gris, ícono Google)
- Divisor "o inicia con tu correo"
- Campo Email:
  - Ícono email (cambia color según estado: gris→verde→rojo)
  - Borde cambia según estado (idle/focus/error/success)
  - Placeholder: "tucorreo@ejemplo.com"
- Campo Contraseña:
  - Ícono candado
  - Botón ojo para mostrar/ocultar
  - Placeholder: "••••••••"
- Checkbox "Recordarme"
- Link "¿Olvidaste tu contraseña?"
- Botón "Iniciar sesión" (verde acento, ancho completo)
- Texto de términos y privacidad
- Footer: "¿No tienes cuenta? Regístrate gratis"

**Estados del formulario:**
- `idle`: Borde gris, ícono gris
- `focus`: Borde verde acento, ícono verde
- `error`: Borde rojo, ícono rojo, mensaje de error debajo
- `success`: Borde verde, ícono verde

---

### PANTALLA 4: HOME (Pantalla Principal)

**Objetivo:** Dashboard con acceso rápido a todas las funcionalidades.

**Header fijo arriba:**
- Logo de la empresa (izquierda)
- Pill de ubicación "Bogotá" con ícono de mapa (derecha)
- Botón de notificaciones (campana)

**Sección Hero:**
- Fondo azul claro (#E7F0FA)
- Blob decorativo circular con opacidad
- Texto "Marketplace de lavanderías" (eyebrow, uppercase)
- Título "Descubre el lavado perfecto para ti" (Poppins SemiBold 28px)
- Subtítulo descriptivo
- **Barra de búsqueda pill** (sombra fuerte, border-radius completo):
  - Ícono de lupa gris
  - Placeholder: "¿Qué necesitas lavar?"

**Grid de categorías (2 filas x 3 columnas):**
Cada categoría es un chip con:
- Fondo blanco, borde gris claro
- Icono box con fondo de color alternado (azul claro / verde claro)
- Texto de 2 líneas

| Categoría | Icono | Color fondo icono |
|-----------|-------|-------------------|
| Lavado por carga | washing-machine | Azul claro |
| Lavado express | lightning-bolt | Verde claro |
| Lavadora a domicilio | home | Azul claro |
| Recogida y entrega | truck | Verde claro |
| Planchado | iron | Azul claro |
| Lavado empresarial | briefcase | Verde claro |

**Barra de confianza:**
- 3 métricas centradas separadas por líneas verticales
- "+320 empresas" | "+18K servicios" | "4.8 calificación"

**Sección "Empresas destacadas":**
- Título + link "Ver todo"
- Lista horizontal de tarjetas de empresa (scroll horizontal)
- Cada tarjeta:
  - Logo circular con color de fondo (azul/verde)
  - Nombre de empresa (1 línea)
  - Ciudad
  - Rating con estrella

**CTA final:**
- Card blanca con sombra
- "¿Listo para comenzar?"
- Botón "Ver servicios"

---

### PANTALLA 5: CATÁLOGO DE SERVICIOS

**Objetivo:** Explorar y filtrar servicios disponibles.

**Header:**
- Título "Servicios" (Poppins SemiBold 26px)
- Subtítulo: "X servicios disponibles"

**Barra de búsqueda pill** (misma que Home)

**Chips de categoría (scroll horizontal):**
- "Todos" (activo por defecto, fondo verde acento)
- Categorías dinámicas extraídas de los servicios
- Chips inactivos: fondo blanco, borde gris

**Chips de ordenamiento (scroll horizontal):**
- Populares | Calificación | Menor precio | Mayor precio | Más rápido
- Cada chip tiene ícono circular que se convierte en check-circle al activarse

**Lista de tarjetas de servicio:**
Cada tarjeta incluye:
- **Imagen** (180px altura) con overlay sutil
- **Badge de estado** (esquina superior izquierda):
  - Disponible: verde con dot
  - En mantenimiento: rojo con dot
- **Cuerpo:**
  - Nombre del servicio (Poppins SemiBold 17px)
  - Rating de la empresa (estrella + número)
  - Nombre de la empresa (texto gris)
  - Fila de info: ubicación + tiempo estimado
  - Precio: "$50,000 / hora" (precio en verde acento bold)
  - Capacidad (si aplica)
  - Tags/badges de categorías (fondo verde claro)
  - **Botón "Reservar ahora"** (verde acento, ancho completo)

**Estado vacío:**
- Ícono grande de lavadora gris
- "Sin resultados"
- "Intenta con otros filtros o términos de búsqueda"

---

### PANTALLA 6: DETALLE DE EMPRESA (Modal)

**Objetivo:** Ver información completa de una empresa y sus servicios.

**Layout:**
- Fondo gris claro
- Close button (X) arriba a la izquierda
- Botones de favorito (corazón) y compartir arriba a la derecha

**Hero de imagen:**
- Imagen de portada (240px altura)
- Overlay oscuro semi-transparente
- Logo circular de la empresa (position absolute, bottom -32px)
- Borde blanco de 3px alrededor del logo

**Card de información:**
- Nombre de la empresa (Poppins SemiBold 22px)
- Badge "Verificada" (verde claro)
- Rating: estrella + número + "(245 reseñas)"
- Ubicación: ícono mapa + distancia
- Horario: ícono reloj + tiempo promedio
- Precio: "Desde $25,000 / hora"

**Galería de imágenes:**
- Scroll horizontal de fotos de la empresa (140x100px cada una)

**Sección "Acerca de":**
- Descripción de la empresa
- Tags/badges de servicios

**Sección "Confianza" (grid 2x2):**
| Indicador | Color |
|-----------|-------|
| Empresa verificada | Verde acento |
| 4.8 calificación promedio | Amarillo |
| Respuesta en minutos | Azul |
| Mismo día disponible | Verde |

**Sección "Servicios disponibles":**
- Lista de tarjetas de servicio (una por cada servicio de la empresa)
- Cada tarjeta:
  - Ícono de lavadora en fondo verde claro
  - Nombre + rating
  - Descripción (2 líneas)
  - Precio + tiempo
  - Botón "Reservar"

**Sección "Opiniones":**
- 3 reseñas de ejemplo
- Cada reseña:
  - Avatar con iniciales
  - Nombre + 5 estrellas (rellenas según calificación)
  - Fecha
  - Texto de la reseña

**Sección "Horario y ubicación":**
- Horarios de lunes a sábado
- Placeholder de mapa
- Botones "Llamar" e "Email"

**Barra fija inferior:**
- Precio a la izquierda
- Botón "Reservar ahora" (verde acento)

---

### PANTALLA 7: SOLICITUD DE SERVICIO (Wizard multi-paso) - MODAL

**Objetivo:** Guiar al cliente through el proceso de reserva.

**Layout del modal:**
- Header fijo con botón atrás, título del paso, botón cerrar (X)
- Barra de progreso (verde acento, animada)
- Labels de pasos con dots indicadores
- Contenido del paso actual (con animación fade+slide)
- Barra de navegación inferior fija (Atrás + Continuar)

**PASO 1: Seleccionar Servicio**
- Título: "Elige un servicio"
- Subtítulo: "[Nombre empresa] ofrece los siguientes servicios"
- Lista de tarjetas de servicio seleccionables:
  - Radio button personalizado (círculo que se llena de verde)
  - Nombre + badge rating
  - Descripción (2 líneas)
  - Precio/hora + duración
  - Imagen del servicio
- Seleccionar uno habilita el botón "Continuar"

**PASO 2: Elegir Fecha**
- Título: "Elige una fecha"
- Subtítulo: "Selecciona el día para tu servicio"
- Grid de 14 días (2 filas de 7):
  - Cada día: nombre abreviado + número + mes
  - Badge "Hoy" en el día actual
  - Seleccionado: fondo verde acento, texto blanco
  - No seleccionado: fondo blanco, borde sutil

**PASO 3: Elegir Horario**
- Título: "Elige un horario"
- Grid de horarios (3 columnas):
  - Horas disponibles: 08:00 a 18:00
  - Seleccionado: fondo verde acento
  - Ocupado: fondo gris claro, badge "Ocupado", deshabilitado

**PASO 4: Dirección**
- Título: "Dirección del servicio"
- Botón "Usar ubicación actual" (fondo verde claro)
- Direcciones guardadas (radio buttons):
  - Casa (ícono home)
  - Trabajo (ícono briefcase)
- Botón "Agregar otra dirección"
- Campo de texto para dirección personalizada

**PASO 5: Confirmar**
- Título: "Confirma tu reserva"
- Card de resumen con:
  - Empresa (logo + nombre)
  - Servicio (ícono + nombre + descripción)
  - Fecha (ícono calendario + fecha)
  - Hora (ícono reloj + hora)
  - Dirección (ícono mapa + dirección)
  - **Total** (precio grande en verde)
  - Nota: "Precio por hora. El costo final puede variar según la duración del servicio."

**Confirmación exitosa:**
- Círculo verde grande con check blanco (animación spring)
- "Tu reserva fue creada correctamente"
- Detalles de la reserva
- Botón "Ver seguimiento"
- Botón "Explorar más servicios"

---

### PANTALLA 8: HISTORIAL / MIS RESERVAS

**Objetivo:** Ver y gestionar reservas activas y pasadas.

**Header:**
- Título "Mis Reservas"
- Subtítulo dinámico: "Tienes X reservas activas" o "Tu actividad reciente"

**Card de estadísticas:**
- 4 métricas en fila: Servicios | Empresas | Uso total | Nivel
- Footer: "Miembro desde julio 2025"

**Barra de búsqueda pill**

**Chips de filtro:**
- Todas | Activas | Programadas | Finalizadas | Canceladas

**Tarjetas de reserva:**
Cada tarjeta incluye:
- Logo de empresa + nombre + servicio
- Badge de estado (color según estado):
  - Pendiente: amarillo
  - Confirmada: azul
  - En proceso: verde con timer
  - Finalizada: verde
  - Cancelada: rojo
- Detalles: fecha + hora + dirección + duración
- Precio total
- **Timeline de progreso** (solo para "en proceso"):
  - 7 pasos: Reserva confirmada → Operario asignado → Recogiendo ropa → Lavando → Secando → En camino → Entregado
  - Dots que se llenan de verde al completarse
  - Línea de conexión entre pasos
  - Badge "Actual" en el paso en curso
- Notas (si existen)
- Botones de acción contextuales:
  - Pendiente: Ver detalles, Reagendar, Cancelar
  - Confirmada: Ver detalles, Contactar empresa
  - En proceso: Seguir servicio, Contactar empresa
  - Finalizada: Reservar de nuevo, Calificar, Descargar factura

---

## FLUJO DEL ADMINISTRADOR (3 pantallas + 2 modales)

### PANTALLA A: BÚSQUEDA DE CLIENTE

**Objetivo:** Encontrar al cliente por cédula para agendar servicios.

**Elementos:**
- Card con campo de búsqueda:
  - Label: "Cédula del Cliente *"
  - Input de texto + botón "Buscar" (celeste) + botón X (para limpiar)
- Al encontrar: Alert verde con nombre, email y teléfono del cliente
- Al no encontrar: SweetAlert2 con opción "Registrar Cliente"

### PANTALLA B: FORMULARIO DE AGENDAMIENTO (Admin)

**Campos (deshabilitados hasta encontrar cliente):**
- Servicio (select)
- Fecha (date picker)
- Hora (time picker)
- Dirección (texto, pre-cargada del cliente)
- Observaciones (textarea)

**Tabla de agendamientos activos:**
- Columnas: #, Cliente, Servicio, Fecha/Hora, Estado, Acciones
- 4 botones de acción por fila:
  1. **Iniciar** (play verde) - Solo para pendientes
  2. **Pausar** (pause amarillo) - Solo para en proceso
  3. **Cancelar** (X rojo) - Siempre
  4. **Finalizar** (check azul) - Solo para en proceso

### MODAL C: REGISTRO DE CLIENTE (Wizard 2 pasos)

**Paso 1 - Datos Personales:**
- Nombres, Apellidos, Fecha nacimiento
- Tipo identificación (select: CC, TI, CE, Pasaporte)
- Identificación, Teléfono, Correo

**Paso 2 - Credenciales:**
- Usuario, Contraseña (min 6), Confirmar contraseña

### MODAL D: PAGO

**Elementos:**
- Título: "Realizar Pago - Factura #X"
- Total a pagar (monto grande verde)
- Selector de método de pago:
  - Efectivo → Info: "Paga al técnico"
  - Tarjeta → Número de cuenta + botón copiar
  - PSE → Número de cuenta + instrucciones
  - Nequi/Daviplata → Código QR dinámico
- Botón "Confirmar Pago"
- Botón "PDF" (genera factura)

---

## MÁQUINA DE ESTADOS DEL AGENDAMIENTO

```
[creado] → pendiente
pendiente → confirmado (admin confirma)
confirmado → en_proceso (admin inicia timer)
en_proceso → finalizado (admin/cliente finaliza)
finalizado → pagada (pago registrado)
en_proceso → pendiente (admin pausa)
cualquier estado → cancelado (eliminación)
```

**Filtros de visualización:**
- **Activos:** pendiente, confirmado, en_proceso
- **Completados:** finalizado, completado, pagada, cancelado

---

## SISTEMA DE TIMERS EN VIVO

**Mecánica:**
- Contador que avanza en tiempo real cuando el servicio está "en_proceso"
- Persiste en localStorage (sobrevive recarga de página)
- Formato visual: "Xm Xs" (minutos y segundos)
- Actualización cada segundo via setInterval

**En el admin:**
- Botón play inicia el timer
- Botón pause lo detiene (mantiene el tiempo)
- El timer se muestra en la columna de estado con color de badge

---

## PALETA DE COLORES COMPLETA

| Uso | Color | Hex |
|-----|-------|-----|
| **Primario (Acento)** | Verde teal | `#12A594` |
| **Secundario** | Azul medio | `#1F4E79` |
| **Acento alternativo** | Azul fuerte | `#2D6CB5` |
| **Fondo claro** | Gris muy claro | `#F7F9FB` |
| **Fondo de cards** | Blanco | `#FFFFFF` |
| **Bordes** | Gris claro | `#EEF1F4` |
| **Texto primario** | Azul oscuro | `#132A45` |
| **Texto secundario** | Gris medio | `#5C6675` |
| **Texto placeholder** | Gris claro | `#8B94A3` |
| **Éxito/Disponible** | Verde | `#28a745` |
| **Error/No disponible** | Rojo | `#dc3545` |
| **Advertencia** | Amarillo | `#ffc107` |
| **Info** | Celeste | `#17a2b8` |
| **Tint de acento** | Verde claro | `#E4F6F3` |
| **Tint azul** | Azul claro | `#E7F0FA` |

---

## TIPOGRAFÍA

| Familia | Peso | Uso |
|---------|------|-----|
| Poppins | SemiBold (600) | Títulos principales |
| Poppins | Bold (700) | Números grandes, precios |
| Poppins | Medium (500) | Títulos secundarios |
| Inter | SemiBold (600) | Labels, botones |
| Inter | Medium (500) | Texto medium |
| Inter | Regular (400) | Cuerpo de texto |

---

## ANIMACIONES CLAVE

1. **Splash:** Fade-in + spring scale del logo
2. **Onboarding:** Stagger fade + slide de elementos
3. **Login:** Hero fade+slide, luego form fade+slide con delay
4. **Home:** Cards con stagger fade+slide
5. **Timeline:** Dots que se llenan secuencialmente
6. **Confirmación de reserva:** Spring scale del círculo + fade de detalles
7. **Timers:** Contador que incrementa cada segundo
8. **Badges de estado:** Transición de color suave

---

## ENDPOINTS DE API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/servicios/` | Listar servicios |
| GET | `/agendamientos/` | Listar agendamientos |
| GET | `/personas/` | Listar personas |
| POST | `/agendamientos/` | Crear agendamiento |
| DELETE | `/agendamientos/{id}` | Eliminar agendamiento |
| POST | `/agendamientos/iniciar/{id}` | Iniciar servicio |
| POST | `/agendamientos/finalizar` | Finalizar servicio |
| PUT | `/agendamientos/{id}/estado` | Actualizar estado |
| POST | `/pagos/` | Registrar pago |
| PUT | `/facturas/{id}/estado` | Actualizar factura |
| POST | `/usuarios/registro` | Registrar usuario |

---

## ESTRUCTURAS DE DATOS

### Servicio
```json
{
  "id_servicio": 1,
  "nombre_servicio": "Lavado y Desinfección",
  "precio_base": 50000,
  "duracion_minutos": 60,
  "descripcion": "Servicio completo de lavado",
  "activo": true
}
```

### Agendamiento
```json
{
  "id_agendamiento": 1,
  "persona_id": 1,
  "servicio_id": 1,
  "fecha": "2025-07-15",
  "hora": "14:30",
  "estado": "pendiente",
  "observaciones": "Nota del cliente",
  "tiempo_transcurrido": 300
}
```

### Persona
```json
{
  "id_persona": 1,
  "nombres": "Juan",
  "apellidos": "Pérez",
  "identificacion": "123456789",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "direccion": { "direccion_detalle": "Calle Real 48#23" }
}
```

### Factura
```json
{
  "id_factura": 1,
  "fecha": "2025-07-15",
  "estado": "pendiente",
  "total": 50000
}
```

### Métodos de Pago
```json
[
  { "id": 1, "nombre": "Efectivo" },
  { "id": 2, "nombre": "Tarjeta" },
  { "id": 26, "nombre": "PSE" },
  { "id": 27, "nombre": "Nequi/Daviplata" }
]
```
