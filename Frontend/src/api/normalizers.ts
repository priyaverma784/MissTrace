import { API_BASE_URL } from './axios'
import type { MissingPerson, SearchResult } from '../types'

type Raw = Record<string, unknown>

function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function str(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value)
  }
  return null
}

/**
 * Turns whatever photo reference the backend sends (absolute URL, relative
 * path or base64) into something an <img> can use. Raw file-system paths are
 * reduced to their file name and never shown to the user.
 */
export function resolvePhotoUrl(value: unknown): string | null {
  const raw = str(value).trim()
  if (!raw) return null
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw
  // Looks like bare base64 image data
  if (/^[A-Za-z0-9+/=\r\n]{200,}$/.test(raw)) return `data:image/jpeg;base64,${raw}`
  const cleaned = raw.replace(/\\/g, '/').replace(/^\.?\//, '')
  return `${API_BASE_URL}/${cleaned}`
}

export function normalizePerson(input: unknown): MissingPerson {
  const r: Raw = isRecord(input) ? input : {}
  return {
    id: str(r.id ?? r._id ?? r.person_id),
    name: str(r.name),
    age: num(r.age),
    gender: str(r.gender),
    lastSeenLocation: str(r.last_seen_location ?? r.lastSeenLocation ?? r.location),
    lastSeenDate: str(r.last_seen_date ?? r.lastSeenDate ?? r.date),
    photoUrl: resolvePhotoUrl(
      r.photo_url ?? r.photoUrl ?? r.photo ?? r.image_url ?? r.image ?? r.image_path ?? r.photo_path,
    ),
  }
}

/** Accepts `[...]`, `{persons: [...]}`, `{data: [...]}`, `{results: [...]}` etc. */
export function extractList(data: unknown, keys: string[]): unknown[] {
  if (Array.isArray(data)) return data
  if (isRecord(data)) {
    for (const key of keys) {
      const value = data[key]
      if (Array.isArray(value)) return value
    }
  }
  return []
}

function toPercentage(value: unknown): number {
  const n = num(value)
  if (n === null) return 0
  const pct = n <= 1 ? n * 100 : n
  return Math.max(0, Math.min(100, Math.round(pct)))
}

export function normalizeSearchResult(input: unknown): SearchResult {
  const r: Raw = isRecord(input) ? input : {}
  // Some backends nest the record under `person`.
  const personSource: unknown = isRecord(r.person) ? { ...r.person, ...r } : r
  const person = normalizePerson(personSource)
  return {
    ...person,
    similarity: toPercentage(r.similarity ?? r.similarity_score ?? r.score ?? r.confidence),
  }
}
