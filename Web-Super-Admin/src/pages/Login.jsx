import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/pages/Login.module.css'

// ─── Credenciales mock ────────────────────────────────────────────
// TODO: reemplazar por validacion real contra backend.
// El backend debe devolver un "rol" o "tipo_usuario" para decidir la redireccion.
const MOCK_SUPER_ADMIN = { email: 'admin@servilavadora.co', password: '123456' }
const MOCK_EMPRESA_ADMIN = { email: 'adminempresa@cleanhouse.co', password: '123456' }

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electronico valido.'
    }
    if (!password || password.length < 6) {
      newErrors.password = 'La contrasena debe tener al menos 6 caracteres.'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setTimeout(() => {
      // ── Super Admin ──────────────────────────────
      if (email === MOCK_SUPER_ADMIN.email && password === MOCK_SUPER_ADMIN.password) {
        navigate('/admin')
        return
      }

      // ── Admin Empresa ────────────────────────────
      // TODO: cuando exista backend, el login devolvera el rol y se usa ahi:
      //   if (rol === 'super_admin')      navigate('/admin')
      //   else if (rol === 'admin_empresa') navigate('/administrador-empresa')
      if (email === MOCK_EMPRESA_ADMIN.email && password === MOCK_EMPRESA_ADMIN.password) {
        navigate('/administrador-empresa')
        return
      }

      // ── Credenciales incorrectas ─────────────────
      setLoading(false)
      setErrors({ credentials: 'Correo o contrasena incorrectos.' })
    }, 800)
  }

  return (
    <div className={styles.page}>
      <aside className={styles.showcase}>
        <div className={`${styles.blob} ${styles.blobOne}`} />
        <div className={`${styles.blob} ${styles.blobTwo}`} />

        <a href="#" className={styles.logo}>
          <svg viewBox="0 0 40 40" width="32" height="32" fill="none">
            <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="2"/>
            <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5"/>
            <circle cx="20" cy="20" r="5" fill="currentColor"/>
          </svg>
          <span className={styles.logoText}>Servi<strong>Lavadora</strong></span>
        </a>

        <div className={styles.showcaseBody}>
          <span className={styles.eyebrow}>Panel de Administracion</span>
          <h1>Gestiona tu plataforma desde un solo lugar.</h1>
          <p>Controla empresas, usuarios, servicios y solicitudes de toda la red ServiLavadora.</p>
        </div>

        <div className={styles.stats}>
          <div><strong>+320</strong><span>Empresas activas</span></div>
          <div><strong>+18.000</strong><span>Servicios completados</span></div>
          <div><strong>4.8/5</strong><span>Calificacion promedio</span></div>
        </div>

        <p className={styles.footer}>&copy; 2026 ServiLavadora S.A.S.</p>
      </aside>

      <main className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Inicia sesion</h2>
            <p>Ingresa con tu cuenta de Super Admin</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={`field ${errors.email ? 'hasError' : ''}`}>
              <label htmlFor="email">Correo electronico</label>
              <div className="inputWrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2.5"/>
                  <path d="M3 6.5l9 6 9-6"/>
                </svg>
                <input
                  className="input"
                  type="email"
                  id="email"
                  placeholder="admin@servilavadora.co"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
                />
              </div>
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className={`field ${errors.password ? 'hasError' : ''}`}>
              <label htmlFor="password">Contrasena</label>
              <div className="inputWrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10.5" width="16" height="10" rx="2"/>
                  <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>
                </svg>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
                />
            {errors.credentials && <span className="error" style={{ textAlign: 'center' }}>{errors.credentials}</span>}

            <button
                  type="button"
                  className="togglePass"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18"/>
                      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24"/>
                      <path d="M9.9 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.6 13.6 0 0 1-3.1 3.9"/>
                      <path d="M6.6 6.6C3.9 8.3 2 12 2 12s4 7 11 7a10.7 10.7 0 0 0 3.4-.6"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="formRow">
              <label className="checkbox">
                <input type="checkbox" />
                Recordarme
              </label>
              <a href="#" className="link">Olvidaste tu contrasena?</a>
            </div>

            <button
              type="submit"
              className={`btn btnPrimary btnBlock ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading && <span className="spinner" />}
              <span>{loading ? '' : 'Iniciar sesion'}</span>
            </button>
          </form>

          <p className={styles.formFooter}>
            Al continuar, aceptas nuestros <a href="#">Terminos</a> y <a href="#">Politica de privacidad</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
