import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../src/context/AuthContext'
import { api } from '../../src/services/api'
import AsideEmpresa from '../components/AsideEmpresa'
import styles from '../styles/layouts/AdminEmpresaLayout.module.css'

function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos dias'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getFechaActual() {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function AdminEmpresaLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('aside-empresa-collapsed') === 'true'
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
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

  useEffect(() => {
    const fetchNotifCount = async () => {
      try {
        const res = await api.get('/notificaciones/no-leidas/count')
        if (res.success) setNotifCount(res.data.count)
      } catch {
        // ignore
      }
    }
    fetchNotifCount()
    const interval = setInterval(fetchNotifCount, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user?.nombre_completo
    ? user.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'EM'

  const layoutClass = `${styles.layout} ${sidebarCollapsed ? styles.layoutCollapsed : ''}`

  return (
    <div className={layoutClass}>
      <AsideEmpresa
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir menu"
            >
              <Menu width={20} height={20} />
            </button>
            <div className={styles.greeting}>
              <h1 className={styles.greetingText}>
                {getSaludo()}, <span className={styles.greetingName}>{user?.nombre_completo || 'Administrador'}</span>
              </h1>
              <span className={styles.greetingDate}>{getFechaActual()}</span>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <Bell width={18} height={18} />
              {notifCount > 0 && <span className={styles.notifBadge}>{notifCount}</span>}
            </button>

            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={styles.profileAvatar}>{initials}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{user?.nombre_completo || 'Usuario'}</span>
                  <span className={styles.profileRole}>{user?.rol_nombre || 'Admin Empresa'}</span>
                </div>
                <ChevronDown width={14} height={14} className={`${styles.profileChevron} ${profileOpen ? styles.profileChevronOpen : ''}`} />
              </button>

              <div className={`${styles.profileDropdown} ${profileOpen ? styles.profileDropdownOpen : ''}`}>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false); navigate('/administrador-empresa') }}>
                  <User width={15} height={15} />
                  Mi perfil
                </button>
                <button className={styles.dropdownItem} onClick={() => { setProfileOpen(false); navigate('/administrador-empresa') }}>
                  <Settings width={15} height={15} />
                  Configuracion
                </button>
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut width={15} height={15} />
                  Cerrar sesion
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
