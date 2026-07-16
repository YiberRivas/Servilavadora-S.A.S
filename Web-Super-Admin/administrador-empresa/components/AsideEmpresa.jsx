import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, WashingMachine, RefreshCw, CreditCard,
  LogOut, ChevronLeft,
} from 'lucide-react'
import styles from '../styles/components/AsideEmpresa.module.css'

const navItems = [
  { to: '/administrador-empresa', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/administrador-empresa/usuarios', icon: Users, label: 'Usuarios / Clientes' },
  { to: '/administrador-empresa/lavadoras', icon: WashingMachine, label: 'Lavadoras' },
  { to: '/administrador-empresa/alquileres', icon: RefreshCw, label: 'Alquileres' },
  { to: '/administrador-empresa/pagos', icon: CreditCard, label: 'Pagos / Facturacion' },
]

export default function AsideEmpresa({ isOpen, onClose, onCollapsedChange }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('aside-empresa-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('aside-empresa-collapsed', collapsed)
    onCollapsedChange?.(collapsed)
  }, [collapsed, onCollapsedChange])

  const handleToggleCollapse = () => {
    setCollapsed(prev => !prev)
  }

  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onClose()
    }
  }

  const sidebarClass = [
    styles.sidebar,
    collapsed ? styles.collapsed : '',
    isOpen ? styles.sidebarOpen : ''
  ].filter(Boolean).join(' ')

  return (
    <>
      {isOpen && (
        <div
          className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
          onClick={onClose}
        />
      )}

      <aside className={sidebarClass}>
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logoGroup}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6" strokeDasharray="3 4"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <div className={styles.logoSection}>
                <span className={styles.logoName}>CleanHouse</span>
                <span className={styles.logoSub}>Panel Empresa</span>
              </div>
            </div>
            <button className={styles.collapseBtn} onClick={handleToggleCollapse} aria-label="Colapsar menu">
              <ChevronLeft className={styles.collapseBtnSvg} width={16} height={16} />
            </button>
          </div>

          <nav className={styles.navSection}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={handleNavClick}
              >
                <span className={styles.navItemIcon}>
                  <item.icon width={18} height={18} />
                </span>
                <span className={styles.navItemText}>{item.label}</span>
                <span className={styles.navItemTooltip}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.planWidget}>
            <div className={styles.planHeader}>
              <span className={styles.planLabel}>Plan actual</span>
              <span className={styles.planBadge}>Premium</span>
            </div>
            <div className={styles.planDetails}>
              <div className={styles.planDetail}>
                <span className={styles.planDetailLabel}>Lavadoras</span>
                <span className={styles.planDetailValue}>32 / 50</span>
              </div>
              <div className={styles.planBar}>
                <div className={styles.planBarFill} style={{ width: '64%' }} />
              </div>
            </div>
            <button className={styles.planUpgrade}>Mejorar plan</button>
          </div>

          <div className={styles.logoutSection}>
            <NavLink to="/" className={styles.logoutItem} onClick={handleNavClick}>
              <LogOut width={18} height={18} />
              <span className={styles.navItemText}>Cerrar sesion</span>
              <span className={styles.navItemTooltip}>Cerrar sesion</span>
            </NavLink>
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.footerInfo}>
              <div className={styles.footerBase}>
                <span className={styles.footerDot}></span>
                <span className={styles.footerStatus}>Servilavadora S.A.S.</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
