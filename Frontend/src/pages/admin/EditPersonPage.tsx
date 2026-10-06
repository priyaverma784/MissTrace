import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserX } from 'lucide-react'
import { updateMissingPerson } from '../../api/personApi'
import { buttonClasses } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { PersonAvatar } from '../../components/PersonAvatar'
import { PersonForm } from '../../components/PersonForm'
import { useToast } from '../../context/ToastContext'
import { usePersons } from '../../hooks/usePersons'
import type { ApiError, PersonFormValues } from '../../types'
import { toInputDate } from '../../utils/format'

export function EditPersonPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { persons, loading, error: loadError, reload } = usePersons()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const person = persons.find((p) => p.id === id)

  const handleSubmit = async (values: PersonFormValues) => {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await updateMissingPerson(id, {
        name: values.name,
        age: Number(values.age),
        gender: values.gender,
        last_seen_location: values.lastSeenLocation,
        last_seen_date: values.lastSeenDate,
      })
      toast.success('Missing person updated successfully.')
      navigate(`/admin/persons/${id}`)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        to={`/admin/persons/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to record
      </Link>

      {loading ? (
        <LoadingSpinner label="Loading records..." />
      ) : loadError ? (
        <ErrorBanner error={loadError} onRetry={() => void reload()} />
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
          <div className="flex items-center gap-4">
            <PersonAvatar name={person.name} src={person.photoUrl} className="h-16 w-16" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-navy-900">Edit Record</h1>
              <p className="text-sm text-slate-500">Record ID: #{person.id}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
            <PersonForm
              mode="edit"
              initial={{
                name: person.name,
                age: person.age === null ? '' : String(person.age),
                gender:
                  ['Male', 'Female', 'Other'].find((g) => g.toLowerCase() === person.gender.toLowerCase()) ??
                  person.gender,
                lastSeenLocation: person.lastSeenLocation,
                lastSeenDate: toInputDate(person.lastSeenDate),
              }}
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/admin/persons/${id}`)}
            />
          </div>
        </>
      )}
    </div>
  )
}
