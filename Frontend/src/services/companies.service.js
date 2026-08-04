import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const companiesService = {
  async list() {
    const { data: response } = await apiClient.get(endpoints.public.empresas);
    if (!response.success) {
      throw new Error(response.message || 'Error al cargar empresas');
    }
    return response;
  },

  async get(uuid) {
    const { data: response } = await apiClient.get(endpoints.public.empresaDetail(uuid));
    if (!response.success) {
      throw new Error(response.message || 'Empresa no encontrada');
    }
    return response;
  },

  async getDetail(uuid) {
    return this.get(uuid);
  },
};
