import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Loader2,
  ScanFace,
  ShieldCheck,
} from 'lucide-react'

interface LoginResponse {
  message: string
  access_token?: string
  token?: string
  user: {
    id: number
    name: string
    email: string
  }
}

interface LocationState {
  from?: string
  message?: string
  transition?: string
}

interface FormErrors {
  email?: string
  password?: string
}

function getLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Unable to connect to the MissTrace server. Please check that the backend is running.'
    }

    const data = error.response.data as
      | { error?: string; message?: string }
      | undefined

    if (data?.error) return data.error
    if (data?.message) return data.message

    if (error.response.status === 401) {
      return 'Invalid email or password.'
    }

    return 'Unable to sign in. Please try again.'
  }

  return 'Something went wrong. Please try again.'
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leavingForSignup, setLeavingForSignup] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading || leavingForSignup) return

    const newErrors: FormErrors = {}

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
      const response = await axios.post<LoginResponse>(
        '/api/auth/login',
        {
          email: email.trim(),
          password,
        },
      )

      const token =
        response.data.access_token ?? response.data.token

      if (!token) {
        setServerError(
          'Login succeeded, but the server did not return an authentication token.',
        )
        return
      }

      localStorage.setItem('misstrace_token', token)

      navigate(state?.from ?? '/search', {
        replace: true,
      })
    } catch (error: unknown) {
      setServerError(getLoginError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSignupNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault()

    if (loading || leavingForSignup) return

    setLeavingForSignup(true)

    window.setTimeout(() => {
      navigate('/signup', {
        state: { transition: 'slide' },
      })
    }, 250)
  }

  return (
    <section className="relative isolate flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl"
        aria-hidden="true"
      />

      <div
        className={`relative w-full max-w-md transition-all duration-300 ${
          leavingForSignup
            ? '-translate-x-8 opacity-0'
            : 'translate-x-0 opacity-100'
        }`}
      >
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-950 text-cyan-300 shadow-lg shadow-blue-950/15">
            <ScanFace
              className="h-9 w-9"
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-navy-950">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Sign in to continue to MissTrace.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/[0.06] sm:p-8">
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
            <ShieldCheck
              className="h-5 w-5 shrink-0 text-cyan-700"
              aria-hidden="true"
            />

            <p className="text-xs leading-relaxed text-slate-700">
              Sign in securely to access your MissTrace account.
            </p>
          </div>

          {state?.message && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800"
            >
              <Info
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{state.message}</span>
            </div>
          )}

          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrors((previous) => ({
                    ...previous,
                    email: undefined,
                  }))
                }}
                disabled={loading || leavingForSignup}
                aria-invalid={Boolean(errors.email)}
                className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                    : 'border-slate-200 focus:border-cyan-500 focus:ring-cyan-100'
                }`}
              />

              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setErrors((previous) => ({
                      ...previous,
                      password: undefined,
                    }))
                  }}
                  disabled={loading || leavingForSignup}
                  aria-invalid={Boolean(errors.password)}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-cyan-500 focus:ring-cyan-100'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-navy-950"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || leavingForSignup}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy-950/15 transition duration-300 hover:-translate-y-0.5 hover:bg-navy-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">
              NEW TO MISSTRACE?
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Link
            to="/signup"
            onClick={handleSignupNavigation}
            aria-disabled={loading || leavingForSignup}
            className={`group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-navy-950 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-md ${
              loading || leavingForSignup
                ? 'pointer-events-none opacity-60'
                : ''
            }`}
          >
            Create an Account
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-500">
          MissTrace · AI-generated matches are potential matches only and
          must be independently verified.
        </p>
      </div>
    </section>
  )
}