import { useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { SearchPanel } from '../../components/SearchPanel'
import { SearchResults } from '../../components/SearchResults'
import { useSearch } from '../../context/SearchContext'

const control =
  'min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm'

export function AdminSearchPage() {
  const { status, results, queryPreview, reset, rerun } = useSearch()
  const [minSimilarity, setMinSimilarity] = useState(0)
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('')

  const locations = useMemo(
    () => Array.from(new Set(results.map((r) => r.lastSeenLocation).filter(Boolean))).sort(),
    [results],
  )
  const genders = useMemo(
    () => Array.from(new Set(results.map((r) => r.gender).filter(Boolean))).sort(),
    [results],
  )

  // Filters only narrow the results already returned by POST /api/search.
  const filtered = useMemo(
    () =>
      results.filter(
        (r) =>
          r.similarity >= minSimilarity &&
          (!location || r.lastSeenLocation === location) &&
          (!gender || r.gender === gender),
      ),
    [results, minSimilarity, location, gender],
  )
  const hasFilters = minSimilarity > 0 || location !== '' || gender !== ''

  const clearFilters = () => {
    setMinSimilarity(0)
    setLocation('')
    setGender('')
  }

  const startOver = () => {
    reset()
    clearFilters()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">AI Search</h1>
        <p className="mt-1 text-sm text-slate-500">Search using a face photo and find potential matches.</p>
      </div>

      <SearchPanel />

      {status === 'done' && (
        <section className="space-y-5" aria-label="Search results">
          <div className="flex items-center gap-4">
            {queryPreview && (
              <img src={queryPreview} alt="Photo you searched with" className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Results ({filtered.length}
                {hasFilters ? ` of ${results.length}` : ''})
              </h2>
              <p className="text-sm text-slate-500">Sorted by highest similarity.</p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden /> Filters
                </h3>
                {hasFilters && (
                  <button type="button" onClick={clearFilters} className="text-sm font-medium text-blue-600 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block text-sm font-medium text-slate-700">
                  Minimum similarity
                  <select
                    className={`${control} mt-1.5`}
                    value={minSimilarity}
                    onChange={(e) => setMinSimilarity(Number(e.target.value))}
                  >
                    <option value={0}>Any</option>
                    {[50, 60, 70, 80, 90].map((n) => (
                      <option key={n} value={n}>
                        {n}% or higher
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Location
                  <select className={`${control} mt-1.5`} value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option value="">Any</option>
                    {locations.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Gender
                  <select className={`${control} mt-1.5`} value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Any</option>
                    {genders.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}

          <SearchResults
            results={filtered}
            filtered={hasFilters && results.length > 0}
            onTryAnother={startOver}
            onSearchAgain={() => void rerun()}
            adminBase="/admin/persons"
          />
        </section>
      )}
    </div>
  )
}
