import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
} from 'lucide-react'

interface MissingPerson {
  id: number
  name: string
  age: number | string | null
  gender: string | null
  photo_path: string | null
  last_seen_location: string | null
  last_seen_date: string | null
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

export default function MissingPersons() {
  const [persons, setPersons] = useState<MissingPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPersons = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get<MissingPerson[]>('/api/persons')
      setPersons(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            'Unable to load missing-person records. Please try again.',
        )
      } else {
        setError('Something went wrong while loading the records.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchPersons()
  }, [])

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
              View the missing-person records submitted to MissTrace.
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
            <p className="font-semibold text-white">
              Could not load records
            </p>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
            <button
              type="button"
              onClick={() => void fetchPersons()}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : persons.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <h2 className="text-xl font-semibold">
              No Records Available
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              No missing-person records have been added yet. You can add the
              first record to the directory.
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