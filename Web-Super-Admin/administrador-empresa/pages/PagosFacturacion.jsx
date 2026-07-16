import { useState, useMemo } from 'react'
import { DollarSign, Clock, AlertTriangle, TrendingUp, Search, Eye, Download, ChevronDown } from 'lucide-react'
import { pagos } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ITEMS_PER_PAGE = 8

const estadoBadge = {
  pagado: { cls: styles.badgePagado, text: 'Pagado' },
  pendiente: { cls: styles.badgePendiente, text: 'Pendiente' },
  vencido: { cls: styles.badgeVencido, text: 'Vencido' },
}

function formatCurrency(n) {
  return '$' + n.toLocaleString('es-CO')
}

export default function PagosFacturacion() {
  const [filterEstado, setFilterEstado] = useState('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const stats = useMemo(() => ({
    ingresosMes: pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0),
    pendientes: pagos.filter(p => p.estado === 'pendiente').length,
    totalFacturado: pagos.reduce((s, p) => s + p.monto, 0),
  }), [])

  const filtered = useMemo(() => {
    let result = [...pagos]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(p => p.usuario.toLowerCase().includes(q) || p.lavadora.toLowerCase().includes(q) || p.factura.toLowerCase().includes(q))
    }
    if (filterEstado !== 'todos') {
      result = result.filter(p => p.estado === filterEstado)
    }
    if (sortKey) {
      result.sort((a, b) => {
        const va = a[sortKey] || ''
        const vb = b[sortKey] || ''
        const cmp = String(va).localeCompare(String(vb), 'es')
        return sortDir === 'asc' ? cmp : -cmp
      })
    }
    return result
  }, [search, filterEstado, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pagos / Facturacion</h1>
        <p className={styles.pageDesc}>Consulta todos los pagos recibidos y facturas generadas.</p>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <Search width={16} height={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por usuario, lavadora o factura..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}
        >
          <option value="todos">Todos los estados</option>
          <option value="pagado">Pagados</option>
          <option value="pendiente">Pendientes</option>
          <option value="vencido">Vencidos</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Historial de pagos</h3>
            <span className={styles.tableCount}>{filtered.length}</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('usuario')}>Usuario</th>
                <th>Lavadora</th>
                <th>Factura</th>
                <th onClick={() => handleSort('monto')}>Monto</th>
                <th>Metodo</th>
                <th onClick={() => handleSort('fecha')}>Fecha</th>
                <th onClick={() => handleSort('estado')}>Estado</th>
                <th style={{ width: 60 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className={styles.tableEmpty}>No se encontraron pagos</td></tr>
              ) : paged.map(p => {
                const badge = estadoBadge[p.estado] || estadoBadge.pagado
                return (
                  <tr key={p.id}>
                    <td><span className={styles.userName}>{p.usuario}</span></td>
                    <td><span className={styles.cellProduct}>{p.lavadora}</span></td>
                    <td><span className={styles.cellMuted}>{p.factura}</span></td>
                    <td><span className={styles.cellMuted}>{formatCurrency(p.monto)}</span></td>
                    <td><span className={styles.cellMuted}>{p.metodo}</span></td>
                    <td><span className={styles.cellMuted}>{p.fecha}</span></td>
                    <td>
                      <span className={`${styles.badge} ${badge.cls}`}>
                        <span className={styles.badgeDot} />
                        {badge.text}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} title="Ver factura"><Eye width={14} height={14} /></button>
                        <button className={styles.actionBtn} title="Descargar"><Download width={14} height={14} /></button>
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
            Mostrando {filtered.length > 0 ? Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length) : 0} - {Math.min(page * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
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
