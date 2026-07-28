import ENV from '../config/env';

const API_PREFIX = '/api';

const endpoints = {
  health: `${API_PREFIX}/health`,

  auth: {
    login: `${API_PREFIX}/auth/login`,
    register: `${API_PREFIX}/auth/register`,
    refresh: `${API_PREFIX}/auth/refresh`,
    logout: `${API_PREFIX}/auth/logout`,
    me: `${API_PREFIX}/auth/me`,
    profile: `${API_PREFIX}/auth/profile`,
    changePassword: `${API_PREFIX}/auth/change-password`,
  },

  usuarios: {
    list: `${API_PREFIX}/usuarios`,
    get: (uuid) => `${API_PREFIX}/usuarios/${uuid}`,
    create: `${API_PREFIX}/usuarios`,
    update: (uuid) => `${API_PREFIX}/usuarios/${uuid}`,
    delete: (uuid) => `${API_PREFIX}/usuarios/${uuid}`,
    roles: `${API_PREFIX}/usuarios/roles/all`,
  },

  empresas: {
    list: `${API_PREFIX}/empresas`,
    pendientes: `${API_PREFIX}/empresas/pendientes`,
    get: (uuid) => `${API_PREFIX}/empresas/${uuid}`,
    create: `${API_PREFIX}/empresas`,
    update: (uuid) => `${API_PREFIX}/empresas/${uuid}`,
    aprobar: (uuid) => `${API_PREFIX}/empresas/${uuid}/aprobar`,
    rechazar: (uuid) => `${API_PREFIX}/empresas/${uuid}/rechazar`,
    delete: (uuid) => `${API_PREFIX}/empresas/${uuid}`,
    sucursales: (uuid) => `${API_PREFIX}/empresas/${uuid}/sucursales`,
    planes: `${API_PREFIX}/empresas/planes/all`,
    pagos: `${API_PREFIX}/empresas/pagos/all`,
  },

  lavadoras: {
    list: `${API_PREFIX}/lavadoras`,
    estados: `${API_PREFIX}/lavadoras/estados/all`,
    marcas: `${API_PREFIX}/lavadoras/marcas/all`,
    capacidades: `${API_PREFIX}/lavadoras/capacidades/all`,
  },

  alquileres: {
    list: `${API_PREFIX}/alquileres`,
    solicitudes: `${API_PREFIX}/alquileres/solicitudes`,
    crearSolicitud: `${API_PREFIX}/alquileres/solicitudes`,
    estados: `${API_PREFIX}/alquileres/estados/all`,
    estadosSolicitud: `${API_PREFIX}/alquileres/estados-solicitud/all`,
    misServicios: `${API_PREFIX}/alquileres/mis-servicios`,
    misServicioDetail: (uuid) => `${API_PREFIX}/alquileres/mis-servicios/${uuid}`,
    misServicioCronometro: (uuid) => `${API_PREFIX}/alquileres/mis-servicios/${uuid}/cronometro`,
    misHistorial: `${API_PREFIX}/alquileres/mis-historial`,
  },

  dashboard: `${API_PREFIX}/dashboard`,

  configuraciones: {
    get: `${API_PREFIX}/configuraciones`,
    getAll: `${API_PREFIX}/configuraciones/all`,
  },

  clientes: {
    list: `${API_PREFIX}/clientes`,
    get: (uuid) => `${API_PREFIX}/clientes/${uuid}`,
    create: `${API_PREFIX}/clientes`,
    update: (uuid) => `${API_PREFIX}/clientes/${uuid}`,
    delete: (uuid) => `${API_PREFIX}/clientes/${uuid}`,
  },

  repartidores: {
    list: `${API_PREFIX}/repartidores`,
    get: (uuid) => `${API_PREFIX}/repartidores/${uuid}`,
    create: `${API_PREFIX}/repartidores`,
    update: (uuid) => `${API_PREFIX}/repartidores/${uuid}`,
    delete: (uuid) => `${API_PREFIX}/repartidores/${uuid}`,
  },

  repartidor: {
    dashboard: `${API_PREFIX}/repartidor/dashboard`,
    asignaciones: `${API_PREFIX}/repartidor/asignaciones`,
    historial: `${API_PREFIX}/repartidor/historial`,
  },

  rutas: {
    list: `${API_PREFIX}/rutas`,
    create: `${API_PREFIX}/rutas`,
    update: (uuid) => `${API_PREFIX}/rutas/${uuid}`,
    delete: (uuid) => `${API_PREFIX}/rutas/${uuid}`,
    mia: `${API_PREFIX}/rutas/mia`,
    detail: (uuid) => `${API_PREFIX}/rutas/${uuid}`,
    historial: (uuid) => `${API_PREFIX}/rutas/${uuid}/historial`,
    iniciar: (uuid) => `${API_PREFIX}/rutas/${uuid}/iniciar`,
    finalizar: (uuid) => `${API_PREFIX}/rutas/${uuid}/finalizar`,
    ubicacion: (uuid) => `${API_PREFIX}/rutas/${uuid}/ubicacion`,
  },

  notificaciones: {
    list: `${API_PREFIX}/notificaciones`,
    get: (uuid) => `${API_PREFIX}/notificaciones/${uuid}`,
    countNoLeidas: `${API_PREFIX}/notificaciones/no-leidas/count`,
    marcarLeida: (uuid) => `${API_PREFIX}/notificaciones/${uuid}/leer`,
    marcarTodasLeidas: `${API_PREFIX}/notificaciones/leer-todas`,
    delete: (uuid) => `${API_PREFIX}/notificaciones/${uuid}`,
    device: `${API_PREFIX}/notificaciones/device`,
    removeDevice: `${API_PREFIX}/notificaciones/device`,
  },

  tickets: {
    list: `${API_PREFIX}/tickets`,
    get: (uuid) => `${API_PREFIX}/tickets/${uuid}`,
    create: `${API_PREFIX}/tickets`,
    update: (uuid) => `${API_PREFIX}/tickets/${uuid}`,
    addRespuesta: (uuid) => `${API_PREFIX}/tickets/${uuid}/respuestas`,
  },

  archivos: {
    list: `${API_PREFIX}/archivos`,
    create: `${API_PREFIX}/archivos`,
    delete: (uuid) => `${API_PREFIX}/archivos/${uuid}`,
  },

  mantenimientos: {
    list: `${API_PREFIX}/mantenimientos`,
    create: `${API_PREFIX}/mantenimientos`,
    delete: (uuid) => `${API_PREFIX}/mantenimientos/${uuid}`,
  },

  colaEspera: {
    list: `${API_PREFIX}/cola-espera`,
    create: `${API_PREFIX}/cola-espera`,
    atender: (uuid) => `${API_PREFIX}/cola-espera/${uuid}/atender`,
    remove: (uuid) => `${API_PREFIX}/cola-espera/${uuid}`,
  },

  tarifas: {
    list: `${API_PREFIX}/tarifas`,
    create: `${API_PREFIX}/tarifas`,
    update: (uuid) => `${API_PREFIX}/tarifas/${uuid}`,
    delete: (uuid) => `${API_PREFIX}/tarifas/${uuid}`,
  },

  pagos: {
    list: `${API_PREFIX}/pagos`,
    get: (uuid) => `${API_PREFIX}/pagos/${uuid}`,
    create: `${API_PREFIX}/pagos`,
    confirmar: (uuid) => `${API_PREFIX}/pagos/${uuid}/confirmar`,
    cancelar: (uuid) => `${API_PREFIX}/pagos/${uuid}/cancelar`,
    metodos: `${API_PREFIX}/pagos/metodos`,
  },

  suscripciones: {
    list: `${API_PREFIX}/suscripciones`,
    planes: `${API_PREFIX}/suscripciones/planes/all`,
    create: `${API_PREFIX}/suscripciones`,
    update: (uuid) => `${API_PREFIX}/suscripciones/${uuid}`,
    metodosPago: `${API_PREFIX}/suscripciones/metodos-pago/all`,
    estadosPago: `${API_PREFIX}/suscripciones/estados-pago/all`,
    pagos: `${API_PREFIX}/suscripciones/pagos`,
  },

  historial: {
    alquiler: (uuid) => `${API_PREFIX}/historial/alquileres/${uuid}`,
    lavadora: (uuid) => `${API_PREFIX}/historial/lavadoras/${uuid}`,
    auditoria: `${API_PREFIX}/historial/auditoria`,
  },

  ws: {
    cronometro: (uuid) => `${ENV.WS_BASE_URL}/ws/cronometro/${uuid}`,
    ruta: (uuid) => `${ENV.WS_BASE_URL}/ws/rutas/${uuid}`,
  },

  public: {
    empresas: `${API_PREFIX}/public/empresas`,
    empresaDetail: (uuid) => `${API_PREFIX}/public/empresas/${uuid}`,
  },
};

export default endpoints;
