import { useState, useEffect, useMemo } from 'react'
import { Building2, Search, X, Eye, Check, XCircle, Edit3, FileText, Download, Clock, AlertTriangle, CheckCircle2, Filter, ChevronDown } from 'lucide-react'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import PdfViewer from '../components/PdfViewer'
import { api } from '../services/api'
import styles from '../styles/pages/AprobarEmpresas.module.css'

export default function AprobarEmpresas() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filters, setFilters] = useState({ empresa: '', nit: '', responsable: '', email: '', ciudad: '', estado: '', fecha: '' })
  const [showFilters, setShowFilters] = useState(true)
  const [viewingFile, setViewingFile] = useState(null)
  const [fileTab, setFileTab] = useState('info')
  const [viewingPdf, setViewingPdf] = useState(null)
  const [approveDialog, setApproveDialog] = useState(null)
  const [rejectDialog, setRejectDialog] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [toast, setToast] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchEmpresas = async (currentPage = page, perPage = rowsPerPage) => {
    setLoading(true)
    try {
      const response = await api.get(`/empresas/pendientes?page=${currentPage}&per_page=${perPage}`)
      if (response.success) {
        setItems(response.data || [])
        setTotalPages(response.total_pages || 1)
        setTotalRecords(response.total || 0)
      } else {
        showToast(response.message || 'Error al cargar empresas', 'danger')
      }
    } catch (error) {
      showToast('Error de conexion con el servidor', 'danger')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas(page, rowsPerPage)
  }, [page, rowsPerPage])

  const filtered = useMemo(() => {
    return items.filter((e) => {
      const nombre = e.razon_social || e.nombre_comercial || ''
      if (filters.empresa && !nombre.toLowerCase().includes(filters.empresa.toLowerCase())) return false
      if (filters.nit && !e.nit?.includes(filters.nit)) return false
      if (filters.responsable && !e.representante_legal?.toLowerCase().includes(filters.responsable.toLowerCase())) return false
      if (filters.email && !e.correo?.toLowerCase().includes(filters.email.toLowerCase())) return false
      if (filters.fecha && !e.fecha_registro?.includes(filters.fecha)) return false
      return true
    })
  }, [items, filters])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const clearFilters = () => {
    setFilters({ empresa: '', nit: '', responsable: '', email: '', ciudad: '', estado: '', fecha: '' })
    setPage(1)
  }

  const toggleSelectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([])
    } else {
      setSelected(filtered.map((e) => e.uuid))
    }
  }

  const toggleSelect = (uuid) => {
    setSelected((prev) => prev.includes(uuid) ? prev.filter((x) => x !== uuid) : [...prev, uuid])
  }

  const handleApprove = (empresa) => {
    setApproveDialog(empresa)
  }

  const confirmApprove = async (empresa) => {
    setActionLoading(true)
    try {
      const response = await api.put(`/empresas/${empresa.uuid}/aprobar`)
      if (response.success) {
        setItems((prev) => prev.filter((e) => e.uuid !== empresa.uuid))
        setSelected((prev) => prev.filter((x) => x !== empresa.uuid))
        setApproveDialog(null)
        setTotalRecords((prev) => prev - 1)
        showToast(`Empresa "${empresa.razon_social || empresa.nombre_comercial}" aprobada exitosamente`)
      } else {
        showToast(response.message || 'Error al aprobar empresa', 'danger')
      }
    } catch (error) {
      showToast('Error de conexion al aprobar empresa', 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = (empresa) => {
    setRejectDialog(empresa)
    setRejectReason('')
  }

  const confirmReject = async () => {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    try {
      const response = await api.put(`/empresas/${rejectDialog.uuid}/rechazar?observaciones=${encodeURIComponent(rejectReason)}`)
      if (response.success) {
        setItems((prev) => prev.filter((e) => e.uuid !== rejectDialog.uuid))
        setSelected((prev) => prev.filter((x) => x !== rejectDialog.uuid))
        setRejectDialog(null)
        setRejectReason('')
        setTotalRecords((prev) => prev - 1)
        showToast(`Empresa "${rejectDialog.razon_social || rejectDialog.nombre_comercial}" rechazada`, 'danger')
      } else {
        showToast(response.message || 'Error al rechazar empresa', 'danger')
      }
    } catch (error) {
      showToast('Error de conexion al rechazar empresa', 'danger')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkApprove = async () => {
    setActionLoading(true)
    let successCount = 0
    let failCount = 0
    for (const uuid of selected) {
      try {
        const response = await api.put(`/empresas/${uuid}/aprobar`)
        if (response.success) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }
    setItems((prev) => prev.filter((e) => !selected.includes(e.uuid)))
    setSelected([])
    setTotalRecords((prev) => prev - successCount)
    setActionLoading(false)
    if (successCount > 0) {
      showToast(`${successCount} empresa(s) aprobada(s)`)
    }
    if (failCount > 0) {
      showToast(`${failCount} empresa(s) no pudieron ser aprobadas`, 'danger')
    }
  }

  const handleBulkReject = async () => {
    setActionLoading(true)
    let successCount = 0
    let failCount = 0
    for (const uuid of selected) {
      try {
        const response = await api.put(`/empresas/${uuid}/rechazar?observaciones=${encodeURIComponent('Rechazo masivo')}`)
        if (response.success) {
          successCount++
        } else {
          failCount++
        }
      } catch {
        failCount++
      }
    }
    setItems((prev) => prev.filter((e) => !selected.includes(e.uuid)))
    setSelected([])
    setTotalRecords((prev) => prev - successCount)
    setActionLoading(false)
    if (successCount > 0) {
      showToast(`${successCount} empresa(s) rechazada(s)`, 'danger')
    }
    if (failCount > 0) {
      showToast(`${failCount} empresa(s) no pudieron ser rechazadas`, 'danger')
    }
  }

  const handleExport = () => {
    const csv = ['Empresa,NIT,Responsable,Correo,Fecha Registro']
    filtered.forEach((e) => {
      const nombre = e.razon_social || e.nombre_comercial || ''
      csv.push(`"${nombre}","${e.nit || ''}","${e.representante_legal || ''}","${e.correo || ''}","${e.fecha_registro || ''}"`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'empresas_pendientes.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Archivo CSV exportado')
  }

  const openFile = (empresa) => {
    setViewingFile(empresa)
    setFileTab('info')
    setViewingPdf(null)
  }

  const getEstadoBadge = () => {
    return { class: styles.badgePendiente, label: 'Pendiente' }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '--'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' })
    } catch {
      return dateStr
    }
  }

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
            <span className={styles.statValue}>{totalRecords}</span>
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
              <label className={styles.filterLabel}>Fecha Registro</label>
              <input className={styles.filterInput} type="date" value={filters.fecha} onChange={(e) => { setFilters({ ...filters, fecha: e.target.value }); setPage(1) }} />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkInfo}>{selected.length} empresa(s) seleccionada(s)</span>
          <div className={styles.bulkActions}>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnSuccess}`} onClick={handleBulkApprove} disabled={actionLoading}>
              <Check width={14} height={14} />
              Aprobar seleccionadas
            </button>
            <button className={`${styles.bulkBtn} ${styles.bulkBtnDanger}`} onClick={handleBulkReject} disabled={actionLoading}>
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
          <span className={styles.tableTitle}>Empresas pendientes de aprobacion</span>
          <span className={styles.tableCount}>{totalRecords} resultado(s)</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" className={styles.checkbox} checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
              </th>
              <th>Empresa</th>
              <th>NIT</th>
              <th>Responsable Legal</th>
              <th>Correo</th>
              <th>Telefono</th>
              <th>Fecha Solicitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Clock width={32} height={32} />
                    </div>
                    <div className={styles.emptyTitle}>Cargando empresas...</div>
                    <div className={styles.emptyDesc}>Espere un momento</div>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Building2 width={32} height={32} />
                    </div>
                    <div className={styles.emptyTitle}>No se encontraron resultados</div>
                    <div className={styles.emptyDesc}>No hay empresas pendientes de aprobacion</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((empresa) => {
                const nombre = empresa.razon_social || empresa.nombre_comercial || ''
                const iniciales = nombre.substring(0, 2).toUpperCase()
                const badge = getEstadoBadge()
                return (
                  <tr key={empresa.uuid} className={selected.includes(empresa.uuid) ? styles.selected : ''}>
                    <td>
                      <input type="checkbox" className={styles.checkbox} checked={selected.includes(empresa.uuid)} onChange={() => toggleSelect(empresa.uuid)} />
                    </td>
                    <td>
                      <div className={styles.companyName}>{nombre}</div>
                    </td>
                    <td>{empresa.nit || '--'}</td>
                    <td>{empresa.representante_legal || '--'}</td>
                    <td>{empresa.correo || '--'}</td>
                    <td>{empresa.telefono || '--'}</td>
                    <td>{formatDate(empresa.fecha_registro)}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver detalles" onClick={() => openFile(empresa)}>
                          <Eye width={15} height={15} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnApprove}`} title="Aprobar" onClick={() => handleApprove(empresa)} disabled={actionLoading}>
                          <Check width={15} height={15} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionBtnReject}`} title="Rechazar" onClick={() => handleReject(empresa)} disabled={actionLoading}>
                          <XCircle width={15} height={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        {totalRecords > 0 && (
          <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} rowsPerPage={rowsPerPage} onRowsPerPageChange={(v) => { setRowsPerPage(v); setPage(1) }} onPageChange={setPage} />
        )}
      </div>

      {/* Detail Modal */}
      {viewingFile && (
        <Modal open={!!viewingFile} onClose={() => { setViewingFile(null); setViewingPdf(null) }} title="" wide>
          {viewingPdf ? (
            <PdfViewer documento={viewingPdf} onClose={() => setViewingPdf(null)} />
          ) : (
            <>
              <div className={styles.fileHeader}>
                <div className={styles.fileLogo} style={{ background: 'var(--primary)' }}>
                  {(viewingFile.razon_social || viewingFile.nombre_comercial || '').substring(0, 2).toUpperCase()}
                </div>
                <div className={styles.fileTitleSection}>
                  <div className={styles.fileTitleName}>{viewingFile.razon_social || viewingFile.nombre_comercial || ''}</div>
                  <div className={styles.fileTitleMeta}>NIT: {viewingFile.nit || '--'}</div>
                </div>
                <div className={styles.fileStatus}>
                  <span className={`${styles.badge} ${getEstadoBadge().class}`}>
                    <span className={styles.badgeDot}></span>
                    {getEstadoBadge().label}
                  </span>
                </div>
              </div>

              <div className={styles.fileTabs}>
                <button className={`${styles.fileTab} ${fileTab === 'info' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('info')}>Informacion General</button>
                <button className={`${styles.fileTab} ${fileTab === 'docs' ? styles.fileTabActive : ''}`} onClick={() => setFileTab('docs')}>Documentacion</button>
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
                      <span className={styles.infoLabel}>Razon Social</span>
                      <span className={styles.infoValue}>{viewingFile.razon_social || '--'}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Nombre Comercial</span>
                      <span className={styles.infoValue}>{viewingFile.nombre_comercial || '--'}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>NIT</span>
                      <span className={styles.infoValue}>{viewingFile.nit || '--'}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Representante Legal</span>
                      <span className={styles.infoValue}>{viewingFile.representante_legal || '--'}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Correo</span>
                      <span className={styles.infoValue}>{viewingFile.correo || '--'}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Telefono</span>
                      <span className={styles.infoValue}>{viewingFile.telefono || '--'}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Fecha de Registro</span>
                      <span className={styles.infoValue}>{formatDate(viewingFile.fecha_registro)}</span>
                    </div>
                    <div className={styles.infoField}>
                      <span className={styles.infoLabel}>Estado</span>
                      <span className={`${styles.badge} ${getEstadoBadge().class}`}>
                        <span className={styles.badgeDot}></span>
                        {getEstadoBadge().label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {fileTab === 'docs' && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <FileText width={16} height={16} />
                    Documentacion
                  </div>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <FileText width={32} height={32} />
                    </div>
                    <div className={styles.emptyTitle}>Documentos no disponibles</div>
                    <div className={styles.emptyDesc}>La documentacion estara disponible proximamente</div>
                  </div>
                </div>
              )}

              {fileTab === 'obs' && (
                <div className={styles.infoSection}>
                  <div className={styles.infoSectionTitle}>
                    <AlertTriangle width={16} height={16} />
                    Observaciones
                  </div>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <AlertTriangle width={32} height={32} />
                    </div>
                    <div className={styles.emptyTitle}>Sin observaciones</div>
                    <div className={styles.emptyDesc}>No hay observaciones registradas para esta empresa</div>
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
                <span className={styles.confirmSummaryValue}>{approveDialog.razon_social || approveDialog.nombre_comercial || ''}</span>
              </div>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>NIT</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.nit || '--'}</span>
              </div>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>Representante Legal</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.representante_legal || '--'}</span>
              </div>
              <div className={styles.confirmSummaryRow}>
                <span className={styles.confirmSummaryLabel}>Correo</span>
                <span className={styles.confirmSummaryValue}>{approveDialog.correo || '--'}</span>
              </div>
            </div>
            <div className={styles.confirmActions}>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnCancel}`} onClick={() => setApproveDialog(null)} disabled={actionLoading}>Cancelar</button>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnApprove}`} onClick={() => confirmApprove(approveDialog)} disabled={actionLoading}>Aprobar Empresa</button>
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
            <div className={styles.confirmMessage}>Rechazar empresa <strong>{rejectDialog.razon_social || rejectDialog.nombre_comercial || ''}</strong></div>
            <div className={styles.rejectReason}>
              <label>Motivo del rechazo (obligatorio)</label>
              <textarea placeholder="Ingrese el motivo del rechazo..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <div className={styles.confirmActions}>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnCancel}`} onClick={() => { setRejectDialog(null); setRejectReason('') }} disabled={actionLoading}>Cancelar</button>
              <button className={`${styles.confirmBtn} ${styles.confirmBtnReject}`} onClick={confirmReject} disabled={!rejectReason.trim() || actionLoading}>Rechazar Empresa</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}