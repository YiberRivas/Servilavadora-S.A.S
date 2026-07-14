import styles from '../styles/components/PageHeader.module.css'

export default function PageHeader({ title, actionLabel, onAction }) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {actionLabel && (
        <button className="btn btnPrimary btnSm" onClick={onAction}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
