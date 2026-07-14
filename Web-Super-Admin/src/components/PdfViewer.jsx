import { FileText, Download, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import styles from '../styles/pages/AprobarEmpresas.module.css'

export default function PdfViewer({ documento, onClose }) {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '#'
    link.download = documento.nombre
    link.click()
  }

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.pdfHeader}>
        <span className={styles.pdfTitle}>{documento.nombre}</span>
        <div className={styles.pdfActions}>
          <button className={styles.pdfBtn} onClick={onClose}>
            <X width={14} height={14} />
            Cerrar
          </button>
          <button className={`${styles.pdfBtn} ${styles.pdfBtnPrimary}`} onClick={handleDownload}>
            <Download width={14} height={14} />
            Descargar
          </button>
        </div>
      </div>
      <div className={styles.pdfContent}>
        <div className={styles.pdfPlaceholder}>
          <div className={styles.pdfPlaceholderIcon}>
            <FileText width={40} height={40} />
          </div>
          <div className={styles.pdfPlaceholderTitle}>{documento.nombre}</div>
          <div className={styles.pdfPlaceholderDesc}>
            Tipo: {documento.tipo} | Tamano: {documento.tamano} | Fecha: {documento.fecha}
          </div>
          <div className={styles.pdfPlaceholderNote}>
            Visor PDF - Se conectara con documentos reales en el futuro
          </div>
        </div>
      </div>
    </div>
  )
}
