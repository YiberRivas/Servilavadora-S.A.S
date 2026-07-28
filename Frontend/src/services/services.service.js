import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const servicesService = {
  async listWashingMachines(params = {}) {
    const { data } = await apiClient.get(endpoints.lavadoras.list, { params });
    return data;
  },

  async getWashingMachineStates() {
    const { data } = await apiClient.get(endpoints.lavadoras.estados);
    return data;
  },

  async getBrands() {
    const { data } = await apiClient.get(endpoints.lavadoras.marcas);
    return data;
  },

  async getCapacities() {
    const { data } = await apiClient.get(endpoints.lavadoras.capacidades);
    return data;
  },

  async getTarifas(params = {}) {
    const { data } = await apiClient.get(endpoints.tarifas.list, { params });
    return data;
  },
};
