import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('travel_user')
      const parsed = raw ? JSON.parse(raw) : null
      console.debug('[admin-client][auth] init user', parsed)
      return parsed
    } catch (error) {
      console.error('[admin-client][auth] init parse error', error)
      return null
    }
  })

  useEffect(() => {
    const handleStorage = () => {
      try {
        const raw = localStorage.getItem('travel_user')
        const parsed = raw ? JSON.parse(raw) : null
        console.debug('[admin-client][auth] storage user', parsed)
        setUser(parsed)
      } catch (error) {
        console.error('[admin-client][auth] storage parse error', error)
        setUser(null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const isAuthenticated = Boolean(user)
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const login = (credentials) => {
    console.debug('[admin-client][auth] login attempt', credentials?.email)
    // AuthContext không tự login; LoginPage sẽ gọi api rồi truyền token/user vào đây.
    throw new Error('AuthContext.login cần token + userData')
  }

  const setSession = (token, userData) => {
    localStorage.setItem('travel_token', token)
    localStorage.setItem('travel_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('travel_token')
    localStorage.removeItem('travel_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
