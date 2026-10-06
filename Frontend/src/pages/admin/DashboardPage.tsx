import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Search, UserPlus, Users, Sparkles } from 'lucide-react'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { TableSkeleton } from '../../components/LoadingSpinner'
import { Pagination } from '../../components/Pagination'
import { PersonTable } from '../../components/PersonTable'
import { StatCard } from '../../components/StatCard'
import { buttonClasses } from '../../components/Button'
import { useDeletePerson } from '../../hooks/useDeletePerson'
import { usePersons } from '../../hooks/usePersons'
import { timestampOf } from '../../utils/format'
import { readUsage } from '../../utils/usageStats'

const PAGE_SIZE = 5
const RECENT_DAYS = 30

export function DashboardPage() {
  const { persons, loading, error, reload } = usePersons()
  const [page, setPage] = useState(1)
  const { requestDelete, dialog } = useDeletePerson(() => void reload())
  const usage = readUsage()

  const sorted = useMemo(
    () => [...persons].sort((a, b) => timestampOf(b.lastSeenDate) - timestampOf(a.lastSeenDate)),
    [persons],
  )
  const recentCount = useMemo(() => {
    const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000
    return persons.filter((p) => timestampOf(p.lastSeenDate) >= cutoff).length
  }, [persons])
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of missing persons and system activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Missing Persons"
          value={persons.length}
          icon={<Users className="h-5 w-5" aria-hidden />}
          loading={loading}
        />
        <StatCard
          label="Recent Records"
          value={recentCount}
          hint={`Last seen in the past ${RECENT_DAYS} days`}
          icon={<Clock className="h-5 w-5" aria-hidden />}
          loading={loading}
        />
        <StatCard
          label="Searches Performed"
          value={usage.searches}
          hint="From this browser"
          icon={<Search className="h-5 w-5" aria-hidden />}
        />
        <StatCard
          label="Potential Matches"
          value={usage.matches}
          hint="From this browser"
          icon={<Sparkles className="h-5 w-5" aria-hidden />}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-slate-900">Recent Missing Persons</h2>
          <Link to="/admin/persons" className="text-sm font-medium text-blue-600 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="p-4">
            <ErrorBanner error={error} onRetry={() => void reload()} />
          </div>
        ) : persons.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<Users className="h-7 w-7" aria-hidden />}
              title="No records yet"
              description="Register the first missing person to start building the database."
              actions={
                <Link to="/admin/persons/add" className={buttonClasses('primary')}>
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden /> Add Person
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <PersonTable persons={visible} onDelete={requestDelete} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onChange={setPage} />
          </>
        )}
      </section>

      {dialog}
    </div>
  )
}
