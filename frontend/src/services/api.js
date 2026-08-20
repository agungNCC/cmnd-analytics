import axios from 'axios'
import { clearToken, getToken } from './storage.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const url = String(err.config?.url || '')
    const isAuthRequest = url.includes('/api/auth/')
    const onLoginPage = window.location.pathname === '/login'

    // Jangan reload halaman login: 401 di /me atau /login memicu loop
    // yang menghabiskan rate-limit dan membuat Sign in gagal.
    if (status === 401 && !isAuthRequest && !onLoginPage) {
      clearToken()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default api
