import { productosTop } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const circumference = 2 * Math.PI * 18

const progressColors = ['var(--accent)', 'var(--blue-500)', 'var(--warning)']

export default function ProductosTopCard() {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <h3 className={styles.sideCardTitle}>Productos mas alquilados</h3>
      </div>
      <div className={styles.sideCardBody}>
        {productosTop.map((p, i) => {
          const offset = circumference - (p.porcentaje / 100) * circumference
          return (
            <div key={i} className={styles.productItem}>
              <div className={styles.productProgress}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle
                    className={styles.productProgressBg}
                    cx="22" cy="22" r="18"
                  />
                  <circle
                    className={styles.productProgressFill}
                    cx="22" cy="22" r="18"
                    stroke={progressColors[i] || progressColors[0]}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                  />
                </svg>
                <span className={styles.productProgressText}>{p.porcentaje}%</span>
              </div>
              <div className={styles.productInfo}>
                <span className={styles.productName}>{p.nombre}</span>
                <span className={styles.productMeta}>{p.alquileres} alquileres activos</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
