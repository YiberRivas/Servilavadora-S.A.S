import { useState, useEffect, useCallback } from 'react'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { api } from '../services/api'
import styles from '../styles/pages/Usuarios.module.css'

const ESTADOS = ['Todos', 'Activo', 'Inactivo']

const getInitials = (nombre) => {
  if (!nombre) return ''
  const parts = nombre.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return parts[0].substring(0, 2).toUpperCase()
}

const getRolBadgeClass = (rol) => {
  const map = {
    Cliente: styles.badgeRolCliente,
    Repartidor: styles.badgeRolRepartidor,
    Empresa: styles.badgeRolEmpresa,
  }
  return map[rol] || styles.badgeRol
}

const getEstadoBadgeClass = (estado) => {
  return estado === 'Activo' || estado === 1 ? styles.badgeEstado : styles.badgeEstadoInactivo
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const EMPTY_FORM = {
  username: '',
  nombre_completo: '',
  numero_documento: '',
  correo: '',
  telefono: '',
  id_rol: '',
  id_estado_usuario: '',
  password: '',
  confirmPassword: '',
}

const AVATAR_COLORS = ['#2D6CB5', '#12A594', '#1F4E79', '#6B3FA0', '#C0392B', '#E67E22']

const getAvatarColor = (str) => {
  if (!str) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todos')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ ...EMPTY_FORM })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [showDetail, setShowDetail] = useState(false)
  const [viewingUser, setViewingUser] = useState(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingUser, setDeletingUser] = useState(null)

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterRol) params.set('id_rol', filterRol)
      if (filterEstado !== 'Todos') {
        params.set('id_estado', filterEstado === 'Activo' ? '1' : '0')
      }
      params.set('page', String(page))
      params.set('per_page', String(rowsPerPage))

      const res = await api.get(`/usuarios?${params.toString()}`)
      if (res.success) {
        setUsuarios(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar usuarios')
        setUsuarios([])
      }
    } catch {
      setError('Error de conexion al cargar usuarios')
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }, [search, filterRol, filterEstado, page, rowsPerPage])

  const fetchRoles = useCallback(async () => {
    try {
      const res = await api.get('/usuarios/roles/all')
      if (res.success) {
        setRoles(res.data || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  useEffect(() => {
    setPage(1)
  }, [search, filterRol, filterEstado, rowsPerPage])

  const stats = {
    total: totalRecords,
    activos: usuarios.filter((u) => u.estado === 'Activo' || u.estado === 1).length,
    inactivos: usuarios.filter((u) => u.estado === 'Inactivo' || u.estado === 0).length,
  }

  const activeFilters = []
  if (search) activeFilters.push({ label: `Busqueda: "${search}"`, clear: () => setSearch('') })
  if (filterRol) {
    const rolObj = roles.find((r) => r.uuid === filterRol)
    activeFilters.push({ label: `Rol: ${rolObj?.nombre || filterRol}`, clear: () => setFilterRol('') })
  }
  if (filterEstado !== 'Todos') activeFilters.push({ label: `Estado: ${filterEstado}`, clear: () => setFilterEstado('Todos') })

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilterRol('')
    setFilterEstado('Todos')
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
      username: user.username || '',
      nombre_completo: user.nombre_completo || '',
      numero_documento: user.numero_documento || '',
      correo: user.correo || '',
      telefono: user.telefono || '',
      id_rol: user.rol_codigo || '',
      id_estado_usuario: user.estado === 'Activo' || user.estado === 1 ? '1' : '0',
      password: '',
      confirmPassword: '',
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
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }, [formErrors])

  const validateForm = useCallback(() => {
    const errors = {}
    if (!formData.username.trim()) errors.username = 'El usuario es obligatorio.'
    if (!editingUser) {
      if (!formData.password) errors.password = 'La contrasena es obligatoria.'
      else if (formData.password.length < 6) errors.password = 'Minimo 6 caracteres.'
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contrasenas no coinciden.'
    }
    if (!formData.id_rol) errors.id_rol = 'El rol es obligatorio.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData, editingUser])

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return
    setSubmitting(true)
    try {
      if (editingUser) {
        const body = {
          username: formData.username,
          id_rol: formData.id_rol,
          id_estado_usuario: formData.id_estado_usuario,
          estado: formData.id_estado_usuario === '1' ? 1 : 0,
          nombre_completo: formData.nombre_completo,
          correo: formData.correo,
          telefono: formData.telefono,
          numero_documento: formData.numero_documento,
        }
        const res = await api.put(`/usuarios/${editingUser.uuid}`, body)
        if (!res.success) {
          setError(res.message || 'Error al actualizar usuario')
          return
        }
      } else {
        const body = {
          username: formData.username,
          password: formData.password,
          id_persona: null,
          id_rol: formData.id_rol,
          id_estado_usuario: formData.id_estado_usuario || '1',
          nombre_completo: formData.nombre_completo,
          correo: formData.correo,
          telefono: formData.telefono,
          numero_documento: formData.numero_documento,
        }
        const res = await api.post('/usuarios', body)
        if (!res.success) {
          setError(res.message || 'Error al crear usuario')
          return
        }
      }
      setShowForm(false)
      setEditingUser(null)
      await fetchUsuarios()
    } catch {
      setError('Error de conexion al guardar usuario')
    } finally {
      setSubmitting(false)
    }
  }, [formData, editingUser, validateForm, fetchUsuarios])

  const handleDelete = useCallback(async () => {
    if (!deletingUser) return
    try {
      const res = await api.delete(`/usuarios/${deletingUser.uuid}`)
      if (!res.success) {
        setError(res.message || 'Error al eliminar usuario')
        return
      }
      setShowDeleteConfirm(false)
      setDeletingUser(null)
      await fetchUsuarios()
    } catch {
      setError('Error de conexion al eliminar usuario')
    }
  }, [deletingUser, fetchUsuarios])

  const handleToggleEstado = useCallback(async (user) => {
    const newEstado = user.estado === 'Activo' || user.estado === 1 ? 0 : 1
    try {
      const res = await api.put(`/usuarios/${user.uuid}`, {
        estado: newEstado,
        id_estado_usuario: String(newEstado),
      })
      if (res.success) {
        await fetchUsuarios()
      } else {
        setError(res.message || 'Error al cambiar estado')
      }
    } catch {
      setError('Error de conexion al cambiar estado')
    }
  }, [fetchUsuarios])

  return (
    <div className={styles.page}>
      {error && (
        <div className={styles.activeFilters}>
          <span className={styles.activeFilterTag}>
            {error}
            <button onClick={() => setError(null)} aria-label="Cerrar">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        </div>
      )}

      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>Gestion de Usuarios</h1>
            <p className={styles.headerDesc}>Administra todos los usuarios registrados en la plataforma.</p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btnPrimary btnSm" onClick={openCreateForm}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" label="Total Usuarios" value={stats.total} variant="blue" />
        <StatCard icon="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" label="Activos" value={stats.activos} variant="accent" />
        <StatCard icon="M18 6L6 18M6 6l12 12" label="Inactivos" value={stats.inactivos} variant="danger" />
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <div className={styles.filterHeaderLeft}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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
              placeholder="Nombre, usuario o documento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Rol</label>
            <select className={styles.filterInput} value={filterRol} onChange={(e) => setFilterRol(e.target.value)}>
              <option value="">Todos</option>
              {roles.map((r) => (
                <option key={r.uuid} value={r.uuid}>{r.nombre}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado</label>
            <select className={styles.filterInput} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className="btn btnOutline btnSm" onClick={clearFilters}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
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
            <span className={styles.tableCount}>{totalRecords}</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>Cargando usuarios...</h3>
          </div>
        ) : usuarios.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No se encontraron usuarios</h3>
            <p className={styles.emptyDesc}>Intenta ajustar los filtros de busqueda para encontrar lo que necesitas.</p>
            <button className="btn btnOutline btnSm" onClick={clearFilters}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Ultimo login</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((user) => (
                  <tr key={user.uuid}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: getAvatarColor(user.username) }}>
                          {getInitials(user.nombre_completo || user.username)}
                        </div>
                        <div className={styles.userInfo}>
                          <div className={styles.userName}>{user.nombre_completo || user.username}</div>
                          <div className={styles.userEmail}>{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.phoneCell}>{user.telefono || '-'}</span></td>
                    <td><span className={`${styles.badge} ${getRolBadgeClass(user.rol_nombre)}`}>{user.rol_nombre || '-'}</span></td>
                    <td>
                      <span className={`${styles.badge} ${getEstadoBadgeClass(user.estado_nombre || user.estado)}`}>
                        <span className={styles.badgeDot}></span>
                        {user.estado_nombre || (user.estado === 1 ? 'Activo' : 'Inactivo')}
                      </span>
                    </td>
                    <td><span className={styles.dateCell}>{formatDate(user.created_at)}</span></td>
                    <td><span className={styles.dateCell}>{formatDateTime(user.ultimo_login)}</span></td>
                    <td>
                      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver" onClick={() => openDetailView(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="Editar" onClick={() => openEditForm(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnToggle}`}
                          title={(user.estado_nombre || user.estado) === 'Activo' || user.estado === 1 ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleEstado(user)}
                        >
                          {(user.estado_nombre || user.estado) === 'Activo' || user.estado === 1 ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar" onClick={() => openDeleteConfirm(user)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
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

        {totalRecords > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalRecords={totalRecords}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(1) }}
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingUser ? 'Editar usuario' : 'Nuevo usuario'} wide>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              disabled={!!editingUser}
            />
            {formErrors.username && <span className={styles.formError}>{formErrors.username}</span>}
          </div>

          <div className={styles.formField}>
            <label>Nombre completo</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={formData.nombre_completo}
              onChange={(e) => handleFormChange('nombre_completo', e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label>Numero de documento</label>
            <input
              type="text"
              placeholder="Cedula o NIT"
              value={formData.numero_documento}
              onChange={(e) => handleFormChange('numero_documento', e.target.value)}
            />
          </div>

          <div className={styles.formField}>
            <label>Correo electronico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={formData.correo}
              onChange={(e) => handleFormChange('correo', e.target.value)}
            />
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
            <select value={formData.id_rol} onChange={(e) => handleFormChange('id_rol', e.target.value)}>
              <option value="">Seleccionar rol</option>
              {roles.map((r) => (
                <option key={r.uuid} value={r.uuid}>{r.nombre}</option>
              ))}
            </select>
            {formErrors.id_rol && <span className={styles.formError}>{formErrors.id_rol}</span>}
          </div>

          <div className={styles.formField}>
            <label>Estado</label>
            <select value={formData.id_estado_usuario} onChange={(e) => handleFormChange('id_estado_usuario', e.target.value)}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
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

          {!editingUser && (
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
          )}
        </div>

        <div className={styles.formActions}>
          <button className="btn btnOutline btnSm" onClick={() => setShowForm(false)}>Cancelar</button>
          <button className="btn btnPrimary btnSm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Guardando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </Modal>

      <Modal open={showDetail} onClose={() => setShowDetail(false)} title="Detalle del usuario" wide>
        {viewingUser && (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailAvatar} style={{ background: getAvatarColor(viewingUser.username) }}>
                {getInitials(viewingUser.nombre_completo || viewingUser.username)}
              </div>
              <div className={styles.detailInfo}>
                <h3 className={styles.detailName}>{viewingUser.nombre_completo || viewingUser.username}</h3>
                <p className={styles.detailEmail}>{viewingUser.username}</p>
                <div className={styles.detailBadges}>
                  <span className={`${styles.badge} ${getRolBadgeClass(viewingUser.rol_nombre)}`}>{viewingUser.rol_nombre || '-'}</span>
                  <span className={`${styles.badge} ${getEstadoBadgeClass(viewingUser.estado_nombre || viewingUser.estado)}`}>
                    <span className={styles.badgeDot}></span>
                    {viewingUser.estado_nombre || (viewingUser.estado === 1 ? 'Activo' : 'Inactivo')}
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
                <span className={styles.detailLabel}>Correo</span>
                <span className={styles.detailValue}>{viewingUser.correo || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Documento</span>
                <span className={styles.detailValue}>{viewingUser.numero_documento || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Fecha de registro</span>
                <span className={styles.detailValue}>{formatDate(viewingUser.created_at)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Ultimo login</span>
                <span className={styles.detailValue}>{formatDateTime(viewingUser.ultimo_login)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>UUID</span>
                <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>{viewingUser.uuid}</span>
              </div>
            </div>
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`Estas seguro de eliminar a ${deletingUser?.nombre_completo || deletingUser?.username}? Esta accion desactivara el usuario.`}
      />
    </div>
  )
}
