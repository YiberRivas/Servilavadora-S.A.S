import styles from '../styles/components/DataTable.module.css'

export default function DataTable({ columns, data, filters, pagination }) {
  return (
    <div className={styles.card}>
      {filters && (
        <div className={styles.filters}>
          {filters}
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>Sin registros</td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        typeof pagination === 'object' && pagination.type ? pagination : null
      )}

      {pagination && (
        typeof pagination === 'object' && !pagination.type && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>{pagination.info}</span>
            <div className={styles.paginationBtns}>
              {pagination.pages.map((p, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${p.active ? styles.pageBtnActive : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
