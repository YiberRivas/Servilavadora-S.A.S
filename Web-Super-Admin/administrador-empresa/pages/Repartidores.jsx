import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, ChevronDown } from 'lucide-react'
import { getRepartidores, eliminarRepartidor } from '../services/empresa.service'
import styles from '../styles/pages/DashboardEmpresa.module.css'

export default function Repartidores() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [toast, setToast] = useState(null)
  const perPage = 10

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      const res = await getRepartidores(params)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar repartidores')
        setData([])
      }
    } catch {
      setError('Error de conexion al cargar repartidores')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async (rep) => {
    if (!window.confirm(`Eliminar repartidor ${rep.nombre_completo || rep.nombre || ''}?`)) return
    try {
      const res = await eliminarRepartidor(rep.uuid)
      if (res.success) {
        showToast('Repartidor eliminado')
        fetchData()
      } else {
        showToast(res.message || 'Error al eliminar', 'error')
      }
    } catch {
      showToast('Error de conexion', 'error')
    }
  }

  const getDisponibilidad = (rep) => {
    if (rep.disponible === true || rep.disponible === 1) return { text: 'Disponible', cls: styles.badgeActivo }
    if (rep.disponible === false || rep.disponible === 0) return { text: 'Ocupado', cls: styles.badgeInactivo }
    return { text: 'Sin estado', cls: '' }
  }

  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const colors = ['#2D6CB5', '#12A594', '#1F4E79', '#D64545', '#E8A317', '#7B2D8B']
  const getColor = (i) => colors[i % colors.length]

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
        <h1 className={styles.pageTitle}>Repartidores</h1>
        <p className={styles.pageDesc}>Administra el equipo de repartidores de tu empresa.</p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>X</button>
        </div>
      )}

      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <Search width={16} height={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, correo o telefono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Repartidores</h3>
            <span className={styles.tableCount}>{totalRecords}</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Repartidor</th>
                <th>Contacto</th>
                <th>Licencia</th>
                <th>Vence</th>
                <th>Disponibilidad</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className={styles.tableEmpty}>Cargando repartidores...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className={styles.tableEmpty}>No se encontraron repartidores</td></tr>
              ) : data.map((r, i) => {
                const disp = getDisponibilidad(r)
                return (
                  <tr key={r.uuid || i}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: getColor(i) }}>{getInitials(r.nombre_completo || r.nombre)}</div>
                        <div>
                          <span className={styles.userName}>{r.nombre_completo || r.nombre || '-'}</span>
                          <span className={styles.userEmail}>{r.correo || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.cellMuted}>{r.telefono || '-'}</span></td>
                    <td><span className={styles.cellMuted}>{r.licencia || '-'}</span></td>
                    <td><span className={styles.cellMuted}>{r.vence_licencia ? new Date(r.vence_licencia).toLocaleDateString('es-CO') : '-'}</span></td>
                    <td>
                      <span className={`${styles.badge} ${disp.cls}`}>
                        <span className={styles.badgeDot} />
                        {disp.text}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar" onClick={() => handleDelete(r)}><Trash2 width={14} height={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
