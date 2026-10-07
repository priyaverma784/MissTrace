// One person returned by POST /api/search
export interface SearchResult {
  id: number
  name: string
  age: number | null
  gender: string | null
  last_seen_location: string | null
  last_seen_date: string | null
  similarity: number // 0 to 100
  potential_match: boolean
  photo_url: string | null
}
