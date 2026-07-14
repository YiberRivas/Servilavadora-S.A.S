import styles from '../styles/components/Pagination.module.css'

export default function Pagination({ page, totalPages, totalRecords, rowsPerPage, onRowsPerPageChange, onPageChange }) {
  const start = (page - 1) * rowsPerPage + 1
  const end = Math.min(page * rowsPerPage, totalRecords)

  const getPages = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const rangeStart = Math.max(2, page - 1)
      const rangeEnd = Math.min(totalPages - 1, page + 1)
      for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={styles.pagination}>
      <div className={styles.left}>
        <span className={styles.info}>Mostrando {start}–{end} de {totalRecords} registros</span>
        <select
          className={styles.select}
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        >
          <option value={5}>5 por pagina</option>
          <option value={10}>10 por pagina</option>
          <option value={20}>20 por pagina</option>
        </select>
      </div>
      <div className={styles.right}>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className={styles.dots}>...</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
        <button
          className={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
