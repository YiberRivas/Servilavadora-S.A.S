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
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchConfiguraciones()
  }, [])

  const fetchConfiguraciones = async () => {
    setLoading(true)
    setError(null)
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

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Cargando configuraciones...</p>
      </div>
    )
  }

  if (error) {
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
              readOnly
            />
          </div>
          <div className={styles.field}>
            <label>Max. repartidores por empresa</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.maxRepartidores}
              readOnly
            />
          </div>
          <div className={styles.field}>
            <label>Radio de cobertura (km)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.radioCobertura}
              readOnly
            />
          </div>
        </div>

        <div className={styles.card}>
          <h3>Notificaciones</h3>
          <div className={styles.toggle}>
            <span>Email</span>
            <button
              className={`${styles.toggleBtn} ${config.notificacionesEmail ? styles.active : ''}`}
              disabled
            >
              {config.notificacionesEmail ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className={styles.toggle}>
            <span>Push</span>
            <button
              className={`${styles.toggleBtn} ${config.notificacionesPush ? styles.active : ''}`}
              disabled
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
              disabled
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
    </div>
  )
}
