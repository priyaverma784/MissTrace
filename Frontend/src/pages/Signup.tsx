import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function getSignupError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    if (!error.response) return 'Unable to connect to the MissTrace server.'
    const serverText = String(error.response.data?.error ?? error.response.data?.message ?? '')
    if (error.response.status === 409 || /already|exist|duplicate|unique/i.test(serverText)) {
      return 'An account with this email already exists.'
    }
  }
  return 'Something went wrong. Please try again.'
}

export default function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (loading) return

    // 1. Check the form
    const newErrors: FormErrors = {}
    if (!name.trim()) newErrors.name = 'Please enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) newErrors.email = 'Please enter a valid email address.'
    if (!password) newErrors.password = 'Please enter a password.'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.'
    if (confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match.'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // 2. Create the account (we never send the "confirm password" field)
    setLoading(true)
    setServerError('')
    try {
      await axios.post('/api/auth/signup', { name: name.trim(), email: email.trim(), password })
      navigate('/login', { state: { message: 'Account created successfully. Please sign in.' } })
    } catch (error: unknown) {
      setServerError(getSignupError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container flex justify-center py-10 sm:py-14">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Create Your Account</h1>
        <p className="mt-1 text-sm text-slate-600">Create an account to search for missing persons with MissTrace.</p>

        {serverError && (
          <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {serverError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="field-label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={`field ${errors.name ? 'field-error' : ''}`}
            />
            {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
          </div>

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
                autoComplete="new-password"
                placeholder="At least 6 characters"
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

          <div>
            <label htmlFor="confirmPassword" className="field-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Type your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className={`field ${errors.confirmPassword ? 'field-error' : ''}`}
            />
            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </section>
  )
}
