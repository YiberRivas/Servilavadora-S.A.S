import apiClient from '../api/client';
import endpoints from '../api/endpoints';

export const requestService = {
  async listMisServicios(params = {}) {
    const response = await apiClient.get(endpoints.alquileres.misServicios, { params });
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Error al cargar servicios');
    return res;
  },

  async getMisServicioDetail(uuid) {
    const response = await apiClient.get(endpoints.alquileres.misServicioDetail(uuid));
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Servicio no encontrado');
    return res;
  },

  async getCronometro(uuid) {
    const response = await apiClient.get(endpoints.alquileres.misServicioCronometro(uuid));
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Error al cargar cronometro');
    return res;
  },

  async createSolicitud(data) {
    const response = await apiClient.post(endpoints.alquileres.crearSolicitud, data);
    const res = response.data;
    if (res.success === false) throw new Error(res.message || 'Error al crear solicitud');
    return res;
  },

  async listRequests(params = {}) {
    const response = await apiClient.get(endpoints.alquileres.solicitudes, { params });
    return response.data;
  },

  async listAlquileres(params = {}) {
    const response = await apiClient.get(endpoints.alquileres.list, { params });
    return response.data;
  },

  async getEstadosAlquiler() {
    const response = await apiClient.get(endpoints.alquileres.estados);
    return response.data;
  },

  async getEstadosSolicitud() {
    const response = await apiClient.get(endpoints.alquileres.estadosSolicitud);
    return response.data;
  },

  async createRequest(requestData) {
    const response = await apiClient.post(endpoints.alquileres.list, requestData);
    return response.data;
  },

  async updateRequest(uuid, requestData) {
    const response = await apiClient.put(`${endpoints.alquileres.list}/${uuid}`, requestData);
    return response.data;
  },
};
