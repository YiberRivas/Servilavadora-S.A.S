import { useState, useEffect, useCallback } from 'react'
import { getLavadoras } from '../services/empresa.service'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const ESTADO_COLORS = {
  DISPONIBLE: { bg: 'var(--accent-tint)', text: 'var(--accent-dark)' },
  EN_USO: { bg: 'var(--primary-tint)', text: 'var(--primary)' },
  MANTENIMIENTO: { bg: 'var(--warning-tint)', text: 'var(--warning)' },
  RETIRADA: { bg: 'var(--gray-100)', text: 'var(--gray-500)' },
}

export default function Lavadoras() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterEstado, setFilterEstado] = useState('')
  const perPage = 15

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, per_page: perPage }
      if (filterEstado) params.id_estado = filterEstado
      const res = await getLavadoras(params)
      if (res.success) {
        setData(res.data || [])
        setTotalRecords(res.total || 0)
        setTotalPages(res.total_pages || 1)
      } else {
        setError(res.message || 'Error al cargar lavadoras')
        setData([])
      }
    } catch {
      setError('Error de conexion')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, filterEstado])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [filterEstado])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lavadoras</h1>
        <p className={styles.pageDesc}>Administra el inventario de lavadoras de tu empresa.</p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, background: 'var(--danger-tint)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontWeight: 700 }}>X</button>
        </div>
      )}

      <div className={styles.filtersBar}>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-200)',
            fontSize: '0.82rem', color: 'var(--gray-700)', background: 'var(--white)', cursor: 'pointer',
          }}
        >
          <option value="">Todos los estados</option>
          <option value="1">Disponible</option>
          <option value="2">En uso</option>
          <option value="3">Mantenimiento</option>
          <option value="4">Retirada</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
            Cargando lavadoras...
          </div>
        ) : data.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
            No se encontraron lavadoras
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Capacidad</th>
                <th>Estado</th>
                <th>Sucursal</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l) => {
                const estado = l.estado?.nombre || l.estado_nombre || 'DISPONIBLE'
                const ec = ESTADO_COLORS[estado] || ESTADO_COLORS.DISPONIBLE
                const marca = l.marca?.nombre || l.marca_nombre || '-'
                const modelo = l.modelo?.nombre || l.modelo_nombre || '-'
                const capacidad = l.capacidad?.valor || l.capacidad_valor || '-'
                const sucursal = l.sucursal?.nombre || l.sucursal_nombre || '-'
                return (
                  <tr key={l.id_lavadora || l.uuid}>
                    <td style={{ fontWeight: 500 }}>{l.codigo || l.uuid?.substring(0, 8) || '-'}</td>
                    <td>{marca}</td>
                    <td>{modelo}</td>
                    <td>{capacidad} kg</td>
                    <td>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: '0.72rem',
                        fontWeight: 600, background: ec.bg, color: ec.text,
                      }}>
                        {estado}
                      </span>
                    </td>
                    <td>{sucursal}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalRecords > perPage && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--gray-200)', background: page === 1 ? 'var(--gray-100)' : 'var(--white)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
          >
            Anterior
          </button>
          <span style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            Pagina {page} de {totalPages} ({totalRecords} registros)
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--gray-200)', background: page === totalPages ? 'var(--gray-100)' : 'var(--white)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
