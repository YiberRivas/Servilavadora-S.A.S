import { useState, useMemo, useCallback } from 'react'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { usuarios as initialUsuarios } from '../data/mockData'
import styles from '../styles/pages/Usuarios.module.css'

const CIUDADES = ['Todas', 'Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Quibdo']
const ROLES = ['Todos', 'Cliente', 'Repartidor', 'Empresa']
const ESTADOS = ['Todos', 'Activo', 'Inactivo']

const getInitials = (nombre, apellido) => {
  return `${(nombre || '')[0] || ''}${(apellido || '')[0] || ''}`.toUpperCase()
}

const getRolBadgeClass = (rol) => {
  const map = { Cliente: styles.badgeRolCliente, Repartidor: styles.badgeRolRepartidor, Empresa: styles.badgeRolEmpresa }
  return map[rol] || styles.badgeRol
}

const getEstadoBadgeClass = (estado) => {
  return estado === 'activo' ? styles.badgeEstado : styles.badgeEstadoInactivo
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const EMPTY_FORM = {
  nombre: '', apellido: '', email: '', telefono: '', rol: 'Cliente', ciudad: 'Bogota', estado: 'activo', password: '', confirmPassword: '', observaciones: ''
}

export default function Usuarios() {
  const [datos, setDatos] = useState(initialUsuarios)
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('Todos')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [filterCiudad, setFilterCiudad] = useState('Todas')
  const [filterFechaDesde, setFilterFechaDesde] = useState('')
  const [filterFechaHasta, setFilterFechaHasta] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [formErrors, setFormErrors] = useState({})

  const [showDetail, setShowDetail] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)

  const stats = useMemo(() => {
    const total = datos.length
    const clientes = datos.filter(u => u.rol === 'Cliente').length
    const repartidores = datos.filter(u => u.rol === 'Repartidor').length
    const empresas = datos.filter(u => u.rol === 'Empresa').length
    const activos = datos.filter(u => u.estado === 'activo').length
    const inactivos = datos.filter(u => u.estado === 'inactivo').length
    return { total, clientes, repartidores, empresas, activos, inactivos }
  }, [datos])

  const filtered = useMemo(() => {
    return datos.filter(u => {
      const term = search.toLowerCase()
      if (term) {
        const fullName = `${u.nombre} ${u.apellido}`.toLowerCase()
        const matchName = fullName.includes(term)
        const matchEmail = u.email.toLowerCase().includes(term)
        const matchPhone = (u.telefono || '').includes(term)
        if (!matchName && !matchEmail && !matchPhone) return false
      }
      if (filterRol !== 'Todos' && u.rol !== filterRol) return false
      if (filterEstado !== 'Todos') {
        const estadoFilter = filterEstado === 'Activo' ? 'activo' : 'inactivo'
        if (u.estado !== estadoFilter) return false
      }
      if (filterCiudad !== 'Todas' && u.ciudad !== filterCiudad) return false
      if (filterFechaDesde && u.fechaRegistro < filterFechaDesde) return false
      if (filterFechaHasta && u.fechaRegistro > filterFechaHasta) return false
      return true
    })
  }, [datos, search, filterRol, filterEstado, filterCiudad, filterFechaDesde, filterFechaHasta])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, safePage, rowsPerPage])

  const activeFilters = useMemo(() => {
    const filters = []
    if (search) filters.push({ label: `Busqueda: "${search}"`, clear: () => { setSearch(''); setPage(1) } })
    if (filterRol !== 'Todos') filters.push({ label: `Rol: ${filterRol}`, clear: () => { setFilterRol('Todos'); setPage(1) } })
    if (filterEstado !== 'Todos') filters.push({ label: `Estado: ${filterEstado}`, clear: () => { setFilterEstado('Todos'); setPage(1) } })
    if (filterCiudad !== 'Todas') filters.push({ label: `Ciudad: ${filterCiudad}`, clear: () => { setFilterCiudad('Todas'); setPage(1) } })
    if (filterFechaDesde) filters.push({ label: `Desde: ${formatDate(filterFechaDesde)}`, clear: () => setFilterFechaDesde('') })
    if (filterFechaHasta) filters.push({ label: `Hasta: ${formatDate(filterFechaHasta)}`, clear: () => setFilterFechaHasta('') })
    return filters
  }, [search, filterRol, filterEstado, filterCiudad, filterFechaDesde, filterFechaHasta])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilterRol('Todos')
    setFilterEstado('Todos')
    setFilterCiudad('Todas')
    setFilterFechaDesde('')
    setFilterFechaHasta('')
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
  }, [])

  const handleRowsPerPageChange = useCallback((value) => {
    setRowsPerPage(value)
    setPage(1)
  }, [])

  const openCreateForm = useCallback(() => {
    setEditingUser(null)
    setFormData({ ...EMPTY_FORM })
    setFormErrors({})
    setShowForm(true)
  }, [])

  const openEditForm = useCallback((user) => {
    setEditingUser(user)
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      email: user.email || '',
      telefono: user.telefono || '',
      rol: user.rol || 'Cliente',
      ciudad: user.ciudad || 'Bogota',
      estado: user.estado || 'activo',
      password: '',
      confirmPassword: '',
      observaciones: user.observaciones || ''
    })
    setFormErrors({})
    setShowForm(true)
  }, [])

  const openDetailView = useCallback((user) => {
    setViewingUser(user)
    setShowDetail(true)
  }, [])

  const openDeleteConfirm = useCallback((user) => {
    setDeletingUser(user)
    setShowDeleteConfirm(true)
  }, [])

  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }, [formErrors])

  const validateForm = useCallback(() => {
    const errors = {}
    if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio.'
    if (!formData.apellido.trim()) errors.apellido = 'El apellido es obligatorio.'
    if (!formData.email.trim()) errors.email = 'El correo es obligatorio.'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Correo invalido.'
    if (!editingUser) {
      if (!formData.password) errors.password = 'La contrasena es obligatoria.'
      else if (formData.password.length < 6) errors.password = 'Minimo 6 caracteres.'
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contrasenas no coinciden.'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, editingUser])

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return

    if (editingUser) {
      setDatos(prev => prev.map(u =>
        u.id === editingUser.id ? { ...u, ...formData } : u
      ))
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
        fechaRegistro: new Date().toISOString().split('T')[0],
        ultimoAcceso: new Date().toISOString().split('T')[0],
        serviciosRealizados: 0,
        color: ['#2D6CB5', '#12A594', '#1F4E79'][Math.floor(Math.random() * 3)]
      }
      setDatos(prev => [newUser, ...prev])
    }
    setShowForm(false)
    setEditingUser(null)
  }, [formData, editingUser, validateForm])

  const handleDelete = useCallback(() => {
    if (!deletingUser) return
    setDatos(prev => prev.filter(u => u.id !== deletingUser.id))
    setShowDeleteConfirm(false)
    setDeletingUser(null)
  }, [deletingUser])

  const handleToggleEstado = useCallback((user) => {
    setDatos(prev => prev.map(u =>
      u.id === user.id ? { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' } : u
    ))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>Gestion de Usuarios</h1>
            <p className={styles.headerDesc}>Administra todos los usuarios registrados en la plataforma.</p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btnPrimary btnSm" onClick={openCreateForm}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" label="Total Usuarios" value={stats.total} variant="blue" />
        <StatCard icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" label="Clientes" value={stats.clientes} variant="accent" />
        <StatCard icon="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" label="Repartidores" value={stats.repartidores} variant="warning" />
        <StatCard icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" label="Empresas" value={stats.empresas} variant="blue" />
        <StatCard icon="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" label="Activos" value={stats.activos} variant="accent" />
        <StatCard icon="M18 6L6 18M6 6l12 12" label="Inactivos" value={stats.inactivos} variant="danger" />
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <div className={styles.filterHeaderLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span className={styles.filterTitle}>Filtros de busqueda</span>
          </div>
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Buscar</label>
            <input
              className={styles.filterInput}
              type="text"
              placeholder="Nombre, correo o telefono..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Rol</label>
            <select className={styles.filterInput} value={filterRol} onChange={(e) => { setFilterRol(e.target.value); setPage(1) }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado</label>
            <select className={styles.filterInput} value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ciudad</label>
            <select className={styles.filterInput} value={filterCiudad} onChange={(e) => { setFilterCiudad(e.target.value); setPage(1) }}>
              {CIUDADES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fecha desde</label>
            <input
              className={styles.filterInput}
              type="date"
              value={filterFechaDesde}
              onChange={(e) => { setFilterFechaDesde(e.target.value); setPage(1) }}
            />
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className="btn btnOutline btnSm" onClick={clearFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Limpiar filtros
          </button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className={styles.activeFilters}>
          {activeFilters.map((f, i) => (
            <span key={i} className={styles.activeFilterTag}>
              {f.label}
              <button onClick={f.clear} aria-label="Quitar filtro">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <span className={styles.tableTitle}>Usuarios registrados</span>
            <span className={styles.tableCount}>{filtered.length}</span>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No se encontraron usuarios</h3>
            <p className={styles.emptyDesc}>Intenta ajustar los filtros de busqueda para encontrar lo que necesitas.</p>
            <button className="btn btnOutline btnSm" onClick={clearFilters}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Telefono</th>
                  <th>Rol</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Ultimo acceso</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: user.color || '#2D6CB5' }}>
                          {getInitials(user.nombre, user.apellido)}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.nombre} {user.apellido}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.phoneCell}>{user.telefono || '-'}</span></td>
                    <td><span className={`${styles.badge} ${getRolBadgeClass(user.rol)}`}>{user.rol}</span></td>
                    <td>{user.ciudad}</td>
                    <td>
                      <span className={`${styles.badge} ${getEstadoBadgeClass(user.estado)}`}>
                        <span className={styles.badgeDot}></span>
                        {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td><span className={styles.dateCell}>{formatDate(user.fechaRegistro)}</span></td>
                    <td><span className={styles.dateCell}>{formatDate(user.ultimoAcceso)}</span></td>
                    <td>
                      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver" onClick={() => openDetailView(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="Editar" onClick={() => openEditForm(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnToggle}`}
                          title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleEstado(user)}
                        >
                          {user.estado === 'activo' ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                              <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                          )}
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar" onClick={() => openDeleteConfirm(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalRecords={filtered.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingUser ? 'Editar usuario' : 'Nuevo usuario'} wide>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => handleFormChange('nombre', e.target.value)}
            />
            {formErrors.nombre && <span className={styles.formError}>{formErrors.nombre}</span>}
          </div>

          <div className={styles.formField}>
            <label>Apellidos</label>
            <input
              type="text"
              placeholder="Apellidos"
              value={formData.apellido}
              onChange={(e) => handleFormChange('apellido', e.target.value)}
            />
            {formErrors.apellido && <span className={styles.formError}>{formErrors.apellido}</span>}
          </div>

          <div className={styles.formField}>
            <label>Correo electronico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
            />
            {formErrors.email && <span className={styles.formError}>{formErrors.email}</span>}
          </div>

          <div className={styles.formField}>
            <label>Telefono</label>
            <input
              type="tel"
              placeholder="300 123 4567"
              value={formData.telefono}
              onChange={(e) => handleFormChange('telefono', e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label>Rol</label>
            <select value={formData.rol} onChange={(e) => handleFormChange('rol', e.target.value)}>
              <option value="Cliente">Cliente</option>
              <option value="Repartidor">Repartidor</option>
              <option value="Empresa">Empresa</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label>Ciudad</label>
            <select value={formData.ciudad} onChange={(e) => handleFormChange('ciudad', e.target.value)}>
              {CIUDADES.filter(c => c !== 'Todas').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.formField}>
            <label>Estado</label>
            <select value={formData.estado} onChange={(e) => handleFormChange('estado', e.target.value)}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>

          <div className={styles.formField}>
            <label>Observaciones</label>
            <input
              type="text"
              placeholder="Notas adicionales..."
              value={formData.observaciones}
              onChange={(e) => handleFormChange('observaciones', e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label>Contrasena {editingUser && '(dejar vacio para no cambiar)'}</label>
            <input
              type="password"
              placeholder="Minimo 6 caracteres"
              value={formData.password}
              onChange={(e) => handleFormChange('password', e.target.value)}
            />
            {formErrors.password && <span className={styles.formError}>{formErrors.password}</span>}
          </div>

          <div className={styles.formField}>
            <label>Confirmar contrasena</label>
            <input
              type="password"
              placeholder="Repetir contrasena"
              value={formData.confirmPassword}
              onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
            />
            {formErrors.confirmPassword && <span className={styles.formError}>{formErrors.confirmPassword}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
          <button className="btn btnOutline btnSm" onClick={() => setShowForm(false)}>Cancelar</button>
          <button className="btn btnPrimary btnSm" onClick={handleSubmit}>
            {editingUser ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </Modal>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detalle del usuario" wide>
        {viewingUser && (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailAvatar} style={{ background: viewingUser.color || '#2D6CB5' }}>
                {getInitials(viewingUser.nombre, viewingUser.apellido)}
              </div>
              <div className={styles.detailInfo}>
                <h3 className={styles.detailName}>{viewingUser.nombre} {viewingUser.apellido}</h3>
                <p className={styles.detailEmail}>{viewingUser.email}</p>
                <div className={styles.detailBadges}>
                  <span className={`${styles.badge} ${getRolBadgeClass(viewingUser.rol)}`}>{viewingUser.rol}</span>
                  <span className={`${styles.badge} ${getEstadoBadgeClass(viewingUser.estado)}`}>
                    <span className={styles.badgeDot}></span>
                    {viewingUser.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Telefono</span>
                <span className={styles.detailValue}>{viewingUser.telefono || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Ciudad</span>
                <span className={styles.detailValue}>{viewingUser.ciudad}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fecha de registro</span>
                <span className={styles.detailValue}>{formatDate(viewingUser.fechaRegistro)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Ultimo acceso</span>
                <span className={styles.detailValue}>{formatDate(viewingUser.ultimoAcceso)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Servicios realizados</span>
                <span className={styles.detailValue}>{viewingUser.serviciosRealizados || 0}</span>
              </div>

              {viewingUser.observaciones && (
                <div className={styles.detailObservaciones}>
                  <h4 className={styles.detailObservacionesTitle}>Observaciones</h4>
                  <p className={styles.detailObservacionesText}>{viewingUser.observaciones}</p>
                </div>
              )}
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Estas seguro de eliminar a ${deletingUser?.nombre} ${deletingUser?.apellido}? Esta accion no se puede deshacer.`}
      />
    </div>
  )
}
