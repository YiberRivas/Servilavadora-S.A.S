export const formatCurrency = (amount) => {
  return `$${Number(amount).toLocaleString('es-CO')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatMinutes = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0m 0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const getStatusColor = (status) => {
  const colors = {
    disponible: '#00a085',
    'en mantenimiento': '#ff5252',
    pendiente: '#ffc107',
    en_proceso: '#17a2b8',
    finalizado: '#28a745',
    completado: '#28a745',
    cancelado: '#dc3545',
    confirmado: '#0d6efd',
  };
  return colors[status] || '#6c757d';
};

export const getStatusLabel = (status) => {
  const labels = {
    disponible: 'Disponible',
    'en mantenimiento': 'En mantenimiento',
    pendiente: 'Pendiente',
    en_proceso: 'En proceso',
    finalizado: 'Finalizado',
    completado: 'Completado',
    cancelado: 'Cancelado',
    confirmado: 'Confirmado',
  };
  return labels[status] || status;
};
