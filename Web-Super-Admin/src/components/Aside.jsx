import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Building2, ShieldCheck, Users, CreditCard,
  BarChart3, Settings, LogOut, ChevronLeft,
  TrendingUp, Home, Shield
} from 'lucide-react'
import styles from '../styles/components/Aside.module.css'

const navSections = [
  {
    label: 'Principal',
    items: [
      { to: '/admin', icon: Home, label: 'Dashboard', end: true },
    ]
  },
  {
    label: 'Gestion de Empresas',
    items: [
      { to: '/admin/empresas', icon: Building2, label: 'Empresas' },
      { to: '/admin/aprobar', icon: ShieldCheck, label: 'Empresas Pendientes', badge: 3, badgeType: 'warning' },
      { to: '/admin/planes', icon: CreditCard, label: 'Planes y Suscripciones' },
    ]
  },
  {
    label: 'Administracion',
    items: [
      { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
      { to: '/admin/estadisticas', icon: TrendingUp, label: 'Estadisticas Globales' },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/configuraciones', icon: Settings, label: 'Configuracion' },
    ]
  },
]

export default function Aside({ isOpen, onClose, onCollapsedChange }) {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed)
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
          {/* Header - Solo Logo */}
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
                <span className={styles.logoName}>Servilavadora</span>
                <span className={styles.logoSub}>S.A.S.</span>
              </div>
            </div>
            <button className={styles.collapseBtn} onClick={handleToggleCollapse} aria-label="Colapsar menu">
              <ChevronLeft className={styles.collapseBtnSvg} width={16} height={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className={styles.navSection}>
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className={styles.navGroup}>
                <div className={styles.navLabel}>
                  <span className={styles.navLabelText}>{section.label}</span>
                </div>
                {section.items.map((item) => (
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
                    {item.badge && (
                      <span className={`${styles.navBadge} ${styles[`navBadge${item.badgeType.charAt(0).toUpperCase() + item.badgeType.slice(1)}`] || styles.navBadgeWarning}`}>
                        {item.badge}
                      </span>
                    )}
                    <span className={styles.navItemTooltip}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

         <div className={styles.logoutSection}>
            <NavLink to="/" className={styles.logoutItem} onClick={handleNavClick}>
              <LogOut width={18} height={18} />
              <span className={styles.navItemText}>Cerrar sesion</span>
              <span className={styles.navItemTooltip}>Cerrar sesion</span>
            </NavLink>
          </div>

          {/* Footer */}
          <div className={styles.sidebarFooter}>
            <div className={styles.footerInfo}>
              <span className={styles.footerVersion}>v1.0.0-beta</span>
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
