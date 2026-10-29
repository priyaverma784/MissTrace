import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import LoadingState from '../components/LoadingState'
import type { SearchResult } from '../types/search'

const tips = [
  'Use a clear, well-lit photo.',
  'The face should be fully visible and facing the camera.',
  'Only one person should be in the photo.',
  'Recent photos generally give better results.',
]

interface SearchResponse {
  message?: string
  matches?: unknown
}

type Raw = Record<string, unknown>

function isObject(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (
    typeof value === 'string' &&
    value.trim() !== '' &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value)
  }

  return null
}

function toResults(data: unknown): SearchResult[] {
  if (!isObject(data) || !Array.isArray(data.matches)) {
    return []
  }

  return data.matches
    .filter(isObject)
    .map((item): SearchResult => {
      const rawScore = asNumber(item.similarity) ?? 0
      const similarity = Math.max(0, Math.min(100, Math.round(rawScore)))

      return {
        id: asNumber(item.id) ?? 0,
        name: asText(item.name) ?? 'Unknown',
        age: asNumber(item.age),
        gender: asText(item.gender),
        last_seen_location: asText(item.last_seen_location),
        last_seen_date: asText(item.last_seen_date),
        similarity,
        potential_match:
          typeof item.potential_match === 'boolean'
            ? item.potential_match
            : similarity >= 50,
      }
    })
    .filter((result) => result.id > 0)
    .sort((a, b) => b.similarity - a.similarity)
}

function getSearchError(error: unknown): string {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    if (!error.response) {
      return 'Unable to connect to the MissTrace server. Please try again.'
    }

    const status = error.response.status
    const serverText = String(
      error.response.data?.error ?? error.response.data?.message ?? '',
    )

    if (status === 401 || status === 422) {
      return 'Your session has expired. Please sign in again.'
    }

    if (status === 403) {
      return 'You do not have permission to perform this search.'
    }

    if (/no face|face not|0 faces/i.test(serverText)) {
      return 'No face was detected in this image. Try a clearer, front-facing photograph.'
    }

    if (status === 400 || status === 415) {
      return serverText || 'We could not process your photograph. Please try another one.'
    }

    if (status >= 500) {
      return 'The server encountered an error. Please try again later.'
    }
  }

  return 'Something went wrong. Please try again.'
}

export default function Search() {
  const navigate = useNavigate()

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (loading) return

    if (!file) {
      setError('Please upload a photograph of the missing person.')
      return
    }

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      navigate('/login', {
        state: {
          from: '/search',
          message: 'Please sign in to search for a missing person.',
        },
      })
      return
    }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await axios.post<SearchResponse>(
        '/api/search',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const results = toResults(response.data)

      navigate('/results', {
        state: { results },
      })
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 401 || err.response?.status === 422)
      ) {
        localStorage.removeItem('misstrace_token')

        navigate('/login', {
          state: {
            from: '/search',
            message: 'Your session has expired. Please sign in again.',
          },
        })

        return
      }

      setError(getSearchError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container py-8 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
        Find a Missing Person
      </h1>

      <p className="mt-2 max-w-2xl text-slate-600">
        Upload a clear photograph to search for potential matches in the
        MissTrace database.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
            {error && (
              <p
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                {error}
              </p>
            )}

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Photograph
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Upload a photo of the person you are looking for.
              </p>
            </div>

            <div className="mt-4">
              <ImageUploader
                file={file}
                onChange={(picked) => {
                  setFile(picked)
                  setError('')
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="btn btn-primary btn-lg mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Search for Missing Person
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              The search compares the face in your photo with registered
              records.
            </p>
          </div>
        )}

        <aside className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="font-semibold text-slate-900">
              Tips for a good photo
            </h2>

            <ul className="mt-3 space-y-2.5">
              {tips.map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
              aria-hidden="true"
            />
            <p>
              Search results indicate potential matches, not confirmed
              identities. Similarity scores are estimates and must not be
              treated as proof of identity.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}