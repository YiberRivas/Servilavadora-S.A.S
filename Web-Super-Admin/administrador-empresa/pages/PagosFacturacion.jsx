import { useState, useEffect, useCallback } from 'react'
import { Search, DollarSign, Clock, TrendingUp, ChevronDown } from 'lucide-react'
import { getPagos } from '../services/empresa.service'
import styles from '../styles/pages/DashboardEmpresa.module.css'

function formatCurrency(n) {
  return '$' + (n || 0).toLocaleString('es-CO')
}

export default function PagosFacturacion() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [stats, setStats] = useState({ ingresosMes: 0, pendientes: 0, totalFacturado: 0 })
  const perPage = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      const res = await getPagos(params)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar pagos')
        setData([])
      }
    } catch {
      setError('Error de conexion al cargar pagos')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  const fetchStats = useCallback(async () => {
    try {
      const res = await getPagos({ per_page: 1000 })
      if (res.success && res.data) {
        const all = res.data
        setStats({
          ingresosMes: all.filter(p => (p.estado_codigo || p.estado) === 'pagado').reduce((s, p) => s + (p.valor || p.monto || 0), 0),
          pendientes: all.filter(p => (p.estado_codigo || p.estado) === 'pendiente').length,
          totalFacturado: all.reduce((s, p) => s + (p.valor || p.monto || 0), 0),
        })
      }
    } catch {}
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { setPage(1) }, [search])

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const va = a[sortKey] || ''
    const vb = b[sortKey] || ''
    const cmp = String(va).localeCompare(String(vb), 'es')
    return sortDir === 'asc' ? cmp : -cmp
  })

  const estadoBadge = {
    pagado: { cls: styles.badgeActivo, text: 'Pagado' },
    pendiente: { cls: styles.badgePendiente || styles.badgeInactivo, text: 'Pendiente' },
    vencido: { cls: styles.badgeInactivo, text: 'Vencido' },
    cancelado: { cls: styles.badgeInactivo, text: 'Cancelado' },
  }

  const getBadge = (p) => {
    const code = (p.estado_codigo || p.estado || '').toLowerCase()
    return estadoBadge[code] || { cls: '', text: code || 'Sin estado' }
  }

  return (
    <div className={styles.page}>
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>X</button>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pagos / Facturacion</h1>
        <p className={styles.pageDesc}>Consulta todos los pagos recibidos y facturas generadas.</p>
      </div>

      <div className={styles.statsRow}>
        {[
          { icon: TrendingUp, label: 'Ingresos del mes', value: formatCurrency(stats.ingresosMes), bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
          { icon: Clock, label: 'Pagos pendientes', value: stats.pendientes, bg: 'var(--warning-tint)', color: 'var(--warning)' },
          { icon: DollarSign, label: 'Total facturado', value: formatCurrency(stats.totalFacturado), bg: 'var(--blue-100)', color: 'var(--blue-700)' },
        ].map((s, i) => (
          <div key={i} className={styles.miniStat} style={{ flex: 1 }}>
            <div className={styles.miniStatIcon} style={{ background: s.bg, color: s.color }}>
              <s.icon width={18} height={18} />
            </div>
            <div className={styles.miniStatInfo}>
              <span className={styles.miniStatValue}>{s.value}</span>
              <span className={styles.miniStatLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <Search width={16} height={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por referencia o transaccion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Historial de pagos</h3>
            <span className={styles.tableCount}>{totalRecords}</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Referencia</th>
                <th onClick={() => handleSort('valor')}>Monto</th>
                <th>Metodo</th>
                <th onClick={() => handleSort('fecha_pago')}>Fecha</th>
                <th onClick={() => handleSort('estado')}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className={styles.tableEmpty}>Cargando pagos...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={5} className={styles.tableEmpty}>No se encontraron pagos</td></tr>
              ) : sorted.map((p, i) => {
                const badge = getBadge(p)
                return (
                  <tr key={p.uuid || i}>
                    <td><span className={styles.userName}>{p.numero_transaccion || p.referencia || '-'}</span></td>
                    <td><span className={styles.cellMuted}>{formatCurrency(p.valor)}</span></td>
                    <td><span className={styles.cellProduct}>{p.metodo_pago || p.metodo_pago_nombre || '-'}</span></td>
                    <td><span className={styles.cellMuted}>{p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-CO') : '-'}</span></td>
                    <td>
                      <span className={`${styles.badge} ${badge.cls}`}>
                        <span className={styles.badgeDot} />
                        {badge.text}
                      </span>
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
