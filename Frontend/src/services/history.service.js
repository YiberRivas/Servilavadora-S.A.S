import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const historyService = {
  async getMisHistorial(params = {}) {
    const response = await apiClient.get(endpoints.alquileres.misHistorial, { params });
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Error al cargar historial');
    return res;
  },

  async getAlquilerHistory(alquilerUuid) {
    const response = await apiClient.get(endpoints.historial.alquiler(alquilerUuid));
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Error al cargar historial');
    return res;
  },

  async getLavadoraHistory(lavadoraUuid) {
    const response = await apiClient.get(endpoints.historial.lavadora(lavadoraUuid));
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Error al cargar historial');
    return res;
  },

  async getAuditHistory(params = {}) {
    const response = await apiClient.get(endpoints.historial.auditoria, { params });
    return response.data;
  },
};
