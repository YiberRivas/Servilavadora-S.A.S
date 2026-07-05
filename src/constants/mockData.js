export const companies = [
  {
    id: 1,
    name: 'Lavadoras del Norte',
    description: 'Empresa especializada en alquiler de lavadoras de alta eficiencia.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80',
    rating: 4.5,
    location: 'Centro Comercial Santafé - Bogotá',
    phone: '3001234567',
    email: 'contacto@lavadorasnorte.com',
    services: ['Lavado general', 'Lavado en seco', 'Planchado'],
  },
  {
    id: 2,
    name: 'EcoLavandería SAS',
    description: 'Servicio ecológico con máquinas de bajo consumo de agua y energía.',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80',
    rating: 4.8,
    location: 'Centro Comercial Unicentro - Bogotá',
    phone: '3007654321',
    email: 'info@ecolavanderia.com',
    services: ['Lavado ecológico', 'Lavado express', 'Desinfección'],
  },
  {
    id: 3,
    name: 'LavaRápido 24/7',
    description: 'Servicio de lavandería automática disponible las 24 horas.',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=500&q=80',
    rating: 4.2,
    location: 'Chapinero Alto - Bogotá',
    phone: '3109876543',
    email: 'contacto@lavarapido.com',
    services: ['Autoservicio', 'Lavado premium', 'Secado'],
  },
];

export const services = [
  {
    id: 1,
    name: 'LG WashTower Premium',
    status: 'Disponible',
    description: 'Lavadora de carga frontal con tecnología AI DD y control inteligente.',
    location: 'Centro Comercial Santafé - Bogotá',
    capacity: '12 kg',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80',
    companyId: 1,
  },
  {
    id: 2,
    name: 'Samsung EcoBubble',
    status: 'Disponible',
    description: 'Lavadora con tecnología EcoBubble que lava eficazmente con burbujas.',
    location: 'Centro Comercial Unicentro - Bogotá',
    capacity: '10 kg',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80',
    companyId: 2,
  },
  {
    id: 3,
    name: 'Mabe Lma11700pbbo',
    status: 'En mantenimiento',
    description: 'Lavadora automática con sistema de lavado por agitador.',
    location: 'Chapinero Alto - Bogotá',
    capacity: '17 kg',
    price: 3000,
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=500&q=80',
    companyId: 3,
  },
  {
    id: 4,
    name: 'Whirlpool Supreme',
    status: 'Disponible',
    description: 'Lavadora de carga superior con sistema de limpieza profunda.',
    location: 'Centro Comercial Santafé - Bogotá',
    capacity: '15 kg',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80',
    companyId: 1,
  },
];

export const appointments = [
  {
    id: 1,
    serviceId: 1,
    serviceName: 'LG WashTower Premium',
    date: '2026-07-10',
    time: '14:00',
    status: 'pendiente',
    address: 'Calle 123 #45-67',
    notes: 'Llegar antes de las 2pm',
    price: 3000,
  },
  {
    id: 2,
    serviceId: 2,
    serviceName: 'Samsung EcoBubble',
    date: '2026-07-08',
    time: '10:00',
    status: 'en_proceso',
    address: 'Carrera 5 #20-30',
    notes: '',
    price: 3000,
  },
  {
    id: 3,
    serviceId: 4,
    serviceName: 'Whirlpool Supreme',
    date: '2026-07-05',
    time: '09:00',
    status: 'finalizado',
    address: 'Avenida 10 #50-60',
    notes: 'Servicio completado',
    price: 3500,
  },
];

export const users = [
  {
    id: 1,
    name: 'Juan Pérez',
    email: 'juan@email.com',
    phone: '3001112233',
    role: 'cliente',
  },
  {
    id: 2,
    name: 'Admin Servilavadora',
    email: 'admin@servilavadora.com',
    phone: '3009998877',
    role: 'administrador',
  },
];

export const onboardingSlides = [
  {
    id: 1,
    title: 'Bienvenido a Servilavadora',
    description: 'La forma más fácil de alquilar lavadoras de alta calidad por horas.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    title: 'Encuentra lavadoras cerca',
    description: 'Busca y encuentra lavadoras disponibles cerca de tu ubicación.',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    title: 'Reserva y lava',
    description: 'Selecciona la lavadora, el horario y disfruta de ropa limpia y fresca.',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=500&q=80',
  },
];

export const benefits = [
  { icon: 'clock-outline', title: 'Ahorra Tiempo', description: 'Evita largos viajes a lavanderías tradicionales' },
  { icon: 'cash', title: 'Precios Justos', description: 'Solo $3.000 por hora, máximo 4 horas de uso' },
  { icon: 'map-marker', title: 'Ubicaciones Cercanas', description: 'Encuentra lavadoras cerca de tu ubicación' },
  { icon: 'shield-check', title: 'Garantía de Calidad', description: 'Lavadoras modernas y en perfecto estado' },
];
