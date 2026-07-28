import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: '@servilavadora:access_token',
  REFRESH_TOKEN: '@servilavadora:refresh_token',
  USER: '@servilavadora:user',
  PREFERENCES: '@servilavadora:preferences',
  DEVICE_TOKEN: '@servilavadora:device_token',
};

const storage = {
  async getAccessToken() {
    try {
      return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  },

  async setAccessToken(token) {
    try {
      await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error guardando access token:', error);
    }
  },

  async getRefreshToken() {
    try {
      return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token) {
    try {
      await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error guardando refresh token:', error);
    }
  },

  async setTokens(accessToken, refreshToken) {
    try {
      await AsyncStorage.multiSet([
        [KEYS.ACCESS_TOKEN, accessToken],
        [KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (error) {
      console.error('Error guardando tokens:', error);
    }
  },

  async getUser() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setUser(user) {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error guardando usuario:', error);
    }
  },

  async getPreferences() {
    try {
      const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setPreferences(prefs) {
    try {
      await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error guardando preferencias:', error);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  },

  async clearAuth() {
    try {
      await AsyncStorage.multiRemove([
        KEYS.ACCESS_TOKEN,
        KEYS.REFRESH_TOKEN,
        KEYS.USER,
      ]);
    } catch (error) {
      console.error('Error limpiando auth:', error);
    }
  },

  async getDeviceToken() {
    try {
      return await AsyncStorage.getItem(KEYS.DEVICE_TOKEN);
    } catch {
      return null;
    }
  },

  async setDeviceToken(token) {
    try {
      await AsyncStorage.setItem(KEYS.DEVICE_TOKEN, token);
    } catch (error) {
      console.error('Error guardando device token:', error);
    }
  },

  async clearDeviceToken() {
    try {
      await AsyncStorage.removeItem(KEYS.DEVICE_TOKEN);
    } catch (error) {
      console.error('Error limpiando device token:', error);
    }
  },
};

export default storage;
