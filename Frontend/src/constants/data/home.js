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

export const LOGO_BG = [
  '#00C6B3',
  '#1A4A7A',
  '#3B82F6',
  '#0A8A7A',
  '#132A45',
  '#00C6B3',
  '#1A4A7A',
  '#6B7280',
];

export const getLogoBg = (id) => {
  return LOGO_BG[((id || 1) - 1) % LOGO_BG.length];
};

export const homeCategories = [
  { icon: 'washing-machine', label: 'Lavado\npor carga' },
  { icon: 'lightning-bolt', label: 'Lavado\nexpress' },
  { icon: 'home', label: 'Lavadora\na domicilio' },
  { icon: 'truck', label: 'Recogida\ny entrega' },
  { icon: 'iron', label: 'Planchado' },
  { icon: 'briefcase', label: 'Lavado\nempresarial' },
];
