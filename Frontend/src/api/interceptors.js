import storage from '../storage';
import apiClient from './client';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

export function setupInterceptors(navigationRef) {
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
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data: response } = await apiClient.post('/api/auth/refresh', {
          refresh_token: refreshToken,
        });

        if (!response.success) {
          throw new Error(response.message || 'Token de refresco invalido');
        }

        const { access_token, refresh_token: newRefresh } = response.data;
        await storage.setTokens(access_token, newRefresh);
        apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await storage.clearAll();
        delete apiClient.defaults.headers.common.Authorization;

        if (navigationRef?.current) {
          navigationRef.current.resetRoot({
            index: 0,
            routes: [{ name: '(auth)/login' }],
          });
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
}
