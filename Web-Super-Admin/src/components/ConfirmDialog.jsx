import Modal from './Modal'
import styles from '../styles/components/ConfirmDialog.module.css'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirmar'}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className="btn btnOutline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btnDanger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}
