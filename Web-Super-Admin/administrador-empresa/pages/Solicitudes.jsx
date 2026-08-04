import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Check, X, Eye, MoreVertical, CalendarCheck, Ban, Truck, RotateCcw } from 'lucide-react'
import { getSolicitudes, aceptarSolicitud, rechazarSolicitud, programarRecogida } from '../services/empresa.service'
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

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.8rem', color: 'var(--gray-800)', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value || '-'}</span>
    </div>
  )
}

export default function Solicitudes() {
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
  const [menuOpen, setMenuOpen] = useState(null)
  const [processing, setProcessing] = useState(null)
  const menuRef = useRef(null)

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAceptar = async (uuid) => {
    setProcessing(uuid)
    setMenuOpen(null)
    try {
      const res = await aceptarSolicitud(uuid)
      if (res.success) {
        showToast('Solicitud aceptada correctamente')
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

  const handleRechazar = async (uuid) => {
    setProcessing(uuid)
    setMenuOpen(null)
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
    setMenuOpen(null)
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
    if (codigo === 'PENDIENTE' || codigo === 'ENVIADA') {
      return [
        { key: 'aceptar', label: 'Aceptar solicitud', icon: <Check width={14} />, color: 'var(--accent)', onClick: () => handleAceptar(s.uuid) },
        { key: 'rechazar', label: 'Rechazar solicitud', icon: <Ban width={14} />, color: 'var(--danger)', onClick: () => handleRechazar(s.uuid) },
      ]
    }
    if (codigo === 'FINALIZACION' || codigo === 'CLIENTE_DEVOLUCION') {
      return [
        { key: 'recogida', label: 'Programar recogida', icon: <PackageReturn width={14} />, color: 'var(--warning)', onClick: () => handleProgramarRecogida(s.alquiler_uuid) },
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
                          <div ref={menuRef} style={{ position: 'relative' }}>
                            <button
                              onClick={() => setMenuOpen(menuOpen === s.uuid ? null : s.uuid)}
                              title="Gestionar"
                              disabled={processing === s.uuid}
                              style={{
                                padding: '5px 10px', borderRadius: 6, border: '1px solid var(--gray-200)',
                                background: 'var(--white)', color: 'var(--gray-600)', cursor: 'pointer',
                                fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                                opacity: processing === s.uuid ? 0.5 : 1,
                              }}
                            >
                              <MoreVertical width={14} /> Gestionar
                            </button>
                            {menuOpen === s.uuid && (
                              <div style={{
                                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                                background: 'var(--white)', border: '1px solid var(--gray-200)',
                                borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 50, minWidth: 180, padding: '4px 0',
                              }}>
                                {actions.map((a) => (
                                  <button
                                    key={a.key}
                                    onClick={a.onClick}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      padding: '8px 14px', border: 'none', background: 'none',
                                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                                      color: a.color, width: '100%', textAlign: 'left',
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'var(--gray-50)'}
                                    onMouseLeave={(e) => e.target.style.background = 'none'}
                                  >
                                    {a.icon} {a.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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

      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Detalle de solicitud" wide>
        {viewModal && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-900)', marginBottom: 8, borderBottom: '2px solid var(--accent)', paddingBottom: 4, display: 'inline-block' }}>
                Informacion del cliente
              </h4>
              <InfoRow label="Nombre" value={viewModal.cliente_nombre} />
              <InfoRow label="Telefono" value={viewModal.cliente_telefono} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-900)', marginBottom: 8, borderBottom: '2px solid var(--accent)', paddingBottom: 4, display: 'inline-block' }}>
                Informacion del servicio
              </h4>
              <InfoRow label="Capacidad" value={viewModal.capacidad_kg ? `${viewModal.capacidad_kg} kg` : viewModal.capacidad_tipo || '-'} />
              <InfoRow label="Fecha solicitud" value={formatDateTime(viewModal.fecha_solicitud)} />
              <InfoRow label="Fecha programada" value={formatDateTime(viewModal.fecha_programada)} />
              <InfoRow label="Estado" value={
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                  background: (ESTADO_COLORS[viewModal.estado_nombre] || ESTADO_COLORS.PENDIENTE).bg,
                  color: (ESTADO_COLORS[viewModal.estado_nombre] || ESTADO_COLORS.PENDIENTE).text,
                }}>
                  {viewModal.estado_nombre}
                </span>
              } />
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-900)', marginBottom: 8, borderBottom: '2px solid var(--accent)', paddingBottom: 4, display: 'inline-block' }}>
                Direccion
              </h4>
              <InfoRow label="Direccion de entrega" value={viewModal.direccion_entrega} />
            </div>

            {viewModal.observaciones && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-900)', marginBottom: 8, borderBottom: '2px solid var(--accent)', paddingBottom: 4, display: 'inline-block' }}>
                  Observaciones
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.5, margin: 0, padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 6 }}>
                  {viewModal.observaciones}
                </p>
              </div>
            )}

            {viewModal.lavadora_nombre && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-900)', marginBottom: 8, borderBottom: '2px solid var(--accent)', paddingBottom: 4, display: 'inline-block' }}>
                  Lavadora asignada
                </h4>
                <InfoRow label="Codigo" value={viewModal.lavadora_nombre} />
              </div>
            )}

            {viewModal.alquiler_uuid && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--blue-900)', marginBottom: 8, borderBottom: '2px solid var(--accent)', paddingBottom: 4, display: 'inline-block' }}>
                  Alquiler asociado
                </h4>
                <InfoRow label="UUID" value={viewModal.alquiler_uuid} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
