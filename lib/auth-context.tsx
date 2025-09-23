import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

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
  hasDiaryPassword: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoggedIn: boolean
  updateUser: (user: User) => void
  unreadCount: number
  refreshUnreadCount: () => Promise<void>
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
    hasDiaryPassword: !!raw?.hasDiaryPassword,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = useCallback(
    async (authToken: string) => {
      try {
        const res = await fetch('/api/messages/unread-count', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count ?? 0)
        } else if (res.status === 401) {
          setUnreadCount(0)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    },
    []
  )

  const refreshUnreadCount = useCallback(async () => {
    if (!token) {
      setUnreadCount(0)
      return
    }
    await fetchUnreadCount(token)
  }, [fetchUnreadCount, token])

  useEffect(() => {
    // Controlla se c'è un token salvato al caricamento
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setToken(savedToken)
        setUser(normalizeUser(userData))
        void fetchUnreadCount(savedToken)
      } catch (error) {
        // Se i dati sono corrotti, pulisci
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    const normalized = normalizeUser(newUser)
    setUser(normalized)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(normalized))
    void fetchUnreadCount(newToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setUnreadCount(0)
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

  useEffect(() => {
    if (!token || !user) {
      setUnreadCount(0)
      return
    }
    void fetchUnreadCount(token)
  }, [token, user, fetchUnreadCount])

  const value = {
    user,
    token,
    login,
    logout,
    isLoggedIn: !!token && !!user,
    updateUser,
    unreadCount,
    refreshUnreadCount,
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
