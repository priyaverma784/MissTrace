import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, Search, SearchX, UserPlus, Users } from 'lucide-react'
import { buttonClasses } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { CardSkeletonGrid, TableSkeleton } from '../../components/LoadingSpinner'
import { Pagination } from '../../components/Pagination'
import { PersonCard } from '../../components/PersonCard'
import { PersonTable } from '../../components/PersonTable'
import { useDeletePerson } from '../../hooks/useDeletePerson'
import { usePersons } from '../../hooks/usePersons'
import { timestampOf } from '../../utils/format'

type View = 'table' | 'cards'
type Sort = 'newest' | 'oldest' | 'name'

const PAGE_SIZE = 10

const control =
  'min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm'

export function PersonsPage() {
  const [params, setParams] = useSearchParams()
  const { persons, loading, error, reload } = usePersons()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [gender, setGender] = useState('')
  const [sort, setSort] = useState<Sort>('newest')
  const [view, setView] = useState<View>('table')
  const [page, setPage] = useState(1)
  const { requestDelete, dialog } = useDeletePerson(() => void reload())

  // Keep in sync when the top bar search navigates here with ?q=
  const urlQuery = params.get('q') ?? ''
  useEffect(() => {
    setQuery(urlQuery)
    setPage(1)
  }, [urlQuery])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = persons.filter((p) => {
      if (gender && p.gender.toLowerCase() !== gender.toLowerCase()) return false
      if (!q) return true
      return [p.name, p.lastSeenLocation, p.id].some((v) => v.toLowerCase().includes(q))
    })
    return list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      const diff = timestampOf(b.lastSeenDate) - timestampOf(a.lastSeenDate)
      return sort === 'newest' ? diff : -diff
    })
  }, [persons, query, gender, sort])

  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const onQuery = (value: string) => {
    setQuery(value)
    setPage(1)
    if (params.has('q')) setParams({}, { replace: true })
  }

  const clearFilters = () => {
    setQuery('')
    setGender('')
    setPage(1)
    setParams({}, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">Missing Persons</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Loading records...' : `${persons.length} record${persons.length === 1 ? '' : 's'} in the database`}
          </p>
        </div>
        <Link to="/admin/persons/add" className={buttonClasses('primary')}>
          <UserPlus className="mr-2 h-4 w-4" aria-hidden /> Add Person
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search by name or location"
            aria-label="Search records"
            className={`${control} w-full pl-9`}
          />
        </div>
        <select
          value={gender}
          onChange={(e) => {
            setGender(e.target.value)
            setPage(1)
          }}
          aria-label="Filter by gender"
          className={control}
        >
          <option value="">All genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort records" className={control}>
          <option value="newest">Newest last seen</option>
          <option value="oldest">Oldest last seen</option>
          <option value="name">Name A–Z</option>
        </select>
        <div className="hidden rounded-lg border border-slate-300 p-1 sm:flex" role="group" aria-label="View mode">
          {(
            [
              ['table', List, 'Table view'],
              ['cards', LayoutGrid, 'Card view'],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              aria-label={label}
              aria-pressed={view === mode}
              className={`flex h-9 w-10 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                view === mode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorBanner error={error} onRetry={() => void reload()} />
      ) : loading ? (
        view === 'cards' ? (
          <CardSkeletonGrid />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
            <TableSkeleton rows={6} />
          </div>
        )
      ) : persons.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" aria-hidden />}
          title="No records yet"
          description="Register the first missing person to start building the database."
          actions={
            <Link to="/admin/persons/add" className={buttonClasses('primary')}>
              Add Person
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-7 w-7" aria-hidden />}
          title="No matching records"
          description="Try a different search term or clear the filters."
          actions={
            <button type="button" onClick={clearFilters} className={buttonClasses('outline')}>
              Clear filters
            </button>
          }
        />
      ) : view === 'cards' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <PersonCard key={p.id} person={p} adminBase="/admin/persons" onDelete={requestDelete} />
            ))}
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <PersonTable persons={visible} onDelete={requestDelete} />
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
        </div>
      )}

      {dialog}
    </div>
  )
}
