import { useMemo } from 'react'
import StatCard from '../components/StatCard'
import { stats, empresas, planes, pagos, dashboardData } from '../data/mockData'
import styles from '../styles/pages/Estadisticas.module.css'

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`
  return `$${val}`
}

export default function Estadisticas() {
  const statCards = useMemo(() => [
    { icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', label: 'Ingresos mensuales', value: formatCurrency(stats.ingresos.mesActual), variant: 'success' },
    { icon: 'M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', label: 'Empresas activas', value: stats.empresas.activas, variant: 'blue' },
    { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75', label: 'Suscripciones activas', value: stats.suscripciones.activas, variant: 'accent' },
    { icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', label: 'Planes disponibles', value: planes.length, variant: 'warning' },
  ], [])

  const resumenPagos = useMemo(() => {
    const pagados = pagos.filter(p => p.estado === 'pagado').length
    const pendientes = pagos.filter(p => p.estado === 'pendiente').length
    const vencidos = pagos.filter(p => p.estado === 'vencido').length
    const totalRecaudado = pagos.filter(p => p.estado === 'pagado').reduce((s, p) => s + p.monto, 0)
    return { pagados, pendientes, vencidos, totalRecaudado }
  }, [])

  const distribucionPlan = useMemo(() => {
    const count = {}
    empresas.forEach(e => { count[e.plan] = (count[e.plan] || 0) + 1 })
    const total = empresas.length
    return Object.entries(count).map(([plan, cantidad]) => ({
      plan, cantidad, porcentaje: Math.round((cantidad / total) * 100)
    }))
  }, [])

  const estadosPago = useMemo(() => {
    const count = {}
    empresas.forEach(e => {
      const ep = e.estadoPago || 'pagado'
      count[ep] = (count[ep] || 0) + 1
    })
    const colors = { pagado: 'var(--accent)', proximo_vencer: 'var(--warning)', en_mora: 'var(--danger)', pendiente: 'var(--gray-400)' }
    return Object.entries(count).map(([estado, cantidad]) => ({
      estado, cantidad, color: colors[estado] || 'var(--gray-400)'
    }))
  }, [])

  const planColors = ['var(--blue-700)', 'var(--accent)', 'var(--warning)', 'var(--gray-400)']

  return (
    <div>
      <div className={styles.stats}>
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className={styles.charts}>
        {/* Ingresos por mes */}
        <div className={styles.chartPlaceholder}>
          <h3>Ingresos por mes</h3>
          <div className={styles.chart}>
            <div className={styles.barChart}>
              {dashboardData.ingresosPorMes.map((item, i) => (
                <div key={i} className={styles.barGroup}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(item.ingresos / 20000000) * 100}%`,
                      background: item.ingresos > item.anterior ? 'var(--accent)' : 'var(--blue-700)'
                    }}
                  >
                    <span className={styles.barValue}>{formatCurrency(item.ingresos)}</span>
                  </div>
                  <span className={styles.barLabel}>{item.mes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribucion por plan */}
        <div className={styles.chartPlaceholder}>
          <h3>Empresas por plan</h3>
          <div className={styles.chart}>
            <div className={styles.pieList}>
              {distribucionPlan.map((item, i) => (
                <div key={item.plan} className={styles.pieItem}>
                  <div className={styles.pieBar}>
                    <div
                      className={styles.pieFill}
                      style={{ width: `${item.porcentaje}%`, background: planColors[i % planColors.length] }}
                    />
                  </div>
                  <span className={styles.pieLabel}>{item.plan}</span>
                  <span className={styles.pieValue}>{item.cantidad} ({item.porcentaje}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estado de pagos */}
        <div className={styles.chartPlaceholder}>
          <h3>Estado de pagos</h3>
          <div className={styles.chart}>
            <div className={styles.pieList}>
              {estadosPago.map((item) => (
                <div key={item.estado} className={styles.pieItem}>
                  <div className={styles.pieBar}>
                    <div
                      className={styles.pieFill}
                      style={{ width: `${(item.cantidad / empresas.length) * 100}%`, background: item.color }}
                    />
                  </div>
                  <span className={styles.pieLabel}>{item.estado.replace('_', ' ')}</span>
                  <span className={styles.pieValue}>{item.cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen pagos */}
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

      {/* Tabla de planes */}
      <div className={styles.tableSection}>
        <h3>Detalle de planes</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Valor mensual</th>
                <th>Empresas</th>
                <th>Max usuarios</th>
                <th>Soporte</th>
                <th>Ingresos estimados</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <div className={styles.planBadge} style={{ background: plan.color + '15', color: plan.color }}>
                      <span className={styles.planDot} style={{ background: plan.color }}></span>
                      {plan.nombre}
                    </div>
                  </td>
                  <td>{formatCurrency(plan.valorMensual)}</td>
                  <td>{plan.empresas}</td>
                  <td>{plan.maxUsuarios === -1 ? 'Ilimitado' : plan.maxUsuarios}</td>
                  <td>{plan.soporte}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(plan.valorMensual * plan.empresas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
