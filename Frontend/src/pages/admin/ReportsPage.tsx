import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { usePersons } from '../../hooks/usePersons'

/** Simple summary computed from GET /api/persons – no extra endpoints needed. */
export function ReportsPage() {
  const { persons, loading, error, reload } = usePersons()

  const byLocation = useMemo(() => {
    const counts = new Map<string, number>()
    persons.forEach((p) => {
      const key = p.lastSeenLocation || 'Unknown'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [persons])

  const byGender = useMemo(() => {
    const counts = new Map<string, number>()
    persons.forEach((p) => {
      const key = p.gender || 'Unknown'
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [persons])

  const max = Math.max(1, ...byLocation.map(([, n]) => n))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">A summary of the records currently in the database.</p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading records..." />
      ) : error ? (
        <ErrorBanner error={error} onRetry={() => void reload()} />
      ) : persons.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-7 w-7" aria-hidden />}
          title="Nothing to report yet"
          description="Reports will appear once missing persons have been registered."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold text-slate-900">Top last seen locations</h2>
            <ul className="mt-4 space-y-3">
              {byLocation.map(([name, count]) => (
                <li key={name}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{name}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-semibold text-slate-900">By gender</h2>
            <ul className="mt-4 divide-y divide-slate-100">
              {byGender.map(([name, count]) => (
                <li key={name} className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-700">{name}</span>
                  <span className="font-medium text-slate-900">
                    {count} <span className="text-slate-400">({Math.round((count / persons.length) * 100)}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
