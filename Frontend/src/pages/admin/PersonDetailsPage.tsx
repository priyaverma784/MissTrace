import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Fingerprint, MapPin, Pencil, Trash2, UserX } from 'lucide-react'
import { Button, buttonClasses } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { Skeleton } from '../../components/LoadingSpinner'
import { PersonAvatar } from '../../components/PersonAvatar'
import { useDeletePerson } from '../../hooks/useDeletePerson'
import { usePersons } from '../../hooks/usePersons'
import { formatDate } from '../../utils/format'

export function PersonDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { persons, loading, error, reload } = usePersons()
  const { requestDelete, dialog } = useDeletePerson(() => navigate('/admin/persons'))

  // There is no "get one" endpoint, so the record is picked from GET /api/persons.
  const person = persons.find((p) => p.id === id)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/admin/persons" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to list
      </Link>

      {loading ? (
        <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-[280px_1fr]">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ) : error ? (
        <ErrorBanner error={error} onRetry={() => void reload()} />
      ) : !person ? (
        <EmptyState
          icon={<UserX className="h-7 w-7" aria-hidden />}
          title="Record not found"
          description="This record may have been removed."
          actions={
            <Link to="/admin/persons" className={buttonClasses('primary')}>
              Back to Missing Persons
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:grid-cols-[280px_1fr] md:p-6">
            <PersonAvatar
              name={person.name}
              src={person.photoUrl}
              rounded="lg"
              className="aspect-square w-full max-w-sm text-5xl"
            />
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-navy-900">{person.name}</h1>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    Record ID: #{person.id}
                  </span>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Age</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{person.age ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Gender</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{person.gender || '—'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <MapPin className="h-3.5 w-3.5" aria-hidden /> Last seen location
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{person.lastSeenLocation || '—'}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    <Calendar className="h-3.5 w-3.5" aria-hidden /> Last seen date
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(person.lastSeenDate)}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <Fingerprint className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
                <div>
                  <h2 className="text-sm font-semibold text-navy-900">AI Identification Data</h2>
                  <p className="mt-0.5 text-sm text-slate-600">Face embedding stored for similarity-based matching.</p>
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card" aria-label="Quick actions">
            <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Link to={`/admin/persons/${person.id}/edit`} className={buttonClasses('outline')}>
                <Pencil className="mr-2 h-4 w-4" aria-hidden /> Edit Record
              </Link>
              <Button variant="danger" icon={<Trash2 className="h-4 w-4" aria-hidden />} onClick={() => requestDelete(person)}>
                Delete Record
              </Button>
            </div>
          </section>
        </>
      )}

      {dialog}
    </div>
  )
}
