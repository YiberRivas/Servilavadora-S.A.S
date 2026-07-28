import { useState, useEffect, useMemo } from 'react'
import StatCard from '../components/StatCard'
import { api } from '../services/api'
import styles from '../styles/pages/Estadisticas.module.css'

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
  return `$${val}`
}

export default function Estadisticas() {
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState(null)
  const [pagos, setPagos] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, pagosRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/empresas/pagos/all?per_page=100'),
        ])
        if (dashRes.success) setDashboard(dashRes.data)
        if (pagosRes.success) setPagos(pagosRes.data || [])
      } catch {
        // ignore
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const resumen = dashboard?.resumen || {}

  const statCards = useMemo(() => [
    { icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', label: 'Ingresos totales', value: formatCurrency(resumen.ingresos_totales || 0), variant: 'success' },
    { icon: 'M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', label: 'Empresas activas', value: resumen.empresas_activas || 0, variant: 'blue' },
    { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', label: 'Suscripciones', value: resumen.total_suscripciones || 0, variant: 'accent' },
    { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', label: 'Planes', value: dashboard?.distribucion_planes?.length || 0, variant: 'warning' },
  ], [resumen, dashboard])

  const resumenPagos = useMemo(() => {
    const pagados = pagos.filter(p => p.estado_pago_nombre === 'PAGADO').length
    const pendientes = pagos.filter(p => p.estado_pago_nombre === 'PENDIENTE').length
    const vencidos = pagos.filter(p => p.estado_pago_nombre === 'VENCIDO').length
    const totalRecaudado = pagos.filter(p => p.estado_pago_nombre === 'PAGADO').reduce((s, p) => s + (p.valor || 0), 0)
    return { pagados, pendientes, vencidos, totalRecaudado }
  }, [pagos])

  const distribucionPlan = useMemo(() => {
    if (!dashboard?.distribucion_planes) return []
    const total = dashboard.distribucion_planes.reduce((s, p) => s + p.cantidad, 0)
    return dashboard.distribucion_planes.map(p => ({
      plan: p.nombre, cantidad: p.cantidad, precio: p.precio,
      porcentaje: total > 0 ? Math.round((p.cantidad / total) * 100) : 0
    }))
  }, [dashboard])

  const planColors = ['var(--blue-700)', 'var(--accent)', 'var(--warning)', 'var(--gray-400)']

  if (loading) {
    return <div className={styles.page}><p style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>Cargando estadisticas...</p></div>
  }

  return (
    <div>
      <div className={styles.stats}>
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className={styles.charts}>
        <div className={styles.chartPlaceholder}>
          <h3>Empresas por plan</h3>
          <div className={styles.chart}>
            <div className={styles.pieList}>
              {distribucionPlan.map((item, i) => (
                <div key={item.plan} className={styles.pieItem}>
                  <div className={styles.pieBar}>
                    <div className={styles.pieFill} style={{ width: `${item.porcentaje}%`, background: planColors[i % planColors.length] }} />
                  </div>
                  <span className={styles.pieLabel}>{item.plan}</span>
                  <span className={styles.pieValue}>{item.cantidad} ({item.porcentaje}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chartPlaceholder}>
          <h3>Resumen de cobros</h3>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiItem}>
              <div className={styles.kpiValue} style={{ color: 'var(--accent)' }}>{resumenPagos.pagados}</div>
              <div className={styles.kpiLabel}>Pagos exitosos</div>
            </div>
            <div className={styles.kpiItem}>
              <div className={styles.kpiValue} style={{ color: 'var(--warning)' }}>{resumenPagos.pendientes}</div>
              <div className={styles.kpiLabel}>Pendientes</div>
            </div>
            <div className={styles.kpiItem}>
              <div className={styles.kpiValue} style={{ color: 'var(--danger)' }}>{resumenPagos.vencidos}</div>
              <div className={styles.kpiLabel}>Vencidos</div>
            </div>
            <div className={styles.kpiItem}>
              <div className={styles.kpiValue} style={{ color: 'var(--blue-700)' }}>{formatCurrency(resumenPagos.totalRecaudado)}</div>
              <div className={styles.kpiLabel}>Total recaudado</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableSection}>
        <h3>Detalle de planes</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Valor mensual</th>
                <th>Empresas</th>
                <th>Ingresos estimados</th>
              </tr>
            </thead>
            <tbody>
              {distribucionPlan.map((plan, i) => (
                <tr key={plan.plan}>
                  <td>
                    <div className={styles.planBadge} style={{ background: planColors[i % planColors.length] + '15', color: planColors[i % planColors.length] }}>
                      <span className={styles.planDot} style={{ background: planColors[i % planColors.length] }}></span>
                      {plan.plan}
                    </div>
                  </td>
                  <td>{formatCurrency(plan.precio)}</td>
                  <td>{plan.cantidad}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(plan.precio * plan.cantidad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
