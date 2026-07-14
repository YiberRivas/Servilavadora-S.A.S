import styles from '../styles/components/StatCard.module.css'

const variants = {
  blue: { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  accent: { bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
  warning: { bg: 'var(--warning-tint)', color: 'var(--warning)' },
  danger: { bg: 'var(--danger-tint)', color: 'var(--danger)' },
}

export default function StatCard({ icon, label, value, change, variant = 'blue' }) {
  const v = variants[variant] || variants.blue

  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ background: v.bg, color: v.color }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </div>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {change && <span className={`${styles.change} ${change.type === 'up' ? styles.up : change.type === 'down' ? styles.down : ''}`}>{change.text}</span>}
      </div>
    </div>
  )
}
