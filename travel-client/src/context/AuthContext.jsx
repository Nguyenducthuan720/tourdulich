import { createContext, useContext, useMemo, useState } from 'react'
import { loginUser, registerUser } from '../api/authService'

const AuthContext = createContext(null)

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('travel_user')) || null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser)

  const persistSession = (payload) => {
    const nextUser = payload.user || payload.account || payload
    const token = payload.token || payload.accessToken

    if (token) localStorage.setItem('travel_token', token)
    localStorage.setItem('travel_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  const login = async (credentials) => {
    const payload = await loginUser(credentials)
    return persistSession(payload)
  }

  const register = async (values) => {
    const payload = await registerUser(values)
    return persistSession(payload)
  }

  const logout = () => {
    localStorage.removeItem('travel_token')
    localStorage.removeItem('travel_user')
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role?.toLowerCase() === 'admin',
      login,
      logout,
      register,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
