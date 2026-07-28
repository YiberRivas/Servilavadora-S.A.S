import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const profileService = {
  async getProfile() {
    const { data: response } = await apiClient.get(endpoints.auth.profile);
    if (!response.success) {
      throw new Error(response.message || 'Error al cargar perfil');
    }
    return response.data;
  },

  async updateProfile(uuid, profileData) {
    const { data: response } = await apiClient.put(endpoints.clientes.update(uuid), profileData);
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar perfil');
    }
    return response.data;
  },
};
