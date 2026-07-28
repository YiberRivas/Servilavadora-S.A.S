import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await apiClient.get(endpoints.notificaciones.list, { params });
    return response.data;
  },

  async getNotification(uuid) {
    const response = await apiClient.get(endpoints.notificaciones.get(uuid));
    return response.data;
  },

  async markAsRead(uuid) {
    const response = await apiClient.put(endpoints.notificaciones.marcarLeida(uuid));
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.put(endpoints.notificaciones.marcarTodasLeidas);
    return response.data;
  },

  async deleteNotification(uuid) {
    const response = await apiClient.delete(endpoints.notificaciones.delete(uuid));
    return response.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get(endpoints.notificaciones.countNoLeidas);
    return response.data;
  },

  async registerDevice(expoPushToken, dispositivo) {
    const response = await apiClient.post(endpoints.notificaciones.device, {
      expo_push_token: expoPushToken,
      dispositivo,
    });
    return response.data;
  },

  async removeDevice(expoPushToken) {
    const response = await apiClient.delete(endpoints.notificaciones.removeDevice, {
      params: { expo_push_token: expoPushToken },
    });
    return response.data;
  },
};
