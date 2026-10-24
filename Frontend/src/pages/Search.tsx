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
  'Recent photos give the best results.',
]

type Raw = Record<string, unknown>

function isObject(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== ''
    ? value
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
  const list: unknown = Array.isArray(data)
    ? data
    : isObject(data)
      ? data.results ?? data.matches
      : []

  if (!Array.isArray(list)) return []

  return list
    .filter(isObject)
    .map((item): SearchResult => {
      const score =
        asNumber(item.similarity ?? item.similarity_score ?? item.score) ?? 0

      const similarity = Math.max(
        0,
        Math.min(100, Math.round(score <= 1 ? score * 100 : score)),
      )

      const photo = asText(
        item.photo_url ??
          item.image_url ??
          item.photo ??
          item.image_path ??
          item.photo_path,
      )

      const photoUrl = !photo
        ? null
        : /^(https?:|data:|blob:)/i.test(photo)
          ? photo
          : `http://127.0.0.1:5000/${photo
              .replace(/\\/g, '/')
              .replace(/^\/+/, '')}`

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
        photo_url: photoUrl,
      }
    })
    .filter((result) => result.similarity > 0)
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

    if (status === 403) {
      return 'Access denied. Only authorized administrators can search the confidential missing-person database.'
    }

    if (status === 404 && /user not found/i.test(serverText)) {
      return 'Your account could not be verified. Please sign in again.'
    }

    if (/no face|face not|0 faces/i.test(serverText)) {
      return 'No face was detected in this image. Please upload a clearer photo.'
    }

    if (status === 400 || status === 415) {
      return (
        serverText ||
        'We could not read this image. Please try a different photo.'
      )
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
      setError('Please upload a photo first.')
      return
    }

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      navigate('/login', {
        state: {
          from: '/search',
          message: 'Please sign in to continue.',
        },
      })
      return
    }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await axios.post<unknown>('/api/search', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

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
        Upload a clear photo to search for potential matches in the MissTrace
        database.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {loading ? (
          <LoadingState />
        ) : (
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
            {error && (
              <p
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden
                />
                {error}
              </p>
            )}

            <ImageUploader
              file={file}
              onChange={(picked) => {
                setFile(picked)
                setError('')
              }}
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="btn btn-primary btn-lg mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              Search with AI
            </button>
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
                    aria-hidden
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-sm text-blue-900">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
              aria-hidden
            />
            <p>
              Search results indicate potential matches and must be verified
              by authorized personnel. A similarity score is not proof of
              identity.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}