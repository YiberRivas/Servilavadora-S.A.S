import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { stats, empresas, pagos, planes, dashboardData } from '../data/mockData'
import styles from '../styles/pages/Dashboard.module.css'

const COLORS = {
  blue: '#2D6CB5',
  accent: '#12A594',
  warning: '#E8A317',
  danger: '#D64545',
  success: '#28A745',
  blueDark: '#1F4E79',
}

const PIE_COLORS = [COLORS.accent, COLORS.warning, COLORS.danger]

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
  return `$${val}`
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos dias'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const formatTime = (d) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const formatDateFull = (d) => d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const getActivityIcon = (tipo) => {
  const map = {
    empresa_aprobada: styles.timelineIconSuccess,
    usuario_nuevo: styles.timelineIconInfo,
    empresa_info: styles.timelineIconAccent,
    pago_recibido: styles.timelineIconSuccess,
    pago_vencido: styles.timelineIconDanger,
    empresa_registro: styles.timelineIconWarning,
    renovacion: styles.timelineIconInfo,
  }
  return map[tipo] || styles.timelineIconInfo
}

const getActivitySvg = (tipo) => {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' }
  switch (tipo) {
    case 'empresa_aprobada':
      return <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>
    case 'usuario_nuevo':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
    case 'empresa_info':
      return <svg {...common}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    case 'pago_recibido':
      return <svg {...common}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    case 'pago_vencido':
      return <svg {...common}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    case 'empresa_registro':
      return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
    case 'renovacion':
      return <svg {...common}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
    default:
      return <svg {...common}><circle cx="12" cy="12" r="10"/></svg>
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: 'var(--blue-900)', color: 'var(--white)', padding: '8px 12px',
      borderRadius: '8px', fontSize: '0.78rem', boxShadow: 'var(--shadow-md)'
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0 0', color: p.color || 'var(--white)' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const kpis = useMemo(() => [
    { label: 'Empresas Activas', value: stats.empresas.activas, change: `${stats.empresas.total} registradas`, changeType: 'up', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', variant: 'blue', bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { label: 'Ingresos Mensuales', value: formatCurrency(stats.ingresos.mesActual), change: `+${stats.ingresos.crecimiento}% vs anterior`, changeType: 'up', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', variant: 'success', bg: 'var(--success-tint)', color: 'var(--success)' },
    { label: 'Planes Activos', value: '3', change: 'Basico, Premium, Enterprise', changeType: 'neutral', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', variant: 'accent', bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
    { label: 'Suscripciones', value: stats.suscripciones.activas, change: `${stats.suscripciones.vencenPronto} vencen pronto`, changeType: 'up', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', variant: 'warning', bg: 'var(--warning-tint)', color: 'var(--warning)' },
    { label: 'Empresas Pendientes', value: stats.empresas.pendientes, change: 'Requieren revision', changeType: 'neutral', icon: 'M12 2v20M2 12h20', variant: 'warning', bg: 'var(--warning-tint)', color: 'var(--warning)' },
    { label: 'Empresas en Mora', value: stats.empresas.enMora, change: 'Atencion urgente', changeType: 'down', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', variant: 'danger', bg: 'var(--danger-tint)', color: 'var(--danger)' },
    { label: 'Ingresos Anuales', value: formatCurrency(stats.ingresos.anual), change: 'Proyeccion', changeType: 'neutral', icon: 'M23 6l-9.5 9.5-5-5L1 18', variant: 'blue', bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { label: 'Crecimiento Mensual', value: `${stats.ingresos.crecimiento}%`, change: 'vs mes anterior', changeType: 'up', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z', variant: 'accent', bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
  ], [])

  const ingresosData = useMemo(() => {
    return dashboardData.ingresosPorMes.map(item => ({
      ...item,
      ingresos: item.basico + item.premium
    }))
  }, [])

  const resumenPagos = useMemo(() => {
    const pagados = pagos.filter(p => p.estado === 'pagado').length
    const proximos = pagos.filter(p => p.estado === 'pendiente').length
    const vencidos = pagos.filter(p => p.estado === 'vencido').length
    const total = pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)
    return { pagados, proximos, vencidos, total }
  }, [])

  const rendimiento = useMemo(() => ({
    tiempoRespuesta: '2.4h',
    tasaExito: '94.2%',
    mayorCrecimiento: empresas.find(e => e.estado === 'activa') || { nombre: '-', crecimiento: '-' },
    planMasVendido: { nombre: 'Premium', empresas: 14 },
    usuariosConectados: 47,
  }), [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); setNow(new Date()) }, 1000)
  }

  return (
    <div className={styles.page}>
      {/* Banner */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className={styles.headerGreeting}>
              <h1>{getGreeting()}, Super Administrador</h1>
              <p>Panel de control en tiempo real</p>
            </div>
          </div>
          <div className={styles.headerQuickStats}>
            <div className={styles.headerQuickStat}>
              <span className={styles.headerQuickStatValue}>{stats.empresas.activas}</span>
              <span className={styles.headerQuickStatLabel}>Empresas activas</span>
            </div>
            <div className={styles.headerQuickStat}>
              <span className={styles.headerQuickStatValue}>{stats.suscripciones.activas}</span>
              <span className={styles.headerQuickStatLabel}>Suscripciones activas</span>
            </div>
            <div className={styles.headerQuickStat}>
              <span className={styles.headerQuickStatValue}>{stats.empresas.pendientes}</span>
              <span className={styles.headerQuickStatLabel}>Pendientes revision</span>
            </div>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.headerDate}>{formatDateFull(now)}</span>
            <span className={styles.headerTime}>{formatTime(now)}</span>
            <button className={styles.btnRefresh} onClick={handleRefresh} disabled={refreshing}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}>
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <div key={i} className={`${styles.kpiCard} ${styles[`kpiCard${kpi.variant.charAt(0).toUpperCase() + kpi.variant.slice(1)}`] || styles.kpiCardBlue}`}>
            <div className={styles.kpiTop}>
              <div className={styles.kpiIcon} style={{ background: kpi.bg, color: kpi.color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={kpi.icon}/>
                </svg>
              </div>
              <span className={`${styles.kpiChange} ${kpi.changeType === 'up' ? styles.kpiChangeUp : kpi.changeType === 'down' ? styles.kpiChangeDown : styles.kpiChangeNeutral}`}>
                {kpi.changeType === 'up' && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>}
                {kpi.change}
              </span>
            </div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue-700)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <span className={styles.cardTitle}>Empresas por Mes</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.empresasPorMes} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--gray-500)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cantidad" name="Empresas" fill={COLORS.blue} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span className={styles.cardTitle}>Ingresos por Mes</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingresosData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradServ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'var(--gray-500)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--gray-500)' }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={COLORS.accent} fill="url(#gradServ)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue-700)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span className={styles.cardTitle}>Distribucion por Planes</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboardData.distribucionPlanes} dataKey="cantidad" nameKey="plan" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} label={({ plan, percent }) => `${plan} ${(percent * 100).toFixed(0)}%`}>
                  {dashboardData.distribucionPlanes.map((_, i) => (
                    <Cell key={i} fill={[COLORS.blue, COLORS.accent, COLORS.warning, COLORS.danger, COLORS.blueDark][i % 5]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              <span className={styles.cardTitle}>Estado de Pagos</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboardData.estadoPagos} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} label={({ estado, percent }) => `${estado} ${(percent * 100).toFixed(0)}%`}>
                  {dashboardData.estadoPagos.map((_, i) => (
                    <Cell key={i} fill={[COLORS.accent, COLORS.warning, COLORS.danger, COLORS.blue, COLORS.blueDark][i % 5]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Grid: Activity + Alerts */}
      <div className={styles.mainGrid}>
        <div className={styles.mainContent}>
          {/* Activity Timeline */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue-700)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className={styles.cardTitle}>Actividad Reciente</span>
              </div>
              <span className={styles.cardBadge}>{dashboardData.actividadReciente.length} eventos</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.timeline}>
                {dashboardData.actividadReciente.map((item) => (
                  <div key={item.id} className={styles.timelineItem}>
                    <div className={`${styles.timelineIcon} ${getActivityIcon(item.tipo)}`}>
                      {getActivitySvg(item.tipo)}
                    </div>
                    <div className={styles.timelineContent}>
                      <p className={styles.timelineDesc}>{item.descripcion}</p>
                      <div className={styles.timelineMeta}>
                        <span className={styles.timelineDate}>{item.fecha}</span>
                        <span className={styles.timelineTime}>{item.hora}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Alerts */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <span className={styles.cardTitle}>Alertas</span>
              </div>
              <span className={styles.cardBadge} style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>{dashboardData.alertas.length}</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.alertsList}>
                {dashboardData.alertas.map((alerta) => (
                  <div key={alerta.id} className={styles.alertItem}>
                    <div className={`${styles.alertIcon} ${styles[`alertIcon${alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}`] || styles.alertIconSolicitud}`}>
                      {alerta.tipo === 'pendiente' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      {alerta.tipo === 'inactiva' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
                      {alerta.tipo === 'retrasado' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                      {alerta.tipo === 'solicitud' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                      {alerta.tipo === 'pago_vencido' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                      {alerta.tipo === 'suscripcion_por_vencer' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      {alerta.tipo === 'empresa_pendiente' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                    </div>
                    <span className={styles.alertText}>{alerta.mensaje}</span>
                    <span className={`${styles.alertCount} ${styles[`alertCount${alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}`] || styles.alertCountSolicitud}`}>{alerta.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Payments + Performance */}
      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue-700)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span className={styles.cardTitle}>Resumen de Pagos</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceLabel}>Pagados</span>
                  <span className={styles.serviceValue}>{resumenPagos.pagados}</span>
                </div>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon} style={{ background: 'var(--warning-tint)', color: 'var(--warning)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceLabel}>Proximos a vencer</span>
                  <span className={styles.serviceValue}>{resumenPagos.proximos}</span>
                </div>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon} style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceLabel}>Vencidos</span>
                  <span className={styles.serviceValue}>{resumenPagos.vencidos}</span>
                </div>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceLabel}>Total recaudado</span>
                  <span className={styles.serviceValue}>{formatCurrency(resumenPagos.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span className={styles.cardTitle}>Rendimiento</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.performanceGrid}>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Tiempo prom. respuesta</span>
                  <span className={styles.perfValue}>{rendimiento.tiempoRespuesta}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Tasa de exito</span>
                  <span className={styles.perfValue}>{rendimiento.tasaExito}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--accent-tint)', color: 'var(--accent-dark)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 23 12 17 12"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Mayor crecimiento</span>
                  <span className={styles.perfValue}>{rendimiento.mayorCrecimiento.nombre}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--warning-tint)', color: 'var(--warning)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Plan mas vendido</span>
                  <span className={styles.perfValue}>{rendimiento.planMasVendido.nombre} ({rendimiento.planMasVendido.empresas})</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Usuarios conectados hoy</span>
                  <span className={styles.perfValue}>{rendimiento.usuariosConectados}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
