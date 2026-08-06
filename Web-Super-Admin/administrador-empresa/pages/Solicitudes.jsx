import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Check, X, Eye, MoreVertical, CalendarCheck, Ban, Truck, RotateCcw, User, Phone, MapPin, Calendar, FileText, WashingMachine, CreditCard, Clock } from 'lucide-react'
import { getSolicitudes, aceptarSolicitud, asignarRepartidor, rechazarSolicitud, programarRecogida } from '../services/empresa.service'
import { useAuth } from '../../src/context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import Modal from '../../src/components/Modal'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ESTADO_COLORS = {
  PENDIENTE: { bg: 'var(--warning-tint)', text: 'var(--warning)' },
  ENVIADA: { bg: 'var(--warning-tint)', text: 'var(--warning)' },
  ACEPTADA: { bg: 'var(--accent-tint)', text: 'var(--accent-dark)' },
  RECHAZADA: { bg: 'var(--danger-tint)', text: 'var(--danger)' },
  EN_CURSO: { bg: 'var(--primary-tint)', text: 'var(--primary)' },
  CLIENTE_DEVOLUCION: { bg: '#FFF3E0', text: '#E65100' },
  FINALIZACION: { bg: '#FFF3E0', text: '#E65100' },
  COMPLETADA: { bg: 'var(--accent-tint)', text: 'var(--accent-dark)' },
  FINALIZADA: { bg: 'var(--accent-tint)', text: 'var(--accent-dark)' },
}

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: '1', label: 'Pendiente' },
  { value: '2', label: 'Aceptada' },
  { value: '3', label: 'Rechazada' },
  { value: '4', label: 'En curso' },
  { value: '5', label: 'Finalizada' },
]

function InfoSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h4 style={{
        fontSize: '0.82rem', fontWeight: 700, color: 'var(--blue-900)',
        marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--accent)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {title}
      </h4>
      {children}
    </div>
  )
}

function InfoRow({ label, value, icon: IconComp }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--gray-100)' }}>
      {IconComp && <IconComp width={14} height={14} style={{ marginRight: 8, color: 'var(--accent)', flexShrink: 0 }} />}
      <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 500, minWidth: 120 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: 'var(--gray-800)', fontWeight: 500, flex: 1, textAlign: 'right' }}>{value || '-'}</span>
    </div>
  )
}

export default function Solicitudes() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterEstado, setFilterEstado] = useState('')
  const perPage = 15

  const [viewModal, setViewModal] = useState(null)
  const [gestionarModal, setGestionarModal] = useState(null)
  const [asignarModal, setAsignarModal] = useState(null)
  const [repartidoresList, setRepartidoresList] = useState([])
  const [lavadorasList, setLavadorasList] = useState([])
  const [selectedRepartidor, setSelectedRepartidor] = useState(null)
  const [selectedLavadora, setSelectedLavadora] = useState(null)
  const [processing, setProcessing] = useState(null)

  const { lastEvent, clearLastEvent } = useNotifications(user?.uuid)

  useEffect(() => {
    if (lastEvent && lastEvent._eventType === 'nueva_solicitud') {
      showToast('Nueva solicitud recibida')
      fetchData()
      clearLastEvent()
    }
  }, [lastEvent, clearLastEvent])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: perPage }
      if (filterEstado) params.id_estado = filterEstado
      const res = await getSolicitudes(params)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar solicitudes')
        setData([])
      }
    } catch {
      setError('Error de conexion')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, filterEstado])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [filterEstado])

  const handleAceptar = async (uuid) => {
    setProcessing(uuid)
    setGestionarModal(null)
    try {
      const res = await aceptarSolicitud(uuid)
      if (res.success) {
        showToast('Solicitud aceptada. Ahora asigna un repartidor.')
        setAsignarModal(gestionarModal || data.find(s => s.uuid === uuid))
        setRepartidoresList(res.data?.repartidores_disponibles || [])
        setLavadorasList(res.data?.lavadoras_disponibles || [])
        setSelectedRepartidor(null)
        setSelectedLavadora(null)
        fetchData()
      } else {
        showToast(res.message || 'Error al aceptar', 'error')
      }
    } catch {
      showToast('Error de conexion', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleAsignar = async () => {
    if (!selectedRepartidor || !selectedLavadora || !asignarModal) return
    setProcessing(asignarModal.uuid)
    try {
      const res = await asignarRepartidor(asignarModal.uuid, {
        id_repartidor: selectedRepartidor,
        id_lavadora: selectedLavadora,
      })
      if (res.success) {
        showToast('Repartidor asignado correctamente')
        setAsignarModal(null)
        fetchData()
      } else {
        showToast(res.message || 'Error al asignar', 'error')
      }
    } catch {
      showToast('Error de conexion', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleRechazar = async (uuid) => {
    setProcessing(uuid)
    setGestionarModal(null)
    try {
      const res = await rechazarSolicitud(uuid)
      if (res.success) {
        showToast('Solicitud rechazada')
        fetchData()
      } else {
        showToast(res.message || 'Error al rechazar', 'error')
      }
    } catch {
      showToast('Error de conexion', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const handleProgramarRecogida = async (alquilerUuid) => {
    setProcessing(alquilerUuid)
    setGestionarModal(null)
    try {
      const res = await programarRecogida(alquilerUuid)
      if (res.success) {
        showToast('Recogida programada correctamente')
        fetchData()
      } else {
        showToast(res.message || 'Error al programar recogida', 'error')
      }
    } catch {
      showToast('Error de conexion', 'error')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const getGestionActions = (s) => {
    const codigo = s.estado_codigo || s.estado_nombre || ''
    if (codigo === 'PENDIENTE') {
      return [
        { key: 'aceptar', label: 'Aceptar solicitud', icon: <Check width={14} />, color: 'var(--accent)', onClick: () => handleAceptar(s.uuid) },
        { key: 'rechazar', label: 'Rechazar solicitud', icon: <Ban width={14} />, color: 'var(--danger)', onClick: () => handleRechazar(s.uuid) },
      ]
    }
    if (codigo === 'FINALIZACION' || codigo === 'CLIENTE_DEVOLUCION') {
      if (!s.alquiler_uuid) return []
      return [
        { key: 'recogida', label: 'Programar recogida', icon: <RotateCcw width={14} />, color: 'var(--warning)', onClick: () => handleProgramarRecogida(s.alquiler_uuid) },
      ]
    }
    return []
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Solicitudes de Alquiler</h1>
        <p className={styles.pageDesc}>Gestiona las solicitudes de alquiler recibidas de tus clientes.</p>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 8,
          background: toast.type === 'success' ? 'var(--accent)' : 'var(--danger)',
          color: '#fff', fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.msg}
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>X</button>
        </div>
      )}

      <div className={styles.filtersBar}>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)',
            fontSize: '0.82rem', color: 'var(--gray-700)', background: 'var(--white)', cursor: 'pointer',
          }}
        >
          {ESTADO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
            Cargando solicitudes...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
            No se encontraron solicitudes
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha solicitud</th>
                <th>Fecha programada</th>
                <th>Estado</th>
                <th style={{ width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => {
                const estado = s.estado_nombre || 'PENDIENTE'
                const ec = ESTADO_COLORS[estado] || ESTADO_COLORS.PENDIENTE
                const cliente = s.cliente_nombre || '-'
                const actions = getGestionActions(s)
                return (
                  <tr key={s.id_solicitud_alquiler || s.uuid}>
                    <td style={{ fontWeight: 500 }}>{cliente}</td>
                    <td>{formatDate(s.fecha_solicitud || s.created_at)}</td>
                    <td>{formatDate(s.fecha_programada)}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem',
                        fontWeight: 600, background: ec.bg, color: ec.text,
                      }}>
                        {estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button
                          onClick={() => setViewModal(s)}
                          title="Ver detalle"
                          style={{
                            padding: '5px 10px', borderRadius: 6, border: '1px solid var(--gray-200)',
                            background: 'var(--white)', color: 'var(--gray-600)', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <Eye width={14} /> Ver
                        </button>
                        {actions.length > 0 && (
                          <button
                            onClick={() => setGestionarModal(s)}
                            title="Gestionar"
                            disabled={processing === s.uuid}
                            style={{
                              padding: '5px 10px', borderRadius: 6, border: '1px solid var(--accent)',
                              background: 'var(--accent-tint)', color: 'var(--accent)', cursor: 'pointer',
                              fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                              opacity: processing === s.uuid ? 0.5 : 1,
                            }}
                          >
                            <MoreVertical width={14} /> Gestionar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalRecords > perPage && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--gray-200)', background: page === 1 ? 'var(--gray-100)' : 'var(--white)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
          >
            Anterior
          </button>
          <span style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            Pagina {page} de {totalPages} ({totalRecords} registros)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--gray-200)', background: page === totalPages ? 'var(--gray-100)' : 'var(--white)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Ver Detalle */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Detalle de solicitud" wide>
        {viewModal && (
          <div>
            <InfoSection title="Informacion del cliente">
              <InfoRow label="Nombre" value={viewModal.cliente_nombre} icon={User} />
              <InfoRow label="Telefono" value={viewModal.cliente_telefono} icon={Phone} />
            </InfoSection>

            <InfoSection title="Informacion del servicio">
              <InfoRow label="Capacidad" value={viewModal.capacidad_kg ? `${viewModal.capacidad_kg} kg` : viewModal.capacidad_tipo || '-'} icon={WashingMachine} />
              <InfoRow label="Fecha solicitud" value={formatDateTime(viewModal.fecha_solicitud)} icon={Calendar} />
              <InfoRow label="Fecha programada" value={formatDateTime(viewModal.fecha_programada)} icon={Clock} />
              <InfoRow label="Estado" value={
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                  background: (ESTADO_COLORS[viewModal.estado_nombre] || ESTADO_COLORS.PENDIENTE).bg,
                  color: (ESTADO_COLORS[viewModal.estado_nombre] || ESTADO_COLORS.PENDIENTE).text,
                }}>
                  {viewModal.estado_nombre}
                </span>
              } />
            </InfoSection>

            <InfoSection title="Direccion">
              <InfoRow label="Direccion de entrega" value={viewModal.direccion_entrega} icon={MapPin} />
            </InfoSection>

            {viewModal.observaciones && (
              <InfoSection title="Observaciones">
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.5, margin: 0, padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 6, borderLeft: '3px solid var(--accent)' }}>
                  {viewModal.observaciones}
                </p>
              </InfoSection>
            )}

            {viewModal.lavadora_nombre && (
              <InfoSection title="Lavadora asignada">
                <InfoRow label="Codigo" value={viewModal.lavadora_nombre} icon={WashingMachine} />
              </InfoSection>
            )}

            {viewModal.alquiler_uuid && (
              <InfoSection title="Alquiler asociado">
                <InfoRow label="UUID" value={viewModal.alquiler_uuid} icon={FileText} />
              </InfoSection>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Gestionar */}
      <Modal open={!!gestionarModal} onClose={() => setGestionarModal(null)} title="Gestionar solicitud" wide>
        {gestionarModal && (
          <div>
            <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 10, marginBottom: 20, border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User width={20} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--blue-900)', margin: 0 }}>{gestionarModal.cliente_nombre || 'Cliente'}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0 }}>{gestionarModal.cliente_telefono || 'Sin telefono'}</p>
                </div>
                <span style={{
                  marginLeft: 'auto', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                  background: (ESTADO_COLORS[gestionarModal.estado_nombre] || ESTADO_COLORS.PENDIENTE).bg,
                  color: (ESTADO_COLORS[gestionarModal.estado_nombre] || ESTADO_COLORS.PENDIENTE).text,
                }}>
                  {gestionarModal.estado_nombre}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: '12px', background: 'var(--white)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '0 0 4px 0', fontWeight: 500 }}>Capacidad</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--blue-900)', margin: 0 }}>{gestionarModal.capacidad_kg ? `${gestionarModal.capacidad_kg} kg` : gestionarModal.capacidad_tipo || '-'}</p>
              </div>
              <div style={{ padding: '12px', background: 'var(--white)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '0 0 4px 0', fontWeight: 500 }}>Fecha programada</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--blue-900)', margin: 0 }}>{formatDateTime(gestionarModal.fecha_programada)}</p>
              </div>
              <div style={{ padding: '12px', background: 'var(--white)', borderRadius: 8, border: '1px solid var(--gray-200)', gridColumn: 'span 2' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '0 0 4px 0', fontWeight: 500 }}>Direccion de entrega</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-700)', margin: 0, lineHeight: 1.5 }}>{gestionarModal.direccion_entrega || 'Sin direccion'}</p>
              </div>
            </div>

            {gestionarModal.observaciones && (
              <div style={{ marginBottom: 20, padding: '12px', background: 'var(--white)', borderRadius: 8, border: '1px solid var(--gray-200)', borderLeft: '3px solid var(--accent)' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '0 0 6px 0', fontWeight: 500 }}>Observaciones</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-700)', margin: 0, lineHeight: 1.5 }}>{gestionarModal.observaciones}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--gray-200)' }}>
              <button
                onClick={() => setGestionarModal(null)}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid var(--gray-200)',
                  background: 'var(--white)', color: 'var(--gray-600)', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                Cerrar
              </button>
              {getGestionActions(gestionarModal).map((action) => (
                <button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={processing === gestionarModal.uuid}
                  style={{
                    padding: '10px 20px', borderRadius: 8, border: 'none',
                    background: action.color, color: '#fff', cursor: 'pointer',
                    fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                    opacity: processing === gestionarModal.uuid ? 0.6 : 1,
                  }}
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Asignar Repartidor */}
      <Modal open={!!asignarModal} onClose={() => setAsignarModal(null)} title="Asignar repartidor y lavadora" wide>
        {asignarModal && (
          <div>
            <div style={{ padding: '16px', background: 'var(--gray-50)', borderRadius: 10, marginBottom: 20, border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User width={20} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--blue-900)', margin: 0 }}>{asignarModal.cliente_nombre || 'Cliente'}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: 0 }}>{asignarModal.direccion_entrega || ''}</p>
                </div>
              </div>
            </div>

            {/* Seleccion de repartidor */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--blue-900)', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Truck width={14} /> Seleccionar repartidor
              </h4>
              {repartidoresList.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', padding: 12, background: 'var(--gray-50)', borderRadius: 8, textAlign: 'center', margin: 0 }}>
                  No hay repartidores disponibles
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {repartidoresList.map((r) => (
                    <div
                      key={r.id_repartidor}
                      onClick={() => setSelectedRepartidor(r.id_repartidor)}
                      style={{
                        padding: '12px', borderRadius: 8, border: `2px solid ${selectedRepartidor === r.id_repartidor ? 'var(--accent)' : 'var(--gray-200)'}`,
                        background: selectedRepartidor === r.id_repartidor ? 'var(--accent-tint)' : 'var(--white)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedRepartidor === r.id_repartidor ? 'var(--accent)' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User width={16} color={selectedRepartidor === r.id_repartidor ? '#fff' : 'var(--gray-500)'} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--blue-900)', margin: 0 }}>{r.nombre_completo}</p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: 0 }}>{r.telefono || 'Sin telefono'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Seleccion de lavadora */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--blue-900)', marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <WashingMachine width={14} /> Seleccionar lavadora
              </h4>
              {lavadorasList.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', padding: 12, background: 'var(--gray-50)', borderRadius: 8, textAlign: 'center', margin: 0 }}>
                  No hay lavadoras disponibles de esta capacidad
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {lavadorasList.map((l) => (
                    <div
                      key={l.id_lavadora}
                      onClick={() => setSelectedLavadora(l.id_lavadora)}
                      style={{
                        padding: '12px', borderRadius: 8, border: `2px solid ${selectedLavadora === l.id_lavadora ? 'var(--accent)' : 'var(--gray-200)'}`,
                        background: selectedLavadora === l.id_lavadora ? 'var(--accent-tint)' : 'var(--white)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedLavadora === l.id_lavadora ? 'var(--accent)' : 'var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <WashingMachine width={16} color={selectedLavadora === l.id_lavadora ? '#fff' : 'var(--gray-500)'} />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--blue-900)', margin: 0 }}>{l.codigo_interno}</p>
                          {l.color && <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: 0 }}>{l.color}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--gray-200)' }}>
              <button
                onClick={() => setAsignarModal(null)}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid var(--gray-200)',
                  background: 'var(--white)', color: 'var(--gray-600)', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                Cerrar
              </button>
              <button
                onClick={handleAsignar}
                disabled={!selectedRepartidor || !selectedLavadora || processing === asignarModal.uuid}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: 'none',
                  background: (!selectedRepartidor || !selectedLavadora) ? 'var(--gray-300)' : 'var(--accent)',
                  color: '#fff', cursor: (!selectedRepartidor || !selectedLavadora) ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                  opacity: processing === asignarModal.uuid ? 0.6 : 1,
                }}
              >
                <Check width={14} /> Asignar y crear servicio
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
