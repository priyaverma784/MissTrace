import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import axios from 'axios'

interface UserResponse {
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

interface ProtectedRouteProps {
  adminOnly?: boolean
}

export default function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const location = useLocation()
  const token = localStorage.getItem('misstrace_token')

  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    let active = true

    if (!token) {
      setLoading(false)
      return
    }

    axios
      .get<UserResponse>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (active) {
          setRole(response.data.user.role)
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem('misstrace_token')
          setUnauthorized(true)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [token])

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  if (unauthorized) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}