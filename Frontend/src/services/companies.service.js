import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const companiesService = {
  async list(params = {}) {
    const response = await apiClient.get(endpoints.public.empresas, { params });
    return response.data;
  },

  async get(uuid) {
    const response = await apiClient.get(endpoints.public.empresaDetail(uuid));
    return response.data;
  },
};
