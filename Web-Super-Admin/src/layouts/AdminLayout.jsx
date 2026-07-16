import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, KeyRound } from 'lucide-react'
import Aside from '../components/Aside'
import styles from '../styles/layouts/AdminLayout.module.css'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const layoutClass = `${styles.layout} ${sidebarCollapsed ? styles.layoutCollapsed : ''}`

  return (
    <div className={layoutClass}>
      <Aside
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir menu"
          >
            <Menu width={20} height={20} />
          </button>

          <div className={styles.topbarRight}>
            {/* Notificaciones */}
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <Bell width={18} height={18} />
            </button>

            {/* Perfil */}
            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={styles.profileAvatar}>SA</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>Juan Perez</span>
                  <span className={styles.profileRole}>Super Administrador</span>
                </div>
                <ChevronDown width={14} height={14} className={`${styles.profileChevron} ${profileOpen ? styles.profileChevronOpen : ''}`} />
              </button>

              <div className={`${styles.profileDropdown} ${profileOpen ? styles.profileDropdownOpen : ''}`}>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false); navigate('/admin/configuraciones') }}>
                  <User width={15} height={15} />
                  Mi perfil
                </button>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false); navigate('/admin/configuraciones') }}>
                  <Settings width={15} height={15} />
                  Configuracion
                </button>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false) }}>
                  <KeyRound width={15} height={15} />
                  Cambiar contrasena
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
