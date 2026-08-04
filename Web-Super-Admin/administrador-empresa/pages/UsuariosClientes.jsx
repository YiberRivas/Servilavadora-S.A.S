import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { getClientes } from '../services/empresa.service'
import styles from '../styles/pages/DashboardEmpresa.module.css'

export default function UsuariosClientes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const perPage = 10

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      const res = await getClientes(params)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar clientes')
        setData([])
      }
    } catch {
      setError('Error de conexion al cargar clientes')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])
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

  const getInitials = (name) => {
    if (!name) return '??'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const colors = ['#2D6CB5', '#12A594', '#1F4E79', '#D64545', '#E8A317', '#7B2D8B']
  const getColor = (i) => colors[i % colors.length]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Usuarios / Clientes</h1>
        <p className={styles.pageDesc}>Gestiona todos los clientes que alquilan tus lavadoras.</p>
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
            placeholder="Buscar por nombre, correo o documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Listado de clientes</h3>
            <span className={styles.tableCount}>{totalRecords}</span>
          </div>
          <div className={styles.sortGroup}>
            {[
              { key: 'nombre_completo', label: 'Nombre' },
              { key: 'correo', label: 'Correo' },
              { key: 'fecha_registro', label: 'Registro' },
            ].map(opt => (
              <button
                key={opt.key}
                className={`${styles.sortBtn} ${sortKey === opt.key ? styles.sortBtnActive : ''}`}
                onClick={() => handleSort(opt.key)}
              >
                {opt.label}
                <ChevronDown width={12} height={12} style={{ transform: sortKey === opt.key && sortDir === 'desc' ? 'rotate(180deg)' : 'none' }} />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Documento</th>
                <th onClick={() => handleSort('fecha_registro')}>Registro</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className={styles.tableEmpty}>Cargando clientes...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={5} className={styles.tableEmpty}>No se encontraron clientes</td></tr>
              ) : sorted.map((c, i) => (
                <tr key={c.uuid || i}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar} style={{ background: getColor(i) }}>{getInitials(c.nombre_completo)}</div>
                      <div>
                        <span className={styles.userName}>{c.nombre_completo}</span>
                        <span className={styles.userEmail}>{c.correo}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.cellMuted}>{c.telefono || '-'}</span></td>
                  <td><span className={styles.cellMuted}>{c.numero_documento || '-'}</span></td>
                  <td><span className={styles.cellMuted}>{c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString('es-CO') : '-'}</span></td>
                  <td>
                    <div className={styles.actions}>
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
