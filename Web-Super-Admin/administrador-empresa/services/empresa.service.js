import { api } from '../../src/services/api'

function buildParams(params = {}) {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v))
  })
  return p.toString()
}

export async function getClientes(params = {}) {
  const qs = buildParams(params)
  return api.get(`/clientes${qs ? '?' + qs : ''}`)
}

export async function getCliente(uuid) {
  return api.get(`/clientes/${uuid}`)
}

export async function crearCliente(data) {
  return api.post('/clientes', data)
}

export async function actualizarCliente(uuid, data) {
  return api.put(`/clientes/${uuid}`, data)
}

export async function eliminarCliente(uuid) {
  return api.delete(`/clientes/${uuid}`)
}

export async function getRepartidores(params = {}) {
  const qs = buildParams(params)
  return api.get(`/repartidores${qs ? '?' + qs : ''}`)
}

export async function getRepartidor(uuid) {
  return api.get(`/repartidores/${uuid}`)
}

export async function crearRepartidor(data) {
  return api.post('/repartidores', data)
}

export async function actualizarRepartidor(uuid, data) {
  return api.put(`/repartidores/${uuid}`, data)
}

export async function eliminarRepartidor(uuid) {
  return api.delete(`/repartidores/${uuid}`)
}

export async function getTarifas(params = {}) {
  const qs = buildParams(params)
  return api.get(`/tarifas${qs ? '?' + qs : ''}`)
}

export async function crearTarifa(data) {
  return api.post('/tarifas', data)
}

export async function actualizarTarifa(uuid, data) {
  return api.put(`/tarifas/${uuid}`, data)
}

export async function eliminarTarifa(uuid) {
  return api.delete(`/tarifas/${uuid}`)
}

export async function aceptarSolicitud(uuid) {
  return api.post(`/alquileres/solicitudes/${uuid}/aceptar`)
}

export async function rechazarSolicitud(uuid) {
  return api.post(`/alquileres/solicitudes/${uuid}/rechazar`)
}

export async function getSolicitudes(params = {}) {
  const qs = buildParams(params)
  return api.get(`/alquileres/solicitudes${qs ? '?' + qs : ''}`)
}

export async function getAlquileres(params = {}) {
  const qs = buildParams(params)
  return api.get(`/alquileres${qs ? '?' + qs : ''}`)
}

export async function getLavadoras(params = {}) {
  const qs = buildParams(params)
  return api.get(`/lavadoras${qs ? '?' + qs : ''}`)
}

export async function programarRecogida(uuid, data = {}) {
  return api.post(`/alquileres/${uuid}/programar-recogida`, data)
}

export async function getPagos(params = {}) {
  const qs = buildParams(params)
  return api.get(`/pagos${qs ? '?' + qs : ''}`)
}

export async function getMetodosPago() {
  return api.get('/pagos/metodos')
}

export async function getNotificaciones(params = {}) {
  const qs = buildParams(params)
  return api.get(`/notificaciones${qs ? '?' + qs : ''}`)
}

export async function marcarNotificacionLeida(uuid) {
  return api.put(`/notificaciones/${uuid}/leer`)
}

export async function marcarTodasLeidas() {
  return api.put('/notificaciones/leer-todas')
}

export async function eliminarNotificacion(uuid) {
  return api.delete(`/notificaciones/${uuid}`)
}

export async function getPerfil() {
  return api.get('/auth/profile')
}

export async function cambiarPassword(data) {
  return api.post('/auth/change-password', data)
}
