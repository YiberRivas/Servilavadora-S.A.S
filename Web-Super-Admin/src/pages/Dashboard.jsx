import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/pages/Dashboard.module.css'

const COLORS = {
  blue: '#2D6CB5',
  accent: '#12A594',
  warning: '#E8A317',
  danger: '#D64545',
  success: '#28A745',
  blueDark: '#1F4E79',
}

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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: 'var(--blue-900)', color: 'var(--white)', padding: '8px 12px',
      borderRadius: '8px', fontSize: '0.78rem', boxShadow: 'var(--shadow-md)'
    }}>
      <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '2px 0 0', color: p.color || 'var(--white)' }}>{p.name}: {typeof p.value === 'number' && p.value > 999 ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [now, setNow] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [pagos, setPagos] = useState([])
  const [empresasPendientes, setEmpresasPendientes] = useState(0)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dashRes, pagosRes, pendRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/empresas/pagos/all?per_page=50'),
        api.get('/empresas/pendientes?per_page=1'),
      ])
      if (dashRes.success) setData(dashRes.data)
      if (pagosRes.success) setPagos(pagosRes.data || [])
      if (pendRes.success) setEmpresasPendientes(pendRes.total || 0)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const resumen = data?.resumen || {}

  const kpis = useMemo(() => [
    { label: 'Empresas Activas', value: resumen.empresas_activas || 0, change: `${resumen.total_empresas || 0} registradas`, changeType: 'up', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', variant: 'blue', bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { label: 'Ingresos Totales', value: formatCurrency(resumen.ingresos_totales || 0), change: 'Acumulado', changeType: 'up', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', variant: 'success', bg: 'var(--success-tint)', color: 'var(--success)' },
    { label: 'Planes Disponibles', value: data?.distribucion_planes?.length || 0, change: 'Planes activos', changeType: 'neutral', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', variant: 'accent', bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
    { label: 'Suscripciones', value: resumen.total_suscripciones || 0, change: 'Activas', changeType: 'up', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', variant: 'warning', bg: 'var(--warning-tint)', color: 'var(--warning)' },
    { label: 'Empresas Pendientes', value: resumen.empresas_pendientes || 0, change: 'Requieren revision', changeType: 'neutral', icon: 'M12 2v20M2 12h20', variant: 'warning', bg: 'var(--warning-tint)', color: 'var(--warning)' },
    { label: 'Alquileres Activos', value: resumen.alquileres_activos || 0, change: `${resumen.total_alquileres || 0} totales`, changeType: 'up', icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', variant: 'danger', bg: 'var(--danger-tint)', color: 'var(--danger)' },
    { label: 'Lavadoras', value: resumen.total_lavadoras || 0, change: `${resumen.lavadoras_disponibles || 0} disponibles`, changeType: 'up', icon: 'M23 6l-9.5 9.5-5-5L1 18', variant: 'blue', bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { label: 'Solicitudes Pendientes', value: resumen.solicitudes_pendientes || 0, change: 'Por atender', changeType: 'neutral', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z', variant: 'accent', bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
  ], [resumen, data])

  const distribucionPlanes = useMemo(() => {
    if (!data?.distribucion_planes) return []
    return data.distribucion_planes.map(p => ({ plan: p.nombre, cantidad: p.cantidad }))
  }, [data])

  const resumenPagos = useMemo(() => {
    const pagados = pagos.filter(p => p.estado_pago_nombre === 'PAGADO').length
    const pendientes = pagos.filter(p => p.estado_pago_nombre === 'PENDIENTE').length
    const vencidos = pagos.filter(p => p.estado_pago_nombre === 'VENCIDO').length
    const total = pagos.filter(p => p.estado_pago_nombre === 'PAGADO').reduce((s, p) => s + (p.valor || 0), 0)
    return { pagados, pendientes, vencidos, total }
  }, [pagos])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData().finally(() => setRefreshing(false))
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--gray-400)' }}>
          Cargando dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
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
              <h1>{getGreeting()}, {user?.nombre_completo || 'Administrador'}</h1>
              <p>Panel de control en tiempo real</p>
            </div>
          </div>
          <div className={styles.headerQuickStats}>
            <div className={styles.headerQuickStat}>
              <span className={styles.headerQuickStatValue}>{resumen.empresas_activas || 0}</span>
              <span className={styles.headerQuickStatLabel}>Empresas activas</span>
            </div>
            <div className={styles.headerQuickStat}>
              <span className={styles.headerQuickStatValue}>{resumen.total_suscripciones || 0}</span>
              <span className={styles.headerQuickStatLabel}>Suscripciones</span>
            </div>
            <div className={styles.headerQuickStat}>
              <span className={styles.headerQuickStatValue}>{empresasPendientes}</span>
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

      <div className={styles.chartsGrid}>
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
                <Pie data={distribucionPlanes} dataKey="cantidad" nameKey="plan" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} label={({ plan, percent }) => `${plan} ${(percent * 100).toFixed(0)}%`}>
                  {distribucionPlanes.map((_, i) => (
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
              <span className={styles.cardTitle}>Resumen de Pagos</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[
                  { estado: 'Pagados', cantidad: resumenPagos.pagados },
                  { estado: 'Pendientes', cantidad: resumenPagos.pendientes },
                  { estado: 'Vencidos', cantidad: resumenPagos.vencidos },
                ]} dataKey="cantidad" nameKey="estado" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} label={({ estado, percent }) => `${estado} ${(percent * 100).toFixed(0)}%`}>
                  {[COLORS.accent, COLORS.warning, COLORS.danger].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue-700)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              <span className={styles.cardTitle}>Pagos Recientes</span>
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
                  <span className={styles.serviceLabel}>Pendientes</span>
                  <span className={styles.serviceValue}>{resumenPagos.pendientes}</span>
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
              <span className={styles.cardTitle}>Resumen General</span>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.performanceGrid}>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Alquileres activos</span>
                  <span className={styles.perfValue}>{resumen.alquileres_activos || 0}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--success-tint)', color: 'var(--success)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Lavadoras disponibles</span>
                  <span className={styles.perfValue}>{resumen.lavadoras_disponibles || 0}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--accent-tint)', color: 'var(--accent-dark)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 23 12 17 12"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Total lavadoras</span>
                  <span className={styles.perfValue}>{resumen.total_lavadoras || 0}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--warning-tint)', color: 'var(--warning)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Solicitudes totales</span>
                  <span className={styles.perfValue}>{resumen.total_solicitudes || 0}</span>
                </div>
              </div>
              <div className={styles.perfItem}>
                <div className={styles.perfIcon} style={{ background: 'var(--danger-tint)', color: 'var(--danger)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div className={styles.perfInfo}>
                  <span className={styles.perfLabel}>Empresas suspendidas</span>
                  <span className={styles.perfValue}>{resumen.empresas_suspendidas || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
