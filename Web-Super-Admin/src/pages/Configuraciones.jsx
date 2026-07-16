import { useState } from 'react'
import { configuracion } from '../data/mockData'
import styles from '../styles/pages/Configuraciones.module.css'

export default function Configuraciones() {
  const [config, setConfig] = useState({
    comisionPlataforma: configuracion.comisionPlataforma || 15,
    maxRepartidores: configuracion.maxRepartidoresPorEmpresa || 10,
    radioCobertura: configuracion.radioCoberturaKm || 15,
    notificacionesEmail: true,
    notificacionesPush: true,
    mantenimiento: false,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (field, value) => {
    setConfig({ ...config, [field]: value })
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              onChange={(e) => handleChange('comisionPlataforma', Number(e.target.value))}
            />
          </div>
          <div className={styles.field}>
            <label>Max. repartidores por empresa</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.maxRepartidores}
              onChange={(e) => handleChange('maxRepartidores', Number(e.target.value))}
            />
          </div>
          <div className={styles.field}>
            <label>Radio de cobertura (km)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.radioCobertura}
              onChange={(e) => handleChange('radioCobertura', Number(e.target.value))}
            />
          </div>
        </div>

        <div className={styles.card}>
          <h3>Notificaciones</h3>
          <div className={styles.toggle}>
            <span>Email</span>
            <button
              className={`${styles.toggleBtn} ${config.notificacionesEmail ? styles.active : ''}`}
              onClick={() => handleChange('notificacionesEmail', !config.notificacionesEmail)}
            >
              {config.notificacionesEmail ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className={styles.toggle}>
            <span>Push</span>
            <button
              className={`${styles.toggleBtn} ${config.notificacionesPush ? styles.active : ''}`}
              onClick={() => handleChange('notificacionesPush', !config.notificacionesPush)}
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
              onClick={() => handleChange('mantenimiento', !config.mantenimiento)}
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

      <div className={styles.footer}>
        {saved && <span className={styles.saved}>Guardado correctamente</span>}
        <button className="btn btnBlue" onClick={handleSave}>
          Guardar cambios
        </button>
      </div>
    </div>
  )
}
