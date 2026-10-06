/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { UserRole } from '../types'

/**
 * Placeholder authentication.
 * The role is only stored in the browser so the UI can be demonstrated.
 * When real auth is added, replace `signIn` / `signOut` with API calls and
 * keep the rest of the app unchanged — routes already read the role from here.
 */
interface AuthContextValue {
  role: UserRole | null
  signIn: (role: UserRole) => void
  signOut: () => void
}

const STORAGE_KEY = 'misstrace.role'
const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredRole(): UserRole | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'user' || value === 'admin' ? value : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(readStoredRole)

  const signIn = useCallback((next: UserRole) => {
    setRole(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable – keep in memory only */
    }
  }, [])

  const signOut = useCallback(() => {
    setRole(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ role, signIn, signOut }), [role, signIn, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
