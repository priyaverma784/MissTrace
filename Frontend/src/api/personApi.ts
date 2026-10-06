import { api, toApiError } from './axios'
import { extractList, normalizePerson } from './normalizers'
import type { MissingPerson, PersonUpdatePayload } from '../types'

export interface AddPersonInput {
  name: string
  age: number
  gender: string
  last_seen_location: string
  last_seen_date: string
  photo: File
}

/** POST /api/persons  (multipart/form-data) */
export async function addMissingPerson(input: AddPersonInput): Promise<void> {
  const form = new FormData()
  form.append('name', input.name)
  form.append('age', String(input.age))
  form.append('gender', input.gender)
  form.append('last_seen_location', input.last_seen_location)
  form.append('last_seen_date', input.last_seen_date)
  form.append('photo', input.photo)
  try {
    await api.post('/api/persons', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  } catch (error) {
    throw toApiError(error)
  }
}

/** GET /api/persons */
export async function getMissingPersons(): Promise<MissingPerson[]> {
  try {
    const { data } = await api.get<unknown>('/api/persons')
    return extractList(data, ['persons', 'data', 'results', 'records']).map(normalizePerson)
  } catch (error) {
    throw toApiError(error)
  }
}

/** PUT /api/persons/:id  (JSON) */
export async function updateMissingPerson(id: string, payload: PersonUpdatePayload): Promise<void> {
  try {
    await api.put(`/api/persons/${encodeURIComponent(id)}`, payload)
  } catch (error) {
    throw toApiError(error)
  }
}

/** DELETE /api/persons/:id */
export async function deleteMissingPerson(id: string): Promise<void> {
  try {
    await api.delete(`/api/persons/${encodeURIComponent(id)}`)
  } catch (error) {
    throw toApiError(error)
  }
}
