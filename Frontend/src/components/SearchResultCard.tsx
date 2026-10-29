import { Calendar, MapPin, Navigation } from 'lucide-react'
import type { SearchResult } from '../types/search'

function formatDate(value: string | null): string {
  if (!value) return 'Not available'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function SearchResultCard({
  person,
}: {
  person: SearchResult
}) {
  const similarity =
    typeof person.similarity === 'number' &&
    Number.isFinite(person.similarity)
      ? Math.max(0, Math.min(100, Math.round(person.similarity)))
      : null

  const barColor =
    similarity === null
      ? 'bg-slate-300'
      : similarity >= 85
        ? 'bg-emerald-500'
        : similarity >= 70
          ? 'bg-blue-500'
          : 'bg-amber-500'

  const location = person.last_seen_location?.trim()

  const mapUrl = location
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`
    : null

  return (
    <article className="min-w-0 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            person.potential_match
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
              : 'bg-amber-50 text-amber-700 ring-amber-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              person.potential_match
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
            aria-hidden="true"
          />

          {person.potential_match ? 'Potential Match' : 'Possible Match'}
        </span>

        <span className="text-xs font-medium text-slate-500">
          Record #{person.id}
        </span>
      </div>

      <h3 className="mt-3 break-words text-xl font-bold text-navy-950">
        {person.name || 'Unknown'}
      </h3>

      <p className="mt-1 text-sm text-slate-600">
        Age: {person.age ?? 'Not available'}{' '}
        <span aria-hidden="true">·</span> Gender:{' '}
        {person.gender ?? 'Not available'}
      </p>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start gap-2.5">
          <MapPin
            className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <dt className="text-xs font-medium text-slate-500">
              Last known location
            </dt>

            <dd className="mt-0.5 break-words font-medium text-slate-800">
              {location || 'Not available'}
            </dd>

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:border-cyan-400 hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                aria-label={`View directions to the last known location for ${person.name || 'this person'}`}
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                View on Map
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Calendar
            className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700"
            aria-hidden="true"
          />

          <div>
            <dt className="text-xs font-medium text-slate-500">
              Last seen date
            </dt>

            <dd className="mt-0.5 font-medium text-slate-800">
              {formatDate(person.last_seen_date)}
            </dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-slate-600">
            Facial similarity
          </span>

          <span className="text-lg font-bold text-navy-950">
            {similarity === null ? 'N/A' : `${similarity}%`}
          </span>
        </div>

        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={similarity ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            similarity === null
              ? 'Facial similarity not available'
              : `Facial similarity: ${similarity}%`
          }
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${similarity ?? 0}%` }}
          />
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Similarity indicates facial resemblance, not confirmed identity.
          Verify every potential match independently.
        </p>

        <p className="mt-2 text-xs leading-5 text-amber-700">
          Map directions lead to the recorded last-known location, not a
          confirmed current location. Verify the information with the
          appropriate authorities before travelling.
        </p>
      </div>
    </article>
  )
}
