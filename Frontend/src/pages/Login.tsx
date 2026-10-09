import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertTriangle, Eye, EyeOff, Info, Loader2 } from 'lucide-react'

interface LoginResponse {
  token?: string
  access_token?: string
}

// Values other pages can pass to this page (where to go next, a notice to show).
interface LocationState {
  from?: string
  message?: string
}

function getLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Unable to connect to the MissTrace server.'
    const status = error.response.status
    if (status === 400 || status === 401 || status === 404) return 'Invalid email or password.'
  }
  return 'Something went wrong. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const state = useLocation().state as LocationState | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (loading) return

    // 1. Check the form
    const newErrors: { email?: string; password?: string } = {}
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address.'
    if (!password) newErrors.password = 'Please enter your password.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // 2. Ask the backend to log in
    setLoading(true)
    setServerError('')
    try {
      const res = await axios.post<LoginResponse>('/api/auth/login', { email: email.trim(), password })
      const token = res.data.token ?? res.data.access_token
      if (!token) {
        setServerError('Signed in, but the server did not send a login token.')
        return
      }
      // 3. Save the token and go to the search page
      localStorage.setItem('misstrace_token', token)
      navigate(state?.from ?? '/search', { replace: true })
    } catch (error: unknown) {
      setServerError(getLoginError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container flex justify-center py-10 sm:py-14">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to continue using MissTrace.</p>

        {state?.message && (
          <p className="mt-5 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {state.message}
          </p>
        )}
        {serverError && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`field ${errors.email ? 'field-error' : ''}`}
            />
            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`field pr-11 ${errors.password ? 'field-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </section>
  )
}
