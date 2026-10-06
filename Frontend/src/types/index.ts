export type Gender = 'Male' | 'Female' | 'Other'

export interface MissingPerson {
  id: string
  name: string
  age: number | null
  gender: string
  lastSeenLocation: string
  lastSeenDate: string
  /** Resolved, ready-to-use image URL (or null when the backend sent no photo). */
  photoUrl: string | null
}

export interface SearchResult extends MissingPerson {
  /** Similarity as a percentage between 0 and 100. */
  similarity: number
}

export interface SearchResponse {
  results: SearchResult[]
  message?: string
}

export interface PersonFormValues {
  name: string
  age: string
  gender: string
  lastSeenLocation: string
  lastSeenDate: string
}

export interface PersonUpdatePayload {
  name: string
  age: number
  gender: string
  last_seen_location: string
  last_seen_date: string
}

export interface ApiError {
  message: string
  status?: number
  /** Machine readable category used to pick friendly UI wording. */
  kind: 'network' | 'server' | 'validation' | 'not_found' | 'unknown'
}

export type UserRole = 'user' | 'admin'

export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}
