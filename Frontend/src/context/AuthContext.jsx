import React, { createContext, useState, useContext, useEffect } from 'react';
import storage from '../storage';
import { authService } from '../services/auth.service';
import { registerForPushNotifications, removePushToken } from '../utils/pushNotifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await storage.getAccessToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      const userData = await authService.getMe();
      setToken(storedToken);
      setUser(userData);
    } catch {
      await storage.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (userData, userToken, refreshToken) => {
    try {
      if (refreshToken) {
        await storage.setTokens(userToken, refreshToken);
      } else {
        await storage.setAccessToken(userToken);
      }
      await storage.setUser(userData);
      setUser(userData);
      setToken(userToken);

      registerForPushNotifications();
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const signOut = async () => {
    try {
      await removePushToken();
    } catch {}
    try {
      await authService.logout();
    } catch {
      await storage.clearAuth();
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = async (newData) => {
    try {
      setUser((prev) => ({ ...prev, ...newData }));
      const storedUser = await storage.getUser();
      if (storedUser) {
        await storage.setUser({ ...storedUser, ...newData });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
