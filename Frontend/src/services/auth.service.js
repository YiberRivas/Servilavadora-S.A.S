import apiClient from '../api/client';
import endpoints from '../api/endpoints';
import storage from '../storage';

export const authService = {
  async login(username, password) {
    const { data: response } = await apiClient.post(endpoints.auth.login, {
      username,
      password,
    });
    if (!response.success) {
      throw new Error(response.message || 'Credenciales invalidas');
    }
    const { access_token, refresh_token, user } = response.data;
    await storage.setTokens(access_token, refresh_token);
    await storage.setUser(user);
    return response.data;
  },

  async register(userData) {
    const { data: response } = await apiClient.post(endpoints.auth.register, userData);
    if (!response.success) {
      throw new Error(response.message || 'Error en el registro');
    }
    return response.data;
  },

  async logout() {
    try {
      const { data: response } = await apiClient.post(endpoints.auth.logout);
      return response;
    } catch {
      return { success: true, message: 'Sesion cerrada localmente' };
    } finally {
      await storage.clearAuth();
    }
  },

  async getMe() {
    const { data: response } = await apiClient.get(endpoints.auth.me);
    if (!response.success) {
      throw new Error(response.message || 'Token invalido');
    }
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const { data: response } = await apiClient.post(endpoints.auth.changePassword, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    if (!response.success) {
      throw new Error(response.message || 'Error al cambiar contrasena');
    }
    return response.data;
  },

  async refreshToken(refreshToken) {
    const { data: response } = await apiClient.post(endpoints.auth.refresh, {
      refresh_token: refreshToken,
    });
    if (!response.success) {
      throw new Error(response.message || 'Token de refresco invalido');
    }
    const { access_token, refresh_token } = response.data;
    await storage.setTokens(access_token, refresh_token);
    return response.data;
  },
};
