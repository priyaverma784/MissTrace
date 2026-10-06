import { useCallback, useEffect, useState } from 'react'
import { getMissingPersons } from '../api/personApi'
import type { ApiError, MissingPerson } from '../types'

/** Loads GET /api/persons and exposes loading / error / reload state. */
export function usePersons() {
  const [persons, setPersons] = useState<MissingPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setPersons(await getMissingPersons())
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { persons, loading, error, reload: load }
}
