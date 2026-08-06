import { useState, useEffect } from 'react'
import { api } from '../services/api'
import styles from '../styles/pages/Configuraciones.module.css'

export default function Configuraciones() {
  const [config, setConfig] = useState({
    comisionPlataforma: '',
    maxRepartidores: '',
    radioCobertura: '',
    notificacionesEmail: false,
    notificacionesPush: false,
    mantenimiento: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    fetchConfiguraciones()
  }, [])

  const fetchConfiguraciones = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await api.get('/configuraciones/all')
      if (response.success && response.data) {
        const settingsMap = {}
        response.data.forEach((item) => {
          settingsMap[item.clave] = item.valor
        })
        setConfig({
          comisionPlataforma: settingsMap.comision_plataforma || '',
          maxRepartidores: settingsMap.max_repartidores || '',
          radioCobertura: settingsMap.radio_cobertura || '',
          notificacionesEmail: settingsMap.notificaciones_email === 'true',
          notificacionesPush: settingsMap.notificaciones_push === 'true',
          mantenimiento: settingsMap.mantenimiento === 'true',
        })
      } else {
        setError(response.message || 'Error al cargar configuraciones')
      }
    } catch (err) {
      setError('Error de conexion con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updates = [
        { clave: 'comision_plataforma', valor: config.comisionPlataforma },
        { clave: 'max_repartidores', valor: config.maxRepartidores },
        { clave: 'radio_cobertura', valor: config.radioCobertura },
        { clave: 'notificaciones_email', valor: String(config.notificacionesEmail) },
        { clave: 'notificaciones_push', valor: String(config.notificacionesPush) },
        { clave: 'mantenimiento', valor: String(config.mantenimiento) },
      ]
      const results = await Promise.allSettled(
        updates.map((u) => api.put(`/configuraciones/${u.clave}`, { valor: u.valor }))
      )
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        setError('Algunas configuraciones no se pudieron guardar')
      } else {
        setSuccess('Configuraciones guardadas exitosamente')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError('Error al guardar configuraciones')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Cargando configuraciones...</p>
      </div>
    )
  }

  if (error && !config.comisionPlataforma && !config.maxRepartidores) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button className="btn btnBlue" onClick={fetchConfiguraciones}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && <div style={{ padding: '10px 16px', background: '#FEE2E2', color: '#991B1B', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}
      {success && <div style={{ padding: '10px 16px', background: '#D1FAE5', color: '#065F46', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{success}</div>}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>General</h3>
          <div className={styles.field}>
            <label>Comision de plataforma (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={config.comisionPlataforma}
              onChange={(e) => setConfig({ ...config, comisionPlataforma: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Max. repartidores por empresa</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.maxRepartidores}
              onChange={(e) => setConfig({ ...config, maxRepartidores: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>Radio de cobertura (km)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.radioCobertura}
              onChange={(e) => setConfig({ ...config, radioCobertura: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.card}>
          <h3>Notificaciones</h3>
          <div className={styles.toggle}>
            <span>Email</span>
            <button
              className={`${styles.toggleBtn} ${config.notificacionesEmail ? styles.active : ''}`}
              onClick={() => setConfig({ ...config, notificacionesEmail: !config.notificacionesEmail })}
            >
              {config.notificacionesEmail ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className={styles.toggle}>
            <span>Push</span>
            <button
              className={`${styles.toggleBtn} ${config.notificacionesPush ? styles.active : ''}`}
              onClick={() => setConfig({ ...config, notificacionesPush: !config.notificacionesPush })}
            >
              {config.notificacionesPush ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <h3>Mantenimiento</h3>
          <div className={styles.toggle}>
            <span>Modo mantenimiento</span>
            <button
              className={`${styles.toggleBtn} ${config.mantenimiento ? styles.danger : ''}`}
              onClick={() => setConfig({ ...config, mantenimiento: !config.mantenimiento })}
            >
              {config.mantenimiento ? 'ON' : 'OFF'}
            </button>
          </div>
          {config.mantenimiento && (
            <p className={styles.warning}>
              La app mostrara un mensaje de mantenimiento a todos los usuarios.
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
        <button
          className="btn btnPrimary"
          onClick={handleSave}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar configuraciones'}
        </button>
        <button className="btn btnOutline" onClick={fetchConfiguraciones} disabled={saving}>
          Restablecer
        </button>
      </div>
    </div>
  )
}
