import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { usoSemanal } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const COLORS = {
  disponible: 'var(--blue-500)',
  enUso: 'var(--accent)',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className={styles.tooltipItem} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ChartUsoSemanal() {
  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div className={styles.chartHeaderLeft}>
          <h3 className={styles.chartTitle}>Uso de lavadoras</h3>
        </div>
        <select className={styles.chartFilter} defaultValue="semana">
          <option value="semana">Esta semana</option>
          <option value="mes">Este mes</option>
          <option value="trimestre">Este trimestre</option>
        </select>
      </div>

      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.disponible }} />
          Disponible
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: COLORS.enUso }} />
          En uso
        </div>
      </div>

      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={usoSemanal} barGap={4} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 12, fill: 'var(--gray-400)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--gray-400)' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--gray-50)' }} />
            <Bar
              dataKey="disponible"
              name="Disponible"
              fill={COLORS.disponible}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="enUso"
              name="En uso"
              fill={COLORS.enUso}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
