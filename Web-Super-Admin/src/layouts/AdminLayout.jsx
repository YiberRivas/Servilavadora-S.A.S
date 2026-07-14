import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import Aside from '../components/Aside'
import styles from '../styles/layouts/AdminLayout.module.css'

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/empresas': 'Gestion de Empresas',
  '/admin/aprobar': 'Empresas Pendientes',
  '/admin/planes': 'Planes y Suscripciones',
  '/admin/usuarios': 'Gestion de Usuarios',
  '/admin/estadisticas': 'Estadisticas Globales',
  '/admin/configuraciones': 'Configuracion',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

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
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Abrir menu"
            >
              <Menu width={20} height={20} />
            </button>
            <h1 className={styles.topbarTitle}>{title}</h1>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn} aria-label="Notificaciones">
              <Bell width={18} height={18} />
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
