import { useState } from 'react'
import { Mail, Phone, MoreHorizontal, ChevronDown, Check } from 'lucide-react'
import { usuariosClientes } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ITEMS_PER_PAGE = 5

export default function TablaUsuarios() {
  const [selected, setSelected] = useState(new Set())
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [openSort, setOpenSort] = useState(null)

  const totalPages = Math.ceil(usuariosClientes.length / ITEMS_PER_PAGE)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setOpenSort(null)
  }

  const sorted = [...usuariosClientes].sort((a, b) => {
    if (!sortKey) return 0
    const va = a[sortKey] || ''
    const vb = b[sortKey] || ''
    const cmp = String(va).localeCompare(String(vb), 'es')
    return sortDir === 'asc' ? cmp : -cmp
  })

  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paged.map(u => u.id)))
    }
  }

  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSortMenu = (key) => {
    setOpenSort(prev => prev === key ? null : key)
  }

  const sortOptions = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'producto', label: 'Producto' },
    { key: 'fechaAlquiler', label: 'Fecha' },
    { key: 'estado', label: 'Info' },
  ]

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableHeader}>
        <div className={styles.tableHeaderLeft}>
          <h3 className={styles.tableTitle}>Usuarios / Clientes</h3>
          <span className={styles.tableCount}>{usuariosClientes.length}</span>
        </div>
        <div className={styles.sortGroup}>
          {sortOptions.map(opt => (
            <div key={opt.key} className={styles.sortDropdownWrap}>
              <button
                className={`${styles.sortBtn} ${sortKey === opt.key ? styles.sortBtnActive : ''}`}
                onClick={() => toggleSortMenu(opt.key)}
              >
                {opt.label}
                <ChevronDown width={12} height={12} />
              </button>
              {openSort === opt.key && (
                <div className={styles.sortMenu}>
                  <button className={styles.sortMenuItem} onClick={() => { handleSort(opt.key); setOpenSort(null) }}>
                    <span>Ascendente</span>
                    {sortKey === opt.key && sortDir === 'asc' && <Check width={12} height={12} />}
                  </button>
                  <button className={styles.sortMenuItem} onClick={() => { setSortKey(opt.key); setSortDir('desc'); setOpenSort(null) }}>
                    <span>Descendente</span>
                    {sortKey === opt.key && sortDir === 'desc' && <Check width={12} height={12} />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selected.size === paged.length && paged.length > 0}
                  onChange={toggleAll}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </th>
              <th>Usuario</th>
              <th>Producto alquilado</th>
              <th>Fecha de alquiler</th>
              <th>Estado</th>
              <th style={{ width: 80 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.tableEmpty}>Sin registros</td>
              </tr>
            ) : (
              paged.map((u) => (
                <tr key={u.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleOne(u.id)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                  </td>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar} style={{ background: u.color }}>{u.avatar}</div>
                      <div>
                        <span className={styles.userName}>{u.nombre}</span>
                        <span className={styles.userEmail}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.producto}</td>
                  <td>{u.fechaAlquiler}</td>
                  <td>
                    <span className={`${styles.badge} ${u.estado === 'activo' ? styles.badgeActivo : styles.badgeInactivo}`}>
                      <span className={styles.badgeDot} />
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="Contactar">
                        <Mail width={14} height={14} />
                      </button>
                      <button className={styles.actionBtn} title="Enviar mensaje">
                        <Phone width={14} height={14} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnMore}`} title="Mas opciones">
                        <MoreHorizontal width={14} height={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.tablePagination}>
        <span className={styles.paginationInfo}>
          Mostrando {Math.min((page - 1) * ITEMS_PER_PAGE + 1, usuariosClientes.length)} - {Math.min(page * ITEMS_PER_PAGE, usuariosClientes.length)} de {usuariosClientes.length}
        </span>
        <div className={styles.paginationBtns}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
