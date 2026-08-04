import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { getNotificaciones, marcarNotificacionLeida, marcarTodasLeidas, eliminarNotificacion } from '../services/empresa.service'
import styles from '../styles/pages/DashboardEmpresa.module.css'

export default function Notificaciones() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState(null)
  const perPage = 15

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getNotificaciones({ page, per_page: perPage })
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar notificaciones')
        setData([])
      }
    } catch {
      setError('Error de conexion al cargar notificaciones')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleMarkRead = async (uuid) => {
    try {
      const res = await marcarNotificacionLeida(uuid)
      if (res.success) fetchData()
    } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    try {
      const res = await marcarTodasLeidas()
      if (res.success) {
        showToast('Todas las notificaciones marcadas como leidas')
        fetchData()
      }
    } catch {
      showToast('Error al marcar notificaciones', 'error')
    }
  }

  const handleDelete = async (uuid) => {
    try {
      const res = await eliminarNotificacion(uuid)
      if (res.success) {
        showToast('Notificacion eliminada')
        fetchData()
      }
    } catch {
      showToast('Error al eliminar', 'error')
    }
  }

  const getTipoIcon = (tipo) => {
    const t = (tipo || '').toLowerCase()
    if (t.includes('solicitud') || t.includes('alquiler')) return '🔔'
    if (t.includes('pago')) return '💰'
    if (t.includes('ruta') || t.includes('entrega')) return '🚚'
    if (t.includes('alerta') || t.includes('warning')) return '⚠️'
    return '📌'
  }

  return (
    <div className={styles.page}>
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

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Notificaciones</h1>
        <p className={styles.pageDesc}>Consulta las notificaciones enviadas desde el sistema.</p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>X</button>
        </div>
      )}

      <div className={styles.filtersBar}>
        <button
          onClick={handleMarkAllRead}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, border: '1px solid var(--gray-200)',
            background: 'var(--white)', fontSize: '0.82rem', fontWeight: 500,
            color: 'var(--gray-600)', cursor: 'pointer',
          }}
        >
          <CheckCheck width={14} height={14} /> Marcar todas como leidas
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Notificaciones</h3>
            <span className={styles.tableCount}>{totalRecords}</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Titulo</th>
                <th>Mensaje</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th style={{ width: 80 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.tableEmpty}>Cargando notificaciones...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className={styles.tableEmpty}>No hay notificaciones</td></tr>
              ) : data.map((n, i) => (
                <tr key={n.uuid || i} style={{ opacity: n.leida ? 0.6 : 1 }}>
                  <td style={{ fontSize: '1.1rem' }}>{getTipoIcon(n.tipo)}</td>
                  <td><span className={styles.userName}>{n.titulo}</span></td>
                  <td><span className={styles.cellMuted} style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{n.mensaje}</span></td>
                  <td><span className={styles.cellProduct}>{n.tipo || '-'}</span></td>
                  <td><span className={styles.cellMuted}>{n.created_at ? new Date(n.created_at).toLocaleString('es-CO') : '-'}</span></td>
                  <td>
                    <span className={`${styles.badge} ${n.leida ? styles.badgeInactivo : styles.badgeActivo}`}>
                      <span className={styles.badgeDot} />
                      {n.leida ? 'Leida' : 'Nueva'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {!n.leida && (
                        <button className={styles.actionBtn} title="Marcar como leida" onClick={() => handleMarkRead(n.uuid)}>
                          <BellOff width={14} height={14} />
                        </button>
                      )}
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar" onClick={() => handleDelete(n.uuid)}>
                        <Trash2 width={14} height={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tablePagination}>
          <span className={styles.paginationInfo}>
            Mostrando {totalRecords > 0 ? Math.min((page - 1) * perPage + 1, totalRecords) : 0} - {Math.min(page * perPage, totalRecords)} de {totalRecords}
          </span>
          <div className={styles.paginationBtns}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
