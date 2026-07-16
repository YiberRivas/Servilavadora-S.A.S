import { equipo } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

export default function EquipoCard() {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <h3 className={styles.sideCardTitle}>Mi equipo</h3>
        <span className={styles.tableCount}>{equipo.length}</span>
      </div>
      <div className={styles.sideCardBody}>
        <div className={styles.teamAvatars}>
          {equipo.map((m) => (
            <div
              key={m.id}
              className={styles.teamAvatar}
              style={{ background: m.color }}
              title={`${m.nombre} - ${m.rol}`}
            >
              {m.avatar}
            </div>
          ))}
          <div className={`${styles.teamAvatar} ${styles.teamAvatarMore}`}>+2</div>
        </div>

        <div className={styles.inviteForm}>
          <input
            type="email"
            className={styles.inviteInput}
            placeholder="Invitar por correo"
          />
          <button className={styles.inviteBtn}>Invitar</button>
        </div>
      </div>
    </div>
  )
}
