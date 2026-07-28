export const clientProfile = {
  id: 1,
  name: 'Juan Perez',
  email: 'juan@email.com',
  phone: '300 111 2233',
  city: 'Bogota',
  neighborhood: 'Chapinero',
  registrationDate: '15/01/2025',
  accountStatus: 'Activa',
  clientSince: 'Enero 2025',
  photo: null,
};

export const clientAddresses = [
  {
    id: 1,
    label: 'Casa',
    address: 'Calle 85 #15-30',
    neighborhood: 'Chapinero Alto',
    city: 'Bogota',
    details: 'Apt 502, Torre A',
    isPrimary: true,
    icon: 'home-outline',
  },
  {
    id: 2,
    label: 'Trabajo',
    address: 'Carrera 7 #40-62',
    neighborhood: 'Centro',
    city: 'Bogota',
    details: 'Oficina 301, Piso 3',
    isPrimary: false,
    icon: 'briefcase-outline',
  },
  {
    id: 3,
    label: 'Apartamento',
    address: 'Calle 50 #13-80',
    neighborhood: 'Teusaquillo',
    city: 'Bogota',
    details: 'Conjunto Residencial El Parque, Bloque B',
    isPrimary: false,
    icon: 'home-outline',
  },
];

export const paymentMethods = [
  { id: 'cash', label: 'Efectivo', icon: 'cash', isPreferred: true },
  { id: 'nequi', label: 'Nequi', icon: 'cellphone', isPreferred: false },
  { id: 'daviplata', label: 'Daviplata', icon: 'cellphone', isPreferred: false },
  { id: 'transfer', label: 'Transferencia bancaria', icon: 'bank-transfer', isPreferred: false },
];

export const clientStats = {
  servicesCompleted: 12,
  servicesActive: 1,
  companiesUsed: 4,
  rentalHours: 36,
  moneySpent: 144000,
};

export const faqItems = [
  { id: 1, question: 'Como alquilo una lavadora?', answer: 'Busca una empresa cercana, selecciona la capacidad y horario, y confirma tu reserva.' },
  { id: 2, question: 'Cuanto cuesta el alquiler?', answer: 'El precio varia segun la capacidad, desde $2.000/hora hasta $8.000/hora.' },
  { id: 3, question: 'Puedo cancelar una reserva?', answer: 'Si, puedes cancelar hasta 2 horas antes del servicio sin penalizacion.' },
  { id: 4, question: 'Que pasa si la lavadora se dania?', answer: 'Reporta el inconveniente y la empresa enviara un tecnico o reemplazara la lavadora.' },
];
