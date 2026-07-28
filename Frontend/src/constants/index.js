export const SERVICE_STATUS_CONFIG = {
  solicitud_enviada: { color: '#8b5cf6', bg: '#F5F3FF', icon: 'send-outline', label: 'Solicitud enviada', priority: 1 },
  pendiente: { color: '#f59e0b', bg: '#FFFBEB', icon: 'clock-outline', label: 'Pendiente', priority: 2 },
  aceptada: { color: '#3b82f6', bg: '#EFF6FF', icon: 'check-circle-outline', label: 'Aceptada', priority: 3 },
  programada: { color: '#6366f1', bg: '#EEF2FF', icon: 'calendar-clock', label: 'Programada', priority: 4 },
  repartidor_asignado: { color: '#0ea5e9', bg: '#F0F9FF', icon: 'account-check-outline', label: 'Repartidor asignado', priority: 5 },
  en_camino: { color: '#14b8a6', bg: '#F0FDFA', icon: 'truck-delivery-outline', label: 'En camino', priority: 6 },
  lavadora_entregada: { color: '#10b981', bg: '#ECFDF5', icon: 'washing-machine', label: 'Lavadora entregada', priority: 7 },
  en_uso: { color: '#12A594', bg: '#E4F6F3', icon: 'play-circle-outline', label: 'En uso', priority: 8 },
  finalizacion_solicitada: { color: '#f97316', bg: '#FFF7ED', icon: 'clock-alert-outline', label: 'Finalizacion solicitada', priority: 9 },
  repartidor_recogida: { color: '#0ea5e9', bg: '#F0F9FF', icon: 'account-arrow-left-outline', label: 'Repartidor para recoger', priority: 10 },
  lavadora_recogida: { color: '#8b5cf6', bg: '#F5F3FF', icon: 'truck-check-outline', label: 'Lavadora recogida', priority: 11 },
  finalizado: { color: '#10b981', bg: '#ECFDF5', icon: 'check-decagram', label: 'Finalizado', priority: 12 },
  cancelado: { color: '#ef4444', bg: '#FEF2F2', icon: 'close-circle-outline', label: 'Cancelado', priority: 13 },
  incidencia: { color: '#dc2626', bg: '#FEF2F2', icon: 'alert-circle-outline', label: 'Incidencia', priority: 14 },
};

export const HISTORY_STATUS_CONFIG = {
  finalizado: { color: '#10b981', bg: '#ECFDF5', icon: 'check-decagram', label: 'Finalizado' },
  cancelado: { color: '#ef4444', bg: '#FEF2F2', icon: 'close-circle-outline', label: 'Cancelado' },
  incidencia: { color: '#f59e0b', bg: '#FFFBEB', icon: 'alert-circle-outline', label: 'Incidencia' },
  devolucion_tardia: { color: '#8b5cf6', bg: '#F5F3FF', icon: 'clock-alert-outline', label: 'Devolucion tardia' },
};

export const MY_SERVICES_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'solicitud_enviada', label: 'Pendientes' },
  { key: 'aceptada', label: 'Aceptados' },
  { key: 'programada', label: 'Programados' },
  { key: 'en_camino', label: 'En Camino' },
  { key: 'lavadora_entregada', label: 'Entregados' },
  { key: 'en_uso', label: 'En Uso' },
  { key: 'finalizacion_solicitada', label: 'Finalizacion' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'incidencia', label: 'Incidencias' },
];

export const MY_SERVICES_SORT = [
  { key: 'recent', label: 'Mas recientes' },
  { key: 'oldest', label: 'Mas antiguos' },
  { key: 'company', label: 'Empresa' },
  { key: 'status', label: 'Estado' },
  { key: 'date', label: 'Fecha' },
];

export const HISTORY_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'finalizado', label: 'Finalizados' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'reviewed', label: 'Con resena' },
  { key: 'no_reviewed', label: 'Sin resena' },
  { key: '30d', label: 'Ultimos 30 dias' },
  { key: '3m', label: 'Ultimos 3 meses' },
  { key: 'year', label: 'Este anio' },
];

export const HISTORY_SORT = [
  { key: 'recent', label: 'Mas recientes' },
  { key: 'oldest', label: 'Mas antiguos' },
  { key: 'value_desc', label: 'Mayor valor' },
  { key: 'value_asc', label: 'Menor valor' },
  { key: 'duration', label: 'Mayor duracion' },
];

export const COMPANIES_FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'nearby', label: 'Cercanas' },
  { key: 'rating', label: 'Mejor calificadas' },
  { key: 'available', label: 'Disponibles ahora' },
  { key: 'reservation', label: 'Aceptan reservas' },
  { key: 'express', label: 'Express' },
  { key: 'traditional', label: 'Lavado tradicional' },
];

export const COMPANIES_SORT = [
  { key: 'rating', label: 'Calificacion' },
  { key: 'price_asc', label: 'Menor precio' },
  { key: 'price_desc', label: 'Mayor precio' },
  { key: 'distance', label: 'Distancia' },
  { key: 'availability', label: 'Disponibilidad' },
];

export const SERVICES_FILTERS = [
  { key: 'all', label: 'Todos' },
];

export const SERVICES_SORT = [
  { key: 'popular', label: 'Populares' },
  { key: 'rating', label: 'Calificacion' },
  { key: 'price_asc', label: 'Menor precio' },
  { key: 'price_desc', label: 'Mayor precio' },
  { key: 'time', label: 'Mas rapido' },
];

export const PAYMENT_METHODS = [
  { key: 'cash', label: 'Efectivo', icon: 'cash' },
  { key: 'nequi', label: 'Nequi', icon: 'cellphone' },
  { key: 'daviplata', label: 'Daviplata', icon: 'cellphone' },
  { key: 'transfer', label: 'Transferencia bancaria', icon: 'bank-transfer' },
];

export const REPORT_PROBLEMS = [
  { id: 'no_enciende', label: 'No enciende', icon: 'power' },
  { id: 'hace_ruido', label: 'Hace ruido inusual', icon: 'volume-high' },
  { id: 'pierde_agua', label: 'Pierde agua', icon: 'water' },
  { id: 'no_centrifuga', label: 'No centrifuga', icon: 'rotate-3d-variant' },
  { id: 'problema_electrico', label: 'Problema electrico', icon: 'flash' },
  { id: 'golpes', label: 'Golpes en la lavadora', icon: 'car-crash' },
  { id: 'otro', label: 'Otro problema', icon: 'help-circle' },
];

export const TIMELINE_STEPS = [
  { key: 'solicitud', label: 'Solicitud' },
  { key: 'aceptada', label: 'Aceptada' },
  { key: 'programada', label: 'Programada' },
  { key: 'en_camino', label: 'En Camino' },
  { key: 'entregada', label: 'Entregada' },
  { key: 'en_uso', label: 'En Uso' },
];

export const FAQ_ITEMS = [
  { id: 1, question: 'Como alquilo una lavadora?', answer: 'Busca una empresa cercana, selecciona la capacidad y horario, y confirma tu reserva.' },
  { id: 2, question: 'Cuanto cuesta el alquiler?', answer: 'El precio varia segun la capacidad, desde $2.000/hora hasta $8.000/hora.' },
  { id: 3, question: 'Puedo cancelar una reserva?', answer: 'Si, puedes cancelar hasta 2 horas antes del servicio sin penalizacion.' },
  { id: 4, question: 'Que pasa si la lavadora se dania?', answer: 'Reporta el inconveniente y la empresa enviara un tecnico o reemplazara la lavadora.' },
];
