import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000';

const api = {
  async request(endpoint, options = {}) {
    const token = await AsyncStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.message.includes('Network request failed')) {
        throw new Error('Error de conexión. Verifica tu internet.');
      }
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export default api;
