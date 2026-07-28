import { useState, useEffect, useMemo } from 'react'
import { CreditCard, Search, X, Eye, Edit3, Check, XCircle, Download, Filter, Building2, RefreshCw, AlertTriangle, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import { api } from '../services/api'
import styles from '../styles/pages/Planes.module.css'

const formatCurrency = (val) => `$${Number(val || 0).toLocaleString('es-CO')}`

export default function Planes() {
  const [planes, setPlanes] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [filters, setFilters] = useState({ empresa: '', plan: '', estadoPago: '', ciudad: '' })
  const [viewingPayments, setViewingPayments] = useState(null)
  const [empresaPagos, setEmpresaPagos] = useState([])
  const [loadingEmpresaPagos, setLoadingEmpresaPagos] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchPlanes()
  }, [])

  useEffect(() => {
    fetchPagos()
  }, [page, rowsPerPage])

  const fetchPlanes = async () => {
    try {
      const res = await api.get('/empresas/planes/all')
      if (res.success && res.data) {
        setPlanes(res.data)
      }
    } catch (err) {
      console.error('Error fetching planes:', err)
    }
  }

  const fetchPagos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', rowsPerPage)

      const res = await api.get(`/empresas/pagos/all?${params.toString()}`)
      if (res.success) {
        setPagos(res.data || [])
        setTotalPages(res.total_pages || 1)
        setTotalRecords(res.total || 0)
      }
    } catch (err) {
      console.error('Error fetching pagos:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return pagos.filter((p) => {
      if (filters.empresa && !p.empresa_nombre?.toLowerCase().includes(filters.empresa.toLowerCase())) return false
      if (filters.estadoPago && p.estado_pago_nombre?.toLowerCase() !== filters.estadoPago.toLowerCase()) return false
      if (filters.plan && p.plan_nombre?.toLowerCase() !== filters.plan.toLowerCase()) return false
      return true
    })
  }, [pagos, filters])

  const stats = useMemo(() => {
    const pagado = pagos.filter(p => p.estado_pago_nombre?.toLowerCase().includes('pagado'))
    const proximo = pagos.filter(p => p.estado_pago_nombre?.toLowerCase().includes('proximo'))
    const mora = pagos.filter(p => p.estado_pago_nombre?.toLowerCase().includes('mora'))
    return {
      alDia: pagado.length,
      proximas: proximo.length,
      mora: mora.length,
      ingresos: pagado.reduce((sum, p) => sum + (p.valor || 0), 0),
    }
  }, [pagos])

  const showToast = (msg) => {
    setToast({ msg })
    setTimeout(() => setToast(null), 3000)
  }

  const clearFilters = () => {
    setFilters({ empresa: '', plan: '', estadoPago: '', ciudad: '' })
    setPage(1)
  }

  const getEstadoPagoBadge = (estado) => {
    const normalized = estado?.toLowerCase() || ''
    if (normalized.includes('pagado')) return { class: styles.badgePagado, label: estado, icon: CheckCircle2 }
    if (normalized.includes('proximo')) return { class: styles.badgeProximo, label: estado, icon: Clock }
    if (normalized.includes('mora')) return { class: styles.badgeMora, label: estado, icon: AlertTriangle }
    if (normalized.includes('pendiente')) return { class: styles.badgePendiente, label: estado, icon: Clock }
    if (normalized.includes('suspendido')) return { class: styles.badgeSuspendido, label: estado, icon: XCircle }
    return { class: styles.badgePendiente, label: estado || 'Desconocido', icon: Clock }
  }

  const handleExport = () => {
    const csv = ['Empresa,Fecha,Valor,Metodo,Estado,Transaccion']
    filtered.forEach((p) => {
      csv.push(`"${p.empresa_nombre || ''}","${p.fecha_pago || ''}",${p.valor || 0},"${p.metodo_pago_nombre || ''}","${p.estado_pago_nombre || ''}","${p.numero_transaccion || ''}"`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pagos_suscripciones.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Archivo CSV exportado')
  }

  const fetchEmpresaPagos = async (idEmpresa) => {
    setLoadingEmpresaPagos(true)
    try {
      const res = await api.get(`/empresas/pagos/all?id_empresa=${idEmpresa}&page=1&per_page=100`)
      if (res.success && res.data) {
        setEmpresaPagos(res.data)
      }
    } catch (err) {
      console.error('Error fetching empresa pagos:', err)
    } finally {
      setLoadingEmpresaPagos(false)
    }
  }

  const handleViewPayments = (pago) => {
    setViewingPayments(pago)
    fetchEmpresaPagos(pago.id_empresa)
  }

  return (
    <div>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 'var(--radius-sm)',
          background: 'var(--success)', color: 'var(--white)',
          fontSize: '0.85rem', fontWeight: 600, boxShadow: 'var(--shadow-md)',
        }}>{toast.msg}</div>
      )}

      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw width={32} height={32} className={styles.loadingSpinner} style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--gray-500)' }}>Cargando datos...</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
            <CheckCircle2 width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Al Dia</span>
            <span className={styles.statValue}>{stats.alDia}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--warning-tint)', color: 'var(--warning)' }}>
            <Clock width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Proximos a Vencer</span>
            <span className={styles.statValue}>{stats.proximas}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
            <AlertTriangle width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>En Mora</span>
            <span className={styles.statValue}>{stats.mora}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
            <DollarSign width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ingresos Mensuales</span>
            <span className={styles.statValue}>{formatCurrency(stats.ingresos)}</span>
          </div>
        </div>
      </div>

      {/* Plans Summary */}
      <div className={styles.plansRow}>
        {planes.map((plan) => (
          <div key={plan.uuid} className={styles.planCard} style={{ borderTopColor: plan.color || 'var(--primary)' }}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>{plan.nombre}</span>
              <span className={styles.planPrice}>{formatCurrency(plan.precio_mensual)}/mes</span>
            </div>
            <div className={styles.planStats}>
              <span className={styles.planDesc}>{plan.descripcion}</span>
            </div>
            <div className={styles.planFeatures}>
              <span>{plan.cantidad_sucursales || 0} sucursales</span>
              <span>{plan.cantidad_repartidores || 0} repartidores</span>
              <span>{plan.cantidad_lavadoras || 0} lavadoras</span>
              <span>Soporte: {plan.soporte_prioritario ? 'Prioritario' : 'Basico'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filterPanel}>
        <div className={styles.filterHeader}>
          <span className={styles.filterTitle}>
            <Filter width={16} height={16} />
            Filtros
          </span>
          <div className={styles.filterActions}>
            <button className={styles.btnClear} onClick={clearFilters}>
              <X width={14} height={14} />
              Limpiar
            </button>
          </div>
        </div>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Empresa</label>
            <input className={styles.filterInput} placeholder="Nombre..." value={filters.empresa} onChange={(e) => { setFilters({ ...filters, empresa: e.target.value }); setPage(1) }} />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado Pago</label>
            <select className={styles.filterSelect} value={filters.estadoPago} onChange={(e) => { setFilters({ ...filters, estadoPago: e.target.value }); setPage(1) }}>
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="proximo a vencer">Proximo a vencer</option>
              <option value="en mora">En mora</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Historial de Pagos</span>
          <div className={styles.tableHeaderActions}>
            <span className={styles.tableCount}>{totalRecords} resultado(s)</span>
            <button className={styles.exportBtn} onClick={handleExport}>
              <Download width={14} height={14} />
              Exportar
            </button>
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Valor</th>
              <th>Fecha Pago</th>
              <th>Metodo</th>
              <th>Estado</th>
              <th>Transaccion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><RefreshCw width={32} height={32} /></div>
                    <div className={styles.emptyTitle}>Cargando registros...</div>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><Building2 width={32} height={32} /></div>
                    <div className={styles.emptyTitle}>No se encontraron resultados</div>
                    <div className={styles.emptyDesc}>Ajuste los filtros para ver mas registros</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((pago) => {
                const badge = getEstadoPagoBadge(pago.estado_pago_nombre)
                const BadgeIcon = badge.icon
                return (
                  <tr key={pago.uuid}>
                    <td>
                      <div className={styles.companyCell}>
                        <div className={styles.companyLogo} style={{ background: pago.empresa_color || 'var(--primary)' }}>
                          {(pago.empresa_nombre || '').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.companyName}>{pago.empresa_nombre}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.valorCell}>{formatCurrency(pago.valor)}</td>
                    <td>{pago.fecha_pago || '--'}</td>
                    <td>{pago.metodo_pago_nombre || '--'}</td>
                    <td>
                      <span className={`${styles.badge} ${badge.class}`} style={pago.estado_pago_color ? { background: pago.estado_pago_color + '20', color: pago.estado_pago_color } : undefined}>
                        <BadgeIcon width={12} height={12} />
                        {badge.label}
                      </span>
                    </td>
                    <td>{pago.numero_transaccion || '--'}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver pagos" onClick={() => handleViewPayments(pago)}>
                          <Eye width={15} height={15} />
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

      {/* Payment History Modal */}
      {viewingPayments && (
        <Modal open={!!viewingPayments} onClose={() => { setViewingPayments(null); setEmpresaPagos([]) }} title={`Historial de Pagos - ${viewingPayments.empresa_nombre}`} wide>
          {loadingEmpresaPagos ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <RefreshCw width={24} height={24} style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--gray-400)' }}>Cargando historial...</div>
            </div>
          ) : (
            <>
              <div className={styles.paymentSummary}>
                <div className={styles.paymentSummaryRow}>
                  <span className={styles.paymentLabel}>Empresa</span>
                  <span className={styles.paymentValue}>{viewingPayments.empresa_nombre}</span>
                </div>
                <div className={styles.paymentSummaryRow}>
                  <span className={styles.paymentLabel}>Ultimo Pago</span>
                  <span className={styles.paymentValue}>{formatCurrency(viewingPayments.valor)}</span>
                </div>
                <div className={styles.paymentSummaryRow}>
                  <span className={styles.paymentLabel}>Estado</span>
                  <span className={`${styles.badge} ${getEstadoPagoBadge(viewingPayments.estado_pago_nombre).class}`}>
                    {getEstadoPagoBadge(viewingPayments.estado_pago_nombre).label}
                  </span>
                </div>
                <div className={styles.paymentSummaryRow}>
                  <span className={styles.paymentLabel}>Metodo de Pago</span>
                  <span className={styles.paymentValue}>{viewingPayments.metodo_pago_nombre || '--'}</span>
                </div>
                <div className={styles.paymentSummaryRow}>
                  <span className={styles.paymentLabel}>Fecha</span>
                  <span className={styles.paymentValue}>{viewingPayments.fecha_pago || '--'}</span>
                </div>
              </div>
              <div className={styles.paymentTableTitle}>Historial de Pagos</div>
              <table className={styles.paymentTable}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Valor</th>
                    <th>Estado</th>
                    <th>Transaccion</th>
                    <th>Metodo</th>
                  </tr>
                </thead>
                <tbody>
                  {empresaPagos.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>Sin pagos registrados</td></tr>
                  ) : (
                    empresaPagos.map((pago) => {
                      const badge = getEstadoPagoBadge(pago.estado_pago_nombre)
                      return (
                        <tr key={pago.uuid}>
                          <td>{pago.fecha_pago}</td>
                          <td className={styles.valorCell}>{formatCurrency(pago.valor)}</td>
                          <td>
                            <span className={`${styles.badge} ${badge.class}`} style={pago.estado_pago_color ? { background: pago.estado_pago_color + '20', color: pago.estado_pago_color } : undefined}>
                              {badge.label}
                            </span>
                          </td>
                          <td>{pago.numero_transaccion || '--'}</td>
                          <td>{pago.metodo_pago_nombre || '--'}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
