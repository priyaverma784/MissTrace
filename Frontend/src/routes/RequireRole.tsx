import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

/**
 * Route guard. Admin routes need the admin role; user routes accept either
 * role (admins may also use the public search). Swap `useAuth` for real
 * authentication later and nothing else needs to change.
 */
export function RequireRole({ role }: { role: UserRole }) {
  const { role: current } = useAuth()
  const allowed = current === 'admin' || (role === 'user' && current === 'user')
  return allowed ? <Outlet /> : <Navigate to="/" replace />
}
