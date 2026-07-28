import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const paymentService = {
  async getPaymentMethods() {
    const response = await apiClient.get(endpoints.pagos.metodos);
    return response.data;
  },

  async getPayments(params = {}) {
    const response = await apiClient.get(endpoints.pagos.list, { params });
    return response.data;
  },

  async getPayment(uuid) {
    const response = await apiClient.get(endpoints.pagos.get(uuid));
    return response.data;
  },

  async createPayment(paymentData) {
    const response = await apiClient.post(endpoints.pagos.create, paymentData);
    return response.data;
  },

  async confirmPayment(uuid) {
    const response = await apiClient.put(endpoints.pagos.confirmar(uuid));
    return response.data;
  },

  async cancelPayment(uuid) {
    const response = await apiClient.put(endpoints.pagos.cancelar(uuid));
    return response.data;
  },

  async getSubscriptionPlans() {
    const response = await apiClient.get(endpoints.suscripciones.planes);
    return response.data;
  },

  async getSubscriptions(params = {}) {
    const response = await apiClient.get(endpoints.suscripciones.list, { params });
    return response.data;
  },

  async createSubscription(data) {
    const response = await apiClient.post(endpoints.suscripciones.create, data);
    return response.data;
  },

  async updateSubscription(uuid, data) {
    const response = await apiClient.put(endpoints.suscripciones.update(uuid), data);
    return response.data;
  },

  async getSubscriptionPaymentMethods() {
    const response = await apiClient.get(endpoints.suscripciones.metodosPago);
    return response.data;
  },

  async createSubscriptionPayment(data) {
    const response = await apiClient.post(endpoints.suscripciones.pagos, data);
    return response.data;
  },
};
