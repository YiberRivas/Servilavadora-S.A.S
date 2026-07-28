import { useState, useMemo, useCallback, useEffect } from 'react'
import StatCard from '../components/StatCard'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import { api } from '../services/api'
import styles from '../styles/pages/Empresas.module.css'

const ESTADOS = ['Todas', 'ACTIVA', 'PENDIENTE', 'RECHAZADA']

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

const getInitials = (nombre) => {
  if (!nombre) return '??'
  return nombre.substring(0, 2).toUpperCase()
}

const getEstadoBadgeClass = (estado) => {
  const map = { ACTIVA: styles.badgeEstadoActiva, PENDIENTE: styles.badgeEstadoPendiente, RECHAZADA: styles.badgeEstadoInactiva }
  return map[estado] || styles.badgeEstadoPendiente
}

const COLORS = ['#2D6CB5', '#12A594', '#1F4E79', '#E8A317', '#D64545']

export default function Empresas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalRecords, setTotalRecords] = useState(0)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('Todas')
  const [toast, setToast] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nit: '', razon_social: '', nombre_comercial: '', representante_legal: '', correo: '', telefono: '', celular: '', descripcion: '' })
  const [formErrors, setFormErrors] = useState({})

  const [viewOpen, setViewOpen] = useState(false)
  const [viewData, setViewData] = useState(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, per_page: rowsPerPage })
      if (search) params.set('search', search)
      if (filterEstado !== 'Todas') params.set('id_estado_empresa', filterEstado === 'ACTIVA' ? '1' : filterEstado === 'PENDIENTE' ? '2' : '3')

      const res = await api.get(`/empresas?${params.toString()}`)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [page, rowsPerPage, search, filterEstado])

  const stats = useMemo(() => {
    const total = totalRecords
    const activas = data.filter(e => e.estado_nombre === 'ACTIVA').length
    const pendientes = data.filter(e => e.estado_nombre === 'PENDIENTE').length
    const rechazadas = data.filter(e => e.estado_nombre === 'RECHAZADA').length
    return { total, activas, pendientes, rechazadas }
  }, [data, totalRecords])

  const totalPages = Math.max(1, Math.ceil(totalRecords / rowsPerPage))

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm({ nit: '', razon_social: '', nombre_comercial: '', representante_legal: '', correo: '', telefono: '', celular: '', descripcion: '' })
    setFormErrors({})
    setFormOpen(true)
  }

  const openEdit = (empresa) => {
    setEditingId(empresa.uuid)
    setForm({
      nit: empresa.nit || '',
      razon_social: empresa.razon_social || '',
      nombre_comercial: empresa.nombre_comercial || '',
      representante_legal: empresa.representante_legal || '',
      correo: empresa.correo || '',
      telefono: empresa.telefono || '',
      celular: empresa.celular || '',
      descripcion: empresa.descripcion || '',
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
    if (!form.nit.trim()) errors.nit = 'Requerido'
    if (!form.razon_social.trim()) errors.razon_social = 'Requerido'
    if (!form.representante_legal.trim()) errors.representante_legal = 'Requerido'
    if (!form.correo.trim()) errors.correo = 'Requerido'
    else if (!/\S+@\S+\.\S+/.test(form.correo)) errors.correo = 'Invalido'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveForm = async () => {
    if (!validateForm()) return

    if (editingId) {
      const res = await api.put(`/empresas/${editingId}`, form)
      if (res.success) {
        showToast('Empresa actualizada correctamente')
        fetchData()
      } else {
        showToast(res.message || 'Error al actualizar')
      }
    } else {
      const res = await api.post('/empresas', { ...form, id_estado_empresa: 2 })
      if (res.success) {
        showToast('Empresa registrada correctamente')
        fetchData()
      } else {
        showToast(res.message || 'Error al crear')
      }
    }
    setFormOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    const res = await api.delete(`/empresas/${deleteTarget.uuid}`)
    if (res.success) {
      showToast('Empresa eliminada correctamente')
      fetchData()
    }
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerSection}>
        <div className={styles.headerTop}>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>Gestion de Empresas</h1>
            <p className={styles.headerDesc}>Administra todas las empresas afiliadas a Servilavadora S.A.S.</p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btnPrimary btnSm" onClick={openCreate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nueva Empresa
            </button>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" label="Total Empresas" value={stats.total} variant="blue" />
        <StatCard icon="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" label="Empresas Activas" value={stats.activas} variant="accent" />
        <StatCard icon="M12 2v20M2 12h20" label="Pendientes" value={stats.pendientes} variant="warning" />
        <StatCard icon="M18 6L6 18M6 6l12 12" label="Rechazadas" value={stats.rechazadas} variant="danger" />
      </div>

      <div className={styles.filterPanel}>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Buscar</label>
            <input className={styles.filterInput} type="text" placeholder="Nombre, NIT, correo..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado</label>
            <select className={styles.filterInput} value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setPage(1) }}>
              {ESTADOS.map(e => <option key={e} value={e}>{e === 'Todas' ? 'Todas' : e.charAt(0) + e.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderLeft}>
            <span className={styles.tableTitle}>Empresas afiliadas</span>
            <span className={styles.tableCount}>{totalRecords}</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.emptyState}><p>Cargando empresas...</p></div>
        ) : data.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No se encontraron empresas</h3>
            <p className={styles.emptyDesc}>Registra una nueva empresa para comenzar.</p>
            <button className="btn btnPrimary btnSm" onClick={openCreate}>Registrar Empresa</button>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>NIT</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.uuid}>
                    <td>
                      <div className={styles.companyCell}>
                        <div className={styles.logo} style={{ background: COLORS[row.uuid ? row.uuid.charCodeAt(0) % 5 : 0] }}>{getInitials(row.nombre_comercial || row.razon_social)}</div>
                        <div className={styles.companyInfo}>
                          <div className={styles.companyName}>{row.nombre_comercial || row.razon_social}</div>
                          <div className={styles.companyEmail}>{row.correo}</div>
                        </div>
                      </div>
                    </td>
                    <td>{row.nit}</td>
                    <td>{row.representante_legal}</td>
                    <td>
                      <span className={`${styles.badge} ${getEstadoBadgeClass(row.estado_nombre)}`}>
                        <span className={styles.badgeDot}></span>
                        {row.estado_nombre || 'Pendiente'}
                      </span>
                    </td>
                    <td><span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{formatDate(row.fecha_registro)}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver" onClick={() => openView(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="Editar" onClick={() => openEdit(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} title="Eliminar" onClick={() => openDelete(row)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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
            onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(1) }}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Editar Empresa' : 'Nueva Empresa'} wide>
        <div className={styles.formSection}>
          <h4 className={styles.formSectionTitle}>Informacion General</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>NIT *</label>
              <input type="text" placeholder="Ej: 900123456-1" value={form.nit} onChange={(e) => handleFormChange('nit', e.target.value)} />
              {formErrors.nit && <span className={styles.formError}>{formErrors.nit}</span>}
            </div>
            <div className={styles.formField}>
              <label>Razon Social *</label>
              <input type="text" placeholder="Razon social" value={form.razon_social} onChange={(e) => handleFormChange('razon_social', e.target.value)} />
              {formErrors.razon_social && <span className={styles.formError}>{formErrors.razon_social}</span>}
            </div>
            <div className={styles.formField}>
              <label>Nombre Comercial</label>
              <input type="text" placeholder="Nombre comercial" value={form.nombre_comercial} onChange={(e) => handleFormChange('nombre_comercial', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label>Representante Legal *</label>
              <input type="text" placeholder="Nombre del representante" value={form.representante_legal} onChange={(e) => handleFormChange('representante_legal', e.target.value)} />
              {formErrors.representante_legal && <span className={styles.formError}>{formErrors.representante_legal}</span>}
            </div>
          </div>
        </div>
        <div className={styles.formSection}>
          <h4 className={styles.formSectionTitle}>Contacto</h4>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label>Correo *</label>
              <input type="email" placeholder="contacto@empresa.co" value={form.correo} onChange={(e) => handleFormChange('correo', e.target.value)} />
              {formErrors.correo && <span className={styles.formError}>{formErrors.correo}</span>}
            </div>
            <div className={styles.formField}>
              <label>Telefono</label>
              <input type="tel" placeholder="601 555 0101" value={form.telefono} onChange={(e) => handleFormChange('telefono', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label>Celular</label>
              <input type="tel" placeholder="310 123 4567" value={form.celular} onChange={(e) => handleFormChange('celular', e.target.value)} />
            </div>
            <div className={`${styles.formField} ${styles.formGridFull}`}>
              <label>Descripcion</label>
              <textarea placeholder="Breve descripcion..." value={form.descripcion} onChange={(e) => handleFormChange('descripcion', e.target.value)} />
            </div>
          </div>
        </div>
        <div className={styles.formActions}>
          <button className="btn btnOutline btnSm" onClick={() => setFormOpen(false)}>Cancelar</button>
          <button className="btn btnPrimary btnSm" onClick={handleSaveForm}>{editingId ? 'Guardar' : 'Crear'}</button>
        </div>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title="Detalle Empresa" wide>
        {viewData && (
          <div className={styles.detailSection}>
            <div className={styles.detailHeader}>
              <div className={styles.detailLogo} style={{ background: COLORS[0] }}>{getInitials(viewData.nombre_comercial || viewData.razon_social)}</div>
              <div className={styles.detailHeaderInfo}>
                <h3 className={styles.detailName}>{viewData.nombre_comercial || viewData.razon_social}</h3>
                <p className={styles.detailNit}>NIT: {viewData.nit}</p>
                <span className={`${styles.badge} ${getEstadoBadgeClass(viewData.estado_nombre)}`}>{viewData.estado_nombre}</span>
              </div>
            </div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Representante</span><span className={styles.detailValue}>{viewData.representante_legal}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Correo</span><span className={styles.detailValue}>{viewData.correo}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Telefono</span><span className={styles.detailValue}>{viewData.telefono || '-'}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Celular</span><span className={styles.detailValue}>{viewData.celular || '-'}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Plan</span><span className={styles.detailValue}>{viewData.plan_nombre || 'Sin plan'}</span></div>
              <div className={styles.detailItem}><span className={styles.detailLabel}>Registro</span><span className={styles.detailValue}>{formatDate(viewData.fecha_registro)}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar Empresa">
        {deleteTarget && (
          <div className={styles.deleteDialogContent}>
            <p className={styles.deleteMessage}>Eliminar la empresa <strong>{deleteTarget.nombre_comercial || deleteTarget.razon_social}</strong>? Esta accion no se puede deshacer.</p>
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
