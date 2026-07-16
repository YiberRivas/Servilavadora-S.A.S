import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, Search } from 'lucide-react'
import AsideEmpresa from '../components/AsideEmpresa'
import { empresaInfo } from '../data/mockDataEmpresa'
import styles from '../styles/layouts/AdminEmpresaLayout.module.css'

function getSaludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos dias'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getFechaActual() {
  return new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function AdminEmpresaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('aside-empresa-collapsed') === 'true'
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
                {getSaludo()}, <span className={styles.greetingName}>{empresaInfo.nombre}</span>
              </h1>
              <span className={styles.greetingDate}>{getFechaActual()}</span>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.searchWrap}>
              <Search width={16} height={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar..."
              />
            </div>

            <button className={styles.iconBtn} aria-label="Notificaciones">
              <Bell width={18} height={18} />
              <span className={styles.notifDot} />
            </button>

            <button className={styles.iconBtn} aria-label="Configuracion" onClick={() => navigate('/administrador-empresa')}>
              <Settings width={18} height={18} />
            </button>

            <div className={styles.profileWrapper} ref={profileRef}>
              <button
                className={styles.profileBtn}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={styles.profileAvatar}>
                  {empresaInfo.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{empresaInfo.representante}</span>
                  <span className={styles.profileRole}>{empresaInfo.nombre}</span>
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
