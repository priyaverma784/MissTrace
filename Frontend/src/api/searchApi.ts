import { api, toApiError } from './axios'
import { extractList, normalizeSearchResult } from './normalizers'
import type { SearchResponse } from '../types'

/** POST /api/search  (multipart/form-data, field name: photo) */
export async function searchMissingPerson(photo: File): Promise<SearchResponse> {
  const form = new FormData()
  form.append('photo', photo)
  try {
    const { data } = await api.post<unknown>('/api/search', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const results = extractList(data, ['matches', 'results', 'persons', 'data'])
      .map(normalizeSearchResult)
      .sort((a, b) => b.similarity - a.similarity)
    return { results }
  } catch (error) {
    throw toApiError(error)
  }
}
