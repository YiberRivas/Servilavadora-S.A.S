import { useState, useMemo } from 'react'
import { CreditCard, Search, X, Eye, Edit3, Check, XCircle, Download, Filter, Building2, RefreshCw, AlertTriangle, CheckCircle2, Clock, DollarSign } from 'lucide-react'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import { empresas, planes, pagos } from '../data/mockData'
import styles from '../styles/pages/Planes.module.css'

const formatCurrency = (val) => `$${val.toLocaleString('es-CO')}`

export default function Planes() {
  const [items, setItems] = useState(empresas.filter((e) => e.estado === 'activa' || e.estado === 'inactiva'))
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({ empresa: '', plan: '', estadoPago: '', ciudad: '', vencenProximo: '', enMora: '' })
  const [selected, setSelected] = useState([])
  const [viewingPayments, setViewingPayments] = useState(null)
  const [toast, setToast] = useState(null)

  const filtered = useMemo(() => {
    return items.filter((e) => {
      if (filters.empresa && !e.nombre.toLowerCase().includes(filters.empresa.toLowerCase())) return false
      if (filters.plan && e.plan !== filters.plan) return false
      if (filters.estadoPago && e.estadoPago !== filters.estadoPago) return false
      if (filters.ciudad && !e.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())) return false
      if (filters.vencenProximo && e.estadoPago !== 'proximo_vencer') return false
      if (filters.enMora && e.estadoPago !== 'en_mora') return false
      return true
    })
  }, [items, filters])

  const totalPages = Math.ceil(filtered.length / rowsPerPage)
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const stats = useMemo(() => ({
    activas: items.filter((e) => e.estadoPago === 'pagado').length,
    proximas: items.filter((e) => e.estadoPago === 'proximo_vencer').length,
    mora: items.filter((e) => e.estadoPago === 'en_mora').length,
    ingresos: items.reduce((sum, e) => sum + (e.valorMensual || 0), 0),
  }), [items])

  const showToast = (msg) => {
    setToast({ msg })
    setTimeout(() => setToast(null), 3000)
  }

  const clearFilters = () => {
    setFilters({ empresa: '', plan: '', estadoPago: '', ciudad: '', vencenProximo: '', enMora: '' })
    setPage(1)
  }

  const getEstadoPagoBadge = (estado) => {
    const map = {
      pagado: { class: styles.badgePagado, label: 'Pagado', icon: CheckCircle2 },
      proximo_vencer: { class: styles.badgeProximo, label: 'Proximo a vencer', icon: Clock },
      en_mora: { class: styles.badgeMora, label: 'En mora', icon: AlertTriangle },
      pendiente: { class: styles.badgePendiente, label: 'Pendiente', icon: Clock },
      suspendido: { class: styles.badgeSuspendido, label: 'Suspendido', icon: XCircle },
    }
    return map[estado] || map.pendiente
  }

  const handleExport = () => {
    const csv = ['Empresa,NIT,Plan,Valor Mensual,Estado Pago,Proximo Pago,Metodo,Ciudad']
    filtered.forEach((e) => {
      csv.push(`"${e.nombre}","${e.nit}","${e.plan}",${e.valorMensual || 0},"${e.estadoPago}","${e.proximoPago || '-'}","${e.metodoPago || '-'}","${e.ciudad}"`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'planes_suscripciones.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Archivo CSV exportado')
  }

  const empresaPagos = viewingPayments ? pagos.filter((p) => p.empresaId === viewingPayments.id) : []

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

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
            <CheckCircle2 width={22} height={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Al Dia</span>
            <span className={styles.statValue}>{stats.activas}</span>
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
          <div key={plan.id} className={styles.planCard} style={{ borderTopColor: plan.color }}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>{plan.nombre}</span>
              <span className={styles.planPrice}>{formatCurrency(plan.valorMensual)}/mes</span>
            </div>
            <div className={styles.planStats}>
              <span className={styles.planEmpresas}>{plan.empresas} empresas</span>
              <span className={styles.planDesc}>{plan.descripcion}</span>
            </div>
            <div className={styles.planFeatures}>
              <span>{plan.maxUsuarios} usuarios</span>
              <span>{plan.maxServicios === -1 ? 'Ilimitados' : `${plan.maxServicios} servicios`}</span>
              <span>Soporte: {plan.soporte}</span>
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
            <label className={styles.filterLabel}>Plan</label>
            <select className={styles.filterSelect} value={filters.plan} onChange={(e) => { setFilters({ ...filters, plan: e.target.value }); setPage(1) }}>
              <option value="">Todos</option>
              <option value="Basico">Basico</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado Pago</label>
            <select className={styles.filterSelect} value={filters.estadoPago} onChange={(e) => { setFilters({ ...filters, estadoPago: e.target.value }); setPage(1) }}>
              <option value="">Todos</option>
              <option value="pagado">Pagado</option>
              <option value="proximo_vencer">Proximo a vencer</option>
              <option value="en_mora">En mora</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Ciudad</label>
            <input className={styles.filterInput} placeholder="Ciudad..." value={filters.ciudad} onChange={(e) => { setFilters({ ...filters, ciudad: e.target.value }); setPage(1) }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>Suscripciones activas</span>
          <div className={styles.tableHeaderActions}>
            <span className={styles.tableCount}>{filtered.length} resultado(s)</span>
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
              <th>Plan</th>
              <th>Valor Mensual</th>
              <th>Estado Pago</th>
              <th>Proximo Pago</th>
              <th>Metodo</th>
              <th>Renovacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><Building2 width={32} height={32} /></div>
                    <div className={styles.emptyTitle}>No se encontraron resultados</div>
                    <div className={styles.emptyDesc}>Ajuste los filtros para ver mas registros</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((empresa) => {
                const badge = getEstadoPagoBadge(empresa.estadoPago)
                const BadgeIcon = badge.icon
                return (
                  <tr key={empresa.id}>
                    <td>
                      <div className={styles.companyCell}>
                        <div className={styles.companyLogo} style={{ background: empresa.logoColor }}>
                          {empresa.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.companyName}>{empresa.nombre}</div>
                          <div className={styles.companyMeta}>{empresa.ciudad}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${empresa.plan === 'Premium' ? styles.badgePremium : styles.badgeBasico}`}>
                        {empresa.plan}
                      </span>
                    </td>
                    <td className={styles.valorCell}>{formatCurrency(empresa.valorMensual || 0)}</td>
                    <td>
                      <span className={`${styles.badge} ${badge.class}`}>
                        <BadgeIcon width={12} height={12} />
                        {badge.label}
                      </span>
                    </td>
                    <td>{empresa.proximoPago || '--'}</td>
                    <td>{empresa.metodoPago || '--'}</td>
                    <td>
                      <span className={`${styles.badge} ${empresa.renovacionAutomatica ? styles.badgeRenovSi : styles.badgeRenovNo}`}>
                        {empresa.renovacionAutomatica ? 'Automatica' : 'Manual'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button className={`${styles.actionBtn} ${styles.actionBtnView}`} title="Ver pagos" onClick={() => setViewingPayments(empresa)}>
                          <Eye width={15} height={15} />
                        </button>
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

      {/* Payment History Modal */}
      {viewingPayments && (
        <Modal open={!!viewingPayments} onClose={() => setViewingPayments(null)} title={`Historial de Pagos - ${viewingPayments.nombre}`} wide>
          <div className={styles.paymentSummary}>
            <div className={styles.paymentSummaryRow}>
              <span className={styles.paymentLabel}>Plan Actual</span>
              <span className={styles.paymentValue}>{viewingPayments.plan}</span>
            </div>
            <div className={styles.paymentSummaryRow}>
              <span className={styles.paymentLabel}>Valor Mensual</span>
              <span className={styles.paymentValue}>{formatCurrency(viewingPayments.valorMensual || 0)}</span>
            </div>
            <div className={styles.paymentSummaryRow}>
              <span className={styles.paymentLabel}>Estado</span>
              <span className={`${styles.badge} ${getEstadoPagoBadge(viewingPayments.estadoPago).class}`}>
                {getEstadoPagoBadge(viewingPayments.estadoPago).label}
              </span>
            </div>
            <div className={styles.paymentSummaryRow}>
              <span className={styles.paymentLabel}>Metodo de Pago</span>
              <span className={styles.paymentValue}>{viewingPayments.metodoPago || '--'}</span>
            </div>
            <div className={styles.paymentSummaryRow}>
              <span className={styles.paymentLabel}>Proximo Pago</span>
              <span className={styles.paymentValue}>{viewingPayments.proximoPago || '--'}</span>
            </div>
            <div className={styles.paymentSummaryRow}>
              <span className={styles.paymentLabel}>Renovacion</span>
              <span className={styles.paymentValue}>{viewingPayments.renovacionAutomatica ? 'Automatica' : 'Manual'}</span>
            </div>
          </div>
          <div className={styles.paymentTableTitle}>Historial de Pagos</div>
          <table className={styles.paymentTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Factura</th>
                <th>Metodo</th>
              </tr>
            </thead>
            <tbody>
              {empresaPagos.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>Sin pagos registrados</td></tr>
              ) : (
                empresaPagos.map((pago) => (
                  <tr key={pago.id}>
                    <td>{pago.fecha}</td>
                    <td className={styles.valorCell}>{formatCurrency(pago.valor)}</td>
                    <td>
                      <span className={`${styles.badge} ${getEstadoPagoBadge(pago.estado).class}`}>
                        {getEstadoPagoBadge(pago.estado).label}
                      </span>
                    </td>
                    <td>{pago.factura}</td>
                    <td>{pago.metodo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  )
}
