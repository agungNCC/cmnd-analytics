// TODO (Fase 3.1): Auth service
// login(email, password), logout(), getMe()
import api, { setToken, clearToken } from './api.js'

export const login = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password })
  setToken(data.token)
  return data.user
}

export const logout = async () => {
  await api.post('/api/auth/logout')
  clearToken()
}

export const getMe = async () => {
  const { data } = await api.get('/api/auth/me')
  return data.user
}
