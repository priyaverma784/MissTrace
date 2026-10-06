import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addMissingPerson } from '../../api/personApi'
import { PersonForm } from '../../components/PersonForm'
import { useToast } from '../../context/ToastContext'
import type { ApiError, PersonFormValues } from '../../types'

export function AddPersonPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const handleSubmit = async (values: PersonFormValues, photo: File | null) => {
    if (!photo || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await addMissingPerson({
        name: values.name,
        age: Number(values.age),
        gender: values.gender,
        last_seen_location: values.lastSeenLocation,
        last_seen_date: values.lastSeenDate,
        photo,
      })
      toast.success('Missing person registered successfully.')
      navigate('/admin/persons')
    } catch (err) {
      setError(err as ApiError)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-navy-900">Add Missing Person</h1>
      <p className="mt-1 text-sm text-slate-500">Fill in the details below to register a new missing person.</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
        <PersonForm mode="create" submitting={submitting} error={error} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
