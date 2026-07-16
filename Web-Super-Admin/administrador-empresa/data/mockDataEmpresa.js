export const empresaInfo = {
  id: 1,
  nombre: 'CleanHouse',
  logo: null,
  logoColor: '#2D6CB5',
  plan: 'Premium',
  fechaRegistro: '2025-03-15',
  ciudad: 'Bogota',
  direccion: 'Calle 80 #15-30',
  telefono: '601 555 0101',
  email: 'contacto@cleanhouse.co',
  representante: 'Andres Martinez',
}

export const statsEmpresa = {
  totalLavadoras: 32,
  totalClientes: 189,
  lavadorasEnUso: 21,
  lavadorasDisponibles: 11,
  alquileresActivos: 24,
  pagosPendientes: 3,
}

export const usoSemanal = [
  { dia: 'Lun', disponible: 18, enUso: 14 },
  { dia: 'Mar', disponible: 15, enUso: 17 },
  { dia: 'Mie', disponible: 20, enUso: 12 },
  { dia: 'Jue', disponible: 12, enUso: 20 },
  { dia: 'Vie', disponible: 10, enUso: 22 },
  { dia: 'Sab', disponible: 8, enUso: 24 },
  { dia: 'Dom', disponible: 22, enUso: 10 },
]

export const usuariosClientes = [
  { id: 1, nombre: 'Maria Andrade', email: 'maria@email.com', avatar: 'MA', color: '#2D6CB5', producto: 'Lavadora Samsung 15kg', fechaRegistro: '2026-01-12', fechaAlquiler: '2026-06-01', estado: 'activo', telefono: '310 456 7890' },
  { id: 2, nombre: 'Carlos Rodriguez', email: 'carlos@email.com', avatar: 'CR', color: '#12A594', producto: 'Lavadora LG 12kg', fechaRegistro: '2026-02-20', fechaAlquiler: '2026-05-15', estado: 'activo', telefono: '320 876 5432' },
  { id: 3, nombre: 'Laura Perez', email: 'laura@email.com', avatar: 'LP', color: '#1F4E79', producto: 'Lavadora Whirlpool 18kg', fechaRegistro: '2026-01-05', fechaAlquiler: '2026-04-20', estado: 'activo', telefono: '315 678 9012' },
  { id: 4, nombre: 'Pedro Sanchez', email: 'pedro@email.com', avatar: 'PS', color: '#D64545', producto: 'Lavadora Samsung 15kg', fechaRegistro: '2026-06-10', fechaAlquiler: '2026-07-01', estado: 'activo', telefono: '300 567 8901' },
  { id: 5, nombre: 'Sofia Ramirez', email: 'sofia@email.com', avatar: 'SR', color: '#E8A317', producto: 'Lavadora Mabe 10kg', fechaRegistro: '2026-01-05', fechaAlquiler: '2026-03-10', estado: 'inactivo', telefono: '301 234 5678' },
  { id: 6, nombre: 'Valentina Rojas', email: 'valentina@email.com', avatar: 'VR', color: '#2D6CB5', producto: 'Lavadora LG 12kg', fechaRegistro: '2026-03-10', fechaAlquiler: '2026-06-20', estado: 'activo', telefono: '322 456 1230' },
  { id: 7, nombre: 'Fernando Silva', email: 'fernando@email.com', avatar: 'FS', color: '#12A594', producto: 'Lavadora Whirlpool 18kg', fechaRegistro: '2026-02-14', fechaAlquiler: '2026-05-05', estado: 'activo', telefono: '314 567 8902' },
  { id: 8, nombre: 'Elena Torres', email: 'elena@email.com', avatar: 'ET', color: '#1F4E79', producto: 'Lavadora Samsung 15kg', fechaRegistro: '2026-05-10', fechaAlquiler: '2026-07-10', estado: 'activo', telefono: '301 234 5680' },
  { id: 9, nombre: 'Martin Lopez', email: 'martin@email.com', avatar: 'ML', color: '#2D6CB5', producto: 'Lavadora Mabe 10kg', fechaRegistro: '2026-04-18', fechaAlquiler: '2026-06-15', estado: 'activo', telefono: '316 789 0123' },
  { id: 10, nombre: 'Isabella Moreno', email: 'isabella@email.com', avatar: 'IM', color: '#12A594', producto: 'Lavadora Samsung 15kg', fechaRegistro: '2026-06-05', fechaAlquiler: '2026-07-08', estado: 'activo', telefono: '319 012 3457' },
  { id: 11, nombre: 'Santiago Herrera', email: 'santiago@email.com', avatar: 'SH', color: '#1F4E79', producto: 'Lavadora LG 12kg', fechaRegistro: '2026-05-20', fechaAlquiler: '2026-06-25', estado: 'activo', telefono: '305 678 9014' },
  { id: 12, nombre: 'Camilo Andres', email: 'camilo@email.com', avatar: 'CA', color: '#D64545', producto: 'Lavadora Whirlpool 18kg', fechaRegistro: '2026-02-01', fechaAlquiler: '2026-04-10', estado: 'inactivo', telefono: '317 890 1236' },
  { id: 13, nombre: 'Paula Ospina', email: 'paula@email.com', avatar: 'PO', color: '#E8A317', producto: 'Lavadora Mabe 10kg', fechaRegistro: '2026-04-10', fechaAlquiler: '2026-07-02', estado: 'activo', telefono: '303 234 5679' },
  { id: 14, nombre: 'Andres Camilo', email: 'andres.camilo@email.com', avatar: 'AC', color: '#2D6CB5', producto: 'Lavadora Samsung 15kg', fechaRegistro: '2026-03-22', fechaAlquiler: '2026-05-30', estado: 'activo', telefono: '312 901 2345' },
  { id: 15, nombre: 'Monica Parra', email: 'monica@email.com', avatar: 'MP', color: '#12A594', producto: 'Lavadora LG 12kg', fechaRegistro: '2026-03-15', fechaAlquiler: '2026-06-08', estado: 'activo', telefono: '320 890 1235' },
]

export const lavadoras = [
  { id: 1, nombre: 'Samsung WA15TG', modelo: '15kg', estado: 'en_uso', ubicacion: 'Sucursal Norte', precioAlquiler: 45000, vecesAlquilada: 12, color: '#2D6CB5', imagen: null },
  { id: 2, nombre: 'LG FC13BH', modelo: '12kg', estado: 'disponible', ubicacion: 'Sucursal Norte', precioAlquiler: 38000, vecesAlquilada: 8, color: '#12A594', imagen: null },
  { id: 3, nombre: 'Whirlpool WMBR1819', modelo: '18kg', estado: 'en_uso', ubicacion: 'Sucursal Centro', precioAlquiler: 52000, vecesAlquilada: 4, color: '#1F4E79', imagen: null },
  { id: 4, nombre: 'Mabe MMHN812', modelo: '10kg', estado: 'mantenimiento', ubicacion: 'Sucursal Sur', precioAlquiler: 28000, vecesAlquilada: 15, color: '#D64545', imagen: null },
  { id: 5, nombre: 'Samsung WA18TG', modelo: '18kg', estado: 'disponible', ubicacion: 'Sucursal Centro', precioAlquiler: 50000, vecesAlquilada: 6, color: '#2D6CB5', imagen: null },
  { id: 6, nombre: 'LG FC15BH', modelo: '15kg', estado: 'en_uso', ubicacion: 'Sucursal Norte', precioAlquiler: 42000, vecesAlquilada: 10, color: '#12A594', imagen: null },
  { id: 7, nombre: 'Whirlpool WMBR1516', modelo: '15kg', estado: 'disponible', ubicacion: 'Sucursal Sur', precioAlquiler: 40000, vecesAlquilada: 7, color: '#1F4E79', imagen: null },
  { id: 8, nombre: 'Mabe MMHN1014', modelo: '14kg', estado: 'en_uso', ubicacion: 'Sucursal Centro', precioAlquiler: 36000, vecesAlquilada: 9, color: '#E8A317', imagen: null },
  { id: 9, nombre: 'Samsung WA20TG', modelo: '20kg', estado: 'disponible', ubicacion: 'Sucursal Norte', precioAlquiler: 55000, vecesAlquilada: 3, color: '#2D6CB5', imagen: null },
  { id: 10, nombre: 'LG FC18BH', modelo: '18kg', estado: 'en_uso', ubicacion: 'Sucursal Sur', precioAlquiler: 48000, vecesAlquilada: 11, color: '#12A594', imagen: null },
  { id: 11, nombre: 'Whirlpool WMBR2021', modelo: '20kg', estado: 'mantenimiento', ubicacion: 'Sucursal Centro', precioAlquiler: 54000, vecesAlquilada: 5, color: '#D64545', imagen: null },
  { id: 12, nombre: 'Mabe MMHN810', modelo: '8kg', estado: 'disponible', ubicacion: 'Sucursal Norte', precioAlquiler: 22000, vecesAlquilada: 18, color: '#E8A317', imagen: null },
]

export const alquileres = [
  { id: 1, usuarioId: 1, usuario: 'Maria Andrade', lavadora: 'Samsung WA15TG', fechaInicio: '2026-06-01', fechaFin: '2026-07-01', estado: 'activo', monto: 45000 },
  { id: 2, usuarioId: 2, usuario: 'Carlos Rodriguez', lavadora: 'LG FC13BH', fechaInicio: '2026-05-15', fechaFin: '2026-06-15', estado: 'finalizado', monto: 38000 },
  { id: 3, usuarioId: 3, usuario: 'Laura Perez', lavadora: 'Whirlpool WMBR1819', fechaInicio: '2026-04-20', fechaFin: '2026-05-20', estado: 'finalizado', monto: 52000 },
  { id: 4, usuarioId: 4, usuario: 'Pedro Sanchez', lavadora: 'Samsung WA15TG', fechaInicio: '2026-07-01', fechaFin: '2026-08-01', estado: 'activo', monto: 45000 },
  { id: 5, usuarioId: 6, usuario: 'Valentina Rojas', lavadora: 'LG FC13BH', fechaInicio: '2026-06-20', fechaFin: '2026-07-20', estado: 'activo', monto: 38000 },
  { id: 6, usuarioId: 7, usuario: 'Fernando Silva', lavadora: 'Whirlpool WMBR1819', fechaInicio: '2026-05-05', fechaFin: '2026-06-05', estado: 'finalizado', monto: 52000 },
  { id: 7, usuarioId: 8, usuario: 'Elena Torres', lavadora: 'Samsung WA15TG', fechaInicio: '2026-07-10', fechaFin: '2026-08-10', estado: 'activo', monto: 45000 },
  { id: 8, usuarioId: 5, usuario: 'Sofia Ramirez', lavadora: 'Mabe MMHN812', fechaInicio: '2026-03-10', fechaFin: '2026-04-10', estado: 'atrasado', monto: 28000 },
  { id: 9, usuarioId: 9, usuario: 'Martin Lopez', lavadora: 'Mabe MMHN812', fechaInicio: '2026-06-15', fechaFin: '2026-07-15', estado: 'activo', monto: 28000 },
  { id: 10, usuarioId: 10, usuario: 'Isabella Moreno', lavadora: 'Samsung WA15TG', fechaInicio: '2026-07-08', fechaFin: '2026-08-08', estado: 'activo', monto: 45000 },
  { id: 11, usuarioId: 11, usuario: 'Santiago Herrera', lavadora: 'LG FC13BH', fechaInicio: '2026-06-25', fechaFin: '2026-07-25', estado: 'activo', monto: 38000 },
  { id: 12, usuarioId: 12, usuario: 'Camilo Andres', lavadora: 'Whirlpool WMBR1819', fechaInicio: '2026-04-10', fechaFin: '2026-05-10', estado: 'atrasado', monto: 52000 },
  { id: 13, usuarioId: 13, usuario: 'Paula Ospina', lavadora: 'Mabe MMHN812', fechaInicio: '2026-07-02', fechaFin: '2026-08-02', estado: 'activo', monto: 28000 },
  { id: 14, usuarioId: 14, usuario: 'Andres Camilo', lavadora: 'Samsung WA15TG', fechaInicio: '2026-05-30', fechaFin: '2026-06-30', estado: 'finalizado', monto: 45000 },
  { id: 15, usuarioId: 15, usuario: 'Monica Parra', lavadora: 'LG FC13BH', fechaInicio: '2026-06-08', fechaFin: '2026-07-08', estado: 'finalizado', monto: 38000 },
]

export const pagos = [
  { id: 1, usuario: 'Maria Andrade', alquilerId: 1, lavadora: 'Samsung WA15TG', monto: 45000, metodo: 'Daviplata', fecha: '2026-06-01', estado: 'pagado', factura: 'FC-CH-001' },
  { id: 2, usuario: 'Carlos Rodriguez', alquilerId: 2, lavadora: 'LG FC13BH', monto: 38000, metodo: 'Nequi', fecha: '2026-05-15', estado: 'pagado', factura: 'FC-CH-002' },
  { id: 3, usuario: 'Laura Perez', alquilerId: 3, lavadora: 'Whirlpool WMBR1819', monto: 52000, metodo: 'Efectivo', fecha: '2026-04-20', estado: 'pagado', factura: 'FC-CH-003' },
  { id: 4, usuario: 'Pedro Sanchez', alquilerId: 4, lavadora: 'Samsung WA15TG', monto: 45000, metodo: 'Daviplata', fecha: '2026-07-01', estado: 'pagado', factura: 'FC-CH-004' },
  { id: 5, usuario: 'Valentina Rojas', alquilerId: 5, lavadora: 'LG FC13BH', monto: 38000, metodo: 'Nequi', fecha: '2026-06-20', estado: 'pagado', factura: 'FC-CH-005' },
  { id: 6, usuario: 'Fernando Silva', alquilerId: 6, lavadora: 'Whirlpool WMBR1819', monto: 52000, metodo: 'Transferencia', fecha: '2026-05-05', estado: 'pagado', factura: 'FC-CH-006' },
  { id: 7, usuario: 'Elena Torres', alquilerId: 7, lavadora: 'Samsung WA15TG', monto: 45000, metodo: 'Daviplata', fecha: '2026-07-10', estado: 'pendiente', factura: 'FC-CH-007' },
  { id: 8, usuario: 'Sofia Ramirez', alquilerId: 8, lavadora: 'Mabe MMHN812', monto: 28000, metodo: 'Nequi', fecha: '2026-03-10', estado: 'vencido', factura: 'FC-CH-008' },
  { id: 9, usuario: 'Martin Lopez', alquilerId: 9, lavadora: 'Mabe MMHN812', monto: 28000, metodo: 'Efectivo', fecha: '2026-06-15', estado: 'pagado', factura: 'FC-CH-009' },
  { id: 10, usuario: 'Isabella Moreno', alquilerId: 10, lavadora: 'Samsung WA15TG', monto: 45000, metodo: 'Daviplata', fecha: '2026-07-08', estado: 'pendiente', factura: 'FC-CH-010' },
  { id: 11, usuario: 'Santiago Herrera', alquilerId: 11, lavadora: 'LG FC13BH', monto: 38000, metodo: 'Nequi', fecha: '2026-06-25', estado: 'pagado', factura: 'FC-CH-011' },
  { id: 12, usuario: 'Camilo Andres', alquilerId: 12, lavadora: 'Whirlpool WMBR1819', monto: 52000, metodo: 'Transferencia', fecha: '2026-04-10', estado: 'vencido', factura: 'FC-CH-012' },
  { id: 13, usuario: 'Paula Ospina', alquilerId: 13, lavadora: 'Mabe MMHN812', monto: 28000, metodo: 'Daviplata', fecha: '2026-07-02', estado: 'pendiente', factura: 'FC-CH-013' },
  { id: 14, usuario: 'Andres Camilo', alquilerId: 14, lavadora: 'Samsung WA15TG', monto: 45000, metodo: 'Efectivo', fecha: '2026-05-30', estado: 'pagado', factura: 'FC-CH-014' },
  { id: 15, usuario: 'Monica Parra', alquilerId: 15, lavadora: 'LG FC13BH', monto: 38000, metodo: 'Nequi', fecha: '2026-06-08', estado: 'pagado', factura: 'FC-CH-015' },
]

export const equipo = [
  { id: 1, nombre: 'Andres Martinez', email: 'andres@cleanhouse.co', rol: 'Admin', avatar: 'AM', color: '#2D6CB5' },
  { id: 2, nombre: 'Sofia Herrera', email: 'sofia@cleanhouse.co', rol: 'Operario', avatar: 'SH', color: '#12A594' },
  { id: 3, nombre: 'Carlos Vargas', email: 'carlos@cleanhouse.co', rol: 'Operario', avatar: 'CV', color: '#1F4E79' },
]

export const productosTop = [
  { nombre: 'Lavadora Samsung 15kg', alquileres: 12, porcentaje: 50 },
  { nombre: 'Lavadora LG 12kg', alquileres: 8, porcentaje: 33 },
  { nombre: 'Lavadora Whirlpool 18kg', alquileres: 4, porcentaje: 17 },
]
