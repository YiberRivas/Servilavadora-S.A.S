import { useState, useEffect, useCallback } from 'react'
import { Package, Play, RotateCcw } from 'lucide-react'
import { getAlquileres, programarRecogida } from '../services/empresa.service'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ESTADO_COLORS = {
  PENDIENTE: { bg: 'var(--warning-tint)', text: 'var(--warning)' },
  CAMINO: { bg: 'var(--primary-tint)', text: 'var(--primary)' },
  ACTIVO: { bg: 'var(--accent-tint)', text: 'var(--accent-dark)' },
  FINALIZACION: { bg: 'var(--warning-tint)', text: 'var(--warning)' },
  FINALIZADO: { bg: 'var(--success-tint)', text: 'var(--success)' },
  CANCELADO: { bg: 'var(--gray-100)', text: 'var(--gray-500)' },
}

export default function Alquileres() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterEstado, setFilterEstado] = useState('')
  const perPage = 15

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
      const res = await getAlquileres(params)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar alquileres')
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

  const handleProgramarRecogida = async (uuid) => {
    try {
      const res = await programarRecogida(uuid, {})
      if (res.success) {
        showToast('Recogida programada correctamente')
        fetchData()
      } else {
        showToast(res.message || 'Error al programar recogida', 'error')
      }
    } catch {
      showToast('Error de conexion', 'error')
    }
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Alquileres</h1>
        <p className={styles.pageDesc}>Monitorea los alquileres activos de lavadoras a tus clientes.</p>
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
          <option value="">Todos los estados</option>
          <option value="1">Pendiente</option>
          <option value="2">Camino</option>
          <option value="3">Activo</option>
          <option value="4">Finalizacion</option>
          <option value="5">Finalizado</option>
          <option value="6">Cancelado</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
            Cargando alquileres...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
            No se encontraron alquileres
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Lavadora</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => {
                const estado = a.estado?.nombre || a.estado_nombre || 'PENDIENTE'
                const ec = ESTADO_COLORS[estado] || ESTADO_COLORS.PENDIENTE
                const cliente = a.cliente?.nombre || a.cliente_nombre || '-'
                const lavadora = a.lavadora?.nombre || a.lavadora_nombre || '-'
                return (
                  <tr key={a.id_alquiler || a.uuid}>
                    <td style={{ fontWeight: 500 }}>{cliente}</td>
                    <td>{lavadora}</td>
                    <td>{formatDate(a.fecha_inicio)}</td>
                    <td>{formatDate(a.fecha_fin)}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem',
                        fontWeight: 600, background: ec.bg, color: ec.text,
                      }}>
                        {estado}
                      </span>
                    </td>
                    <td>
                      {estado === 'FINALIZACION' && (
                        <button
                          onClick={() => handleProgramarRecogida(a.uuid)}
                          title="Programar recogida"
                          style={{
                            padding: '5px 10px', borderRadius: 6, border: 'none',
                            background: 'var(--primary)', color: '#fff', cursor: 'pointer',
                            fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <RotateCcw width={14} /> Recoger
                        </button>
                      )}
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
    </div>
  )
}
