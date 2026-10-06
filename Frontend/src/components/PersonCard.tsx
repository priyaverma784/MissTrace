import { Link } from 'react-router-dom'
import { Calendar, Eye, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { MissingPerson, SearchResult } from '../types'
import { formatDate } from '../utils/format'
import { PersonAvatar } from './PersonAvatar'
import { MatchBadge, SimilarityScore } from './SimilarityScore'

interface PersonCardProps {
  person: MissingPerson | SearchResult
  /** Show similarity score + potential match badge (search results). */
  showMatch?: boolean
  /** Admin links and actions. */
  adminBase?: string
  onDelete?: (person: MissingPerson) => void
}

function isResult(p: MissingPerson | SearchResult): p is SearchResult {
  return 'similarity' in p
}

export function PersonCard({ person, showMatch = false, adminBase, onDelete }: PersonCardProps) {
  return (
    <article className="flex animate-fade-in flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative">
        <PersonAvatar
          name={person.name}
          src={person.photoUrl}
          rounded="lg"
          className="aspect-[4/3] w-full !rounded-none text-3xl"
        />
        {showMatch && isResult(person) && (
          <div className="absolute left-3 top-3">
            <MatchBadge value={person.similarity} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-lg font-semibold text-slate-900">{person.name || 'Unnamed record'}</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Age: {person.age ?? '—'} <span aria-hidden>|</span> {person.gender || '—'}
        </p>

        <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <div>
              <dt className="sr-only">Last seen location</dt>
              <dd>{person.lastSeenLocation || '—'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <div>
              <dt className="sr-only">Last seen date</dt>
              <dd>Last seen: {formatDate(person.lastSeenDate)}</dd>
            </div>
          </div>
        </dl>

        {showMatch && isResult(person) && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <SimilarityScore value={person.similarity} />
          </div>
        )}

        {adminBase && (
          <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <Link
              to={`${adminBase}/${person.id}`}
              className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Eye className="h-4 w-4" aria-hidden /> View
            </Link>
            <Link
              to={`${adminBase}/${person.id}/edit`}
              aria-label={`Edit ${person.name}`}
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(person)}
                aria-label={`Delete ${person.name}`}
                className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
