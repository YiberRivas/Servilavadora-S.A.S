import { useState, useEffect } from 'react'
import { Users, Truck, DollarSign, Bell, TrendingUp } from 'lucide-react'
import { getClientes, getRepartidores, getPagos, getNotificaciones } from '../services/empresa.service'
import { useAuth } from '../../src/context/AuthContext'
import styles from '../styles/pages/DashboardEmpresa.module.css'

export default function DashboardEmpresa() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalRepartidores: 0,
    repartidoresDisponibles: 0,
    totalPagos: 0,
    ingresosTotales: 0,
    notificacionesNoLeidas: 0,
  })
  const [ultimasNotificaciones, setUltimasNotificaciones] = useState([])
  const [ultimosPagos, setUltimosPagos] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [clientesRes, repartidoresRes, pagosRes, notifRes] = await Promise.allSettled([
          getClientes({ per_page: 1 }),
          getRepartidores({ per_page: 1 }),
          getPagos({ per_page: 5 }),
          getNotificaciones({ per_page: 5 }),
        ])

        const clientes = clientesRes.status === 'fulfilled' && clientesRes.value.success ? clientesRes.value : { total: 0, data: [] }
        const reps = repartidoresRes.status === 'fulfilled' && repartidoresRes.value.success ? repartidoresRes.value : { total: 0, data: [] }
        const pagos = pagosRes.status === 'fulfilled' && pagosRes.value.success ? pagosRes.value : { total: 0, data: [] }
        const notifs = notifRes.status === 'fulfilled' && notifRes.value.success ? notifRes.value : { total: 0, data: [] }

        const repsData = reps.data || []
        const pagosData = pagos.data || []

        setStats({
          totalClientes: clientes.total || 0,
          totalRepartidores: reps.total || 0,
          repartidoresDisponibles: repsData.filter(r => r.disponible === true || r.disponible === 1).length,
          totalPagos: pagos.total || 0,
          ingresosTotales: pagosData.reduce((s, p) => s + (p.valor || 0), 0),
          notificacionesNoLeidas: notifs.total || 0,
        })

        setUltimasNotificaciones((notifs.data || []).slice(0, 5))
        setUltimosPagos(pagosData.slice(0, 5))
      } catch {
        // ignore
      }
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
          <span style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>Cargando dashboard...</span>
        </div>
      </div>
    )
  }

  const statCards = [
    { icon: Users, label: 'Clientes registrados', value: stats.totalClientes, bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
    { icon: Truck, label: 'Repartidores disponibles', value: `${stats.repartidoresDisponibles} / ${stats.totalRepartidores}`, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { icon: DollarSign, label: 'Ingresos registrados', value: '$' + stats.ingresosTotales.toLocaleString('es-CO'), bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
    { icon: Bell, label: 'Notificaciones sin leer', value: stats.notificacionesNoLeidas, bg: 'var(--warning-tint)', color: 'var(--warning)' },
  ]

  return (
    <div className={styles.page}>
      <section className={styles.banner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerText}>
              <h1 className={styles.bannerTitle}>
                Bienvenido, {user?.nombre_completo || 'Administrador'}
              </h1>
              <p className={styles.bannerDesc}>
                Panel de administracion de tu empresa. Gestiona clientes, repartidores y pagos desde un solo lugar.
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

      <div className={styles.mainGrid}>
        <div className={styles.mainCol}>
          <div className={styles.tableCard}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderLeft}>
                <h3 className={styles.tableTitle}>Ultimos pagos</h3>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Monto</th>
                    <th>Metodo</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPagos.length === 0 ? (
                    <tr><td colSpan={5} className={styles.tableEmpty}>No hay pagos registrados</td></tr>
                  ) : ultimosPagos.map((p, i) => (
                    <tr key={p.uuid || i}>
                      <td><span className={styles.userName}>{p.numero_transaccion || p.referencia || '-'}</span></td>
                      <td><span className={styles.cellMuted}>${(p.valor || 0).toLocaleString('es-CO')}</span></td>
                      <td><span className={styles.cellProduct}>{p.metodo_pago || p.metodo_pago_nombre || '-'}</span></td>
                      <td><span className={styles.cellMuted}>{p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-CO') : '-'}</span></td>
                      <td>
                        <span className={`${styles.badge} ${(p.estado_codigo || '').toLowerCase() === 'pagado' ? styles.badgeActivo : styles.badgeInactivo}`}>
                          <span className={styles.badgeDot} />
                          {p.estado_pago || p.estado || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <h3 className={styles.sideCardTitle}>Notificaciones recientes</h3>
            </div>
            <div className={styles.sideCardBody}>
              {ultimasNotificaciones.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', textAlign: 'center', padding: '16px 0' }}>Sin notificaciones</p>
              ) : ultimasNotificaciones.map((n, i) => (
                <div key={n.uuid || i} style={{
                  padding: '10px 0', borderBottom: i < ultimasNotificaciones.length - 1 ? '1px solid var(--gray-100)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--blue-900)' }}>{n.titulo}</span>
                    {!n.leida && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.4 }}>{n.mensaje}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
