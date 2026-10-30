import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
} from 'lucide-react'

type ReportType = 'missing' | 'found'

interface ReportForm {
  name: string
  age: string
  gender: string
  location: string
  date: string
  time: string
  clothing_description: string
  identifying_marks: string
  reporter_name: string
  reporter_relationship: string
  reporter_contact: string
  authority_name: string
  case_reference: string
  additional_notes: string
}

const initialForm: ReportForm = {
  name: '',
  age: '',
  gender: '',
  location: '',
  date: '',
  time: '',
  clothing_description: '',
  identifying_marks: '',
  reporter_name: '',
  reporter_relationship: '',
  reporter_contact: '',
  authority_name: '',
  case_reference: '',
  additional_notes: '',
}

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-[#0a1b33] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400'

const labelClass = 'text-sm font-medium text-slate-300'

export default function AddMissingPerson() {
  const navigate = useNavigate()

  const [reportType, setReportType] = useState<ReportType | null>(null)
  const [form, setForm] = useState<ReportForm>(initialForm)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    setError('')

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoPreview('')

    if (!file) {
      setPhoto(null)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setPhoto(null)
      event.target.value = ''
      setError('Please upload a JPG, PNG, or WEBP image.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhoto(null)
      event.target.value = ''
      setError('The photo must be smaller than 5 MB.')
      return
    }

    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function selectReportType(type: ReportType | null) {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setReportType(type)
    setForm(initialForm)
    setPhoto(null)
    setPhotoPreview('')
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    const token = localStorage.getItem('misstrace_token')

    if (!token) {
      navigate('/login', { state: { from: '/add-person' } })
      return
    }

    if (!reportType) {
      setError('Please select a report type.')
      return
    }

    if (!photo) {
      setError('Please upload a photograph of the person.')
      return
    }

    if (!form.name.trim()) {
      setError('Please enter the person’s name, or enter "Unknown" if not known.')
      return
    }

    if (!form.location.trim()) {
      setError(
        reportType === 'missing'
          ? 'Please enter the last-known location.'
          : 'Please enter the location where the person was found.',
      )
      return
    }

    if (!form.date) {
      setError(
        reportType === 'missing'
          ? 'Please select the date the person was last seen.'
          : 'Please select the date the person was found.',
      )
      return
    }

    if (form.date > new Date().toLocaleDateString('en-CA')) {
      setError('The report date cannot be in the future.')
      return
    }

    if (form.age) {
      const age = Number(form.age)

      if (!Number.isInteger(age) || age < 0 || age > 150) {
        setError('Age must be a whole number between 0 and 150.')
        return
      }
    }

    if (reportType === 'missing' && !form.reporter_contact.trim()) {
      setError('Please enter your contact information.')
      return
    }

    const payload = new FormData()

    payload.append('name', form.name.trim())

    if (form.age) {
      payload.append('age', form.age)
    }

    if (form.gender) {
      payload.append('gender', form.gender)
    }

    payload.append(
      reportType === 'missing' ? 'last_seen_location' : 'found_location',
      form.location.trim(),
    )

    payload.append(
      reportType === 'missing' ? 'last_seen_date' : 'found_date',
      form.date,
    )

    if (form.time) {
      payload.append(
        reportType === 'missing' ? 'last_seen_time' : 'found_time',
        form.time,
      )
    }

    payload.append(
      'clothing_description',
      form.clothing_description.trim(),
    )

    payload.append(
      'identifying_marks',
      form.identifying_marks.trim(),
    )

    if (form.reporter_name.trim()) {
      payload.append('reporter_name', form.reporter_name.trim())
    }

    if (form.reporter_contact.trim()) {
      payload.append('reporter_contact', form.reporter_contact.trim())
    }

    payload.append('photo', photo)

    if (reportType === 'missing') {
      if (form.reporter_relationship.trim()) {
        payload.append(
          'reporter_relationship',
          form.reporter_relationship.trim(),
        )
      }
    } else {
      if (form.authority_name.trim()) {
        payload.append('authority_name', form.authority_name.trim())
      }

      if (form.case_reference.trim()) {
        payload.append('case_reference', form.case_reference.trim())
      }

      if (form.additional_notes.trim()) {
        payload.append('additional_notes', form.additional_notes.trim())
      }
    }

    const endpoint =
      reportType === 'missing'
        ? '/api/persons'
        : '/api/found-persons'

    setLoading(true)

     
      try {
      const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
     payload,
     {
       headers: {
        Authorization: `Bearer ${token}`,
       },
     },
    )


      setSuccess(
        response.data?.message ||
          (reportType === 'missing'
            ? 'Missing-person report submitted successfully. It is awaiting review.'
            : 'Found-person report submitted successfully. It is awaiting review.'),
      )

      setForm(initialForm)
      setPhoto(null)

      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }

      setPhotoPreview('')

      const fileInput = document.getElementById(
        'person-photo',
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.value = ''
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem('misstrace_token')
          navigate('/login', { state: { from: '/add-person' } })
          return
        }

        // UPDATED: also show the backend "details" message (debug mode only)
        const serverError =
          err.response?.data?.error ||
          'The report could not be submitted. Please try again.'
        const serverDetails = err.response?.data?.details

        setError(
          serverDetails ? `${serverError} — ${serverDetails}` : serverError,
        )
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#061329] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/search"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={17} />
          Back to search
        </Link>

        <header className="mb-9">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-300">
            <ShieldCheck size={18} />
            MissTrace Reporting Centre
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Person Reporting Centre
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Report a missing person or someone you have found. Every
            submission is reviewed before it is used for potential matching.
          </p>
        </header>

        {!reportType ? (
          <section>
            <h2 className="mb-5 text-lg font-semibold">
              What would you like to report?
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <button
                type="button"
                onClick={() => selectReportType('missing')}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-cyan-300/50 hover:bg-cyan-400/[0.04] sm:p-8"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Users size={29} />
                </div>

                <h3 className="text-xl font-semibold">
                  Report a Missing Person
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Report someone who has not been found yet. Provide their
                  last-known details to help identify possible matches.
                </p>

                <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                  Start missing-person report
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => selectReportType('found')}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left transition hover:border-emerald-300/50 hover:bg-emerald-400/[0.04] sm:p-8"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <ShieldCheck size={29} />
                </div>

                <h3 className="text-xl font-semibold">
                  Report a Found Person
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Found someone who may be missing? Submit their details
                  to help their family reconnect with them. Any registered
                  user can submit a report.
                </p>

                <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  Start found-person report
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </button>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-300"
              />
              <p className="text-sm leading-6 text-slate-400">
                Please provide accurate information. Reports are reviewed
                before matching, and a potential face match alone does not
                confirm a person's identity.
              </p>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-8">
            <button
              type="button"
              onClick={() =>
                selectReportType(reportType === 'missing' ? 'found' : 'missing')
              }
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
            >
              <ArrowLeft size={16} />
              Change report type
            </button>

            <div className="mb-8 flex items-start gap-4">
              <div
                className={`rounded-xl p-3 ${
                  reportType === 'missing'
                    ? 'bg-cyan-400/10 text-cyan-300'
                    : 'bg-emerald-400/10 text-emerald-300'
                }`}
              >
                {reportType === 'missing' ? (
                  <Users size={25} />
                ) : (
                  <ShieldCheck size={25} />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {reportType === 'missing'
                    ? 'Missing-Person Report'
                    : 'Found-Person Report'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {reportType === 'missing'
                    ? "Enter the person's last-known details."
                    : 'Enter the details of the person you found. You do not need to be a police officer to submit this report.'}
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
              >
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <UserRound size={18} className="text-cyan-300" />
                  Person's Information
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    Full name
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="Enter name or Unknown"
                      required
                    />
                  </label>

                  <label className={labelClass}>
                    Age
                    <input
                      name="age"
                      type="number"
                      min="0"
                      max="150"
                      value={form.age}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="Approximate age"
                    />
                  </label>

                  <label className={labelClass}>
                    Gender
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={updateField}
                      className={inputClass}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </label>

                  <div>
                    <label htmlFor="person-photo" className={labelClass}>
                      Photograph
                    </label>

                    <label
                      htmlFor="person-photo"
                      className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 bg-[#0a1b33] p-4 transition hover:border-cyan-300/50"
                    >
                      <Upload size={21} className="shrink-0 text-cyan-300" />

                      <span className="min-w-0">
                        <span className="block truncate text-sm text-slate-200">
                          {photo ? photo.name : 'Choose a photograph'}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          JPG, PNG or WEBP · Maximum 5 MB
                        </span>
                      </span>
                    </label>

                    <input
                      id="person-photo"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />

                    {photoPreview && (
                      <img
                        src={photoPreview}
                        alt="Selected person"
                        className="mt-4 h-40 w-40 rounded-xl border border-white/10 object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <MapPin size={18} className="text-cyan-300" />
                  {reportType === 'missing'
                    ? 'Last-Seen Information'
                    : 'Found Location Information'}
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className={`${labelClass} sm:col-span-2`}>
                    {reportType === 'missing'
                      ? 'Last-known location'
                      : 'Location where the person was found'}

                    <input
                      name="location"
                      value={form.location}
                      onChange={updateField}
                      className={inputClass}
                      placeholder="Area, city, or address"
                      required
                    />
                  </label>

                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      {reportType === 'missing' ? 'Last seen on' : 'Found on'}
                    </span>

                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={updateField}
                      max={new Date().toLocaleDateString('en-CA')}
                      className={inputClass}
                      required
                    />
                  </label>

                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      <Clock size={15} />
                      {reportType === 'missing' ? 'Last seen at' : 'Found at'}
                    </span>

                    <input
                      name="time"
                      type="time"
                      value={form.time}
                      onChange={updateField}
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-semibold">
                  Physical Description
                </h3>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className={labelClass}>
                    Clothing description
                    <textarea
                      name="clothing_description"
                      value={form.clothing_description}
                      onChange={updateField}
                      className={`${inputClass} min-h-28 resize-y`}
                      placeholder="Describe clothing, colours, and accessories"
                    />
                  </label>

                  <label className={labelClass}>
                    Identifying marks
                    <textarea
                      name="identifying_marks"
                      value={form.identifying_marks}
                      onChange={updateField}
                      className={`${inputClass} min-h-28 resize-y`}
                      placeholder="Scars, birthmarks, tattoos, or other identifying details"
                    />
                  </label>
                </div>
              </div>

              {reportType === 'missing' ? (
                <div>
                  <h3 className="mb-4 font-semibold">
                    Reporter Information
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>
                      Your name
                      <input
                        name="reporter_name"
                        value={form.reporter_name}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </label>

                    <label className={labelClass}>
                      Relationship to the person
                      <select
                        name="reporter_relationship"
                        value={form.reporter_relationship}
                        onChange={updateField}
                        className={inputClass}
                      >
                        <option value="">Select relationship</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Relative">Other relative</option>
                        <option value="Friend">Friend</option>
                        <option value="Police">Police personnel</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Contact information
                      <input
                        name="reporter_contact"
                        type="text"
                        value={form.reporter_contact}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Phone number or other contact information"
                        required
                      />
                      <span className="mt-2 block text-xs leading-5 text-slate-500">
                        Your contact information must not be exposed in
                        public search results.
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Users size={18} className="text-emerald-300" />
                    Your Information
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className={labelClass}>
                      Your name
                      <input
                        name="reporter_name"
                        value={form.reporter_name}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </label>

                    <label className={labelClass}>
                      Contact information
                      <input
                        name="reporter_contact"
                        value={form.reporter_contact}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Phone number or email (optional)"
                      />
                    </label>

                    <label className={labelClass}>
                      Police station or organization (optional)
                      <input
                        name="authority_name"
                        value={form.authority_name}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="If applicable"
                      />
                    </label>

                    <label className={labelClass}>
                      Case reference (optional)
                      <input
                        name="case_reference"
                        value={form.case_reference}
                        onChange={updateField}
                        className={inputClass}
                        placeholder="Official reference, if available"
                      />
                    </label>

                    <label className={`${labelClass} sm:col-span-2`}>
                      Additional notes
                      <textarea
                        name="additional_notes"
                        value={form.additional_notes}
                        onChange={updateField}
                        className={`${inputClass} min-h-28 resize-y`}
                        placeholder="Other useful details about where or how the person was found"
                      />
                    </label>
                  </div>

                  <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] p-4 text-sm leading-6 text-slate-400">
                    Anyone with a registered MissTrace account can submit a
                    found-person report. Reports remain pending until reviewed.
                    Keep contact information private and contact local
                    authorities if someone may be in danger.
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => selectReportType(reportType)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                >
                  Clear form
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#061329] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    reportType === 'missing'
                      ? 'bg-cyan-400 hover:bg-cyan-300'
                      : 'bg-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  {loading ? 'Submitting report...' : 'Submit report'}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Submission does not confirm identity or recovery. Reports must
                be reviewed, and potential matches must be independently
                verified.
              </p>
            </form>
          </section>
        )}

        <footer className="mt-8 flex items-start gap-3 text-xs leading-5 text-slate-500">
          <FileText size={17} className="mt-0.5 shrink-0" />
          <p>
            MissTrace supports community missing-person reporting and
            potential-match discovery. It does not replace official
            procedures or identity verification.
          </p>
        </footer>
      </div>
    </main>
  )
}