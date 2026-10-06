import { SearchX, ShieldAlert } from 'lucide-react'
import type { SearchResult } from '../types'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { PersonCard } from './PersonCard'

interface SearchResultsProps {
  results: SearchResult[]
  /** Results hidden by admin filters; used to tailor the empty-state text. */
  filtered?: boolean
  onTryAnother: () => void
  onSearchAgain: () => void
  adminBase?: string
}

export function SearchResults({
  results,
  filtered = false,
  onTryAnother,
  onSearchAgain,
  adminBase,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="h-7 w-7" aria-hidden />}
        title="No potential matches found"
        description={
          filtered
            ? 'No results match your current filters. Try lowering the minimum similarity or clearing the filters.'
            : "We couldn't find a sufficiently similar face in the current records."
        }
        actions={
          <>
            <Button variant="primary" onClick={onTryAnother}>
              Try Another Photo
            </Button>
            <Button variant="outline" onClick={onSearchAgain}>
              Search Again
            </Button>
          </>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((r, i) => (
          <PersonCard key={`${r.id}-${i}`} person={r} showMatch adminBase={adminBase} />
        ))}
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
        <p>
          AI results indicate potential matches and should be verified by authorized personnel. A
          similarity score is not proof of identity.
        </p>
      </div>
    </div>
  )
}
