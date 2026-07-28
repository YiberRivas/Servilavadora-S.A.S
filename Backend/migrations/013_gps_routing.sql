-- Migracion 013: Sistema de rutas GPS en tiempo real
-- Fecha: 2026-07-27

CREATE TABLE IF NOT EXISTS ruta_gps (
    id_ruta_gps BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    id_alquiler BIGINT NOT NULL UNIQUE,
    id_repartidor BIGINT NOT NULL,
    id_empresa BIGINT NOT NULL,
    latitud_actual DECIMAL(10, 8),
    longitud_actual DECIMAL(11, 8),
    latitud_destino DECIMAL(10, 8),
    longitud_destino DECIMAL(11, 8),
    latitud_cliente DECIMAL(10, 8),
    longitud_cliente DECIMAL(11, 8),
    velocidad DECIMAL(6, 2) DEFAULT 0,
    heading DECIMAL(5, 2) DEFAULT 0,
    `precision` DECIMAL(8, 2),
    distancia_restante_metros INTEGER DEFAULT 0,
    tiempo_estimado_segundos INTEGER DEFAULT 0,
    notificado_cerca SMALLINT DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    ultima_actualizacion DATETIME,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ruta_gps_alquiler FOREIGN KEY (id_alquiler) REFERENCES alquiler(id_alquiler),
    CONSTRAINT fk_ruta_gps_repartidor FOREIGN KEY (id_repartidor) REFERENCES repartidor(id_repartidor),
    CONSTRAINT fk_ruta_gps_empresa FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    INDEX idx_ruta_gps_alquiler (id_alquiler),
    INDEX idx_ruta_gps_repartidor (id_repartidor),
    INDEX idx_ruta_gps_estado (estado)
);

CREATE TABLE IF NOT EXISTS ubicacion_ruta (
    id_ubicacion_ruta BIGINT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    id_ruta_gps BIGINT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    `precision` DECIMAL(8, 2),
    heading DECIMAL(5, 2),
    velocidad DECIMAL(6, 2),
    timestampGPS DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ubicacion_ruta_gps FOREIGN KEY (id_ruta_gps) REFERENCES ruta_gps(id_ruta_gps),
    INDEX idx_ubicacion_ruta_gps (id_ruta_gps),
    INDEX idx_ubicacion_ruta_timestamp (timestampGPS)
);
