import { useState } from 'react'
import type { FormEvent } from 'react'
import { Save, UserPlus } from 'lucide-react'
import type { ApiError, PersonFormValues } from '../types'
import { useImageFile } from '../hooks/useImageFile'
import { todayInputDate } from '../utils/format'
import { Button } from './Button'
import { ErrorBanner } from './ErrorBanner'
import { ImageUploader } from './ImageUploader'
import { Input, Select } from './Input'

interface PersonFormProps {
  mode: 'create' | 'edit'
  initial?: PersonFormValues
  submitting: boolean
  error: ApiError | null
  onSubmit: (values: PersonFormValues, photo: File | null) => void | Promise<void>
  onCancel?: () => void
}

const EMPTY: PersonFormValues = {
  name: '',
  age: '',
  gender: '',
  lastSeenLocation: '',
  lastSeenDate: '',
}

const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

type FieldErrors = Partial<Record<keyof PersonFormValues | 'photo', string>>

export function PersonForm({ mode, initial, submitting, error, onSubmit, onCancel }: PersonFormProps) {
  const [values, setValues] = useState<PersonFormValues>(initial ?? EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const image = useImageFile()

  const set = <K extends keyof PersonFormValues>(key: K, value: PersonFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: FieldErrors = {}
    if (!values.name.trim()) next.name = 'Name is required.'
    const age = Number(values.age)
    if (!values.age.trim() || !Number.isInteger(age) || age < 0 || age > 120) {
      next.age = 'Enter a valid age between 0 and 120.'
    }
    if (!values.gender) next.gender = 'Please select a gender.'
    if (!values.lastSeenLocation.trim()) next.lastSeenLocation = 'Last seen location is required.'
    if (!values.lastSeenDate) next.lastSeenDate = 'Last seen date is required.'
    if (mode === 'create' && !image.file) next.photo = 'Photo is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting || !validate()) return
    void onSubmit(
      { ...values, name: values.name.trim(), lastSeenLocation: values.lastSeenLocation.trim() },
      image.file,
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <ErrorBanner error={error} />}

      <Input
        label="Full Name"
        required
        placeholder="Enter full name"
        value={values.name}
        error={errors.name}
        onChange={(e) => set('name', e.target.value)}
        disabled={submitting}
        autoComplete="off"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Age"
          required
          type="number"
          inputMode="numeric"
          min={0}
          max={120}
          placeholder="Enter age"
          value={values.age}
          error={errors.age}
          onChange={(e) => set('age', e.target.value)}
          disabled={submitting}
        />
        <Select
          label="Gender"
          required
          placeholder="Select gender"
          options={GENDERS}
          value={values.gender}
          error={errors.gender}
          onChange={(e) => set('gender', e.target.value)}
          disabled={submitting}
        />
      </div>

      <Input
        label="Last Seen Location"
        required
        placeholder="Enter location"
        value={values.lastSeenLocation}
        error={errors.lastSeenLocation}
        onChange={(e) => set('lastSeenLocation', e.target.value)}
        disabled={submitting}
      />

      <Input
        label="Last Seen Date"
        required
        type="date"
        max={todayInputDate()}
        value={values.lastSeenDate}
        error={errors.lastSeenDate}
        onChange={(e) => set('lastSeenDate', e.target.value)}
        disabled={submitting}
      />

      {mode === 'create' && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">
            Photo<span className="ml-0.5 text-red-500">*</span>
          </p>
          <ImageUploader
            preview={image.preview}
            fileName={image.file?.name}
            error={image.error ?? errors.photo}
            disabled={submitting}
            onSelect={(f) => {
              image.select(f)
              setErrors((e) => ({ ...e, photo: undefined }))
            }}
            onRemove={image.clear}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Use a clear, front-facing photo with one visible face for the best AI matching.
          </p>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        {mode === 'create' ? (
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Registering..."
            icon={<UserPlus className="h-4 w-4" aria-hidden />}
          >
            Register Missing Person
          </Button>
        ) : (
          <Button
            type="submit"
            size="lg"
            loading={submitting}
            loadingText="Updating..."
            icon={<Save className="h-4 w-4" aria-hidden />}
          >
            Save Changes
          </Button>
        )}
      </div>
    </form>
  )
}
