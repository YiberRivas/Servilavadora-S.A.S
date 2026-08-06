const API_BASE = 'http://localhost:8000/api'

function getToken() {
  return localStorage.getItem('token')
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

function setTokens(access, refresh) {
  localStorage.setItem('token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}

function clearTokens() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    if (getRefreshToken()) {
      const refreshed = await tryRefreshToken()
      if (refreshed) {
        headers['Authorization'] = `Bearer ${getToken()}`
        const retryResponse = await fetch(url, { ...options, headers })
        return handleResponse(retryResponse)
      }
    }
    clearTokens()
    window.location.href = '/'
    return { success: false, message: 'Sesion expirada' }
  }

  return handleResponse(response)
}

async function handleResponse(response) {
  const data = await response.json().catch(() => null)
  if (!data) {
    return { success: false, message: 'Error de conexion' }
  }
  return data
}

async function tryRefreshToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    const data = await response.json()
    if (data.success && data.data) {
      setTokens(data.data.access_token, data.data.refresh_token)
      return true
    }
  } catch {
    // ignore
  }
  return false
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
}

export { setTokens, clearTokens, getToken }
