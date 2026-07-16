import { useState, useMemo } from 'react'
import { Search, Eye, Mail, Trash2, ChevronDown, Check, Filter } from 'lucide-react'
import { usuariosClientes } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ITEMS_PER_PAGE = 8

const productos = [...new Set(usuariosClientes.map(u => u.producto))]

export default function UsuariosClientes() {
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterProducto, setFilterProducto] = useState('todos')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')

  const filtered = useMemo(() => {
    let result = [...usuariosClientes]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(u =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.telefono.includes(q)
      )
    }

    if (filterEstado !== 'todos') {
      result = result.filter(u => u.estado === filterEstado)
    }

    if (filterProducto !== 'todos') {
      result = result.filter(u => u.producto === filterProducto)
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
  }, [search, filterEstado, filterProducto, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Usuarios / Clientes</h1>
        <p className={styles.pageDesc}>Gestiona todos los usuarios que alquilan tus lavadoras.</p>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <Search width={16} height={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, correo o telefono..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter width={14} height={14} className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={filterEstado}
            onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <select
            className={styles.filterSelect}
            value={filterProducto}
            onChange={(e) => { setFilterProducto(e.target.value); setPage(1) }}
          >
            <option value="todos">Todos los productos</option>
            {productos.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <h3 className={styles.tableTitle}>Listado completo</h3>
            <span className={styles.tableCount}>{filtered.length}</span>
          </div>
          <div className={styles.sortGroup}>
            {[
              { key: 'nombre', label: 'Nombre' },
              { key: 'producto', label: 'Producto' },
              { key: 'fechaRegistro', label: 'Registro' },
              { key: 'estado', label: 'Estado' },
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
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Producto alquilado</th>
                <th onClick={() => handleSort('fechaRegistro')}>Registro</th>
                <th onClick={() => handleSort('fechaAlquiler')}>Ultimo alquiler</th>
                <th>Estado</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} className={styles.tableEmpty}>No se encontraron usuarios</td></tr>
              ) : paged.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar} style={{ background: u.color }}>{u.avatar}</div>
                      <div>
                        <span className={styles.userName}>{u.nombre}</span>
                        <span className={styles.userEmail}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.cellMuted}>{u.telefono}</span></td>
                  <td><span className={styles.cellProduct}>{u.producto}</span></td>
                  <td><span className={styles.cellMuted}>{u.fechaRegistro}</span></td>
                  <td><span className={styles.cellMuted}>{u.fechaAlquiler}</span></td>
                  <td>
                    <span className={`${styles.badge} ${u.estado === 'activo' ? styles.badgeActivo : styles.badgeInactivo}`}>
                      <span className={styles.badgeDot} />
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Ver detalle"><Eye width={14} height={14} /></button>
                      <button className={styles.actionBtn} title="Contactar"><Mail width={14} height={14} /></button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar"><Trash2 width={14} height={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
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
