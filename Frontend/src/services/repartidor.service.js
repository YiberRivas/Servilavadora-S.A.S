import api from '../api/client';
import endpoints from '../api/endpoints';

export const repartidorService = {
  dashboard: async () => {
    const response = await api.get(endpoints.repartidor.dashboard);
    return response.data;
  },

  asignaciones: async ({ page = 1, per_page = 20, estado = null } = {}) => {
    const params = { page, per_page };
    if (estado) params.estado = estado;
    const response = await api.get(endpoints.repartidor.asignaciones, { params });
    return response.data;
  },

  historial: async ({ page = 1, per_page = 20 } = {}) => {
    const response = await api.get(endpoints.repartidor.historial, { params: { page, per_page } });
    return response.data;
  },
};
