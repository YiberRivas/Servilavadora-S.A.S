import apiClient from '../api/client';
import endpoints from '../api/endpoints';
import storage from '../storage';
import ENV from '../config/env';

export const routesService = {
  async getMyRoute() {
    const { data } = await apiClient.get(endpoints.rutas.mia);
    return data;
  },

  async getRoute(uuid) {
    const { data } = await apiClient.get(endpoints.rutas.detail(uuid));
    return data;
  },

  async getHistory(uuid) {
    const { data } = await apiClient.get(endpoints.rutas.historial(uuid));
    return data;
  },

  async startRoute(uuid) {
    const { data } = await apiClient.post(endpoints.rutas.iniciar(uuid));
    return data;
  },

  async finishRoute(uuid) {
    const { data } = await apiClient.post(endpoints.rutas.finalizar(uuid));
    return data;
  },

  async updateLocation(uuid, locationData) {
    const { data } = await apiClient.put(endpoints.rutas.ubicacion(uuid), locationData);
    return data;
  },

  connect(rutaUuid, onMessage, onError) {
    let ws = null;
    let cancelled = false;
    let reconnectTimer = null;

    const connectWs = async () => {
      if (cancelled) return;
      const token = await storage.getAccessToken();
      if (!token || cancelled) return;

      const wsUrl = `${ENV.WS_BASE_URL}/ws/rutas/${rutaUuid}?token=${token}`;
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        return;
      }

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(event.data);
          if (data.error) {
            if (onError) onError(data.error);
            return;
          }
          if (onMessage) onMessage(data);
        } catch {}
      };

      ws.onerror = () => {};

      ws.onclose = () => {
        if (!cancelled) {
          reconnectTimer = setTimeout(connectWs, 3000);
        }
      };
    };

    connectWs();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        try { ws.close(); } catch {}
      }
    };
  },

  disconnect() {
  },
};
