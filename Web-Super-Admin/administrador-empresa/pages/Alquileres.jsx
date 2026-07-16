import { useState, useMemo } from 'react'
import { RefreshCw, TrendingUp, Clock, AlertTriangle, Search, ChevronDown, Eye } from 'lucide-react'
import { alquileres } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ITEMS_PER_PAGE = 8

const estadoBadge = {
  activo: { cls: styles.badgeActivo, text: 'Activo' },
  finalizado: { cls: styles.badgeFinalizado, text: 'Finalizado' },
  atrasado: { cls: styles.badgeAtrasado, text: 'Atrasado' },
}

function formatCurrency(n) {
  return '$' + n.toLocaleString('es-CO')
}

export default function Alquileres() {
  const [filterEstado, setFilterEstado] = useState('todos')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const stats = useMemo(() => ({
    activos: alquileres.filter(a => a.estado === 'activo').length,
    delMes: alquileres.filter(a => a.fechaInicio >= '2026-07-01' && a.fechaInicio <= '2026-07-31').length,
    atrasados: alquileres.filter(a => a.estado === 'atrasado').length,
    totalMonto: alquileres.reduce((sum, a) => sum + a.monto, 0),
  }), [])

  const filtered = useMemo(() => {
    let result = [...alquileres]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(a => a.usuario.toLowerCase().includes(q) || a.lavadora.toLowerCase().includes(q))
    }
    if (filterEstado !== 'todos') {
      result = result.filter(a => a.estado === filterEstado)
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
        <h1 className={styles.pageTitle}>Alquileres</h1>
        <p className={styles.pageDesc}>Monitorea todos los alquileres de lavadoras a tus clientes.</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { icon: RefreshCw, label: 'Alquileres activos', value: stats.activos, bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
          { icon: TrendingUp, label: 'Alquileres del mes', value: stats.delMes, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
          { icon: AlertTriangle, label: 'Alquileres atrasados', value: stats.atrasados, bg: 'var(--danger-tint)', color: 'var(--danger)' },
          { icon: Clock, label: 'Total facturado', value: formatCurrency(stats.totalMonto), bg: 'var(--warning-tint)', color: 'var(--warning)' },
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
            placeholder="Buscar por usuario o lavadora..."
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
          <option value="activo">Activos</option>
          <option value="finalizado">Finalizados</option>
          <option value="atrasado">Atrasados</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Historial de alquileres</h3>
            <span className={styles.tableCount}>{filtered.length}</span>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('usuario')}>Usuario</th>
                <th onClick={() => handleSort('lavadora')}>Lavadora</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th onClick={() => handleSort('estado')}>Estado</th>
                <th onClick={() => handleSort('monto')}>Monto</th>
                <th style={{ width: 60 }}>Info</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className={styles.tableEmpty}>No se encontraron alquileres</td></tr>
              ) : paged.map(a => {
                const badge = estadoBadge[a.estado] || estadoBadge.activo
                return (
                  <tr key={a.id}>
                    <td><span className={styles.userName}>{a.usuario}</span></td>
                    <td><span className={styles.cellProduct}>{a.lavadora}</span></td>
                    <td><span className={styles.cellMuted}>{a.fechaInicio}</span></td>
                    <td><span className={styles.cellMuted}>{a.fechaFin}</span></td>
                    <td>
                      <span className={`${styles.badge} ${badge.cls}`}>
                        <span className={styles.badgeDot} />
                        {badge.text}
                      </span>
                    </td>
                    <td><span className={styles.cellMuted}>{formatCurrency(a.monto)}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} title="Ver detalle"><Eye width={14} height={14} /></button>
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
