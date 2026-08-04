import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, FileText, RefreshCw, Truck, CreditCard, Bell, LogOut, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../src/context/AuthContext'
import styles from '../styles/components/AsideEmpresa.module.css'

const navItems = [
  { to: '/administrador-empresa', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/administrador-empresa/solicitudes', icon: FileText, label: 'Solicitudes' },
  { to: '/administrador-empresa/usuarios', icon: Users, label: 'Usuarios / Clientes' },
  { to: '/administrador-empresa/repartidores', icon: Truck, label: 'Repartidores' },
  { to: '/administrador-empresa/alquileres', icon: RefreshCw, label: 'Alquileres' },
  { to: '/administrador-empresa/pagos', icon: CreditCard, label: 'Pagos / Facturacion' },
  { to: '/administrador-empresa/notificaciones', icon: Bell, label: 'Notificaciones' },
]

export default function AsideEmpresa({ isOpen, onClose, onCollapsedChange }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('aside-empresa-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('aside-empresa-collapsed', collapsed)
    onCollapsedChange?.(collapsed)
  }, [collapsed, onCollapsedChange])

  const handleToggleCollapse = () => setCollapsed(prev => !prev)
  const handleNavClick = () => { if (window.innerWidth <= 768) onClose() }

  const sidebarClass = [
    styles.sidebar,
    collapsed ? styles.collapsed : '',
    isOpen ? styles.sidebarOpen : ''
  ].filter(Boolean).join(' ')

  return (
    <>
      {isOpen && <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} onClick={onClose} />}
      <aside className={sidebarClass}>
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logoGroup}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" strokeDasharray="3 4"/><circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <div className={styles.logoSection}>
                <span className={styles.logoName}>Servilavadora</span>
                <span className={styles.logoSub}>Panel Empresa</span>
              </div>
            </div>
            <button className={styles.collapseBtn} onClick={handleToggleCollapse} aria-label="Colapsar menu">
              <ChevronLeft className={styles.collapseBtnSvg} width={16} height={16} />
            </button>
          </div>
          <nav className={styles.navSection}>
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={handleNavClick}>
                <span className={styles.navItemIcon}><item.icon width={18} height={18} /></span>
                <span className={styles.navItemText}>{item.label}</span>
                <span className={styles.navItemTooltip}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className={styles.logoutSection}>
            <button className={styles.logoutItem} onClick={async () => { await logout(); navigate('/') }}>
              <LogOut width={18} height={18} />
              <span className={styles.navItemText}>Cerrar sesion</span>
              <span className={styles.navItemTooltip}>Cerrar sesion</span>
            </button>
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
