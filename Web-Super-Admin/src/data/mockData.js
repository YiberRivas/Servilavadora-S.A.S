export const stats = {
  empresas: { total: 24, activas: 14, pendientes: 3, inactivas: 3, enMora: 4 },
  planes: { premium: 14, basico: 10 },
  ingresos: { mesActual: 18500000, mesAnterior: 17200000, anual: 218000000, crecimiento: 7.6 },
  usuarios: { total: 1280, clientes: 1252, repartidores: 18, admins: 10 },
  suscripciones: { activas: 14, vencenPronto: 3, enMora: 4, renovaciones: 11 },
  calificacion: 4.8,
}

export const empresas = [
  { id: 1, nombre: 'CleanHouse', nit: '900123456-1', ciudad: 'Bogota', estado: 'activa', servicios: 324, calificacion: 4.9, email: 'contacto@cleanhouse.co', logoColor: '#2D6CB5', telefono: '601 555 0101', direccion: 'Calle 80 #15-30', responsable: 'Andres Martinez', plan: 'Premium', valorMensual: 500000, observaciones: 'Empresa lider en lavanderia premium', fechaRegistro: '2025-03-15', fechaInicioPlan: '2025-04-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Daviplata', renovacionAutomatica: true, clientesAtendidos: 189, serviciosCancelados: 4, tiempoRespuesta: '18 min', clientesFrecuentes: 67, satisfaccion: 96, cobertura: 'Bogota, Soacha', horarioAtencion: 'Lun-Sab 7:00 - 20:00', descripcion: 'Lavanderia premium con servicio de recogida y entrega a domicilio.' },
  { id: 2, nombre: 'LavaExpress', nit: '900234567-2', ciudad: 'Medellin', estado: 'activa', servicios: 218, calificacion: 4.7, email: 'info@lavaexpress.co', logoColor: '#12A594', telefono: '604 555 0202', direccion: 'Carrera 43 #1-50', responsable: 'Sofia Herrera', plan: 'Basico', valorMensual: 250000, observaciones: '', fechaRegistro: '2025-06-20', fechaInicioPlan: '2025-07-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Nequi', renovacionAutomatica: true, clientesAtendidos: 134, serviciosCancelados: 2, tiempoRespuesta: '25 min', clientesFrecuentes: 42, satisfaccion: 93, cobertura: 'Medellin, Envigado, Itagui', horarioAtencion: 'Lun-Sab 6:30 - 19:00', descripcion: 'Servicio rapido de lavanderia para el area metropolitana de Medellin.' },
  { id: 3, nombre: 'Punto Limpio', nit: '900345678-3', ciudad: 'Cali', estado: 'pendiente', servicios: 0, calificacion: null, email: 'admin@puntolimpio.co', logoColor: '#1F4E79', telefono: '602 555 0303', direccion: 'Calle 5 #20-10', responsable: 'Carlos Vargas', plan: 'Basico', valorMensual: 250000, observaciones: 'Solicitud pendiente de revision', fechaRegistro: '2026-07-01', fechaInicioPlan: null, proximoPago: null, estadoPago: 'pendiente', metodoPago: null, renovacionAutomatica: false, clientesAtendidos: 0, serviciosCancelados: 0, tiempoRespuesta: '-', clientesFrecuentes: 0, satisfaccion: 0, cobertura: 'Cali', horarioAtencion: 'Lun-Vie 8:00 - 17:00', descripcion: 'Nueva lavanderia local ofreciendo servicio basico de lavado y planchado.' },
  { id: 4, nombre: 'Ropa al Dia', nit: '900456789-4', ciudad: 'Quibdo', estado: 'activa', servicios: 156, calificacion: 4.6, email: 'info@ropaaldia.co', logoColor: '#2D6CB5', telefono: '605 555 0404', direccion: 'Calle Principal #12-05', responsable: 'Laura Ospina', plan: 'Premium', valorMensual: 500000, observaciones: '', fechaRegistro: '2025-09-10', fechaInicioPlan: '2025-10-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Daviplata', renovacionAutomatica: true, clientesAtendidos: 78, serviciosCancelados: 1, tiempoRespuesta: '30 min', clientesFrecuentes: 31, satisfaccion: 91, cobertura: 'Quibdo Centro', horarioAtencion: 'Lun-Sab 7:00 - 18:00', descripcion: 'Servicio de lavanderia con enfoque ecologico en el Choco.' },
  { id: 5, nombre: 'Lavanderia Express', nit: '900567890-5', ciudad: 'Barranquilla', estado: 'activa', servicios: 89, calificacion: 4.5, email: 'info@lavex.co', logoColor: '#12A594', telefono: '605 555 0505', direccion: 'Carrera 52 #30-15', responsable: 'Miguel Torres', plan: 'Basico', valorMensual: 250000, observaciones: '', fechaRegistro: '2025-11-05', fechaInicioPlan: '2025-12-01', proximoPago: '2026-07-20', estadoPago: 'proximo_vencer', metodoPago: 'Efecty', renovacionAutomatica: false, clientesAtendidos: 52, serviciosCancelados: 0, tiempoRespuesta: '22 min', clientesFrecuentes: 19, satisfaccion: 89, cobertura: 'Barranquilla Puerto', horarioAtencion: 'Lun-Sab 6:00 - 18:00', descripcion: 'Lavanderia express con entrega en el mismo dia.' },
  { id: 6, nombre: 'CleanPro', nit: '900678901-6', ciudad: 'Bogota', estado: 'inactiva', servicios: 45, calificacion: 3.8, email: 'admin@cleanpro.co', logoColor: '#1F4E79', telefono: '601 555 0606', direccion: 'Carrera 7 #40-20', responsable: 'Diana Castillo', plan: 'Premium', valorMensual: 500000, observaciones: 'Empresa suspendida por falta de pago', fechaRegistro: '2025-08-12', fechaInicioPlan: '2025-09-01', proximoPago: '2026-06-01', estadoPago: 'en_mora', metodoPago: 'Transferencia', renovacionAutomatica: false, clientesAtendidos: 28, serviciosCancelados: 3, tiempoRespuesta: '45 min', clientesFrecuentes: 8, satisfaccion: 72, cobertura: 'Bogota Norte', horarioAtencion: 'Lun-Vie 8:00 - 17:00', descripcion: 'Servicio de lavanderia industrial y domestica.' },
  { id: 7, nombre: 'LavaMax', nit: '900789012-7', ciudad: 'Bogota', estado: 'activa', servicios: 278, calificacion: 4.8, email: 'contacto@lavamax.co', logoColor: '#2D6CB5', telefono: '601 555 0707', direccion: 'Calle 100 #11-45', responsable: 'Pedro Ramirez', plan: 'Premium', valorMensual: 500000, observaciones: '', fechaRegistro: '2025-04-22', fechaInicioPlan: '2025-05-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Daviplata', renovacionAutomatica: true, clientesAtendidos: 156, serviciosCancelados: 2, tiempoRespuesta: '15 min', clientesFrecuentes: 72, satisfaccion: 97, cobertura: 'Bogota, Chia, Cota', horarioAtencion: 'Lun-Sab 6:00 - 21:00', descripcion: 'Red de lavanderias con cobertura en Bogota y municipios cercanos.' },
  { id: 8, nombre: 'Todolava', nit: '900890123-8', ciudad: 'Medellin', estado: 'activa', servicios: 134, calificacion: 4.3, email: 'info@todolava.co', logoColor: '#12A594', telefono: '604 555 0808', direccion: 'Carrera 80 #25-10', responsable: 'Ana Gutierrez', plan: 'Basico', observaciones: '', valorMensual: 250000, fechaRegistro: '2025-07-30', fechaInicioPlan: '2025-08-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Nequi', renovacionAutomatica: true, clientesAtendidos: 87, serviciosCancelados: 1, tiempoRespuesta: '28 min', clientesFrecuentes: 29, satisfaccion: 88, cobertura: 'Medellin Sur', horarioAtencion: 'Lun-Sab 7:00 - 19:00', descripcion: 'Lavanderia familiar con precios accesibles.' },
  { id: 9, nombre: 'EcoLavado', nit: '900901234-9', ciudad: 'Cali', estado: 'activa', servicios: 92, calificacion: 4.6, email: 'hola@ecolavado.co', logoColor: '#2D6CB5', telefono: '602 555 0909', direccion: 'Calle 15 #5-80', responsable: 'Jorge Lopez', plan: 'Basico', observaciones: 'Usa productos ecologicos', valorMensual: 250000, fechaRegistro: '2025-10-18', fechaInicioPlan: '2025-11-01', proximoPago: '2026-09-01', estadoPago: 'pagado', metodoPago: 'Daviplata', renovacionAutomatica: true, clientesAtendidos: 54, serviciosCancelados: 0, tiempoRespuesta: '20 min', clientesFrecuentes: 21, satisfaccion: 92, cobertura: 'Cali Norte', horarioAtencion: 'Lun-Sab 7:30 - 18:30', descripcion: 'Lavanderia ecologica con productos biodegradables y proceso sustentable.' },
  { id: 10, nombre: 'LavRapido', nit: '901012345-0', ciudad: 'Barranquilla', estado: 'pendiente', servicios: 0, calificacion: null, email: 'info@lavrapido.co', logoColor: '#1F4E79', telefono: '605 555 1010', direccion: 'Carrera 10 #20-30', responsable: 'Carolina Mendez', plan: 'Basico', observaciones: 'Nueva solicitud de ingreso', fechaRegistro: '2026-07-05', valorMensual: 250000, fechaInicioPlan: null, proximoPago: null, estadoPago: 'pendiente', metodoPago: null, renovacionAutomatica: false, clientesAtendidos: 0, serviciosCancelados: 0, tiempoRespuesta: '-', clientesFrecuentes: 0, satisfaccion: 0, cobertura: 'Barranquilla', horarioAtencion: 'Lun-Sab 7:00 - 19:00', descripcion: 'Servicio rapido de lavado express para urgencias.' },
  { id: 11, nombre: 'FreshWash', nit: '901123456-1', ciudad: 'Bogota', estado: 'activa', servicios: 167, calificacion: 4.4, email: 'contacto@freshwash.co', logoColor: '#12A594', telefono: '601 555 1111', direccion: 'Calle 72 #9-25', responsable: 'Robert Diaz', plan: 'Premium', observaciones: '', valorMensual: 500000, fechaRegistro: '2025-05-14', fechaInicioPlan: '2025-06-01', proximoPago: '2026-08-01', estadoPago: 'proximo_vencer', metodoPago: 'Transferencia', renovacionAutomatica: false, clientesAtendidos: 98, serviciosCancelados: 1, tiempoRespuesta: '22 min', clientesFrecuentes: 38, satisfaccion: 90, cobertura: 'Bogota Chapinero, Usaquen', horarioAtencion: 'Lun-Sab 7:00 - 20:00', descripcion: 'Lavanderia moderna con app movil para gestion de pedidos.' },
  { id: 12, nombre: 'MiLavanderia', nit: '901234567-2', ciudad: 'Quibdo', estado: 'activa', servicios: 56, calificacion: 4.2, email: 'admin@milavanderia.co', logoColor: '#2D6CB5', telefono: '605 555 1212', direccion: 'Calle 3 #8-12', responsable: 'Valentina Rojas', plan: 'Basico', observaciones: '', valorMensual: 250000, fechaRegistro: '2025-12-01', fechaInicioPlan: '2026-01-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Efecty', renovacionAutomatica: true, clientesAtendidos: 32, serviciosCancelados: 0, tiempoRespuesta: '35 min', clientesFrecuentes: 12, satisfaccion: 86, cobertura: 'Quibdo Urbano', horarioAtencion: 'Lun-Vie 7:00 - 17:00', descripcion: 'Lavanderia comunitaria con servicio personalizado.' },
  { id: 13, nombre: 'SuperClean', nit: '901345678-3', ciudad: 'Medellin', estado: 'inactiva', servicios: 78, calificacion: 3.5, email: 'info@superclean.co', logoColor: '#1F4E79', telefono: '604 555 1313', direccion: 'Carrera 50 #20-40', responsable: 'Fernando Silva', plan: 'Premium', observaciones: 'Cierre temporal por mantenimiento', valorMensual: 500000, fechaRegistro: '2025-06-15', fechaInicioPlan: '2025-07-01', proximoPago: '2026-05-01', estadoPago: 'en_mora', metodoPago: 'Transferencia', renovacionAutomatica: false, clientesAtendidos: 41, serviciosCancelados: 5, tiempoRespuesta: '50 min', clientesFrecuentes: 11, satisfaccion: 68, cobertura: 'Medellin Centro', horarioAtencion: 'Lun-Vie 8:00 - 17:00', descripcion: 'Lavanderia con problemas de servicio, en proceso de mejoramiento.' },
  { id: 14, nombre: 'LavService', nit: '901456789-4', ciudad: 'Barranquilla', estado: 'activa', servicios: 201, calificacion: 4.7, email: 'contacto@lavservice.co', logoColor: '#12A594', telefono: '605 555 1414', direccion: 'Carrera 60 #40-15', responsable: 'Monica Parra', plan: 'Premium', observaciones: '', valorMensual: 500000, fechaRegistro: '2025-04-08', fechaInicioPlan: '2025-05-01', proximoPago: '2026-09-01', estadoPago: 'pagado', metodoPago: 'Nequi', renovacionAutomatica: true, clientesAtendidos: 112, serviciosCancelados: 1, tiempoRespuesta: '17 min', clientesFrecuentes: 48, satisfaccion: 94, cobertura: 'Barranquilla, Soledad, Malambo', horarioAtencion: 'Lun-Sab 6:30 - 19:30', descripcion: 'Servicio integral de lavanderia con convenios empresariales.' },
  { id: 15, nombre: 'CleanUp Co', nit: '901567890-5', ciudad: 'Cali', estado: 'activa', servicios: 145, calificacion: 4.5, email: 'hola@cleanup.co', logoColor: '#2D6CB5', telefono: '602 555 1515', direccion: 'Calle 25 #10-60', responsable: 'Santiago Herrera', plan: 'Basico', observaciones: '', valorMensual: 250000, fechaRegistro: '2025-08-25', fechaInicioPlan: '2025-09-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Daviplata', renovacionAutomatica: true, clientesAtendidos: 82, serviciosCancelados: 2, tiempoRespuesta: '24 min', clientesFrecuentes: 33, satisfaccion: 90, cobertura: 'Cali Centro, Este', horarioAtencion: 'Lun-Sab 7:00 - 19:00', descripcion: 'Lavanderia accesible con promociones semanales.' },
  { id: 16, nombre: 'RapidLav', nit: '901678901-6', ciudad: 'Bogota', estado: 'activa', servicios: 312, calificacion: 4.8, email: 'info@rapidlav.co', logoColor: '#12A594', telefono: '601 555 1616', direccion: 'Carrera 15 #85-20', responsable: 'Isabella Moreno', plan: 'Premium', observaciones: '', valorMensual: 500000, fechaRegistro: '2025-02-10', fechaInicioPlan: '2025-03-01', proximoPago: '2026-09-01', estadoPago: 'pagado', metodoPago: 'Nequi', renovacionAutomatica: true, clientesAtendidos: 178, serviciosCancelados: 3, tiempoRespuesta: '12 min', clientesFrecuentes: 81, satisfaccion: 98, cobertura: 'Bogota, Cundinamarca', horarioAtencion: 'Lun-Dom 6:00 - 22:00', descripcion: 'Lavanderia premium con servicio 24/7 y entrega express.' },
  { id: 17, nombre: 'LavCenter', nit: '901789012-7', ciudad: 'Quibdo', estado: 'pendiente', servicios: 0, calificacion: null, email: 'admin@lavcenter.co', logoColor: '#1F4E79', telefono: '605 555 1717', direccion: 'Calle 8 #4-30', responsable: 'Andres Camilo', plan: 'Basico', observaciones: 'En revision de documentos', fechaRegistro: '2026-07-08', valorMensual: 250000, fechaInicioPlan: null, proximoPago: null, estadoPago: 'pendiente', metodoPago: null, renovacionAutomatica: false, clientesAtendidos: 0, serviciosCancelados: 0, tiempoRespuesta: '-', clientesFrecuentes: 0, satisfaccion: 0, cobertura: 'Quibdo', horarioAtencion: 'Lun-Vie 8:00 - 17:00', descripcion: 'Centro de lavado con maquinas industriales de ultima generacion.' },
  { id: 18, nombre: 'BlueWash', nit: '901890123-8', ciudad: 'Medellin', estado: 'activa', servicios: 178, calificacion: 4.6, email: 'contacto@bluewash.co', logoColor: '#2D6CB5', telefono: '604 555 1818', direccion: 'Carrera 35 #12-50', responsable: 'Paula Ospina', plan: 'Premium', observaciones: '', valorMensual: 500000, fechaRegistro: '2025-05-20', fechaInicioPlan: '2025-06-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Efecty', renovacionAutomatica: true, clientesAtendidos: 103, serviciosCancelados: 1, tiempoRespuesta: '19 min', clientesFrecuentes: 44, satisfaccion: 93, cobertura: 'Medellin, Sabaneta', horarioAtencion: 'Lun-Sab 6:30 - 20:00', descripcion: 'Lavanderia con tecnologia de punta y servicio ecológico.' },
  { id: 19, nombre: 'LavTotal', nit: '901901234-9', ciudad: 'Barranquilla', estado: 'activa', servicios: 98, calificacion: 4.3, email: 'info@lavtotal.co', logoColor: '#12A594', telefono: '605 555 1919', direccion: 'Calle 30 #25-10', responsable: 'Camilo Andres', plan: 'Basico', observaciones: '', valorMensual: 250000, fechaRegistro: '2025-09-28', fechaInicioPlan: '2025-10-01', proximoPago: '2026-09-01', estadoPago: 'proximo_vencer', metodoPago: 'Daviplata', renovacionAutomatica: false, clientesAtendidos: 56, serviciosCancelados: 1, tiempoRespuesta: '26 min', clientesFrecuentes: 18, satisfaccion: 87, cobertura: 'Barranquilla Sur', horarioAtencion: 'Lun-Sab 7:00 - 18:00', descripcion: 'Servicio completo de lavanderia con precios fijos por kilo.' },
  { id: 20, nombre: 'EcoLavaPro', nit: '902012345-0', ciudad: 'Bogota', estado: 'activa', servicios: 234, calificacion: 4.9, email: 'hola@ecolavapro.co', logoColor: '#1F4E79', telefono: '601 555 2020', direccion: 'Carrera 50 #60-35', responsable: 'Elena Torres', plan: 'Premium', observaciones: 'Lider en lavado ecologico', valorMensual: 500000, fechaRegistro: '2025-01-15', fechaInicioPlan: '2025-02-01', proximoPago: '2026-08-01', estadoPago: 'pagado', metodoPago: 'Transferencia', renovacionAutomatica: true, clientesAtendidos: 145, serviciosCancelados: 1, tiempoRespuesta: '14 min', clientesFrecuentes: 69, satisfaccion: 97, cobertura: 'Bogota, Chia, Funza, Mosquera', horarioAtencion: 'Lun-Sab 6:00 - 21:00', descripcion: 'Lavanderia ecologica premium con certificacion ambiental y servicio a domicilio.' },
]

export const solicitudes = []

export const usuarios = [
  { id: 1, nombre: 'Maria', apellido: 'Andrade', email: 'maria@email.com', telefono: '310 456 7890', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-01-12', ultimoAcceso: '2026-07-12', ciudad: 'Bogota', serviciosRealizados: 8, observaciones: 'Cliente frecuente, satisfecha con el servicio.', color: '#2D6CB5' },
  { id: 2, nombre: 'Daniel', apellido: 'Renteria', email: 'daniel@email.com', telefono: '311 234 5678', rol: 'Repartidor', estado: 'activo', fechaRegistro: '2026-03-03', ultimoAcceso: '2026-07-13', ciudad: 'Quibdo', serviciosRealizados: 89, observaciones: 'Repartidor destacado del mes.', color: '#12A594' },
  { id: 3, nombre: 'Juliana', apellido: 'Castro', email: 'juliana@hotelcali.co', telefono: '602 555 0303', rol: 'Empresa', estado: 'activo', fechaRegistro: '2026-02-20', ultimoAcceso: '2026-07-11', ciudad: 'Cali', serviciosRealizados: 45, observaciones: 'Hotel Cali, convenio premium.', color: '#1F4E79' },
  { id: 4, nombre: 'Carlos', apellido: 'Rodriguez', email: 'carlos@email.com', telefono: '320 876 5432', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-04-15', ultimoAcceso: '2026-07-10', ciudad: 'Cali', serviciosRealizados: 12, observaciones: '', color: '#2D6CB5' },
  { id: 5, nombre: 'Laura', apellido: 'Perez', email: 'laura@email.com', telefono: '315 678 9012', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-05-01', ultimoAcceso: '2026-07-12', ciudad: 'Bogota', serviciosRealizados: 5, observaciones: '', color: '#12A594' },
  { id: 6, nombre: 'Luis', apellido: 'Moreno', email: 'luis@email.com', telefono: '318 345 6789', rol: 'Repartidor', estado: 'activo', fechaRegistro: '2026-02-14', ultimoAcceso: '2026-07-13', ciudad: 'Bogota', serviciosRealizados: 142, observaciones: 'Repartidor senior, alta calificacion.', color: '#1F4E79' },
  { id: 7, nombre: 'Andres', apellido: 'Gutierrez', email: 'andres@email.com', telefono: '312 901 2345', rol: 'Repartidor', estado: 'activo', fechaRegistro: '2026-03-22', ultimoAcceso: '2026-07-09', ciudad: 'Medellin', serviciosRealizados: 67, observaciones: '', color: '#2D6CB5' },
  { id: 8, nombre: 'Pedro', apellido: 'Sanchez', email: 'pedro@email.com', telefono: '300 567 8901', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-06-10', ultimoAcceso: '2026-07-08', ciudad: 'Medellin', serviciosRealizados: 3, observaciones: 'Nuevo usuario.', color: '#12A594' },
  { id: 9, nombre: 'Sofia', apellido: 'Ramirez', email: 'sofia@email.com', telefono: '301 234 5678', rol: 'Cliente', estado: 'inactivo', fechaRegistro: '2026-01-05', ultimoAcceso: '2026-04-20', ciudad: 'Barranquilla', serviciosRealizados: 6, observaciones: 'Cuenta desactivada a solicitud del usuario.', color: '#1F4E79' },
  { id: 10, nombre: 'Martin', apellido: 'Lopez', email: 'martin@email.com', telefono: '316 789 0123', rol: 'Repartidor', estado: 'activo', fechaRegistro: '2026-04-18', ultimoAcceso: '2026-07-12', ciudad: 'Cartagena', serviciosRealizados: 34, observaciones: '', color: '#2D6CB5' },
  { id: 11, nombre: 'Valentina', apellido: 'Rojas', email: 'valentina@email.com', telefono: '322 456 1230', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-03-10', ultimoAcceso: '2026-07-11', ciudad: 'Bogota', serviciosRealizados: 15, observaciones: 'Cliente premium.', color: '#12A594' },
  { id: 12, nombre: 'Santiago', apellido: 'Herrera', email: 'santiago@email.com', telefono: '305 678 9014', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-05-20', ultimoAcceso: '2026-07-07', ciudad: 'Cali', serviciosRealizados: 2, observaciones: '', color: '#1F4E79' },
  { id: 13, nombre: 'Camilo', apellido: 'Andres', email: 'camilo@email.com', telefono: '317 890 1236', rol: 'Repartidor', estado: 'inactivo', fechaRegistro: '2026-02-01', ultimoAcceso: '2026-05-15', ciudad: 'Barranquilla', serviciosRealizados: 28, observaciones: 'Inactivo por cambio de ciudad.', color: '#2D6CB5' },
  { id: 14, nombre: 'Isabella', apellido: 'Moreno', email: 'isabella@email.com', telefono: '319 012 3457', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-06-05', ultimoAcceso: '2026-07-13', ciudad: 'Bogota', serviciosRealizados: 7, observaciones: '', color: '#12A594' },
  { id: 15, nombre: 'Paula', apellido: 'Ospina', email: 'paula@email.com', telefono: '303 234 5679', rol: 'Empresa', estado: 'activo', fechaRegistro: '2026-04-10', ultimoAcceso: '2026-07-12', ciudad: 'Medellin', serviciosRealizados: 23, observaciones: 'Lavanderia BlueWash.', color: '#1F4E79' },
  { id: 16, nombre: 'Fernando', apellido: 'Silva', email: 'fernando@email.com', telefono: '314 567 8902', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-01-25', ultimoAcceso: '2026-07-06', ciudad: 'Medellin', serviciosRealizados: 18, observaciones: '', color: '#2D6CB5' },
  { id: 17, nombre: 'Monica', apellido: 'Parra', email: 'monica@email.com', telefono: '320 890 1235', rol: 'Empresa', estado: 'activo', fechaRegistro: '2026-03-15', ultimoAcceso: '2026-07-11', ciudad: 'Barranquilla', serviciosRealizados: 31, observaciones: 'LavService, empresa asociada.', color: '#12A594' },
  { id: 18, nombre: 'Elena', apellido: 'Torres', email: 'elena@email.com', telefono: '301 234 5680', rol: 'Cliente', estado: 'activo', fechaRegistro: '2026-05-10', ultimoAcceso: '2026-07-10', ciudad: 'Bogota', serviciosRealizados: 9, observaciones: '', color: '#1F4E79' },
  { id: 19, nombre: 'Robert', apellido: 'Diaz', email: 'robert@email.com', telefono: '318 901 2347', rol: 'Cliente', estado: 'inactivo', fechaRegistro: '2026-02-28', ultimoAcceso: '2026-06-01', ciudad: 'Bogota', serviciosRealizados: 4, observaciones: 'Cuenta inactiva por falta de actividad.', color: '#2D6CB5' },
  { id: 20, nombre: 'Carolina', apellido: 'Mendez', email: 'carolina@email.com', telefono: '312 345 6791', rol: 'Repartidor', estado: 'activo', fechaRegistro: '2026-06-20', ultimoAcceso: '2026-07-13', ciudad: 'Barranquilla', serviciosRealizados: 11, observaciones: '', color: '#12A594' },
]

export const planes = [
  { id: 1, nombre: 'Basico', valorMensual: 250000, descripcion: 'Para lavanderias pequenas', maxUsuarios: 5, maxServicios: 100, soporte: 'Email', color: '#2D6CB5', empresas: 10 },
  { id: 2, nombre: 'Premium', valorMensual: 500000, descripcion: 'Para lavanderias en crecimiento', maxUsuarios: 20, maxServicios: 500, soporte: 'Prioritario', color: '#12A594', empresas: 14 },
  { id: 3, nombre: 'Enterprise', valorMensual: 1200000, descripcion: 'Para redes de lavanderias', maxUsuarios: 100, maxServicios: -1, soporte: 'Dedicado 24/7', color: '#1F4E79', empresas: 0 },
]

export const pagos = [
  { id: 1, empresaId: 1, empresa: 'CleanHouse', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-001', metodo: 'Daviplata' },
  { id: 2, empresaId: 2, empresa: 'LavaExpress', fecha: '2026-07-01', valor: 250000, estado: 'pagado', factura: 'FAC-2026-002', metodo: 'Nequi' },
  { id: 3, empresaId: 7, empresa: 'LavaMax', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-003', metodo: 'Nequi' },
  { id: 4, empresaId: 4, empresa: 'Ropa al Dia', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-004', metodo: 'Transferencia' },
  { id: 5, empresaId: 8, empresa: 'Todolava', fecha: '2026-07-01', valor: 250000, estado: 'pagado', factura: 'FAC-2026-005', metodo: 'Efectivo' },
  { id: 6, empresaId: 9, empresa: 'EcoLavado', fecha: '2026-07-01', valor: 250000, estado: 'pagado', factura: 'FAC-2026-006', metodo: 'Transferencia' },
  { id: 7, empresaId: 5, empresa: 'Lavanderia Express', fecha: '2026-07-15', valor: 250000, estado: 'proximo_vencer', factura: 'FAC-2026-007', metodo: 'Efectivo' },
  { id: 8, empresaId: 6, empresa: 'CleanPro', fecha: '2026-06-01', valor: 500000, estado: 'en_mora', factura: 'FAC-2026-008', metodo: 'Daviplata' },
  { id: 9, empresaId: 13, empresa: 'SuperClean', fecha: '2026-06-01', valor: 500000, estado: 'en_mora', factura: 'FAC-2026-009', metodo: 'Nequi' },
  { id: 10, empresaId: 11, empresa: 'FreshWash', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-010', metodo: 'Daviplata' },
  { id: 11, empresaId: 14, empresa: 'LavService', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-011', metodo: 'Transferencia' },
  { id: 12, empresaId: 16, empresa: 'RapidLav', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-012', metodo: 'Nequi' },
  { id: 13, empresaId: 18, empresa: 'BlueWash', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-013', metodo: 'Daviplata' },
  { id: 14, empresaId: 20, empresa: 'EcoLavaPro', fecha: '2026-07-01', valor: 500000, estado: 'pagado', factura: 'FAC-2026-014', metodo: 'Transferencia' },
]

export const servicios = []

export const solicitudesServicio = []

export const configuracion = {
  nombrePlataforma: 'ServiLavadora',
  emailContacto: 'hola@servilavadora.co',
  telefono: '+57 601 123 4567',
  ciudadPrincipal: 'Bogota',
  comisionPlataforma: 15,
  maxRepartidoresPorEmpresa: 10,
  radioCoberturaKm: 15,
  notificaciones: {
    nuevaSolicitudEmpresa: true,
    nuevaSolicitudServicio: true,
    reportesSemanales: false,
  },
}

export const dashboardData = {
  actividadReciente: [
    { id: 1, tipo: 'empresa_aprobada', empresa: 'LavRapido', fecha: '2026-07-13', hora: '10:32', descripcion: 'Empresa "LavRapido" fue aprobada y activada en la plataforma.' },
    { id: 2, tipo: 'usuario_nuevo', usuario: 'Valentina Rojas', fecha: '2026-07-13', hora: '09:45', descripcion: 'Nuevo cliente registrado en la plataforma.' },
    { id: 3, tipo: 'pago_recibido', empresa: 'CleanHouse', fecha: '2026-07-12', hora: '16:20', descripcion: 'Pago de $500.000 recibido de CleanHouse (Premium).' },
    { id: 4, tipo: 'empresa_info', empresa: 'BlueWash', fecha: '2026-07-12', hora: '14:15', descripcion: 'Empresa actualizo su informacion de contacto y horario.' },
    { id: 5, tipo: 'pago_vencido', empresa: 'CleanPro', fecha: '2026-07-12', hora: '11:00', descripcion: 'Pago de CleanPro vence en 3 dias. Estado: en mora.' },
    { id: 6, tipo: 'empresa_registro', empresa: 'LavCenter', fecha: '2026-07-11', hora: '09:10', descripcion: 'Nueva empresa registrada, pendiente de aprobacion.' },
    { id: 7, tipo: 'renovacion', empresa: 'LavaMax', fecha: '2026-07-11', hora: '08:30', descripcion: 'Renovacion automatica exitosa para LavaMax (Premium).' },
  ],
  empresasRecientes: [
    { id: 17, nombre: 'LavCenter', ciudad: 'Quibdo', estado: 'pendiente', plan: 'Basico', fechaRegistro: '2026-07-08', logoColor: '#1F4E79' },
    { id: 10, nombre: 'LavRapido', ciudad: 'Barranquilla', estado: 'pendiente', plan: 'Basico', fechaRegistro: '2026-07-05', logoColor: '#1F4E79' },
    { id: 20, nombre: 'EcoLavaPro', ciudad: 'Bogota', estado: 'activa', plan: 'Premium', fechaRegistro: '2025-01-15', logoColor: '#1F4E79' },
    { id: 16, nombre: 'RapidLav', ciudad: 'Bogota', estado: 'activa', plan: 'Premium', fechaRegistro: '2025-02-10', logoColor: '#12A594' },
    { id: 18, nombre: 'BlueWash', ciudad: 'Medellin', estado: 'activa', plan: 'Premium', fechaRegistro: '2025-05-20', logoColor: '#2D6CB5' },
  ],
  ingresosPorMes: [
    { mes: 'Ene', basico: 1800000, premium: 4200000 },
    { mes: 'Feb', basico: 2000000, premium: 4500000 },
    { mes: 'Mar', basico: 2250000, premium: 5000000 },
    { mes: 'Abr', basico: 2000000, premium: 4800000 },
    { mes: 'May', basico: 2250000, premium: 5250000 },
    { mes: 'Jun', basico: 2500000, premium: 5500000 },
    { mes: 'Jul', basico: 2500000, premium: 6000000 },
  ],
  empresasPorMes: [
    { mes: 'Ene', cantidad: 2 },
    { mes: 'Feb', cantidad: 3 },
    { mes: 'Mar', cantidad: 4 },
    { mes: 'Abr', cantidad: 3 },
    { mes: 'May', cantidad: 2 },
    { mes: 'Jun', cantidad: 4 },
    { mes: 'Jul', cantidad: 2 },
  ],
  distribucionCiudad: [
    { ciudad: 'Bogota', cantidad: 8 },
    { ciudad: 'Medellin', cantidad: 4 },
    { ciudad: 'Cali', cantidad: 3 },
    { ciudad: 'Barranquilla', cantidad: 3 },
    { ciudad: 'Quibdo', cantidad: 2 },
  ],
  estadoEmpresas: [
    { estado: 'Activas', cantidad: 14 },
    { estado: 'Pendientes', cantidad: 3 },
    { estado: 'Inactivas', cantidad: 3 },
  ],
  distribucionPlanes: [
    { plan: 'Premium', cantidad: 14 },
    { plan: 'Basico', cantidad: 10 },
  ],
  estadoPagos: [
    { estado: 'Pagado', cantidad: 10 },
    { estado: 'Proximo a vencer', cantidad: 3 },
    { estado: 'En mora', cantidad: 4 },
    { estado: 'Pendiente', cantidad: 3 },
  ],
  alertas: [
    { id: 1, tipo: 'mora', mensaje: '4 empresas con pagos vencidos', count: 4 },
    { id: 2, tipo: 'vencimiento', mensaje: '3 empresas proximas a pagar', count: 3 },
    { id: 3, tipo: 'pendiente', mensaje: '3 empresas pendientes por aprobar', count: 3 },
    { id: 4, tipo: 'registro', mensaje: '2 nuevos registros esta semana', count: 2 },
  ],
  rendimiento: {
    ingresoPromedio: '$362.500',
    tasaRenovacion: '78%',
    mejorEmpresa: { nombre: 'CleanHouse', facturacion: 6000000 },
    ciudadMasActiva: { ciudad: 'Bogota', empresas: 8 },
    empresasHoy: 14,
  },
}

export const expedientesEmpresas = {
  3: {
    documentos: [
      { id: 1, nombre: 'Camara de Comercio.pdf', tipo: 'Camara de Comercio', fecha: '2026-07-01', tamano: '2.4 MB', estado: 'aprobado', url: '#' },
      { id: 2, nombre: 'RUT.pdf', tipo: 'RUT', fecha: '2026-07-01', tamano: '1.1 MB', estado: 'aprobado', url: '#' },
      { id: 3, nombre: 'Cedula Representante.pdf', tipo: 'Cedula', fecha: '2026-07-01', tamano: '0.8 MB', estado: 'aprobado', url: '#' },
      { id: 4, nombre: 'Certificacion Bancaria.pdf', tipo: 'Cert. Bancario', fecha: '2026-07-02', tamano: '1.5 MB', estado: 'pendiente', url: '#' },
      { id: 5, nombre: 'Certificado DIAN.pdf', tipo: 'Cert. DIAN', fecha: '2026-07-02', tamano: '0.9 MB', estado: 'aprobado', url: '#' },
      { id: 6, nombre: 'Certificado de Existencia.pdf', tipo: 'Cert. Existencia', fecha: '2026-07-03', tamano: '1.2 MB', estado: 'rechazado', url: '#' },
    ],
    timeline: [
      { id: 1, fecha: '2026-07-01 09:15', titulo: 'Empresa registrada', descripcion: 'Punto Limpio se registro en la plataforma', tipo: 'info' },
      { id: 2, fecha: '2026-07-01 09:20', titulo: 'Documentacion subida', descripcion: '6 documentos fueron cargados al sistema', tipo: 'info' },
      { id: 3, fecha: '2026-07-01 10:00', titulo: 'Solicitud enviada', descripcion: 'Solicitud de aprobacion enviada a revision', tipo: 'info' },
      { id: 4, fecha: '2026-07-02 14:30', titulo: 'Documentos revisados', descripcion: '4 de 6 documentos aprobados', tipo: 'warning' },
      { id: 5, fecha: '2026-07-03 09:00', titulo: 'Observacion registrada', descripcion: 'Certificado de Existencia presenta baja resolucion', tipo: 'danger' },
      { id: 6, fecha: '2026-07-03 11:00', titulo: 'Pendiente de aprobacion', descripcion: 'Esperando correccion de documentacion', tipo: 'warning' },
    ],
    observaciones: [
      { id: 1, fecha: '2026-07-02 14:35', autor: 'Super Admin', texto: 'Documentos revisados, pendiente certificado bancario.' },
      { id: 2, fecha: '2026-07-03 09:05', autor: 'Super Admin', texto: 'Certificado de Existencia ilegible, favor cargar nuevamente.' },
    ],
  },
  10: {
    documentos: [
      { id: 1, nombre: 'Camara de Comercio.pdf', tipo: 'Camara de Comercio', fecha: '2026-07-05', tamano: '2.1 MB', estado: 'aprobado', url: '#' },
      { id: 2, nombre: 'RUT.pdf', tipo: 'RUT', fecha: '2026-07-05', tamano: '1.0 MB', estado: 'aprobado', url: '#' },
      { id: 3, nombre: 'Cedula Representante.pdf', tipo: 'Cedula', fecha: '2026-07-05', tamano: '0.7 MB', estado: 'aprobado', url: '#' },
      { id: 4, nombre: 'Certificacion Bancaria.pdf', tipo: 'Cert. Bancario', fecha: '2026-07-06', tamano: '1.3 MB', estado: 'aprobado', url: '#' },
      { id: 5, nombre: 'Certificado DIAN.pdf', tipo: 'Cert. DIAN', fecha: '2026-07-06', tamano: '0.8 MB', estado: 'pendiente', url: '#' },
    ],
    timeline: [
      { id: 1, fecha: '2026-07-05 08:00', titulo: 'Empresa registrada', descripcion: 'LavRapido se registro en la plataforma', tipo: 'info' },
      { id: 2, fecha: '2026-07-05 08:10', titulo: 'Documentacion subida', descripcion: '5 documentos fueron cargados al sistema', tipo: 'info' },
      { id: 3, fecha: '2026-07-06 10:30', titulo: 'Documentos revisados', descripcion: '4 de 5 documentos aprobados', tipo: 'warning' },
      { id: 4, fecha: '2026-07-06 11:00', titulo: 'Pendiente de aprobacion', descripcion: 'Esperando revision del certificado DIAN', tipo: 'warning' },
    ],
    observaciones: [
      { id: 1, fecha: '2026-07-06 10:35', autor: 'Super Admin', texto: 'Buena documentacion, solo falta certificado DIAN.' },
    ],
  },
  17: {
    documentos: [
      { id: 1, nombre: 'Camara de Comercio.pdf', tipo: 'Camara de Comercio', fecha: '2026-07-08', tamano: '2.3 MB', estado: 'aprobado', url: '#' },
      { id: 2, nombre: 'RUT.pdf', tipo: 'RUT', fecha: '2026-07-08', tamano: '1.2 MB', estado: 'pendiente', url: '#' },
      { id: 3, nombre: 'Cedula Representante.pdf', tipo: 'Cedula', fecha: '2026-07-08', tamano: '0.9 MB', estado: 'aprobado', url: '#' },
      { id: 4, nombre: 'Certificado DIAN.pdf', tipo: 'Cert. DIAN', fecha: '2026-07-09', tamano: '1.0 MB', estado: 'rechazado', url: '#' },
      { id: 5, nombre: 'Certificado de Existencia.pdf', tipo: 'Cert. Existencia', fecha: '2026-07-09', tamano: '1.1 MB', estado: 'aprobado', url: '#' },
    ],
    timeline: [
      { id: 1, fecha: '2026-07-08 14:00', titulo: 'Empresa registrada', descripcion: 'LavCenter se registro en la plataforma', tipo: 'info' },
      { id: 2, fecha: '2026-07-08 14:15', titulo: 'Documentacion subida', descripcion: '5 documentos fueron cargados al sistema', tipo: 'info' },
      { id: 3, fecha: '2026-07-09 09:30', titulo: 'Documentos revisados', descripcion: '3 de 5 documentos aprobados', tipo: 'warning' },
      { id: 4, fecha: '2026-07-09 10:00', titulo: 'Documento rechazado', descripcion: 'Certificado DIAN no cumple con el formato requerido', tipo: 'danger' },
      { id: 5, fecha: '2026-07-09 11:00', titulo: 'Pendiente de aprobacion', descripcion: 'Esperando correccion de documentacion', tipo: 'warning' },
    ],
    observaciones: [
      { id: 1, fecha: '2026-07-09 09:35', autor: 'Super Admin', texto: 'Certificado DIAN rechazado, formato incorrecto.' },
      { id: 2, fecha: '2026-07-09 10:05', autor: 'Super Admin', texto: 'Solicitar al representante legal volver a cargar el certificado DIAN en formato PDF legible.' },
    ],
  },
}
