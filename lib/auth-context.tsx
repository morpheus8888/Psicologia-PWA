import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'ADMIN' | 'PROFESSIONAL' | 'CLIENT'
export type DiaryVisibility = 'PRIVATE' | 'PROFESSIONALS' | 'PUBLIC'

interface User {
  id: string
  email: string
  avatar: string
  nickname: string
  phone?: string | null
  role: UserRole
  diaryVisibility: DiaryVisibility
  isAdmin: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoggedIn: boolean
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const normalizeUser = (raw: any): User => {
  const role: UserRole = raw?.role ?? (raw?.isAdmin ? 'ADMIN' : 'CLIENT')
  const diaryVisibility: DiaryVisibility = raw?.diaryVisibility ?? 'PRIVATE'

  return {
    id: raw?.id ?? '',
    email: raw?.email ?? '',
    avatar: raw?.avatar ?? 'leone',
    nickname: raw?.nickname ?? 'leone',
    phone: raw?.phone ?? null,
    role,
    diaryVisibility,
    isAdmin: raw?.isAdmin ?? role === 'ADMIN',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Controlla se c'è un token salvato al caricamento
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(normalizeUser(userData))
      } catch (error) {
        // Se i dati sono corrotti, pulisci
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    const normalized = normalizeUser(newUser)
    setUser(normalized)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(normalized))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (updatedUser: User) => {
    setUser((prev) => {
      const normalized = normalizeUser({
        ...(prev ?? {}),
        ...updatedUser,
      })
      localStorage.setItem('user', JSON.stringify(normalized))
      return normalized
    })
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoggedIn: !!token && !!user,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
