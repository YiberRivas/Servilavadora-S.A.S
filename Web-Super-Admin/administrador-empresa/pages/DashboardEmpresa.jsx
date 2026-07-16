import { WashingMachine, Users } from 'lucide-react'
import { statsEmpresa } from '../data/mockDataEmpresa'
import ChartUsoSemanal from '../components/ChartUsoSemanal'
import TablaUsuarios from '../components/TablaUsuarios'
import EquipoCard from '../components/EquipoCard'
import ProductosTopCard from '../components/ProductosTopCard'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const statCards = [
  { icon: WashingMachine, label: 'Total de lavadoras', value: statsEmpresa.totalLavadoras, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  { icon: Users, label: 'Total de usuarios/clientes', value: statsEmpresa.totalClientes, bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
]

export default function DashboardEmpresa() {
  return (
    <div className={styles.page}>
      {/* Banner / Hero */}
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerText}>
              <h1 className={styles.bannerTitle}>
                Revisa la actividad de tus usuarios y alquileres en tiempo real
              </h1>
              <p className={styles.bannerDesc}>
                Monitorea el uso de tus lavadoras, gestiona los alquileres activos y mantén el control total de tu negocio desde un solo lugar.
              </p>
            </div>
          </div>

          <div className={styles.bannerIllustration}>
            <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="10" width="140" height="140" rx="18" fill="var(--blue-100)" stroke="var(--blue-500)" strokeWidth="1.5" opacity="0.5"/>
              <rect x="35" y="25" width="110" height="110" rx="14" fill="var(--white)" stroke="var(--blue-100)" strokeWidth="1"/>
              <circle cx="90" cy="80" r="35" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6"/>
              <circle cx="90" cy="80" r="24" fill="var(--white)" stroke="var(--blue-100)" strokeWidth="1"/>
              <circle cx="90" cy="80" r="8" fill="var(--accent)" opacity="0.4"/>
              <rect x="50" y="30" width="80" height="14" rx="4" fill="var(--blue-100)" opacity="0.6"/>
              <circle cx="62" cy="37" r="3" fill="var(--accent)" opacity="0.5"/>
              <circle cx="74" cy="37" r="3" fill="var(--blue-500)" opacity="0.4"/>
              <rect x="110" y="33" width="16" height="5" rx="2.5" fill="var(--blue-500)" opacity="0.3"/>
              <circle cx="60" cy="122" r="4" fill="var(--blue-100)" stroke="var(--blue-500)" strokeWidth="0.8" opacity="0.5"/>
              <circle cx="90" cy="122" r="4" fill="var(--accent-tint)" stroke="var(--accent)" strokeWidth="0.8" opacity="0.5"/>
              <circle cx="120" cy="122" r="4" fill="var(--blue-100)" stroke="var(--blue-500)" strokeWidth="0.8" opacity="0.5"/>
            </svg>
          </div>
        </div>

        <div className={styles.bannerStats}>
          {statCards.map((s, i) => (
            <div key={i} className={styles.miniStat}>
              <div className={styles.miniStatIcon} style={{ background: s.bg, color: s.color }}>
                <s.icon width={20} height={20} />
              </div>
              <div className={styles.miniStatInfo}>
                <span className={styles.miniStatValue}>{s.value}</span>
                <span className={styles.miniStatLabel}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gráfica de uso semanal */}
      <ChartUsoSemanal />

      {/* Tabla + Panel derecho */}
      <div className={styles.mainGrid}>
        <div className={styles.mainCol}>
          <TablaUsuarios />
        </div>
        <div className={styles.sideCol}>
          <EquipoCard />
          <ProductosTopCard />
        </div>
      </div>
    </div>
  )
}
