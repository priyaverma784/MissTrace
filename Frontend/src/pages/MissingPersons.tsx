import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  UserRound,
  Users,
  UserPlus,
  RefreshCw,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react'

interface MissingPerson {
  id: number
  name: string
  age: number | string | null
  gender: string | null
  last_seen_location: string | null
  last_seen_date: string | null
}

interface PersonForm {
  name: string
  age: string
  gender: string
  last_seen_location: string
  last_seen_date: string
}

function formatDate(value: string | null) {
  if (!value) return 'Not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.'
  }

  if (!error.response) {
    return 'Unable to connect to the MissTrace server. Check that the backend is running.'
  }

  const status = error.response.status

  if (status === 401 || status === 422) {
    return 'Your session has expired. Please log in again.'
  }

  if (status === 403) {
    return 'Access denied. Administrator access is required.'
  }

  const data = error.response.data as
    | { error?: string; message?: string }
    | undefined

  return (
    data?.error ||
    data?.message ||
    'The request failed. Please try again.'
  )
}

const emptyForm: PersonForm = {
  name: '',
  age: '',
  gender: '',
  last_seen_location: '',
  last_seen_date: '',
}

export default function MissingPersons() {
  const navigate = useNavigate()

  const [persons, setPersons] = useState<MissingPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<PersonForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState('')

  const fetchPersons = useCallback(async () => {
    setLoading(true)
    setError('')

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      setPersons([])
      setError('Please log in to access missing-person records.')
      setLoading(false)
      return
    }

    try {
      const response = await axios.get<MissingPerson[]>('/api/persons', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!Array.isArray(response.data)) {
        throw new Error('Unexpected response format from the server.')
      }

      setPersons(response.data)
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 422)
      ) {
        localStorage.removeItem('misstrace_token')
        setPersons([])
        navigate('/login', {
          replace: true,
          state: {
            from: '/missing-persons',
            message: 'Your session has expired. Please log in again.',
          },
        })
        return
      }

      setPersons([])
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    void fetchPersons()
  }, [fetchPersons])

  function startEditing(person: MissingPerson) {
    setEditingId(person.id)
    setActionError('')
    setNotice('')
    setForm({
      name: person.name,
      age: person.age == null ? '' : String(person.age),
      gender: person.gender || '',
      last_seen_location: person.last_seen_location || '',
      last_seen_date: person.last_seen_date || '',
    })
  }

  function cancelEditing() {
    setEditingId(null)
    setForm(emptyForm)
    setActionError('')
  }

  function updateForm(field: keyof PersonForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingId === null || saving) return

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      navigate('/login', {
        replace: true,
        state: { from: '/missing-persons' },
      })
      return
    }

    const trimmedName = form.name.trim()

    if (!trimmedName) {
      setActionError('Name is required.')
      return
    }

    if (form.age.trim()) {
      const age = Number(form.age)

      if (!Number.isInteger(age) || age < 0 || age > 150) {
        setActionError('Age must be a whole number between 0 and 150.')
        return
      }
    }

    setSaving(true)
    setActionError('')
    setNotice('')

    try {
      await axios.put(
        `/api/persons/${editingId}`,
        {
          name: trimmedName,
          age: form.age.trim() ? Number(form.age) : null,
          gender: form.gender || null,
          last_seen_location: form.last_seen_location.trim() || null,
          last_seen_date: form.last_seen_date || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      setEditingId(null)
      setForm(emptyForm)
      setNotice('Missing-person record updated successfully.')
      await fetchPersons()
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 422)
      ) {
        localStorage.removeItem('misstrace_token')
        navigate('/login', {
          replace: true,
          state: {
            from: '/missing-persons',
            message: 'Your session has expired. Please log in again.',
          },
        })
        return
      }

      setActionError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(person: MissingPerson) {
    if (deletingId !== null) return

    const confirmed = window.confirm(
      `Delete the record for "${person.name}" (ID: ${person.id})? This action cannot be undone.`,
    )

    if (!confirmed) return

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      navigate('/login', {
        replace: true,
        state: { from: '/missing-persons' },
      })
      return
    }

    setDeletingId(person.id)
    setActionError('')
    setNotice('')
    setError('')

    try {
      await axios.delete(`/api/persons/${person.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (editingId === person.id) {
        setEditingId(null)
        setForm(emptyForm)
      }

      setNotice(`Record for "${person.name}" deleted successfully.`)
      setPersons((current) =>
        current.filter((item) => item.id !== person.id),
      )
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 422)
      ) {
        localStorage.removeItem('misstrace_token')
        navigate('/login', {
          replace: true,
          state: {
            from: '/missing-persons',
            message: 'Your session has expired. Please log in again.',
          },
        })
        return
      }

      setActionError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#061329] px-4 py-10 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[2px] text-cyan-300">
              MissTrace Directory
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Missing Persons
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              View and manage missing-person records submitted to MissTrace.
            </p>
          </div>

          <Link
            to="/add-person"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            Add Missing Person
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total records</p>
              <p className="text-2xl font-bold">{persons.length}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchPersons()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {notice && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice('')}
              aria-label="Dismiss success message"
              className="text-emerald-200/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1">{actionError}</p>
            <button
              type="button"
              onClick={() => setActionError('')}
              aria-label="Dismiss error message"
              className="text-red-200/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03]">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-300" />
            <p className="text-sm text-slate-400">
              Loading missing-person records...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-300" />
            <p className="font-semibold text-white">Could not load records</p>
            <p className="mt-2 text-sm text-slate-400">{error}</p>

            {localStorage.getItem('misstrace_token') ? (
              <button
                type="button"
                onClick={() => void fetchPersons()}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
              >
                Try Again
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: '/missing-persons' }}
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
              >
                Log In
              </Link>
            )}
          </div>
        ) : persons.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <h2 className="text-xl font-semibold">No Records Available</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              No missing-person records have been added yet.
            </p>
            <Link
              to="/add-person"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              <UserPlus className="h-4 w-4" />
              Add Missing Person
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {persons.map((person) => (
              <article
                key={person.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-4 border-b border-white/10 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-400/10 text-cyan-300">
                    <UserRound className="h-7 w-7" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-white">
                      {person.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Record ID: {person.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {editingId === person.id ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm text-slate-300">
                          Name *
                        </label>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => updateForm('name', e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#0b1b33] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-sm text-slate-300">
                            Age
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="150"
                            value={form.age}
                            onChange={(e) => updateForm('age', e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#0b1b33] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm text-slate-300">
                            Gender
                          </label>
                          <input
                            value={form.gender}
                            onChange={(e) => updateForm('gender', e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-[#0b1b33] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm text-slate-300">
                          Last seen location
                        </label>
                        <input
                          value={form.last_seen_location}
                          onChange={(e) =>
                            updateForm('last_seen_location', e.target.value)
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#0b1b33] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm text-slate-300">
                          Last seen date
                        </label>
                        <input
                          type="date"
                          value={form.last_seen_date}
                          onChange={(e) =>
                            updateForm('last_seen_date', e.target.value)
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#0b1b33] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2.5 text-sm font-semibold text-[#061329] hover:bg-cyan-400 disabled:opacity-50"
                        >
                          {saving ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={cancelEditing}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-400">Age</span>
                        <span className="font-medium text-slate-200">
                          {person.age ?? 'Not available'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-400">Gender</span>
                        <span className="font-medium text-slate-200">
                          {person.gender || 'Not available'}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <div>
                          <p className="text-slate-400">Last seen location</p>
                          <p className="mt-1 break-words text-slate-200">
                            {person.last_seen_location || 'Not available'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                        <div>
                          <p className="text-slate-400">Last seen date</p>
                          <p className="mt-1 text-slate-200">
                            {formatDate(person.last_seen_date)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                        <button
                          type="button"
                          onClick={() => startEditing(person)}
                          disabled={deletingId !== null}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/20 px-3 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10 disabled:opacity-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(person)}
                          disabled={deletingId !== null}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/20 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {deletingId === person.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {deletingId === person.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-slate-500">
          Facial resemblance and directory records should be used as
          investigative leads, not as confirmation of a person's identity.
        </p>
      </div>
    </main>
  )
}