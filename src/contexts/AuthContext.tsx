import { createContext, useContext, ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'

interface AuthContextType {
  user: any
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: any, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthStore()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
