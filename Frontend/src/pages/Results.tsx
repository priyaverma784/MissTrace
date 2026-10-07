import { Link, Navigate, useLocation } from 'react-router-dom'
import { Plus, SearchX, ShieldCheck } from 'lucide-react'
import SearchResultCard from '../components/SearchResultCard'
import type { SearchResult } from '../types/search'

// The search page passes the results here through the router.
export default function Results() {
  const state = useLocation().state as { results?: SearchResult[] } | null

  // Opened without searching first (for example after a refresh): go back to search.
  if (!state?.results) return <Navigate to="/search" replace />
  const results = state.results

  if (results.length === 0) {
    return (
      <section className="page-container py-10 sm:py-14">
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <SearchX className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-navy-900">No Potential Matches Found</h1>
          <p className="mt-2 text-slate-600">We couldn&apos;t find a sufficiently similar face in the current records.</p>
          <Link to="/search" className="btn btn-primary mt-6 w-full sm:w-auto">
            Search Again
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-container py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">Search Results</h1>
          <p className="mt-2 text-slate-600">
            {results.length} potential {results.length === 1 ? 'match' : 'matches'} found, sorted by similarity.
          </p>
        </div>
        <Link to="/search" className="btn btn-primary w-full sm:w-auto">
          <Plus className="h-4 w-4" aria-hidden /> New Search
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {results.map((person, index) => (
          <SearchResultCard key={`${person.id}-${index}`} person={person} />
        ))}
      </div>

      <p className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
        AI results indicate potential matches and should be verified by authorized personnel. A similarity score is not
        proof of identity.
      </p>
    </section>
  )
}
