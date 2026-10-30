import { Link, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Plus,
  Search,
  SearchX,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react'
import SearchResultCard from '../components/SearchResultCard'
import type { SearchResult } from '../types/search'

// Only matches at or above this similarity (%) are shown.
const MIN_SIMILARITY = 20

interface ResultsLocationState {
  results?: SearchResult[]
}

interface UserResponse {
  user: {
    role: string
  }
}

function isValidResult(value: unknown): value is SearchResult {
  if (typeof value !== 'object' || value === null) return false

  const person = value as Partial<SearchResult>

  return (
    typeof person.id === 'number' &&
    typeof person.name === 'string' &&
    typeof person.similarity === 'number' &&
    Number.isFinite(person.similarity) &&
    person.similarity >= 0 &&
    person.similarity <= 100
  )
}

function MatchedPersonPhoto({ personId }: { personId: number }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      setFailed(true)
      return
    }

    
      axios
     .get(
     `${import.meta.env.VITE_API_BASE_URL}/api/persons/${personId}/photo`,
     {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
        },
      )

      .then((response) => {
        if (!active) return

        objectUrl = URL.createObjectURL(response.data)
        setPhotoUrl(objectUrl)
      })
      .catch(() => {
        if (active) setFailed(true)
      })

    return () => {
      active = false

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [personId])

  if (failed) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <div className="text-center">
          <UserRound className="mx-auto h-10 w-10" aria-hidden="true" />
          <p className="mt-2 text-xs">Photo unavailable</p>
        </div>
      </div>
    )
  }

  if (!photoUrl) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-xl bg-slate-100">
        <div
          className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"
          role="status"
          aria-label="Loading matched person's photo"
        />
      </div>
    )
  }

  return (
    <img
      src={photoUrl}
      alt="Potentially matched missing person"
      className="h-72 w-full rounded-xl bg-slate-100 object-cover object-top"
      loading="lazy"
    />
  )
}

export default function Results() {
  const location = useLocation()
  const state = location.state as ResultsLocationState | null

  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      setChecking(false)
      return
    }

    axios
      .get<UserResponse>('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (active && response.data.user) {
          // Any authenticated user can view their own search results.
          setAuthorized(true)
        }
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem('misstrace_token')
          setAuthorized(false)
        }
      })
      .finally(() => {
        if (active) {
          setChecking(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"
          role="status"
          aria-label="Verifying access"
        />
      </div>
    )
  }

  if (!localStorage.getItem('misstrace_token')) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: '/search',
          message: 'Please sign in to continue.',
        }}
      />
    )
  }

  if (!authorized) {
    return <Navigate to="/search" replace />
  }

  if (!state || !Array.isArray(state.results)) {
    return <Navigate to="/search" replace />
  }

  const results = state.results
    .filter(isValidResult)
    .filter((person) => person.similarity >= MIN_SIMILARITY)
    .sort((a, b) => b.similarity - a.similarity)

  if (results.length === 0) {
    return (
      <section className="relative isolate flex min-h-[calc(100vh-76px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
        <div
          className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-xl shadow-slate-900/[0.04] sm:px-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <SearchX className="h-8 w-8" aria-hidden="true" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
            Search completed
          </p>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
            No Potential Matches Found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            We couldn't find a sufficiently similar face in the current
            records. Try another photograph with a clear, front-facing view,
            or report this person so others can help find them.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-navy-800"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Try Another Search
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              to="/add-person"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-600 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-100"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Report a Missing Person
            </Link>
          </div>

          <p className="mt-6 text-xs leading-5 text-slate-500">
            No results does not necessarily mean the person is absent from
            the records.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-slate-50">
      <div
        className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-cyan-200/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="page-container relative py-8 sm:py-12">
        <Link
          to="/search"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Search
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Search completed
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
              Search Results
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Review the potential matches identified in the MissTrace records.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/search"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-navy-950/10 transition hover:-translate-y-0.5 hover:bg-navy-800 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Search
            </Link>

            <Link
              to="/add-person"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-600 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:-translate-y-0.5 hover:bg-cyan-100 sm:w-auto"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Report a Missing Person
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <FileSearch className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-bold text-navy-950">
                Potential Matches
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Sorted by similarity
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-2 text-center">
            <p className="text-2xl font-extrabold leading-none text-navy-950">
              {results.length}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              {results.length === 1 ? 'Result' : 'Results'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {results.map((person, index) => (
            <div
              key={`${person.id}-${index}`}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <MatchedPersonPhoto personId={person.id} />

              <div className="mt-4">
                <SearchResultCard person={person} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
          <div>
            <h2 className="text-sm font-bold text-navy-950">
              Not the person you are looking for?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Report them as missing so others can help find them.
            </p>
          </div>

          <Link
            to="/add-person"
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 sm:w-auto"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Report a Missing Person
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-950">
                Important: Verify Every Potential Match
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-900/80">
                AI-generated matches are suggestions, not confirmed
                identifications. Similarity scores are not proof of identity.
                Every potential match must be independently verified by
                authorized personnel before action is taken.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-center text-xs text-slate-500 sm:text-left">
            MissTrace · Helping reconnect missing people with their families.
          </p>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800 transition hover:text-cyan-950"
          >
            Search another photo
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}