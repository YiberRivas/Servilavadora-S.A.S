import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, KeyRound, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Aside from '../components/Aside'
import styles from '../styles/layouts/AdminLayout.module.css'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const profileRef = useRef(null)
  const notifRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setSidebarOpen(false)
    setNotifOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
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

  const handleNotifClick = async () => {
    if (notifOpen) {
      setNotifOpen(false)
      return
    }
    try {
      const res = await api.get('/notificaciones?per_page=10')
      if (res.success) setNotificaciones(res.data || [])
    } catch {
      // ignore
    }
    setNotifOpen(true)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user?.nombre_completo
    ? user.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'SA'

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
            <div className={styles.notifWrapper} ref={notifRef}>
              <button className={styles.iconBtn} aria-label="Notificaciones" onClick={handleNotifClick}>
                <Bell width={18} height={18} />
                {notifCount > 0 && <span className={styles.notifBadge}>{notifCount > 99 ? '99+' : notifCount}</span>}
              </button>

              {notifOpen && (
                <div className={styles.notifDropdown}>
                  <div className={styles.notifHeader}>
                    <span>Notificaciones</span>
                    {notifCount > 0 && (
                      <button onClick={async () => {
                        await api.put('/notificaciones/leer-todas')
                        setNotifCount(0)
                        setNotificaciones(prev => prev.map(n => ({ ...n, leida: 1 })))
                      }}>Marcar todas como leidas</button>
                    )}
                  </div>
                  <div className={styles.notifList}>
                    {notificaciones.length === 0 ? (
                      <p className={styles.notifEmpty}>Sin notificaciones</p>
                    ) : (
                      notificaciones.map((n) => (
                        <div key={n.uuid} className={`${styles.notifItem} ${!n.leida ? styles.notifUnread : ''}`}>
                          <strong>{n.titulo}</strong>
                          <p>{n.mensaje}</p>
                          <span className={styles.notifTime}>{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={styles.profileAvatar}>{initials}</div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{user?.nombre_completo || 'Usuario'}</span>
                  <span className={styles.profileRole}>{user?.rol_nombre || 'Rol'}</span>
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
