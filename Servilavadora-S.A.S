CREATE DATABASE  IF NOT EXISTS `servilavadora_sas` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `servilavadora_sas`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: servilavadora_sas
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alquiler`
--

DROP TABLE IF EXISTS `alquiler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alquiler` (
  `id_alquiler` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_solicitud_alquiler` bigint unsigned NOT NULL,
  `id_lavadora` bigint unsigned NOT NULL,
  `id_cliente_empresa` bigint unsigned NOT NULL,
  `id_repartidor` bigint unsigned NOT NULL,
  `id_estado_alquiler` bigint unsigned NOT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `minutos_facturados` int DEFAULT '0',
  `valor_total` decimal(12,2) DEFAULT '0.00',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_alquiler`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_alquiler_solicitud` (`id_solicitud_alquiler`),
  KEY `fk_alquiler_lavadora` (`id_lavadora`),
  KEY `fk_alquiler_cliente` (`id_cliente_empresa`),
  KEY `fk_alquiler_repartidor` (`id_repartidor`),
  KEY `fk_alquiler_estado` (`id_estado_alquiler`),
  CONSTRAINT `fk_alquiler_cliente` FOREIGN KEY (`id_cliente_empresa`) REFERENCES `cliente_empresa` (`id_cliente_empresa`),
  CONSTRAINT `fk_alquiler_estado` FOREIGN KEY (`id_estado_alquiler`) REFERENCES `estado_alquiler` (`id_estado_alquiler`),
  CONSTRAINT `fk_alquiler_lavadora` FOREIGN KEY (`id_lavadora`) REFERENCES `lavadora` (`id_lavadora`),
  CONSTRAINT `fk_alquiler_repartidor` FOREIGN KEY (`id_repartidor`) REFERENCES `repartidor` (`id_repartidor`),
  CONSTRAINT `fk_alquiler_solicitud` FOREIGN KEY (`id_solicitud_alquiler`) REFERENCES `solicitud_alquiler` (`id_solicitud_alquiler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alquiler`
--

LOCK TABLES `alquiler` WRITE;
/*!40000 ALTER TABLE `alquiler` DISABLE KEYS */;
/*!40000 ALTER TABLE `alquiler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archivo`
--

DROP TABLE IF EXISTS `archivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archivo` (
  `id_archivo` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_servidor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extension` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso` bigint DEFAULT NULL,
  `ruta` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_sha256` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_archivo`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivo`
--

LOCK TABLES `archivo` WRITE;
/*!40000 ALTER TABLE `archivo` DISABLE KEYS */;
/*!40000 ALTER TABLE `archivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignacion_solicitud`
--

DROP TABLE IF EXISTS `asignacion_solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_solicitud` (
  `id_asignacion_solicitud` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_solicitud_alquiler` bigint unsigned NOT NULL,
  `id_lavadora` bigint unsigned NOT NULL,
  `id_repartidor` bigint unsigned NOT NULL,
  `fecha_asignacion` datetime NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asignacion_solicitud`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_asignacion_solicitud` (`id_solicitud_alquiler`),
  KEY `fk_asignacion_lavadora` (`id_lavadora`),
  KEY `fk_asignacion_repartidor` (`id_repartidor`),
  CONSTRAINT `fk_asignacion_lavadora` FOREIGN KEY (`id_lavadora`) REFERENCES `lavadora` (`id_lavadora`),
  CONSTRAINT `fk_asignacion_repartidor` FOREIGN KEY (`id_repartidor`) REFERENCES `repartidor` (`id_repartidor`),
  CONSTRAINT `fk_asignacion_solicitud` FOREIGN KEY (`id_solicitud_alquiler`) REFERENCES `solicitud_alquiler` (`id_solicitud_alquiler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignacion_solicitud`
--

LOCK TABLES `asignacion_solicitud` WRITE;
/*!40000 ALTER TABLE `asignacion_solicitud` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignacion_solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` bigint unsigned DEFAULT NULL,
  `modulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registro_uuid` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_auditoria_usuario` (`id_usuario`),
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `barrio`
--

DROP TABLE IF EXISTS `barrio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `barrio` (
  `id_barrio` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_municipio` bigint unsigned NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_postal` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_barrio`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_barrio_municipio` (`id_municipio`),
  CONSTRAINT `fk_barrio_municipio` FOREIGN KEY (`id_municipio`) REFERENCES `municipio` (`id_municipio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `barrio`
--

LOCK TABLES `barrio` WRITE;
/*!40000 ALTER TABLE `barrio` DISABLE KEYS */;
/*!40000 ALTER TABLE `barrio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `capacidad_lavadora`
--

DROP TABLE IF EXISTS `capacidad_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `capacidad_lavadora` (
  `id_capacidad_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidad_kg` decimal(4,1) NOT NULL,
  `descripcion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_capacidad_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `capacidad_kg` (`capacidad_kg`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `capacidad_lavadora`
--

LOCK TABLES `capacidad_lavadora` WRITE;
/*!40000 ALTER TABLE `capacidad_lavadora` DISABLE KEYS */;
INSERT INTO `capacidad_lavadora` VALUES (1,'f2d9e008-8641-11f1-b554-0a0027000007',7.0,'Lavadora Manual 7 Kg',1,'2026-07-23 02:55:23'),(2,'f2d9e65d-8641-11f1-b554-0a0027000007',8.0,'Lavadora Manual 8 Kg',1,'2026-07-23 02:55:23'),(3,'f2d9e9ae-8641-11f1-b554-0a0027000007',9.0,'Lavadora Manual 9 Kg',1,'2026-07-23 02:55:23'),(4,'f2d9ebd9-8641-11f1-b554-0a0027000007',10.0,'Lavadora Manual 10 Kg',1,'2026-07-23 02:55:23'),(5,'f2d9eddb-8641-11f1-b554-0a0027000007',11.0,'Lavadora Manual 11 Kg',1,'2026-07-23 02:55:23'),(6,'f2d9efdc-8641-11f1-b554-0a0027000007',12.0,'Lavadora Manual 12 Kg',1,'2026-07-23 02:55:23'),(7,'f2d9f1bf-8641-11f1-b554-0a0027000007',13.0,'Lavadora Manual 13 Kg',1,'2026-07-23 02:55:23'),(8,'f2d9f3a9-8641-11f1-b554-0a0027000007',14.0,'Lavadora Manual 14 Kg',1,'2026-07-23 02:55:23');
/*!40000 ALTER TABLE `capacidad_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente_empresa`
--

DROP TABLE IF EXISTS `cliente_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente_empresa` (
  `id_cliente_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `fecha_registro` date NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `id_empresa` (`id_empresa`,`id_usuario`),
  KEY `fk_cliente_usuario` (`id_usuario`),
  CONSTRAINT `fk_cliente_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente_empresa`
--

LOCK TABLES `cliente_empresa` WRITE;
/*!40000 ALTER TABLE `cliente_empresa` DISABLE KEYS */;
/*!40000 ALTER TABLE `cliente_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cola_espera`
--

DROP TABLE IF EXISTS `cola_espera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cola_espera` (
  `id_cola_espera` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_cliente_empresa` bigint unsigned NOT NULL,
  `id_capacidad_lavadora` bigint unsigned NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `prioridad` tinyint DEFAULT '1',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cola_espera`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_cola_empresa` (`id_empresa`),
  KEY `fk_cola_cliente` (`id_cliente_empresa`),
  KEY `fk_cola_capacidad` (`id_capacidad_lavadora`),
  CONSTRAINT `fk_cola_capacidad` FOREIGN KEY (`id_capacidad_lavadora`) REFERENCES `capacidad_lavadora` (`id_capacidad_lavadora`),
  CONSTRAINT `fk_cola_cliente` FOREIGN KEY (`id_cliente_empresa`) REFERENCES `cliente_empresa` (`id_cliente_empresa`),
  CONSTRAINT `fk_cola_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cola_espera`
--

LOCK TABLES `cola_espera` WRITE;
/*!40000 ALTER TABLE `cola_espera` DISABLE KEYS */;
/*!40000 ALTER TABLE `cola_espera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_empresa`
--

DROP TABLE IF EXISTS `configuracion_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_empresa` (
  `id_configuracion_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `permite_reservas` tinyint(1) DEFAULT '1',
  `tiempo_maximo_reserva` int DEFAULT '30',
  `moneda` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'COP',
  `zona_horaria` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'America/Bogota',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_configuracion_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `id_empresa` (`id_empresa`),
  CONSTRAINT `fk_configuracion_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_empresa`
--

LOCK TABLES `configuracion_empresa` WRITE;
/*!40000 ALTER TABLE `configuracion_empresa` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracion_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_global`
--

DROP TABLE IF EXISTS `configuracion_global`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_global` (
  `id_configuracion_global` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clave` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_configuracion_global`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_global`
--

LOCK TABLES `configuracion_global` WRITE;
/*!40000 ALTER TABLE `configuracion_global` DISABLE KEYS */;
INSERT INTO `configuracion_global` VALUES (1,'f4600db0-8641-11f1-b554-0a0027000007','APP_NOMBRE','Servilavadora S.A.S.','Nombre del sistema','2026-07-23 02:55:25','2026-07-23 02:55:25'),(2,'f4601836-8641-11f1-b554-0a0027000007','MONEDA','COP','Moneda oficial','2026-07-23 02:55:25','2026-07-23 02:55:25'),(3,'f4601cc9-8641-11f1-b554-0a0027000007','PAIS','Colombia','País principal','2026-07-23 02:55:25','2026-07-23 02:55:25'),(4,'f460212a-8641-11f1-b554-0a0027000007','ZONA_HORARIA','America/Bogota','Zona horaria','2026-07-23 02:55:25','2026-07-23 02:55:25'),(5,'f46026da-8641-11f1-b554-0a0027000007','VERSION','1.0','Versión del sistema','2026-07-23 02:55:25','2026-07-23 02:55:25');
/*!40000 ALTER TABLE `configuracion_global` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cronometro_alquiler`
--

DROP TABLE IF EXISTS `cronometro_alquiler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cronometro_alquiler` (
  `id_cronometro_alquiler` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_alquiler` bigint unsigned NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `minutos_transcurridos` int DEFAULT '0',
  `minutos_facturables` int DEFAULT '0',
  `valor_acumulado` decimal(12,2) DEFAULT '0.00',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cronometro_alquiler`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_cronometro_alquiler` (`id_alquiler`),
  CONSTRAINT `fk_cronometro_alquiler` FOREIGN KEY (`id_alquiler`) REFERENCES `alquiler` (`id_alquiler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cronometro_alquiler`
--

LOCK TABLES `cronometro_alquiler` WRITE;
/*!40000 ALTER TABLE `cronometro_alquiler` DISABLE KEYS */;
/*!40000 ALTER TABLE `cronometro_alquiler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamento`
--

DROP TABLE IF EXISTS `departamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamento` (
  `id_departamento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_pais` bigint unsigned NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_dane` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_departamento`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_departamento_pais` (`id_pais`),
  CONSTRAINT `fk_departamento_pais` FOREIGN KEY (`id_pais`) REFERENCES `pais` (`id_pais`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamento`
--

LOCK TABLES `departamento` WRITE;
/*!40000 ALTER TABLE `departamento` DISABLE KEYS */;
/*!40000 ALTER TABLE `departamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `devolucion_lavadora`
--

DROP TABLE IF EXISTS `devolucion_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `devolucion_lavadora` (
  `id_devolucion_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_alquiler` bigint unsigned NOT NULL,
  `id_repartidor` bigint unsigned NOT NULL,
  `fecha_devolucion` datetime NOT NULL,
  `estado_lavadora` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `requiere_mantenimiento` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_devolucion_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_devolucion_alquiler` (`id_alquiler`),
  KEY `fk_devolucion_repartidor` (`id_repartidor`),
  CONSTRAINT `fk_devolucion_alquiler` FOREIGN KEY (`id_alquiler`) REFERENCES `alquiler` (`id_alquiler`),
  CONSTRAINT `fk_devolucion_repartidor` FOREIGN KEY (`id_repartidor`) REFERENCES `repartidor` (`id_repartidor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `devolucion_lavadora`
--

LOCK TABLES `devolucion_lavadora` WRITE;
/*!40000 ALTER TABLE `devolucion_lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `devolucion_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direccion`
--

DROP TABLE IF EXISTS `direccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direccion` (
  `id_direccion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_barrio` bigint unsigned DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `complemento` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia` text COLLATE utf8mb4_unicode_ci,
  `codigo_plus` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_direccion`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_direccion_barrio` (`id_barrio`),
  CONSTRAINT `fk_direccion_barrio` FOREIGN KEY (`id_barrio`) REFERENCES `barrio` (`id_barrio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direccion`
--

LOCK TABLES `direccion` WRITE;
/*!40000 ALTER TABLE `direccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `direccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleado_empresa`
--

DROP TABLE IF EXISTS `empleado_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleado_empresa` (
  `id_empleado_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `cargo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salario` decimal(12,2) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_retiro` date DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empleado_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_empleado_empresa` (`id_empresa`),
  KEY `fk_empleado_usuario` (`id_usuario`),
  CONSTRAINT `fk_empleado_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_empleado_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleado_empresa`
--

LOCK TABLES `empleado_empresa` WRITE;
/*!40000 ALTER TABLE `empleado_empresa` DISABLE KEYS */;
/*!40000 ALTER TABLE `empleado_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa`
--

DROP TABLE IF EXISTS `empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa` (
  `id_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_comercial` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `representante_legal` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `celular` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `id_direccion` bigint unsigned DEFAULT NULL,
  `id_estado_empresa` bigint unsigned NOT NULL,
  `fecha_registro` datetime NOT NULL,
  `fecha_aprobacion` datetime DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `nit` (`nit`),
  KEY `fk_empresa_direccion` (`id_direccion`),
  KEY `fk_empresa_estado` (`id_estado_empresa`),
  CONSTRAINT `fk_empresa_direccion` FOREIGN KEY (`id_direccion`) REFERENCES `direccion` (`id_direccion`),
  CONSTRAINT `fk_empresa_estado` FOREIGN KEY (`id_estado_empresa`) REFERENCES `estado_empresa` (`id_estado_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa`
--

LOCK TABLES `empresa` WRITE;
/*!40000 ALTER TABLE `empresa` DISABLE KEYS */;
/*!40000 ALTER TABLE `empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresa_archivo`
--

DROP TABLE IF EXISTS `empresa_archivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresa_archivo` (
  `id_empresa_archivo` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_archivo` bigint unsigned NOT NULL,
  `tipo_documento` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprobado` tinyint(1) DEFAULT '0',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_empresa_archivo`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_empresa_archivo_empresa` (`id_empresa`),
  KEY `fk_empresa_archivo_archivo` (`id_archivo`),
  CONSTRAINT `fk_empresa_archivo_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo` (`id_archivo`),
  CONSTRAINT `fk_empresa_archivo_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresa_archivo`
--

LOCK TABLES `empresa_archivo` WRITE;
/*!40000 ALTER TABLE `empresa_archivo` DISABLE KEYS */;
/*!40000 ALTER TABLE `empresa_archivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_alquiler`
--

DROP TABLE IF EXISTS `estado_alquiler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_alquiler` (
  `id_estado_alquiler` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_alquiler`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_alquiler`
--

LOCK TABLES `estado_alquiler` WRITE;
/*!40000 ALTER TABLE `estado_alquiler` DISABLE KEYS */;
INSERT INTO `estado_alquiler` VALUES (1,'f1be94d3-8641-11f1-b554-0a0027000007','PENDIENTE','Pendiente','Esperando entrega','#FFC107',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f1be9e2e-8641-11f1-b554-0a0027000007','CAMINO','En Camino','Repartidor desplazándose','#17A2B8',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f1bea1be-8641-11f1-b554-0a0027000007','ACTIVO','Activo','Alquiler en curso','#28A745',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f1bea514-8641-11f1-b554-0a0027000007','FINALIZACION','Solicitud Finalización','Cliente solicitó finalizar','#FD7E14',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(5,'f1bea7b1-8641-11f1-b554-0a0027000007','FINALIZADO','Finalizado','Alquiler terminado','#0D6EFD',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(6,'f1beaaa2-8641-11f1-b554-0a0027000007','CANCELADO','Cancelado','Alquiler cancelado','#DC3545',1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `estado_alquiler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_empresa`
--

DROP TABLE IF EXISTS `estado_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_empresa` (
  `id_estado_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_empresa`
--

LOCK TABLES `estado_empresa` WRITE;
/*!40000 ALTER TABLE `estado_empresa` DISABLE KEYS */;
INSERT INTO `estado_empresa` VALUES (1,'f1864c9c-8641-11f1-b554-0a0027000007','PENDIENTE','Pendiente','Empresa pendiente de aprobación','#FFC107',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(2,'f1867ab2-8641-11f1-b554-0a0027000007','ACTIVA','Activa','Empresa habilitada para operar','#28A745',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(3,'f1867e89-8641-11f1-b554-0a0027000007','SUSPENDIDA','Suspendida','Empresa suspendida temporalmente','#DC3545',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(4,'f18680e5-8641-11f1-b554-0a0027000007','RECHAZADA','Rechazada','Solicitud rechazada','#6C757D',1,'2026-07-23 02:55:20','2026-07-23 02:55:20');
/*!40000 ALTER TABLE `estado_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_factura`
--

DROP TABLE IF EXISTS `estado_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_factura` (
  `id_estado_factura` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_factura`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_factura`
--

LOCK TABLES `estado_factura` WRITE;
/*!40000 ALTER TABLE `estado_factura` DISABLE KEYS */;
INSERT INTO `estado_factura` VALUES (1,'f1e2c645-8641-11f1-b554-0a0027000007','BORRADOR','Borrador','Factura en preparación','#6C757D',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f1e2d2df-8641-11f1-b554-0a0027000007','EMITIDA','Emitida','Factura emitida','#0D6EFD',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f1e2d802-8641-11f1-b554-0a0027000007','PAGADA','Pagada','Factura cancelada','#28A745',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f1e2db44-8641-11f1-b554-0a0027000007','ANULADA','Anulada','Factura anulada','#DC3545',1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `estado_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_lavadora`
--

DROP TABLE IF EXISTS `estado_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_lavadora` (
  `id_estado_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_lavadora`
--

LOCK TABLES `estado_lavadora` WRITE;
/*!40000 ALTER TABLE `estado_lavadora` DISABLE KEYS */;
INSERT INTO `estado_lavadora` VALUES (1,'f1a7c93b-8641-11f1-b554-0a0027000007','DISPONIBLE','Disponible','Lista para alquilar','#28A745',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f1a7fc6d-8641-11f1-b554-0a0027000007','RESERVADA','Reservada','Reservada por una solicitud','#17A2B8',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f1a80072-8641-11f1-b554-0a0027000007','TRASLADO','En Traslado','Está siendo transportada','#0DCAF0',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f1a80333-8641-11f1-b554-0a0027000007','ALQUILER','En Alquiler','Actualmente alquilada','#FFC107',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(5,'f1a805d3-8641-11f1-b554-0a0027000007','MANTENIMIENTO','Mantenimiento','En mantenimiento','#FD7E14',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(6,'f1a808d4-8641-11f1-b554-0a0027000007','FUERA_SERVICIO','Fuera de Servicio','No disponible','#DC3545',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(7,'f1a80df0-8641-11f1-b554-0a0027000007','BAJA','Baja','Retirada definitivamente','#343A40',1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `estado_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_pago`
--

DROP TABLE IF EXISTS `estado_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_pago` (
  `id_estado_pago` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_pago`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_pago`
--

LOCK TABLES `estado_pago` WRITE;
/*!40000 ALTER TABLE `estado_pago` DISABLE KEYS */;
INSERT INTO `estado_pago` VALUES (1,'f1d47fe6-8641-11f1-b554-0a0027000007','PENDIENTE','Pendiente','Pago pendiente','#FFC107',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f1d4885c-8641-11f1-b554-0a0027000007','PAGADO','Pagado','Pago realizado','#28A745',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f1d48bde-8641-11f1-b554-0a0027000007','ANULADO','Anulado','Pago anulado','#DC3545',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f1d48ec4-8641-11f1-b554-0a0027000007','REEMBOLSADO','Reembolsado','Pago reembolsado','#17A2B8',1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `estado_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_solicitud`
--

DROP TABLE IF EXISTS `estado_solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_solicitud` (
  `id_estado_solicitud` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_solicitud`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_solicitud`
--

LOCK TABLES `estado_solicitud` WRITE;
/*!40000 ALTER TABLE `estado_solicitud` DISABLE KEYS */;
INSERT INTO `estado_solicitud` VALUES (1,'f1b60f17-8641-11f1-b554-0a0027000007','PENDIENTE','Pendiente','Solicitud creada','#FFC107',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f1b617d2-8641-11f1-b554-0a0027000007','ACEPTADA','Aceptada','Solicitud aceptada','#28A745',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f1b61af6-8641-11f1-b554-0a0027000007','RECHAZADA','Rechazada','Solicitud rechazada','#DC3545',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f1b61f90-8641-11f1-b554-0a0027000007','PROGRAMADA','Programada','Pendiente de ejecución','#17A2B8',1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(5,'f1b62237-8641-11f1-b554-0a0027000007','CANCELADA','Cancelada','Solicitud cancelada','#6C757D',1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `estado_solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_usuario`
--

DROP TABLE IF EXISTS `estado_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_usuario` (
  `id_estado_usuario` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estado_usuario`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_usuario`
--

LOCK TABLES `estado_usuario` WRITE;
/*!40000 ALTER TABLE `estado_usuario` DISABLE KEYS */;
INSERT INTO `estado_usuario` VALUES (1,'f192f95d-8641-11f1-b554-0a0027000007','ACTIVO','Activo','Usuario activo','#28A745',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(2,'f1932d2d-8641-11f1-b554-0a0027000007','INACTIVO','Inactivo','Usuario inactivo','#6C757D',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(3,'f19330ea-8641-11f1-b554-0a0027000007','BLOQUEADO','Bloqueado','Usuario bloqueado','#DC3545',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(4,'f19333a2-8641-11f1-b554-0a0027000007','SUSPENDIDO','Suspendido','Usuario suspendido','#FFC107',1,'2026-07-23 02:55:20','2026-07-23 02:55:20');
/*!40000 ALTER TABLE `estado_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidencia_devolucion`
--

DROP TABLE IF EXISTS `evidencia_devolucion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidencia_devolucion` (
  `id_evidencia_devolucion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_devolucion_lavadora` bigint unsigned NOT NULL,
  `id_archivo` bigint unsigned NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evidencia_devolucion`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_evidencia_devolucion` (`id_devolucion_lavadora`),
  KEY `fk_evidencia_devolucion_archivo` (`id_archivo`),
  CONSTRAINT `fk_evidencia_devolucion` FOREIGN KEY (`id_devolucion_lavadora`) REFERENCES `devolucion_lavadora` (`id_devolucion_lavadora`),
  CONSTRAINT `fk_evidencia_devolucion_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo` (`id_archivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidencia_devolucion`
--

LOCK TABLES `evidencia_devolucion` WRITE;
/*!40000 ALTER TABLE `evidencia_devolucion` DISABLE KEYS */;
/*!40000 ALTER TABLE `evidencia_devolucion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evidencia_entrega`
--

DROP TABLE IF EXISTS `evidencia_entrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evidencia_entrega` (
  `id_evidencia_entrega` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_alquiler` bigint unsigned NOT NULL,
  `id_archivo` bigint unsigned NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_evidencia_entrega`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_evidencia_alquiler` (`id_alquiler`),
  KEY `fk_evidencia_archivo` (`id_archivo`),
  CONSTRAINT `fk_evidencia_alquiler` FOREIGN KEY (`id_alquiler`) REFERENCES `alquiler` (`id_alquiler`),
  CONSTRAINT `fk_evidencia_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo` (`id_archivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evidencia_entrega`
--

LOCK TABLES `evidencia_entrega` WRITE;
/*!40000 ALTER TABLE `evidencia_entrega` DISABLE KEYS */;
/*!40000 ALTER TABLE `evidencia_entrega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `id_factura` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_liquidacion_alquiler` bigint unsigned NOT NULL,
  `id_estado_factura` bigint unsigned NOT NULL,
  `numero_factura` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `descuentos` decimal(12,2) DEFAULT '0.00',
  `impuestos` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `fecha_emision` datetime NOT NULL,
  `pdf` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_factura`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `numero_factura` (`numero_factura`),
  KEY `fk_factura_liquidacion` (`id_liquidacion_alquiler`),
  KEY `fk_factura_estado` (`id_estado_factura`),
  CONSTRAINT `fk_factura_estado` FOREIGN KEY (`id_estado_factura`) REFERENCES `estado_factura` (`id_estado_factura`),
  CONSTRAINT `fk_factura_liquidacion` FOREIGN KEY (`id_liquidacion_alquiler`) REFERENCES `liquidacion_alquiler` (`id_liquidacion_alquiler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `factura`
--

LOCK TABLES `factura` WRITE;
/*!40000 ALTER TABLE `factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fotografia_lavadora`
--

DROP TABLE IF EXISTS `fotografia_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotografia_lavadora` (
  `id_fotografia_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lavadora` bigint unsigned NOT NULL,
  `nombre_archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `principal` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_fotografia_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_fotografia_lavadora` (`id_lavadora`),
  CONSTRAINT `fk_fotografia_lavadora` FOREIGN KEY (`id_lavadora`) REFERENCES `lavadora` (`id_lavadora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotografia_lavadora`
--

LOCK TABLES `fotografia_lavadora` WRITE;
/*!40000 ALTER TABLE `fotografia_lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `fotografia_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `genero`
--

DROP TABLE IF EXISTS `genero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `genero` (
  `id_genero` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_genero`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `genero`
--

LOCK TABLES `genero` WRITE;
/*!40000 ALTER TABLE `genero` DISABLE KEYS */;
INSERT INTO `genero` VALUES (1,'f16df0d5-8641-11f1-b554-0a0027000007','Masculino',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(2,'f16e1a1a-8641-11f1-b554-0a0027000007','Femenino',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(3,'f16e1d5c-8641-11f1-b554-0a0027000007','No Binario',1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(4,'f16e1f11-8641-11f1-b554-0a0027000007','Prefiero no decirlo',1,'2026-07-23 02:55:20','2026-07-23 02:55:20');
/*!40000 ALTER TABLE `genero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_alquiler`
--

DROP TABLE IF EXISTS `historial_alquiler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_alquiler` (
  `id_historial_alquiler` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_alquiler` bigint unsigned NOT NULL,
  `evento` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_evento` datetime NOT NULL,
  `usuario_responsable` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial_alquiler`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_historial_alquiler` (`id_alquiler`),
  CONSTRAINT `fk_historial_alquiler` FOREIGN KEY (`id_alquiler`) REFERENCES `alquiler` (`id_alquiler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_alquiler`
--

LOCK TABLES `historial_alquiler` WRITE;
/*!40000 ALTER TABLE `historial_alquiler` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_alquiler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_lavadora`
--

DROP TABLE IF EXISTS `historial_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_lavadora` (
  `id_historial_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lavadora` bigint unsigned NOT NULL,
  `evento` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `usuario` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_evento` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_historial_lavadora` (`id_lavadora`),
  CONSTRAINT `fk_historial_lavadora` FOREIGN KEY (`id_lavadora`) REFERENCES `lavadora` (`id_lavadora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_lavadora`
--

LOCK TABLES `historial_lavadora` WRITE;
/*!40000 ALTER TABLE `historial_lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_ruta`
--

DROP TABLE IF EXISTS `historial_ruta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_ruta` (
  `id_historial_ruta` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_ruta` bigint unsigned NOT NULL,
  `id_repartidor` bigint unsigned NOT NULL,
  `id_alquiler` bigint unsigned DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `kilometros_recorridos` decimal(8,2) DEFAULT NULL,
  `tiempo_real_minutos` int DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial_ruta`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_historial_ruta` (`id_ruta`),
  KEY `fk_historial_ruta_repartidor` (`id_repartidor`),
  KEY `fk_historial_ruta_alquiler` (`id_alquiler`),
  CONSTRAINT `fk_historial_ruta` FOREIGN KEY (`id_ruta`) REFERENCES `ruta` (`id_ruta`),
  CONSTRAINT `fk_historial_ruta_alquiler` FOREIGN KEY (`id_alquiler`) REFERENCES `alquiler` (`id_alquiler`),
  CONSTRAINT `fk_historial_ruta_repartidor` FOREIGN KEY (`id_repartidor`) REFERENCES `repartidor` (`id_repartidor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_ruta`
--

LOCK TABLES `historial_ruta` WRITE;
/*!40000 ALTER TABLE `historial_ruta` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_ruta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lavadora`
--

DROP TABLE IF EXISTS `lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lavadora` (
  `id_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_sucursal` bigint unsigned NOT NULL,
  `id_marca_lavadora` bigint unsigned NOT NULL,
  `id_modelo_lavadora` bigint unsigned NOT NULL,
  `id_capacidad_lavadora` bigint unsigned NOT NULL,
  `id_estado_lavadora` bigint unsigned NOT NULL,
  `codigo_interno` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_serie` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_compra` date DEFAULT NULL,
  `valor_compra` decimal(12,2) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `disponible` tinyint(1) DEFAULT '1',
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo_interno` (`codigo_interno`),
  UNIQUE KEY `numero_serie` (`numero_serie`),
  KEY `fk_lavadora_empresa` (`id_empresa`),
  KEY `fk_lavadora_sucursal` (`id_sucursal`),
  KEY `fk_lavadora_marca` (`id_marca_lavadora`),
  KEY `fk_lavadora_modelo` (`id_modelo_lavadora`),
  KEY `fk_lavadora_capacidad` (`id_capacidad_lavadora`),
  KEY `fk_lavadora_estado` (`id_estado_lavadora`),
  CONSTRAINT `fk_lavadora_capacidad` FOREIGN KEY (`id_capacidad_lavadora`) REFERENCES `capacidad_lavadora` (`id_capacidad_lavadora`),
  CONSTRAINT `fk_lavadora_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_lavadora_estado` FOREIGN KEY (`id_estado_lavadora`) REFERENCES `estado_lavadora` (`id_estado_lavadora`),
  CONSTRAINT `fk_lavadora_marca` FOREIGN KEY (`id_marca_lavadora`) REFERENCES `marca_lavadora` (`id_marca_lavadora`),
  CONSTRAINT `fk_lavadora_modelo` FOREIGN KEY (`id_modelo_lavadora`) REFERENCES `modelo_lavadora` (`id_modelo_lavadora`),
  CONSTRAINT `fk_lavadora_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lavadora`
--

LOCK TABLES `lavadora` WRITE;
/*!40000 ALTER TABLE `lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `liquidacion_alquiler`
--

DROP TABLE IF EXISTS `liquidacion_alquiler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liquidacion_alquiler` (
  `id_liquidacion_alquiler` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_alquiler` bigint unsigned NOT NULL,
  `tiempo_real_minutos` int NOT NULL,
  `tiempo_facturado_minutos` int NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `descuentos` decimal(12,2) DEFAULT '0.00',
  `recargos` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `fecha_liquidacion` datetime NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_liquidacion_alquiler`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_liquidacion_alquiler` (`id_alquiler`),
  CONSTRAINT `fk_liquidacion_alquiler` FOREIGN KEY (`id_alquiler`) REFERENCES `alquiler` (`id_alquiler`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liquidacion_alquiler`
--

LOCK TABLES `liquidacion_alquiler` WRITE;
/*!40000 ALTER TABLE `liquidacion_alquiler` DISABLE KEYS */;
/*!40000 ALTER TABLE `liquidacion_alquiler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento_lavadora`
--

DROP TABLE IF EXISTS `mantenimiento_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento_lavadora` (
  `id_mantenimiento_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lavadora` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `tipo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `costo` decimal(12,2) DEFAULT NULL,
  `realizado_por` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proximo_mantenimiento` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mantenimiento_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_mantenimiento_lavadora` (`id_lavadora`),
  CONSTRAINT `fk_mantenimiento_lavadora` FOREIGN KEY (`id_lavadora`) REFERENCES `lavadora` (`id_lavadora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento_lavadora`
--

LOCK TABLES `mantenimiento_lavadora` WRITE;
/*!40000 ALTER TABLE `mantenimiento_lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `mantenimiento_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca_lavadora`
--

DROP TABLE IF EXISTS `marca_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca_lavadora` (
  `id_marca_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_marca_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca_lavadora`
--

LOCK TABLES `marca_lavadora` WRITE;
/*!40000 ALTER TABLE `marca_lavadora` DISABLE KEYS */;
INSERT INTO `marca_lavadora` VALUES (1,'f2c92cb4-8641-11f1-b554-0a0027000007','Haceb',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(2,'f2c93490-8641-11f1-b554-0a0027000007','Mabe',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(3,'f2c939c4-8641-11f1-b554-0a0027000007','Samsung',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(4,'f2c93d10-8641-11f1-b554-0a0027000007','LG',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(5,'f2c9406b-8641-11f1-b554-0a0027000007','Whirlpool',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(6,'f2c94376-8641-11f1-b554-0a0027000007','Centrales',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(7,'f2c9467d-8641-11f1-b554-0a0027000007','Electrolux',NULL,1,'2026-07-23 02:55:22','2026-07-23 02:55:22');
/*!40000 ALTER TABLE `marca_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metodo_pago`
--

DROP TABLE IF EXISTS `metodo_pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metodo_pago` (
  `id_metodo_pago` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_metodo_pago`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metodo_pago`
--

LOCK TABLES `metodo_pago` WRITE;
/*!40000 ALTER TABLE `metodo_pago` DISABLE KEYS */;
INSERT INTO `metodo_pago` VALUES (1,'f17992a3-8641-11f1-b554-0a0027000007','Efectivo',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(2,'f179ba78-8641-11f1-b554-0a0027000007','Nequi',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(3,'f179be54-8641-11f1-b554-0a0027000007','Daviplata',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(4,'f179c091-8641-11f1-b554-0a0027000007','Transferencia Bancaria',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(5,'f179c2a0-8641-11f1-b554-0a0027000007','Tarjeta Débito',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(6,'f179c45b-8641-11f1-b554-0a0027000007','Tarjeta Crédito',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20');
/*!40000 ALTER TABLE `metodo_pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo_lavadora`
--

DROP TABLE IF EXISTS `modelo_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelo_lavadora` (
  `id_modelo_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_marca_lavadora` bigint unsigned NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_modelo_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_modelo_marca` (`id_marca_lavadora`),
  CONSTRAINT `fk_modelo_marca` FOREIGN KEY (`id_marca_lavadora`) REFERENCES `marca_lavadora` (`id_marca_lavadora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo_lavadora`
--

LOCK TABLES `modelo_lavadora` WRITE;
/*!40000 ALTER TABLE `modelo_lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `modelo_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimiento_lavadora`
--

DROP TABLE IF EXISTS `movimiento_lavadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimiento_lavadora` (
  `id_movimiento_lavadora` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_lavadora` bigint unsigned NOT NULL,
  `id_estado_anterior` bigint unsigned DEFAULT NULL,
  `id_estado_nuevo` bigint unsigned NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_movimiento` datetime NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimiento_lavadora`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_movimiento_lavadora` (`id_lavadora`),
  KEY `fk_movimiento_estado_anterior` (`id_estado_anterior`),
  KEY `fk_movimiento_estado_nuevo` (`id_estado_nuevo`),
  CONSTRAINT `fk_movimiento_estado_anterior` FOREIGN KEY (`id_estado_anterior`) REFERENCES `estado_lavadora` (`id_estado_lavadora`),
  CONSTRAINT `fk_movimiento_estado_nuevo` FOREIGN KEY (`id_estado_nuevo`) REFERENCES `estado_lavadora` (`id_estado_lavadora`),
  CONSTRAINT `fk_movimiento_lavadora` FOREIGN KEY (`id_lavadora`) REFERENCES `lavadora` (`id_lavadora`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimiento_lavadora`
--

LOCK TABLES `movimiento_lavadora` WRITE;
/*!40000 ALTER TABLE `movimiento_lavadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimiento_lavadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `municipio`
--

DROP TABLE IF EXISTS `municipio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `municipio` (
  `id_municipio` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_departamento` bigint unsigned NOT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_dane` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_municipio`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_municipio_departamento` (`id_departamento`),
  CONSTRAINT `fk_municipio_departamento` FOREIGN KEY (`id_departamento`) REFERENCES `departamento` (`id_departamento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `municipio`
--

LOCK TABLES `municipio` WRITE;
/*!40000 ALTER TABLE `municipio` DISABLE KEYS */;
/*!40000 ALTER TABLE `municipio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificacion`
--

DROP TABLE IF EXISTS `notificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificacion` (
  `id_notificacion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha_lectura` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_notificacion_usuario` (`id_usuario`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificacion`
--

LOCK TABLES `notificacion` WRITE;
/*!40000 ALTER TABLE `notificacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago_cliente`
--

DROP TABLE IF EXISTS `pago_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago_cliente` (
  `id_pago_cliente` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_liquidacion_alquiler` bigint unsigned NOT NULL,
  `id_metodo_pago` bigint unsigned NOT NULL,
  `id_estado_pago` bigint unsigned NOT NULL,
  `numero_transaccion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valor` decimal(12,2) NOT NULL,
  `fecha_pago` datetime NOT NULL,
  `referencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago_cliente`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_pago_liquidacion` (`id_liquidacion_alquiler`),
  KEY `fk_pago_metodo` (`id_metodo_pago`),
  KEY `fk_pago_estado` (`id_estado_pago`),
  CONSTRAINT `fk_pago_estado` FOREIGN KEY (`id_estado_pago`) REFERENCES `estado_pago` (`id_estado_pago`),
  CONSTRAINT `fk_pago_liquidacion` FOREIGN KEY (`id_liquidacion_alquiler`) REFERENCES `liquidacion_alquiler` (`id_liquidacion_alquiler`),
  CONSTRAINT `fk_pago_metodo` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id_metodo_pago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_cliente`
--

LOCK TABLES `pago_cliente` WRITE;
/*!40000 ALTER TABLE `pago_cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago_empresa`
--

DROP TABLE IF EXISTS `pago_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago_empresa` (
  `id_pago_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_suscripcion` bigint unsigned NOT NULL,
  `id_metodo_pago` bigint unsigned NOT NULL,
  `id_estado_pago` bigint unsigned NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `numero_transaccion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `comprobante` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pago_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_pago_empresa_empresa` (`id_empresa`),
  KEY `fk_pago_empresa_suscripcion` (`id_suscripcion`),
  KEY `fk_pago_empresa_metodo` (`id_metodo_pago`),
  KEY `fk_pago_empresa_estado` (`id_estado_pago`),
  CONSTRAINT `fk_pago_empresa_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_pago_empresa_estado` FOREIGN KEY (`id_estado_pago`) REFERENCES `estado_pago` (`id_estado_pago`),
  CONSTRAINT `fk_pago_empresa_metodo` FOREIGN KEY (`id_metodo_pago`) REFERENCES `metodo_pago` (`id_metodo_pago`),
  CONSTRAINT `fk_pago_empresa_suscripcion` FOREIGN KEY (`id_suscripcion`) REFERENCES `suscripcion` (`id_suscripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago_empresa`
--

LOCK TABLES `pago_empresa` WRITE;
/*!40000 ALTER TABLE `pago_empresa` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pais`
--

DROP TABLE IF EXISTS `pais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pais` (
  `id_pais` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_iso2` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_iso3` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `indicativo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pais`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo_iso2` (`codigo_iso2`),
  UNIQUE KEY `codigo_iso3` (`codigo_iso3`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pais`
--

LOCK TABLES `pais` WRITE;
/*!40000 ALTER TABLE `pais` DISABLE KEYS */;
/*!40000 ALTER TABLE `pais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permiso`
--

DROP TABLE IF EXISTS `permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permiso` (
  `id_permiso` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permiso`
--

LOCK TABLES `permiso` WRITE;
/*!40000 ALTER TABLE `permiso` DISABLE KEYS */;
INSERT INTO `permiso` VALUES (1,'f2063182-8641-11f1-b554-0a0027000007','EMPRESAS','EMPRESA_VER','Ver empresas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f2063bff-8641-11f1-b554-0a0027000007','EMPRESAS','EMPRESA_CREAR','Crear empresas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f2064007-8641-11f1-b554-0a0027000007','EMPRESAS','EMPRESA_EDITAR','Editar empresas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f2064396-8641-11f1-b554-0a0027000007','EMPRESAS','EMPRESA_ELIMINAR','Eliminar empresas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(5,'f2064782-8641-11f1-b554-0a0027000007','USUARIOS','USUARIO_VER','Ver usuarios',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(6,'f2064b13-8641-11f1-b554-0a0027000007','USUARIOS','USUARIO_CREAR','Crear usuarios',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(7,'f2064e09-8641-11f1-b554-0a0027000007','USUARIOS','USUARIO_EDITAR','Editar usuarios',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(8,'f206511e-8641-11f1-b554-0a0027000007','USUARIOS','USUARIO_ELIMINAR','Eliminar usuarios',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(9,'f20654af-8641-11f1-b554-0a0027000007','LAVADORAS','LAVADORA_VER','Ver lavadoras',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(10,'f206579b-8641-11f1-b554-0a0027000007','LAVADORAS','LAVADORA_CREAR','Crear lavadoras',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(11,'f2065a8b-8641-11f1-b554-0a0027000007','LAVADORAS','LAVADORA_EDITAR','Editar lavadoras',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(12,'f2065dcf-8641-11f1-b554-0a0027000007','LAVADORAS','LAVADORA_MANTENIMIENTO','Registrar mantenimiento',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(13,'f2066109-8641-11f1-b554-0a0027000007','ALQUILERES','ALQUILER_VER','Ver alquileres',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(14,'f2066404-8641-11f1-b554-0a0027000007','ALQUILERES','ALQUILER_CREAR','Crear alquiler',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(15,'f2066710-8641-11f1-b554-0a0027000007','ALQUILERES','ALQUILER_FINALIZAR','Finalizar alquiler',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(16,'f2066a7e-8641-11f1-b554-0a0027000007','PAGOS','PAGO_VER','Ver pagos',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(17,'f2066e34-8641-11f1-b554-0a0027000007','PAGOS','PAGO_CREAR','Registrar pago',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(18,'f2067159-8641-11f1-b554-0a0027000007','FACTURAS','FACTURA_VER','Ver facturas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(19,'f2067491-8641-11f1-b554-0a0027000007','FACTURAS','FACTURA_GENERAR','Generar factura',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(20,'f2067786-8641-11f1-b554-0a0027000007','RUTAS','RUTA_VER','Ver rutas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(21,'f2067a97-8641-11f1-b554-0a0027000007','RUTAS','RUTA_CREAR','Crear rutas',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(22,'f2067db7-8641-11f1-b554-0a0027000007','REPORTES','REPORTE_VER','Ver reportes',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(23,'f20680c4-8641-11f1-b554-0a0027000007','CONFIGURACION','CONFIGURACION_EDITAR','Editar configuración',NULL,1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `persona`
--

DROP TABLE IF EXISTS `persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persona` (
  `id_persona` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_tipo_documento` bigint unsigned NOT NULL,
  `numero_documento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_genero` bigint unsigned DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_direccion` bigint unsigned DEFAULT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `numero_documento` (`numero_documento`),
  UNIQUE KEY `correo` (`correo`),
  KEY `fk_persona_tipo_documento` (`id_tipo_documento`),
  KEY `fk_persona_genero` (`id_genero`),
  KEY `fk_persona_direccion` (`id_direccion`),
  CONSTRAINT `fk_persona_direccion` FOREIGN KEY (`id_direccion`) REFERENCES `direccion` (`id_direccion`),
  CONSTRAINT `fk_persona_genero` FOREIGN KEY (`id_genero`) REFERENCES `genero` (`id_genero`),
  CONSTRAINT `fk_persona_tipo_documento` FOREIGN KEY (`id_tipo_documento`) REFERENCES `tipo_documento` (`id_tipo_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `persona`
--

LOCK TABLES `persona` WRITE;
/*!40000 ALTER TABLE `persona` DISABLE KEYS */;
/*!40000 ALTER TABLE `persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `id_plan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_mensual` decimal(12,2) NOT NULL,
  `cantidad_sucursales` int DEFAULT NULL,
  `cantidad_repartidores` int DEFAULT NULL,
  `cantidad_lavadoras` int DEFAULT NULL,
  `soporte_prioritario` tinyint(1) DEFAULT '0',
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_plan`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES (1,'f2774648-8641-11f1-b554-0a0027000007','BÁSICO','Plan para pequeñas empresas',0.00,1,2,20,0,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(2,'f27750f6-8641-11f1-b554-0a0027000007','PROFESIONAL','Plan empresarial',50000.00,3,10,100,1,1,'2026-07-23 02:55:22','2026-07-23 02:55:22'),(3,'f277537f-8641-11f1-b554-0a0027000007','EMPRESARIAL','Plan ilimitado',120000.00,NULL,NULL,NULL,1,1,'2026-07-23 02:55:22','2026-07-23 02:55:22');
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `id_refresh_token` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `revocado` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_refresh_token`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_refresh_usuario` (`id_usuario`),
  CONSTRAINT `fk_refresh_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `repartidor`
--

DROP TABLE IF EXISTS `repartidor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `repartidor` (
  `id_repartidor` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `licencia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vence_licencia` date DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT '1',
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `ultima_conexion` datetime DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_repartidor`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_repartidor_empresa` (`id_empresa`),
  KEY `fk_repartidor_usuario` (`id_usuario`),
  CONSTRAINT `fk_repartidor_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_repartidor_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `repartidor`
--

LOCK TABLES `repartidor` WRITE;
/*!40000 ALTER TABLE `repartidor` DISABLE KEYS */;
/*!40000 ALTER TABLE `repartidor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_sistema` tinyint(1) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'f1ef808f-8641-11f1-b554-0a0027000007','SUPER_ADMIN','Super Administrador','Administrador general de la plataforma',1,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(2,'f1ef8a8e-8641-11f1-b554-0a0027000007','ADMIN_EMPRESA','Administrador Empresa','Administrador de una empresa',1,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(3,'f1ef8e21-8641-11f1-b554-0a0027000007','REPARTIDOR','Repartidor','Encargado de entregas y recogidas',1,1,'2026-07-23 02:55:21','2026-07-23 02:55:21'),(4,'f1ef90e5-8641-11f1-b554-0a0027000007','CLIENTE','Cliente','Usuario final de la plataforma',1,1,'2026-07-23 02:55:21','2026-07-23 02:55:21');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `id_rol_permiso` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_rol` bigint unsigned NOT NULL,
  `id_permiso` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol_permiso`),
  UNIQUE KEY `uk_rol_permiso` (`id_rol`,`id_permiso`),
  KEY `fk_rol_permiso_permiso` (`id_permiso`),
  CONSTRAINT `fk_rol_permiso_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`),
  CONSTRAINT `fk_rol_permiso_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ruta`
--

DROP TABLE IF EXISTS `ruta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ruta` (
  `id_ruta` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `origen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destino` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distancia_km` decimal(8,2) DEFAULT NULL,
  `tiempo_estimado_minutos` int DEFAULT NULL,
  `latitud_origen` decimal(10,8) DEFAULT NULL,
  `longitud_origen` decimal(11,8) DEFAULT NULL,
  `latitud_destino` decimal(10,8) DEFAULT NULL,
  `longitud_destino` decimal(11,8) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ruta`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_ruta_empresa` (`id_empresa`),
  CONSTRAINT `fk_ruta_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ruta`
--

LOCK TABLES `ruta` WRITE;
/*!40000 ALTER TABLE `ruta` DISABLE KEYS */;
/*!40000 ALTER TABLE `ruta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sesion`
--

DROP TABLE IF EXISTS `sesion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesion` (
  `id_sesion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` datetime NOT NULL,
  `fecha_expiracion` datetime DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sesion`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_sesion_usuario` (`id_usuario`),
  CONSTRAINT `fk_sesion_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sesion`
--

LOCK TABLES `sesion` WRITE;
/*!40000 ALTER TABLE `sesion` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitud_alquiler`
--

DROP TABLE IF EXISTS `solicitud_alquiler`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_alquiler` (
  `id_solicitud_alquiler` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_cliente_empresa` bigint unsigned NOT NULL,
  `id_sucursal` bigint unsigned NOT NULL,
  `id_capacidad_lavadora` bigint unsigned NOT NULL,
  `id_estado_solicitud` bigint unsigned NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `fecha_programada` datetime DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `direccion_entrega` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_solicitud_alquiler`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_solicitud_empresa` (`id_empresa`),
  KEY `fk_solicitud_cliente` (`id_cliente_empresa`),
  KEY `fk_solicitud_sucursal` (`id_sucursal`),
  KEY `fk_solicitud_capacidad` (`id_capacidad_lavadora`),
  KEY `fk_solicitud_estado` (`id_estado_solicitud`),
  CONSTRAINT `fk_solicitud_capacidad` FOREIGN KEY (`id_capacidad_lavadora`) REFERENCES `capacidad_lavadora` (`id_capacidad_lavadora`),
  CONSTRAINT `fk_solicitud_cliente` FOREIGN KEY (`id_cliente_empresa`) REFERENCES `cliente_empresa` (`id_cliente_empresa`),
  CONSTRAINT `fk_solicitud_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_solicitud_estado` FOREIGN KEY (`id_estado_solicitud`) REFERENCES `estado_solicitud` (`id_estado_solicitud`),
  CONSTRAINT `fk_solicitud_sucursal` FOREIGN KEY (`id_sucursal`) REFERENCES `sucursal` (`id_sucursal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitud_alquiler`
--

LOCK TABLES `solicitud_alquiler` WRITE;
/*!40000 ALTER TABLE `solicitud_alquiler` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitud_alquiler` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soporte_respuesta`
--

DROP TABLE IF EXISTS `soporte_respuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soporte_respuesta` (
  `id_soporte_respuesta` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_soporte_ticket` bigint unsigned NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `respuesta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_soporte_respuesta`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_respuesta_ticket` (`id_soporte_ticket`),
  KEY `fk_respuesta_usuario` (`id_usuario`),
  CONSTRAINT `fk_respuesta_ticket` FOREIGN KEY (`id_soporte_ticket`) REFERENCES `soporte_ticket` (`id_soporte_ticket`),
  CONSTRAINT `fk_respuesta_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soporte_respuesta`
--

LOCK TABLES `soporte_respuesta` WRITE;
/*!40000 ALTER TABLE `soporte_respuesta` DISABLE KEYS */;
/*!40000 ALTER TABLE `soporte_respuesta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soporte_ticket`
--

DROP TABLE IF EXISTS `soporte_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `soporte_ticket` (
  `id_soporte_ticket` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned DEFAULT NULL,
  `id_usuario` bigint unsigned DEFAULT NULL,
  `asunto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `prioridad` enum('BAJA','MEDIA','ALTA','CRITICA') COLLATE utf8mb4_unicode_ci DEFAULT 'MEDIA',
  `estado` enum('ABIERTO','PROCESO','CERRADO') COLLATE utf8mb4_unicode_ci DEFAULT 'ABIERTO',
  `fecha_cierre` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_soporte_ticket`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_ticket_empresa` (`id_empresa`),
  KEY `fk_ticket_usuario` (`id_usuario`),
  CONSTRAINT `fk_ticket_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_ticket_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soporte_ticket`
--

LOCK TABLES `soporte_ticket` WRITE;
/*!40000 ALTER TABLE `soporte_ticket` DISABLE KEYS */;
/*!40000 ALTER TABLE `soporte_ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sucursal`
--

DROP TABLE IF EXISTS `sucursal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sucursal` (
  `id_sucursal` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_direccion` bigint unsigned NOT NULL,
  `principal` tinyint(1) DEFAULT '0',
  `estado` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sucursal`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_sucursal_empresa` (`id_empresa`),
  KEY `fk_sucursal_direccion` (`id_direccion`),
  CONSTRAINT `fk_sucursal_direccion` FOREIGN KEY (`id_direccion`) REFERENCES `direccion` (`id_direccion`),
  CONSTRAINT `fk_sucursal_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sucursal`
--

LOCK TABLES `sucursal` WRITE;
/*!40000 ALTER TABLE `sucursal` DISABLE KEYS */;
/*!40000 ALTER TABLE `sucursal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suscripcion`
--

DROP TABLE IF EXISTS `suscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suscripcion` (
  `id_suscripcion` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_plan` bigint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `valor` decimal(12,2) NOT NULL,
  `pagada` tinyint(1) DEFAULT '0',
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_suscripcion`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_suscripcion_empresa` (`id_empresa`),
  KEY `fk_suscripcion_plan` (`id_plan`),
  CONSTRAINT `fk_suscripcion_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`),
  CONSTRAINT `fk_suscripcion_plan` FOREIGN KEY (`id_plan`) REFERENCES `plan` (`id_plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suscripcion`
--

LOCK TABLES `suscripcion` WRITE;
/*!40000 ALTER TABLE `suscripcion` DISABLE KEYS */;
/*!40000 ALTER TABLE `suscripcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifa_empresa`
--

DROP TABLE IF EXISTS `tarifa_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifa_empresa` (
  `id_tarifa_empresa` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_empresa` bigint unsigned NOT NULL,
  `id_capacidad_lavadora` bigint unsigned NOT NULL,
  `valor_hora` decimal(12,2) NOT NULL,
  `valor_minuto` decimal(12,2) NOT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tarifa_empresa`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `fk_tarifa_empresa` (`id_empresa`),
  KEY `fk_tarifa_capacidad` (`id_capacidad_lavadora`),
  CONSTRAINT `fk_tarifa_capacidad` FOREIGN KEY (`id_capacidad_lavadora`) REFERENCES `capacidad_lavadora` (`id_capacidad_lavadora`),
  CONSTRAINT `fk_tarifa_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifa_empresa`
--

LOCK TABLES `tarifa_empresa` WRITE;
/*!40000 ALTER TABLE `tarifa_empresa` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarifa_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_documento`
--

DROP TABLE IF EXISTS `tipo_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_documento` (
  `id_tipo_documento` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_tipo_documento`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_documento`
--

LOCK TABLES `tipo_documento` WRITE;
/*!40000 ALTER TABLE `tipo_documento` DISABLE KEYS */;
INSERT INTO `tipo_documento` VALUES (1,'f154f1a9-8641-11f1-b554-0a0027000007','CC','Cédula de Ciudadanía',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(2,'f1621931-8641-11f1-b554-0a0027000007','CE','Cédula de Extranjería',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(3,'f16225d2-8641-11f1-b554-0a0027000007','TI','Tarjeta de Identidad',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(4,'f1622950-8641-11f1-b554-0a0027000007','NIT','Número de Identificación Tributaria',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(5,'f1622d2d-8641-11f1-b554-0a0027000007','PAS','Pasaporte',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(6,'f1623124-8641-11f1-b554-0a0027000007','PEP','Permiso Especial de Permanencia',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20'),(7,'f162339a-8641-11f1-b554-0a0027000007','PPT','Permiso por Protección Temporal',NULL,1,'2026-07-23 02:55:20','2026-07-23 02:55:20');
/*!40000 ALTER TABLE `tipo_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_persona` bigint unsigned NOT NULL,
  `id_rol` bigint unsigned NOT NULL,
  `id_estado_usuario` bigint unsigned NOT NULL,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ultimo_login` datetime DEFAULT NULL,
  `intentos_fallidos` int NOT NULL DEFAULT '0',
  `cambiar_password` tinyint(1) NOT NULL DEFAULT '0',
  `doble_factor` tinyint(1) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_usuario_persona` (`id_persona`),
  KEY `fk_usuario_rol` (`id_rol`),
  KEY `fk_usuario_estado` (`id_estado_usuario`),
  CONSTRAINT `fk_usuario_estado` FOREIGN KEY (`id_estado_usuario`) REFERENCES `estado_usuario` (`id_estado_usuario`),
  CONSTRAINT `fk_usuario_persona` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-23 16:51:58
