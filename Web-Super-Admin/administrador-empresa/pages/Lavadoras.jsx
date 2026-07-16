import { useState } from 'react'
import { Plus, WashingMachine, MapPin, CalendarDays } from 'lucide-react'
import { lavadoras } from '../data/mockDataEmpresa'
import styles from '../styles/pages/DashboardEmpresa.module.css'

const estadoBadge = {
  disponible: { cls: styles.badgeDisponible, text: 'Disponible' },
  en_uso: { cls: styles.badgeEnUso, text: 'En uso' },
  mantenimiento: { cls: styles.badgeMantenimiento, text: 'Mantenimiento' },
}

function formatCurrency(n) {
  return '$' + n.toLocaleString('es-CO')
}

export default function Lavadoras() {
  const [filterEstado, setFilterEstado] = useState('todos')

  const filtered = filterEstado === 'todos'
    ? lavadoras
    : lavadoras.filter(l => l.estado === filterEstado)

  const stats = {
    total: lavadoras.length,
    disponibles: lavadoras.filter(l => l.estado === 'disponible').length,
    enUso: lavadoras.filter(l => l.estado === 'en_uso').length,
    mantenimiento: lavadoras.filter(l => l.estado === 'mantenimiento').length,
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeaderRow}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Lavadoras</h1>
          <p className={styles.pageDesc}>Administra todas las lavadoras que ofrece tu empresa.</p>
        </div>
        <button className={styles.btnPrimary}>
          <Plus width={16} height={16} />
          Agregar lavadora
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
          { label: 'Disponibles', value: stats.disponibles, bg: 'var(--accent-tint)', color: 'var(--accent-dark)' },
          { label: 'En uso', value: stats.enUso, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
          { label: 'Mantenimiento', value: stats.mantenimiento, bg: 'var(--warning-tint)', color: 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} className={styles.miniStat} style={{ flex: 1 }}>
            <div className={styles.miniStatIcon} style={{ background: s.bg, color: s.color }}>
              <WashingMachine width={18} height={18} />
            </div>
            <div className={styles.miniStatInfo}>
              <span className={styles.miniStatValue}>{s.value}</span>
              <span className={styles.miniStatLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="en_uso">En uso</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.lavadorasGrid}>
        {filtered.map(l => {
          const badge = estadoBadge[l.estado] || estadoBadge.disponible
          return (
            <div key={l.id} className={styles.lavadoraCard}>
              <div className={styles.lavadoraCardTop}>
                <div className={styles.lavadoraIcon} style={{ background: l.color + '18', color: l.color }}>
                  <WashingMachine width={22} height={22} />
                </div>
                <span className={`${styles.badge} ${badge.cls}`}>
                  <span className={styles.badgeDot} />
                  {badge.text}
                </span>
              </div>
              <h3 className={styles.lavadoraName}>{l.nombre}</h3>
              <p className={styles.lavadoraModelo}>Modelo: {l.modelo}</p>
              <div className={styles.lavadoraDetails}>
                <div className={styles.lavadoraDetail}>
                  <span className={styles.lavadoraDetailLabel}><MapPin width={12} height={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Ubicacion</span>
                  <span className={styles.lavadoraDetailValue}>{l.ubicacion}</span>
                </div>
                <div className={styles.lavadoraDetail}>
                  <span className={styles.lavadoraDetailLabel}>Precio alquiler</span>
                  <span className={styles.lavadoraPrice}>{formatCurrency(l.precioAlquiler)}/mes</span>
                </div>
              </div>
              <div className={styles.lavadoraCardFooter}>
                <span className={styles.lavadoraAlquileres}>
                  <strong>{l.vecesAlquilada}</strong> veces alquilada
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
