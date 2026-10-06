/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { searchMissingPerson } from '../api/searchApi'
import type { ApiError, SearchResult } from '../types'
import { recordSearch } from '../utils/usageStats'

export type SearchStatus = 'idle' | 'searching' | 'done' | 'error'

interface SearchContextValue {
  status: SearchStatus
  results: SearchResult[]
  error: ApiError | null
  /** Preview of the photo that was searched with (owned by this context). */
  queryPreview: string | null
  /** Index of the processing stage currently shown (0-4). */
  stage: number
  run: (file: File) => Promise<boolean>
  /** Repeat the last search with the same photo. */
  rerun: () => Promise<boolean>
  reset: () => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

/** Minimum score (percent) for a result to be shown as a potential match. */
export const MIN_MATCH_SCORE = 1

export function SearchProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<ApiError | null>(null)
  const [queryPreview, setQueryPreview] = useState<string | null>(null)
  const [stage, setStage] = useState(0)
  const lastFile = useRef<File | null>(null)
  const busy = useRef(false)

  const run = useCallback(async (file: File) => {
    if (busy.current) return false
    busy.current = true
    lastFile.current = file
    setStatus('searching')
    setError(null)
    setResults([])
    setStage(0)
    setQueryPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return URL.createObjectURL(file)
    })

    // The backend does everything in a single request; these stages only give
    // visual feedback about what is happening while we wait for it.
    const timers = [1, 2, 3, 4].map((step) => window.setTimeout(() => setStage(step), step * 1100))

    try {
      const response = await searchMissingPerson(file)
      const useful = response.results.filter((r) => r.similarity >= MIN_MATCH_SCORE)
      setResults(useful)
      recordSearch(useful.length)
      setStatus('done')
      return true
    } catch (err) {
      setError(err as ApiError)
      setStatus('error')
      return false
    } finally {
      timers.forEach((t) => window.clearTimeout(t))
      busy.current = false
    }
  }, [])

  const rerun = useCallback(async () => {
    const file = lastFile.current
    if (!file) return false
    return run(file)
  }, [run])

  const reset = useCallback(() => {
    lastFile.current = null
    setStatus('idle')
    setResults([])
    setError(null)
    setStage(0)
    setQueryPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return null
    })
  }, [])

  const value = useMemo(
    () => ({ status, results, error, queryPreview, stage, run, rerun, reset }),
    [status, results, error, queryPreview, stage, run, rerun, reset],
  )
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>')
  return ctx
}
