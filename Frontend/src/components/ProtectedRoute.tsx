import { Navigate, Outlet, useLocation } from 'react-router-dom'

// Shows the page only when the user is logged in (a token is saved).
// Otherwise sends them to /login and remembers where they wanted to go.
export default function ProtectedRoute() {
  const location = useLocation()
  const token = localStorage.getItem('misstrace_token')

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
