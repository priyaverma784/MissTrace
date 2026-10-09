import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertTriangle, Eye, EyeOff, Info, Loader2 } from 'lucide-react'

interface LoginResponse {
  token?: string
  access_token?: string
}

interface LocationState {
  from?: string
  message?: string
}

function getLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Unable to connect to the MissTrace server.'
    const status = error.response.status
    if (status === 400 || status === 401 || status === 404) {
      return 'Invalid email or password.'
    }
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

    const newErrors: { email?: string; password?: string } = {}

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Please enter your password.'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setServerError('')

    try {
      const res = await axios.post<LoginResponse>('/api/auth/login', {
        email: email.trim(),
        password,
      })

      const token = res.data.token ?? res.data.access_token

      if (!token) {
        setServerError('Signed in, but the server did not send a login token.')
        return
      }

      localStorage.setItem('misstrace_token', token)
      navigate(state?.from ?? '/search', { replace: true })
    } catch (error: unknown) {
      setServerError(getLoginError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container flex min-h-[80vh] items-center justify-center bg-slate-50 px-4 py-10 sm:py-14">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
        <h1 className="text-3xl font-bold tracking-tight text-navy-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to continue your journey with MissTrace.
        </p>

        {state?.message && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {state.message}
          </p>
        )}

        {serverError && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
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
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              disabled={loading}
              className={`field rounded-xl border-slate-200 bg-slate-50 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                errors.email ? 'field-error' : ''
              }`}
            />

            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                disabled={loading}
                className={`field rounded-xl border-slate-200 bg-slate-50 pr-11 transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 ${
                  errors.password ? 'field-error' : ''
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full rounded-xl py-3.5 shadow-lg shadow-blue-900/15 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">NEW TO MISSTRACE?</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </section>
  )
}