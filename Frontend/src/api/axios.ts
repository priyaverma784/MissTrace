import axios, { AxiosError } from 'axios'
import type { ApiError } from '../types'

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://127.0.0.1:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // face embedding can take a while on first request
  headers: { Accept: 'application/json' },
})

/** Friendly wording for the backend messages we know about. */
const FRIENDLY_MESSAGES: Array<[RegExp, string]> = [
  [/no face/i, 'No face was detected in this photo. Please use a clear, front-facing image.'],
  [/unable to read image|invalid image|cannot identify image|decode/i, 'We could not read that image. Please try a different JPG or PNG file.'],
  [/embedding/i, 'We could not analyse the face in this photo. Please try a clearer image.'],
  [/photo.*required|image.*required|no (photo|image|file)/i, 'A photo is required.'],
  [/name.*required/i, 'Name is required.'],
]

function friendly(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  for (const [pattern, message] of FRIENDLY_MESSAGES) {
    if (pattern.test(raw)) return message
  }
  // Never show Python tracebacks to people.
  if (/traceback|File ".*\.py"|Exception/i.test(raw)) return undefined
  return raw
}

interface ErrorBody {
  error?: string
  message?: string
  detail?: string
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<ErrorBody | string>

    if (!err.response) {
      return {
        kind: 'network',
        message:
          err.code === 'ECONNABORTED'
            ? 'The request took too long. Please try again.'
            : 'Cannot reach the MissTrace server. Please check that the backend is running and try again.',
      }
    }

    const { status, data } = err.response
    const raw =
      typeof data === 'string' ? undefined : (data?.error ?? data?.message ?? data?.detail)
    const message = friendly(raw)

    if (status === 404) {
      return { kind: 'not_found', status, message: message ?? 'We could not find that record.' }
    }
    if (status >= 400 && status < 500) {
      return { kind: 'validation', status, message: message ?? 'Please check the details and try again.' }
    }
    return {
      kind: 'server',
      status,
      message: message ?? 'Something went wrong on our side. Please try again in a moment.',
    }
  }
  return { kind: 'unknown', message: 'An unexpected error occurred. Please try again.' }
}
