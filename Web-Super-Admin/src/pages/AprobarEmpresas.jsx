import { useState, useMemo } from 'react'
import { Building2, Search, X, Eye, Check, XCircle, Edit3, FileText, Download, Clock, AlertTriangle, CheckCircle2, Filter, ChevronDown } from 'lucide-react'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import PdfViewer from '../components/PdfViewer'
import { empresas, expedientesEmpresas } from '../data/mockData'
import styles from '../styles/pages/AprobarEmpresas.module.css'

const allEmpresas = empresas

export default function AprobarEmpresas() {
  const [items, setItems] = useState(allEmpresas)
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({ empresa: '', nit: '', responsable: '', email: '', ciudad: '', estado: '', fecha: '', plan: '' })
  const [showFilters, setShowFilters] = useState(true)
  const [viewingFile, setViewingFile] = useState(null)
  const [fileTab, setFileTab] = useState('info')
  const [viewingPdf, setViewingPdf] = useState(null)
  const [approveDialog, setApproveDialog] = useState(null)
  const [rejectDialog, setRejectDialog] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast] = useState(null)

  const filtered = useMemo(() => {
    return items.filter((e) => {
      if (filters.empresa && !e.nombre.toLowerCase().includes(filters.empresa.toLowerCase())) return false
      if (filters.nit && !e.nit.includes(filters.nit)) return false
      if (filters.responsable && !e.responsable.toLowerCase().includes(filters.responsable.toLowerCase())) return false
      if (filters.email && !e.email.toLowerCase().includes(filters.email.toLowerCase())) return false
      if (filters.ciudad && !e.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())) return false
      if (filters.estado && e.estado !== filters.estado) return false
      if (filters.fecha && !e.fechaRegistro.includes(filters.fecha)) return false
      if (filters.plan && e.plan !== filters.plan) return false
      return true
    })
  }, [items, filters])

  const totalPages = Math.ceil(filtered.length / rowsPerPage)
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const stats = useMemo(() => ({
    pendientes: items.filter((e) => e.estado === 'pendiente').length,
    aprobadas: items.filter((e) => e.estado === 'activa').length,
    rechazadas: items.filter((e) => e.estado === 'inactiva').length,
    revision: items.filter((e) => e.estado === 'pendiente' && expedientesEmpresas[e.id]).length,
  }), [items])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const clearFilters = () => {
    setFilters({ empresa: '', nit: '', responsable: '', email: '', ciudad: '', estado: '', fecha: '', plan: '' })
    setPage(1)
  }

  const toggleSelectAll = () => {
    if (selected.length === paginated.length) {
      setSelected([])
    } else {
      setSelected(paginated.map((e) => e.id))
    }
  }

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleApprove = (empresa) => {
    setApproveDialog(empresa)
  }

  const confirmApprove = (empresa) => {
    setItems((prev) => prev.map((e) => e.id === empresa.id ? { ...e, estado: 'activa' } : e))
    setSelected((prev) => prev.filter((x) => x !== empresa.id))
    setApproveDialog(null)
    showToast(`Empresa "${empresa.nombre}" aprobada exitosamente`)
  }

  const handleReject = (empresa) => {
    setRejectDialog(empresa)
    setRejectReason('')
  }

  const confirmReject = () => {
    if (!rejectReason.trim()) return
    setItems((prev) => prev.map((e) => e.id === rejectDialog.id ? { ...e, estado: 'inactiva', observaciones: rejectReason } : e))
    setSelected((prev) => prev.filter((x) => x !== rejectDialog.id))
    setRejectDialog(null)
    setRejectReason('')
    showToast(`Empresa "${rejectDialog.nombre}" rechazada`, 'danger')
  }

  const handleBulkApprove = () => {
    setItems((prev) => prev.map((e) => selected.includes(e.id) ? { ...e, estado: 'activa' } : e))
    showToast(`${selected.length} empresa(s) aprobada(s)`)
    setSelected([])
  }

  const handleBulkReject = () => {
    setItems((prev) => prev.map((e) => selected.includes(e.id) ? { ...e, estado: 'inactiva' } : e))
    showToast(`${selected.length} empresa(s) rechazada(s)`, 'danger')
    setSelected([])
  }

  const handleExport = () => {
    const csv = ['Empresa,NIT,Responsable,Ciudad,Plan,Estado,Fecha']
    filtered.forEach((e) => {
      csv.push(`"${e.nombre}","${e.nit}","${e.responsable}","${e.ciudad}","${e.plan}","${e.estado}","${e.fechaRegistro}"`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'empresas_aprobacion.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Archivo CSV exportado')
  }

  const openFile = (empresa) => {
    setViewingFile(empresa)
    setFileTab('info')
    setViewingPdf(null)
  }

  const getDocStatusBadge = (estado) => {
    const map = {
      aprobado: { class: styles.badgeDocOk, label: 'Aprobado' },
      pendiente: { class: styles.badgeDocPending, label: 'Pendiente' },
      rechazado: { class: styles.badgeDocFail, label: 'Rechazado' },
    }
    return map[estado] || map.pendiente
  }

  const getEstadoBadge = (estado) => {
    const map = {
      pendiente: { class: styles.badgePendiente, label: 'Pendiente' },
      activa: { class: styles.badgeAprobada, label: 'Aprobada' },
      inactiva: { class: styles.badgeRechazada, label: 'Rechazada' },
    }
    return map[estado] || map.pendiente
  }

  const expediente = viewingFile ? expedientesEmpresas[viewingFile.id] : null

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 'var(--radius-sm)',
          background: toast.type === 'danger' ? 'var(--danger)' : 'var(--success)',
          color: 'var(--white)', fontSize: '0.85rem', fontWeight: 600,
          boxShadow: 'var(--shadow-md)', animation: 'slideUp 0.2s ease'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-tint)', color: 'var(--warning)' }}>
            <Clock width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Pendientes</span>
            <span className={styles.statValue}>{stats.pendientes}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
            <CheckCircle2 width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Aprobadas</span>
            <span className={styles.statValue}>{stats.aprobadas}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
            <XCircle width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Rechazadas</span>
            <span className={styles.statValue}>{stats.rechazadas}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
            <FileText width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>En Revision</span>
            <span className={styles.statValue}>{stats.revision}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <span className={styles.filterTitle}>
            <Filter width={16} height={16} />
            Filtros de busqueda
          </span>
          <div className={styles.filterActions}>
            <button className={styles.btnClear} onClick={clearFilters}>
              <X width={14} height={14} />
              Limpiar filtros
            </button>
          </div>
        </div>
        {showFilters && (
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Empresa</label>
              <input className={styles.filterInput} placeholder="Nombre de empresa..." value={filters.empresa} onChange={(e) => { setFilters({ ...filters, empresa: e.target.value }); setPage(1) }} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>NIT</label>
              <input className={styles.filterInput} placeholder="NIT..." value={filters.nit} onChange={(e) => { setFilters({ ...filters, nit: e.target.value }); setPage(1) }} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Responsable</label>
              <input className={styles.filterInput} placeholder="Nombre responsable..." value={filters.responsable} onChange={(e) => { setFilters({ ...filters, responsable: e.target.value }); setPage(1) }} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Correo</label>
              <input className={styles.filterInput} placeholder="Correo electronico..." value={filters.email} onChange={(e) => { setFilters({ ...filters, email: e.target.value }); setPage(1) }} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Ciudad</label>
              <input className={styles.filterInput} placeholder="Ciudad..." value={filters.ciudad} onChange={(e) => { setFilters({ ...filters, ciudad: e.target.value }); setPage(1) }} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Estado</label>
              <select className={styles.filterSelect} value={filters.estado} onChange={(e) => { setFilters({ ...filters, estado: e.target.value }); setPage(1) }}>
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="activa">Aprobada</option>
                <option value="inactiva">Rechazada</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Fecha</label>
              <input className={styles.filterInput} type="date" value={filters.fecha} onChange={(e) => { setFilters({ ...filters, fecha: e.target.value }); setPage(1) }} />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Plan</label>
              <select className={styles.filterSelect} value={filters.plan} onChange={(e) => { setFilters({ ...filters, plan: e.target.value }); setPage(1) }}>
                <option value="">Todos</option>
                <option value="Basico">Basico</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkInfo}>{selected.length} empresa(s) seleccionada(s)</span>
          <div className={styles.bulkActions}>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnSuccess}`} onClick={handleBulkApprove}>
              <Check width={14} height={14} />
              Aprobar seleccionadas
            </button>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} onClick={handleBulkReject}>
              <XCircle width={14} height={14} />
              Rechazar seleccionadas
            </button>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnOutline}`} onClick={handleExport}>
              <Download width={14} height={14} />
              Exportar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Empresas registradas</span>
          <span className={styles.tableCount}>{filtered.length} resultado(s)</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" className={styles.checkbox} checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll} />
              </th>
              <th>Logo</th>
              <th>Empresa</th>
              <th>NIT</th>
              <th>Responsable</th>
              <th>Ciudad</th>
              <th>Plan</th>
              <th>Fecha Solicitud</th>
              <th>Estado</th>
              <th>Documentacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Building2 width={32} height={32} />
                    </div>
                    <div className={styles.emptyTitle}>No se encontraron resultados</div>
                    <div className={styles.emptyDesc}>Ajuste los filtros para ver mas empresas</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((empresa) => {
                const exp = expedientesEmpresas[empresa.id]
                const docsOk = exp ? exp.documentos.filter((d) => d.estado === 'aprobado').length : 0
                const docsTotal = exp ? exp.documentos.length : 0
                const badge = getEstadoBadge(empresa.estado)
                return (
                  <tr key={empresa.id} className={selected.includes(empresa.id) ? styles.selected : ''}>
                    <td>
                      <input type="checkbox" className={styles.checkbox} checked={selected.includes(empresa.id)} onChange={() => toggleSelect(empresa.id)} />
                    </td>
                    <td>
                      <div className={styles.companyLogo} style={{ background: empresa.logoColor }}>
                        {empresa.nombre.substring(0, 2).toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <div className={styles.companyName}>{empresa.nombre}</div>
                      <div className={styles.companyEmail}>{empresa.email}</div>
                    </td>
                    <td>{empresa.nit}</td>
                    <td>{empresa.responsable}</td>
                    <td>{empresa.ciudad}</td>
                    <td>
                      <span className={`${styles.badge} ${empresa.plan === 'Premium' ? styles.badgeRevision : styles.badgeDoc}`}>
                        {empresa.plan}
                      </span>
                    </td>
                    <td>{empresa.fechaRegistro}</td>
                    <td>
                      <span className={`${styles.badge} ${badge.class}`}>
                        <span className={styles.badgeDot}></span>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      {exp ? (
                        <span className={`${styles.badge} ${docsOk === docsTotal ? styles.badgeDocOk : docsOk > 0 ? styles.badgeDocPending : styles.badgeDocFail}`}>
                          {docsOk}/{docsTotal}
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeDoc}`}>--</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver expediente" onClick={() => openFile(empresa)}>
                          <Eye width={15} height={15} />
                        </button>
                        {empresa.estado === 'pendiente' && (
                          <>
                            <button className={`${styles.actionBtn} ${styles.actionBtnApprove}`} title="Aprobar" onClick={() => handleApprove(empresa)}>
                              <Check width={15} height={15} />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionBtnReject}`} title="Rechazar" onClick={() => handleReject(empresa)}>
                              <XCircle width={15} height={15} />
                            </button>
                          </>
                        )}
                        <button className={`${styles.actionBtn} ${styles.actionBtnEdit}`} title="Editar">
                          <Edit3 width={15} height={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <Pagination page={page} totalPages={totalPages} totalRecords={filtered.length} rowsPerPage={rowsPerPage} onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(1) }} onPageChange={setPage} />
        )}
      </div>

      {/* File Modal */}
      {viewingFile && (
        <Modal open={!!viewingFile} onClose={() => { setViewingFile(null); setViewingPdf(null) }} title="" wide>
          {viewingPdf ? (
            <PdfViewer documento={viewingPdf} onClose={() => setViewingPdf(null)} />
          ) : (
            <>
              <div className={styles.fileHeader}>
                <div className={styles.fileLogo} style={{ background: viewingFile.logoColor }}>
                  {viewingFile.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className={styles.fileTitleSection}>
                  <div className={styles.fileTitleName}>{viewingFile.nombre}</div>
                  <div className={styles.fileTitleMeta}>NIT: {viewingFile.nit} | {viewingFile.ciudad}</div>
                </div>
                <div className={styles.fileStatus}>
                  <span className={`${styles.badge} ${getEstadoBadge(viewingFile.estado).class}`}>
                    <span className={styles.badgeDot}></span>
                    {getEstadoBadge(viewingFile.estado).label}
                  </span>
                </div>
              </div>

              <div className={styles.fileTabs}>
                <button className={`${styles.fileTab} ${fileTab === 'info' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('info')}>Informacion General</button>
                <button className={`${styles.fileTab} ${fileTab === 'comercial' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('comercial')}>Informacion Comercial</button>
                <button className={`${styles.fileTab} ${fileTab === 'docs' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('docs')}>Documentacion ({expediente?.documentos.length || 0})</button>
                <button className={`${styles.fileTab} ${fileTab === 'timeline' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('timeline')}>Historial</button>
                <button className={`${styles.fileTab} ${fileTab === 'obs' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('obs')}>Observaciones</button>
              </div>

              {fileTab === 'info' && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <Building2 width={16} height={16} />
                    Informacion General
                  </div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Nombre Empresa</span>
                      <span className={styles.infoValue}>{viewingFile.nombre}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>NIT</span>
                      <span className={styles.infoValue}>{viewingFile.nit}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Responsable</span>
                      <span className={styles.infoValue}>{viewingFile.responsable}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Correo</span>
                      <span className={styles.infoValue}>{viewingFile.email}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Telefono</span>
                      <span className={styles.infoValue}>{viewingFile.telefono}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Direccion</span>
                      <span className={styles.infoValue}>{viewingFile.direccion}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Ciudad</span>
                      <span className={styles.infoValue}>{viewingFile.ciudad}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Plan Solicitado</span>
                      <span className={styles.infoValue}>{viewingFile.plan}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Fecha de Registro</span>
                      <span className={styles.infoValue}>{viewingFile.fechaRegistro}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Estado</span>
                      <span className={`${styles.badge} ${getEstadoBadge(viewingFile.estado).class}`}>
                        <span className={styles.badgeDot}></span>
                        {getEstadoBadge(viewingFile.estado).label}
                      </span>
                    </div>
                    <div className={styles.infoFieldFull}>
                      <span className={styles.infoLabel}>Descripcion</span>
                      <span className={styles.infoValue}>{viewingFile.descripcion}</span>
                    </div>
                  </div>
                </div>
              )}

              {fileTab === 'comercial' && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <Building2 width={16} height={16} />
                    Informacion Comercial
                  </div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Cobertura</span>
                      <span className={styles.infoValue}>{viewingFile.cobertura}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Horario</span>
                      <span className={styles.infoValue}>{viewingFile.horarioAtencion}</span>
                    </div>
                    <div className={styles.infoFieldFull}>
                      <span className={styles.infoLabel}>Descripcion</span>
                      <span className={styles.infoValue}>{viewingFile.descripcion}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Servicios</span>
                      <span className={styles.infoValue}>{viewingFile.servicios} servicios ofrecidos</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Observaciones</span>
                      <span className={styles.infoValue}>{viewingFile.observaciones || 'Sin observaciones'}</span>
                    </div>
                  </div>
                </div>
              )}

              {fileTab === 'docs' && expediente && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <FileText width={16} height={16} />
                    Documentacion Legal
                  </div>
                  <div className={styles.docsGrid}>
                    {expediente.documentos.map((doc) => {
                      const docBadge = getDocStatusBadge(doc.estado)
                      return (
                        <div key={doc.id} className={styles.docCard}>
                          <div className={styles.docIcon}>
                            <FileText width={20} height={20} />
                          </div>
                          <div className={styles.docInfo}>
                            <div className={styles.docName}>{doc.nombre}</div>
                            <div className={styles.docMeta}>{doc.tipo} | {doc.tamano} | {doc.fecha}</div>
                          </div>
                          <span className={`${styles.badge} ${docBadge.class}`}>{docBadge.label}</span>
                          <div className={styles.docActions}>
                            <button className={`${styles.docBtn} ${styles.docBtnPrimary}`} onClick={() => setViewingPdf(doc)}>
                              Ver PDF
                            </button>
                            <button className={styles.docBtn} onClick={() => {}}>
                              <Download width={12} height={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {fileTab === 'timeline' && expediente && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <Clock width={16} height={16} />
                    Historial
                  </div>
                  <div className={styles.timeline}>
                    {expediente.timeline.map((item) => (
                      <div key={item.id} className={styles.timelineItem}>
                        <div className={`${styles.timelineDot} ${item.tipo === 'info' ? styles.timelineDotInfo : item.tipo === 'warning' ? styles.timelineDotWarning : styles.timelineDotDanger}`}></div>
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineTitle}>{item.titulo}</div>
                          <div className={styles.timelineDesc}>{item.descripcion}</div>
                          <div className={styles.timelineDate}>{item.fecha}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fileTab === 'obs' && expediente && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <AlertTriangle width={16} height={16} />
                    Observaciones
                  </div>
                  <div className={styles.obsList}>
                    {expediente.observaciones.map((obs) => (
                      <div key={obs.id} className={styles.obsItem}>
                        <div className={styles.obsHeader}>
                          <span className={styles.obsAutor}>{obs.autor}</span>
                          <span className={styles.obsFecha}>{obs.fecha}</span>
                        </div>
                        <div className={styles.obsText}>{obs.texto}</div>
                      </div>
                    ))}
                  </div>
                  <textarea className={styles.obsInput} placeholder="Agregar observacion..." />
                  <div className={styles.obsActions}>
                    <button className="btn btnPrimary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Guardar Observacion</button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal>
      )}

      {/* Approve Dialog */}
      {approveDialog && (
        <Modal open={!!approveDialog} onClose={() => setApproveDialog(null)} title="">
          <div className={styles.confirmContent}>
            <div className={`${styles.confirmIcon} ${styles.confirmIconSuccess}`}>
              <Check width={28} height={28} />
            </div>
            <div className={styles.confirmMessage}>Desea aprobar esta empresa?</div>
            <div className={styles.confirmSummary}>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>Empresa</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.nombre}</span>
              </div>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>Responsable</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.responsable}</span>
              </div>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>Plan</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.plan}</span>
              </div>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>Ciudad</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.ciudad}</span>
              </div>
            </div>
            <div className={styles.confirmActions}>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnCancel}`} onClick={() => setApproveDialog(null)}>Cancelar</button>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnApprove}`} onClick={() => confirmApprove(approveDialog)}>Aprobar Empresa</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Dialog */}
      {rejectDialog && (
        <Modal open={!!rejectDialog} onClose={() => { setRejectDialog(null); setRejectReason('') }} title="">
          <div className={styles.confirmContent}>
            <div className={`${styles.confirmIcon} ${styles.confirmIconDanger}`}>
              <XCircle width={28} height={28} />
            </div>
            <div className={styles.confirmMessage}>Rechazar empresa <strong>{rejectDialog.nombre}</strong></div>
            <div className={styles.rejectReason}>
              <label>Motivo del rechazo (obligatorio)</label>
              <textarea placeholder="Ingrese el motivo del rechazo..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className={styles.confirmActions}>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnCancel}`} onClick={() => { setRejectDialog(null); setRejectReason('') }}>Cancelar</button>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnReject}`} onClick={confirmReject} disabled={!rejectReason.trim()}>Rechazar Empresa</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
