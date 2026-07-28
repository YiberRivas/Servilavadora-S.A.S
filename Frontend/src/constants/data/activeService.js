export const activeService = {
  id: 'SOL-2026-001',
  companyId: 1,
  companyName: 'Lavadoras del Norte',
  status: 'en_uso',
  statusLabel: 'En uso',
  date: '25/07/2026',
  startTime: '14:30',
  estimatedEndTime: '16:30',
  estimatedMinutes: 120,
  capacity: {
    id: 2,
    type: 'Lavadora Automatica',
    kg: 10,
    pricePerHour: 4000,
  },
  address: 'Calle 123 #45-67, Barrio Centro, Apartamento 502',
};

export const washingMachine = {
  id: 'LAV-001',
  brand: 'Samsung',
  model: 'EcoBubble WF10T5040KW',
  capacity: '10 kg',
  internalCode: 'LN-AUT-012',
  status: 'Operativa',
  statusColor: '#28a745',
  companyId: 1,
  companyName: 'Lavadoras del Norte',
  features: ['EcoBubble', 'Digital Inverter', 'Ciclo rapido'],
  lastMaintenance: '20/07/2026',
};

export const deliveryPerson = {
  id: 'RP-001',
  name: 'Carlos Martinez',
  phone: '310 456 7890',
  status: 'En camino',
  statusColor: '#17a2b8',
  photo: null,
  vehicle: 'Moto - ABC 123',
  rating: 4.8,
};
