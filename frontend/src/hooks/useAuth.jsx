import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authService from '../services/auth.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getMe()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const currentUser = await authService.login(username, password)
    setUser(currentUser)
    return currentUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: Boolean(user),
  }), [user, loading, login, logout, refreshUser])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
