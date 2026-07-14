import { useState, useMemo, useCallback } from 'react'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import { empresas as initialEmpresas } from '../data/mockData'
import styles from '../styles/pages/Empresas.module.css'

const CIUDADES = ['Todas', 'Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Quibdo']
const ESTADOS = ['Todas', 'Activa', 'Pendiente', 'Inactiva']
const PLANES = ['Todos', 'Basico', 'Premium']

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getInitials = (nombre) => {
  return nombre.substring(0, 2).toUpperCase()
}

const getEstadoBadgeClass = (estado) => {
  const map = { activa: styles.badgeEstadoActiva, pendiente: styles.badgeEstadoPendiente, inactiva: styles.badgeEstadoInactiva }
  return map[estado] || styles.badgeEstadoPendiente
}

const getCalificacionColor = (cal) => {
  if (cal >= 4.7) return 'var(--success)'
  if (cal >= 4.0) return 'var(--accent)'
  if (cal >= 3.5) return 'var(--warning)'
  return 'var(--danger)'
}

const EMPTY_FORM = {
  nombre: '', nit: '', email: '', telefono: '', direccion: '', ciudad: 'Bogota', responsable: '',
  plan: 'Basico', estado: 'pendiente', cobertura: '', horarioAtencion: '', descripcion: '',
  observaciones: '', fechaRegistro: new Date().toISOString().split('T')[0],
  clientesAtendidos: 0, serviciosCancelados: 0, tiempoRespuesta: '-', clientesFrecuentes: 0, satisfaccion: 0
}

export default function Empresas() {
  const [data, setData] = useState(initialEmpresas)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todas')
  const [filterCiudad, setFilterCiudad] = useState('Todas')
  const [filterPlan, setFilterPlan] = useState('Todos')
  const [filterCalMin, setFilterCalMin] = useState('')
  const [filterServMin, setFilterServMin] = useState('')
  const [filterFechaDesde, setFilterFechaDesde] = useState('')
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [toast, setToast] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [formErrors, setFormErrors] = useState({})

  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const stats = useMemo(() => {
    const total = data.length
    const activas = data.filter(e => e.estado === 'activa').length
    const pendientes = data.filter(e => e.estado === 'pendiente').length
    const inactivas = data.filter(e => e.estado === 'inactiva').length
    const totalServicios = data.reduce((sum, e) => sum + (e.servicios || 0), 0)
    const conCal = data.filter(e => e.calificacion)
    const promCal = conCal.length > 0 ? (conCal.reduce((s, e) => s + e.calificacion, 0) / conCal.length).toFixed(1) : '0.0'
    return { total, activas, pendientes, inactivas, totalServicios, promCal }
  }, [data])

  const filtered = useMemo(() => {
    return data.filter(e => {
      const term = search.toLowerCase()
      if (term) {
        const matchNombre = e.nombre.toLowerCase().includes(term)
        const matchResp = (e.responsable || '').toLowerCase().includes(term)
        const matchEmail = e.email.toLowerCase().includes(term)
        const matchTel = (e.telefono || '').includes(term)
        if (!matchNombre && !matchResp && !matchEmail && !matchTel) return false
      }
      if (filterEstado !== 'Todas') {
        const ef = filterEstado === 'Activa' ? 'activa' : filterEstado === 'Pendiente' ? 'pendiente' : 'inactiva'
        if (e.estado !== ef) return false
      }
      if (filterCiudad !== 'Todas' && e.ciudad !== filterCiudad) return false
      if (filterPlan !== 'Todos' && e.plan !== filterPlan) return false
      if (filterCalMin && (!e.calificacion || e.calificacion < Number(filterCalMin))) return false
      if (filterServMin && (e.servicios || 0) < Number(filterServMin)) return false
      if (filterFechaDesde && e.fechaRegistro < filterFechaDesde) return false
      return true
    })
  }, [data, search, filterEstado, filterCiudad, filterPlan, filterCalMin, filterServMin, filterFechaDesde])

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage))
  const safePage = Math.min(page, totalPages)

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, safePage, rowsPerPage])

  const activeFilters = useMemo(() => {
    const f = []
    if (search) f.push({ label: `Busqueda: "${search}"`, clear: () => { setSearch(''); setPage(1) } })
    if (filterEstado !== 'Todas') f.push({ label: `Estado: ${filterEstado}`, clear: () => { setFilterEstado('Todas'); setPage(1) } })
    if (filterCiudad !== 'Todas') f.push({ label: `Ciudad: ${filterCiudad}`, clear: () => { setFilterCiudad('Todas'); setPage(1) } })
    if (filterPlan !== 'Todos') f.push({ label: `Plan: ${filterPlan}`, clear: () => { setFilterPlan('Todos'); setPage(1) } })
    if (filterCalMin) f.push({ label: `Cal. min: ${filterCalMin}`, clear: () => setFilterCalMin('') })
    if (filterServMin) f.push({ label: `Serv. min: ${filterServMin}`, clear: () => setFilterServMin('') })
    if (filterFechaDesde) f.push({ label: `Desde: ${formatDate(filterFechaDesde)}`, clear: () => setFilterFechaDesde('') })
    return f
  }, [search, filterEstado, filterCiudad, filterPlan, filterCalMin, filterServMin, filterFechaDesde])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilterEstado('Todas')
    setFilterCiudad('Todas')
    setFilterPlan('Todos')
    setFilterCalMin('')
    setFilterServMin('')
    setFilterFechaDesde('')
    setPage(1)
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setFormErrors({})
    setFormOpen(true)
  }

  const openEdit = (empresa) => {
    setEditingId(empresa.id)
    setForm({
      nombre: empresa.nombre || '',
      nit: empresa.nit || '',
      email: empresa.email || '',
      telefono: empresa.telefono || '',
      direccion: empresa.direccion || '',
      ciudad: empresa.ciudad || 'Bogota',
      responsable: empresa.responsable || '',
      plan: empresa.plan || 'Basico',
      estado: empresa.estado || 'pendiente',
      cobertura: empresa.cobertura || '',
      horarioAtencion: empresa.horarioAtencion || '',
      descripcion: empresa.descripcion || '',
      observaciones: empresa.observaciones || '',
      fechaRegistro: empresa.fechaRegistro || '',
      clientesAtendidos: empresa.clientesAtendidos || 0,
      serviciosCancelados: empresa.serviciosCancelados || 0,
      tiempoRespuesta: empresa.tiempoRespuesta || '-',
      clientesFrecuentes: empresa.clientesFrecuentes || 0,
      satisfaccion: empresa.satisfaccion || 0,
    })
    setFormErrors({})
    setFormOpen(true)
  }

  const openView = (empresa) => {
    setViewData(empresa)
    setViewOpen(true)
  }

  const openDelete = (empresa) => {
    setDeleteTarget(empresa)
    setDeleteOpen(true)
  }

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'Requerido'
    if (!form.nit.trim()) errors.nit = 'Requerido'
    if (!form.email.trim()) errors.email = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalido'
    if (!form.responsable.trim()) errors.responsable = 'Requerido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveForm = () => {
    if (!validateForm()) return

    if (editingId) {
      setData(prev => prev.map(e => e.id === editingId ? { ...e, ...form } : e))
      showToast('Empresa actualizada correctamente')
    } else {
      const colors = ['#2D6CB5', '#12A594', '#1F4E79']
      const newEmpresa = {
        id: Date.now(),
        ...form,
        servicios: 0,
        calificacion: null,
        logoColor: colors[Math.floor(Math.random() * colors.length)],
      }
      setData(prev => [newEmpresa, ...prev])
      showToast('Empresa registrada correctamente')
    }
    setFormOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setData(prev => prev.filter(e => e.id !== deleteTarget.id))
    setDeleteOpen(false)
    setDeleteTarget(null)
    showToast('Empresa eliminada correctamente')
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>Gestion de Empresas</h1>
            <p className={styles.headerDesc}>Administra todas las empresas afiliadas a Servilavadora S.A.S., controla su estado, informacion y actividad dentro de la plataforma.</p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btnPrimary btnSm" onClick={openCreate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nueva Empresa
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" label="Total Empresas" value={stats.total} variant="blue" />
        <StatCard icon="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" label="Empresas Activas" value={stats.activas} variant="accent" />
        <StatCard icon="M12 2v20M2 12h20" label="Empresas Pendientes" value={stats.pendientes} variant="warning" />
        <StatCard icon="M18 6L6 18M6 6l12 12" label="Empresas Inactivas" value={stats.inactivas} variant="danger" />
        <StatCard icon="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" label="Total Servicios" value={stats.totalServicios.toLocaleString()} variant="blue" />
        <StatCard icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" label="Calificacion Prom." value={stats.promCal} variant="accent" />
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
            <input className={styles.filterInput} type="text" placeholder="Nombre, responsable, correo..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
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
            <label className={styles.filterLabel}>Plan</label>
            <select className={styles.filterInput} value={filterPlan} onChange={(e) => { setFilterPlan(e.target.value); setPage(1) }}>
              {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Calificacion minima</label>
            <input className={styles.filterInput} type="number" min="0" max="5" step="0.1" placeholder="Ej: 4.5" value={filterCalMin} onChange={(e) => { setFilterCalMin(e.target.value); setPage(1) }} />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Servicios minimos</label>
            <input className={styles.filterInput} type="number" min="0" placeholder="Ej: 50" value={filterServMin} onChange={(e) => { setFilterServMin(e.target.value); setPage(1) }} />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Fecha desde</label>
            <input className={styles.filterInput} type="date" value={filterFechaDesde} onChange={(e) => { setFilterFechaDesde(e.target.value); setPage(1) }} />
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
            <span className={styles.tableTitle}>Empresas afiliadas</span>
            <span className={styles.tableCount}>{filtered.length}</span>
          </div>
        </div>

        {pagedData.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No se encontraron empresas</h3>
            <p className={styles.emptyDesc}>Intenta ajustar los filtros de busqueda o registra una nueva empresa.</p>
            <button className="btn btnPrimary btnSm" onClick={openCreate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Registrar Empresa
            </button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Responsable</th>
                  <th>Ciudad</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Servicios</th>
                  <th>Calificacion</th>
                  <th>Registro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.companyCell}>
                        <div className={styles.logo} style={{ background: row.logoColor }}>{getInitials(row.nombre)}</div>
                        <div className={styles.companyInfo}>
                          <div className={styles.companyName}>{row.nombre}</div>
                          <div className={styles.companyEmail}>{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{row.responsable || '-'}</td>
                    <td>{row.ciudad}</td>
                    <td><span className={`${styles.badge} ${styles.badgePlan}`}>{row.plan}</span></td>
                    <td>
                      <span className={`${styles.badge} ${getEstadoBadgeClass(row.estado)}`}>
                        <span className={styles.badgeDot}></span>
                        {row.estado === 'activa' ? 'Activa' : row.estado === 'pendiente' ? 'Pendiente' : 'Inactiva'}
                      </span>
                    </td>
                    <td><span className={styles.servicesCount}>{row.servicios}</span></td>
                    <td>
                      {row.calificacion ? (
                        <div className={styles.ratingCell}>
                          <svg className={styles.ratingStar} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <span className={styles.ratingValue} style={{ color: getCalificacionColor(row.calificacion) }}>{row.calificacion}</span>
                        </div>
                      ) : (
                        <span className={styles.ratingNull}>Sin calificar</span>
                      )}
                    </td>
                    <td><span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{formatDate(row.fechaRegistro)}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver" onClick={() => openView(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="Editar" onClick={() => openEdit(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar" onClick={() => openDelete(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
            onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(1) }}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {/* Modal: Crear / Editar */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Editar Empresa' : 'Nueva Empresa'} wide>
        <div className={styles.formSection}>
          <h4 className={styles.formSectionTitle}>Informacion General</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Nombre de la empresa *</label>
              <input type="text" placeholder="Ej: CleanHouse" value={form.nombre} onChange={(e) => handleFormChange('nombre', e.target.value)} />
              {formErrors.nombre && <span className={styles.formError}>{formErrors.nombre}</span>}
            </div>
            <div className={styles.formField}>
              <label>NIT *</label>
              <input type="text" placeholder="Ej: 900123456-1" value={form.nit} onChange={(e) => handleFormChange('nit', e.target.value)} />
              {formErrors.nit && <span className={styles.formError}>{formErrors.nit}</span>}
            </div>
            <div className={styles.formField}>
              <label>Responsable *</label>
              <input type="text" placeholder="Nombre del responsable" value={form.responsable} onChange={(e) => handleFormChange('responsable', e.target.value)} />
              {formErrors.responsable && <span className={styles.formError}>{formErrors.responsable}</span>}
            </div>
            <div className={styles.formField}>
              <label>Ciudad</label>
              <select value={form.ciudad} onChange={(e) => handleFormChange('ciudad', e.target.value)}>
                {CIUDADES.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4 className={styles.formSectionTitle}>Informacion de Contacto</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Correo electronico *</label>
              <input type="email" placeholder="contacto@empresa.co" value={form.email} onChange={(e) => handleFormChange('email', e.target.value)} />
              {formErrors.email && <span className={styles.formError}>{formErrors.email}</span>}
            </div>
            <div className={styles.formField}>
              <label>Telefono</label>
              <input type="tel" placeholder="601 555 0101" value={form.telefono} onChange={(e) => handleFormChange('telefono', e.target.value)} />
            </div>
            <div className={`${styles.formField} ${styles.formGridFull}`}>
              <label>Direccion</label>
              <input type="text" placeholder="Calle 80 #15-30" value={form.direccion} onChange={(e) => handleFormChange('direccion', e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4 className={styles.formSectionTitle}>Informacion Comercial</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Plan contratado</label>
              <select value={form.plan} onChange={(e) => handleFormChange('plan', e.target.value)}>
                <option value="Basico">Basico</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label>Cobertura</label>
              <input type="text" placeholder="Ej: Bogota, Soacha" value={form.cobertura} onChange={(e) => handleFormChange('cobertura', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label>Horario de atencion</label>
              <input type="text" placeholder="Ej: Lun-Sab 7:00 - 20:00" value={form.horarioAtencion} onChange={(e) => handleFormChange('horarioAtencion', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label>Estado</label>
              <select value={form.estado} onChange={(e) => handleFormChange('estado', e.target.value)}>
                <option value="pendiente">Pendiente</option>
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
            <div className={`${styles.formField} ${styles.formGridFull}`}>
              <label>Descripcion</label>
              <textarea placeholder="Breve descripcion de la empresa..." value={form.descripcion} onChange={(e) => handleFormChange('descripcion', e.target.value)} />
            </div>
            <div className={`${styles.formField} ${styles.formGridFull}`}>
              <label>Observaciones</label>
              <textarea placeholder="Notas adicionales..." value={form.observaciones} onChange={(e) => handleFormChange('observaciones', e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button className="btn btnOutline btnSm" onClick={() => setFormOpen(false)}>Cancelar</button>
          <button className="btn btnPrimary btnSm" onClick={handleSaveForm}>{editingId ? 'Guardar cambios' : 'Crear empresa'}</button>
        </div>
      </Modal>

      {/* Modal: Ver detalle */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Ficha Empresarial" wide>
        {viewData && (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailLogo} style={{ background: viewData.logoColor }}>{getInitials(viewData.nombre)}</div>
              <div className={styles.detailHeaderInfo}>
                <h3 className={styles.detailName}>{viewData.nombre}</h3>
                <p className={styles.detailNit}>NIT: {viewData.nit || 'No registrado'}</p>
                <div className={styles.detailBadges}>
                  <span className={`${styles.badge} ${getEstadoBadgeClass(viewData.estado)}`}>
                    <span className={styles.badgeDot}></span>
                    {viewData.estado === 'activa' ? 'Activa' : viewData.estado === 'pendiente' ? 'Pendiente' : 'Inactiva'}
                  </span>
                  {viewData.calificacion && (
                    <span className={`${styles.badge} ${styles.badgePlan}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {viewData.calificacion}/5
                    </span>
                  )}
                  <span className={`${styles.badge} ${styles.badgePlan}`}>{viewData.plan}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Informacion de la Empresa</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Responsable</span>
                  <span className={styles.detailValue}>{viewData.responsable || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Ciudad</span>
                  <span className={styles.detailValue}>{viewData.ciudad}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Correo</span>
                  <span className={styles.detailValue}>{viewData.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Telefono</span>
                  <span className={styles.detailValue}>{viewData.telefono || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Direccion</span>
                  <span className={styles.detailValue}>{viewData.direccion || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Fecha de registro</span>
                  <span className={styles.detailValue}>{formatDate(viewData.fechaRegistro)}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Informacion Comercial</h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total servicios realizados</span>
                  <span className={styles.detailValue}>{viewData.servicios}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Clientes atendidos</span>
                  <span className={styles.detailValue}>{viewData.clientesAtendidos || 0}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Cobertura</span>
                  <span className={styles.detailValue}>{viewData.cobertura || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Horario de atencion</span>
                  <span className={styles.detailValue}>{viewData.horarioAtencion || '-'}</span>
                </div>
              </div>
            </div>

            {(viewData.descripcion || viewData.observaciones) && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>Informacion General</h4>
                {viewData.descripcion && (
                  <div className={styles.detailItem} style={{ marginBottom: 'var(--space-lg)' }}>
                    <span className={styles.detailLabel}>Descripcion</span>
                    <p className={styles.detailText}>{viewData.descripcion}</p>
                  </div>
                )}
                {viewData.observaciones && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Observaciones</span>
                    <p className={styles.detailText}>{viewData.observaciones}</p>
                  </div>
                )}
              </div>
            )}

            <div className={styles.detailSection}>
              <h4 className={styles.detailSectionTitle}>Indicadores</h4>
              <div className={styles.indicatorsGrid}>
                <div className={styles.indicatorCard}>
                  <div className={styles.indicatorIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className={styles.indicatorInfo}>
                    <span className={styles.indicatorLabel}>Completados</span>
                    <span className={styles.indicatorValue}>{viewData.servicios - (viewData.serviciosCancelados || 0)}</span>
                  </div>
                </div>
                <div className={styles.indicatorCard}>
                  <div className={styles.indicatorIcon} style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </div>
                  <div className={styles.indicatorInfo}>
                    <span className={styles.indicatorLabel}>Cancelados</span>
                    <span className={styles.indicatorValue}>{viewData.serviciosCancelados || 0}</span>
                  </div>
                </div>
                <div className={styles.indicatorCard}>
                  <div className={styles.indicatorIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className={styles.indicatorInfo}>
                    <span className={styles.indicatorLabel}>Tiempo respuesta</span>
                    <span className={styles.indicatorValue}>{viewData.tiempoRespuesta || '-'}</span>
                  </div>
                </div>
                <div className={styles.indicatorCard}>
                  <div className={styles.indicatorIcon} style={{ background: 'var(--accent-tint)', color: 'var(--accent-dark)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div className={styles.indicatorInfo}>
                    <span className={styles.indicatorLabel}>Clientes frecuentes</span>
                    <span className={styles.indicatorValue}>{viewData.clientesFrecuentes || 0}</span>
                  </div>
                </div>
                <div className={styles.indicatorCard}>
                  <div className={styles.indicatorIcon} style={{ background: 'var(--warning-tint)', color: 'var(--warning)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div className={styles.indicatorInfo}>
                    <span className={styles.indicatorLabel}>Satisfaccion</span>
                    <span className={styles.indicatorValue}>{viewData.satisfaccion || 0}%</span>
                  </div>
                </div>
                <div className={styles.indicatorCard}>
                  <div className={styles.indicatorIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div className={styles.indicatorInfo}>
                    <span className={styles.indicatorLabel}>Clientes atendidos</span>
                    <span className={styles.indicatorValue}>{viewData.clientesAtendidos || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Dialog: Confirmar eliminacion */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar Empresa">
        {deleteTarget && (
          <div className={styles.deleteDialogContent}>
            <div className={styles.deleteCompanyCard}>
              <div className={styles.deleteCompanyLogo} style={{ background: deleteTarget.logoColor }}>{getInitials(deleteTarget.nombre)}</div>
              <div className={styles.deleteCompanyInfo}>
                <div className={styles.deleteCompanyName}>{deleteTarget.nombre}</div>
                <div className={styles.deleteCompanyCity}>{deleteTarget.ciudad}</div>
                <div className={styles.deleteCompanyResp}>Resp: {deleteTarget.responsable}</div>
              </div>
            </div>
            <p className={styles.deleteMessage}>¿Estas seguro de eliminar esta empresa? Esta accion no se puede deshacer y se perderan todos los datos asociados.</p>
            <div className={styles.deleteActions}>
              <button className="btn btnOutline btnSm" onClick={() => setDeleteOpen(false)}>Cancelar</button>
              <button className="btn btnDanger btnSm" onClick={handleConfirmDelete}>Eliminar</button>
            </div>
          </div>
        )}
      </Modal>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
