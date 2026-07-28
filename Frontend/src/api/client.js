import axios from 'axios';
import ENV from '../config/env';
import storage from '../storage';

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.CancelToken = axios.CancelToken;
apiClient.isCancel = axios.isCancel;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');
      const { data: response } = await apiClient.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });
      if (!response.success) throw new Error(response.message || 'Token invalido');
      const { access_token, refresh_token: newRefresh } = response.data;
      await storage.setTokens(access_token, newRefresh);
      processQueue(null, access_token);
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await storage.clearAuth();
      delete apiClient.defaults.headers.common.Authorization;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
