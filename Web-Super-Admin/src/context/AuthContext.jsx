import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setTokens, clearTokens, getToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await api.get('/auth/me')
      if (res.success && res.data) {
        setUser(res.data)
      } else {
        clearTokens()
      }
    } catch {
      clearTokens()
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    if (res.success && res.data) {
      setTokens(res.data.access_token, res.data.refresh_token)
      setUser(res.data.user)
      return { success: true, user: res.data.user }
    }
    return { success: false, message: res.message || 'Credenciales invalidas' }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    }
    clearTokens()
    setUser(null)
  }

  const isSuperAdmin = user?.rol === 'SUPER_ADMIN'
  const isEmpresaAdmin = user?.rol === 'ADMIN_EMPRESA'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSuperAdmin, isEmpresaAdmin, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
