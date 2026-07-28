-- Migracion: FASE 4 - Entrega 12 - Sistema de Notificaciones
-- Fecha: 2026-07-27
-- Descripcion: Agregar campos a notificacion y crear tabla device_token

-- 1. Agregar campos nuevos a la tabla notificacion
ALTER TABLE notificacion ADD COLUMN icono VARCHAR(100) NULL AFTER tipo;
ALTER TABLE notificacion ADD COLUMN color VARCHAR(20) NULL AFTER icono;
ALTER TABLE notificacion ADD COLUMN data TEXT NULL AFTER color;
ALTER TABLE notificacion ADD COLUMN updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 2. Crear tabla device_token
CREATE TABLE IF NOT EXISTS device_token (
    id_device_token BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    id_usuario BIGINT NOT NULL,
    expo_push_token VARCHAR(500) NOT NULL,
    dispositivo VARCHAR(200) NULL,
    activo SMALLINT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Crear indice para busquedas rapidas
CREATE INDEX idx_device_token_usuario ON device_token(id_usuario, activo);
CREATE INDEX idx_notificacion_usuario ON notificacion(id_usuario, leida);
