import { useState } from 'react'
import { Calendar, MapPin } from 'lucide-react'
import type { SearchResult } from '../types/search'

// "2026-10-05" -> "05 October 2026"
function formatDate(value: string | null): string {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function SearchResultCard({ person }: { person: SearchResult }) {
  const [photoFailed, setPhotoFailed] = useState(false)

  // The bar colour follows the score. Green is only used for strong scores.
  const barColor =
    person.similarity >= 85 ? 'bg-emerald-500' : person.similarity >= 70 ? 'bg-blue-500' : 'bg-amber-500'

  return (
    <article className="flex min-w-0 animate-fade-up flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card sm:flex-row">
      {/* Photo (or the first letter of the name when there is no photo) */}
      {person.photo_url && !photoFailed ? (
        <img
          src={person.photo_url}
          alt={`Photo of ${person.name}`}
          onError={() => setPhotoFailed(true)}
          className="h-56 w-full bg-slate-100 object-cover sm:h-auto sm:w-40 sm:shrink-0"
        />
      ) : (
        <div
          aria-label="No photo available"
          className="flex h-40 w-full items-center justify-center bg-navy-100 text-4xl font-bold text-navy-600 sm:h-auto sm:w-40 sm:shrink-0"
        >
          {person.name.charAt(0).toUpperCase() || '?'}
        </div>
      )}

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            person.potential_match
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-amber-50 text-amber-700 ring-amber-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${person.potential_match ? 'bg-emerald-500' : 'bg-amber-500'}`}
            aria-hidden
          />
          {person.potential_match ? 'Potential Match' : 'Possible Match'}
        </span>

        <h3 className="mt-2 truncate text-xl font-semibold text-slate-900">{person.name}</h3>
        <p className="mt-0.5 text-sm text-slate-600">
          Age: {person.age ?? 'Not available'} <span aria-hidden>·</span> Gender: {person.gender ?? 'Not available'}
        </p>

        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <div>
              <dt className="inline text-slate-500">Last seen: </dt>
              <dd className="inline font-medium text-slate-800">{person.last_seen_location ?? 'Not available'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            <div>
              <dt className="inline text-slate-500">Last seen date: </dt>
              <dd className="inline font-medium text-slate-800">{formatDate(person.last_seen_date)}</dd>
            </div>
          </div>
        </dl>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-slate-500">Similarity</span>
            <span className="text-lg font-bold text-slate-900">{person.similarity}%</span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={person.similarity}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Similarity score"
          >
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${person.similarity}%` }} />
          </div>
        </div>
      </div>
    </article>
  )
}
