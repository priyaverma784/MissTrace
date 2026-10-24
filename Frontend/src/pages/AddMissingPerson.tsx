import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  FileImage,
  LoaderCircle,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'

export default function AddMissingPerson() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) return

    if (!photo) {
      setError('Please upload a photograph.')
      return
    }

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      if (age) formData.append('age', age)
      if (gender) formData.append('gender', gender)
      if (location.trim()) formData.append('last_seen_location', location.trim())
      if (date) formData.append('last_seen_date', date)
      formData.append('photo', photo)

      const token = localStorage.getItem('misstrace_token')

      const response = await axios.post(
        '/api/persons',
        formData,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        },
      )

      setSuccess(
        response.data?.message ?? 'Missing person added successfully.',
      )

      setName('')
      setAge('')
      setGender('')
      setLocation('')
      setDate('')
      setPhoto(null)

      const fileInput = document.getElementById(
        'person-photo',
      ) as HTMLInputElement | null

      if (fileInput) fileInput.value = ''

      window.setTimeout(() => {
        navigate('/search')
      }, 1500)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Unable to connect to the MissTrace server.')
        } else {
          const message =
            err.response.data?.error ??
            err.response.data?.message

          setError(
            typeof message === 'string'
              ? message
              : 'Unable to add this record. Please try again.',
          )
        }
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page-container py-8 sm:py-12">
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Search
      </Link>

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-800">
            <UserPlus className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Add Missing Person
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Add a missing-person record so MissTrace can compare its facial
            embedding against future search photographs.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-8"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800"
            >
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {success}
            </div>
          )}

          <div>
            <label
              htmlFor="person-name"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Full name <span className="text-red-500">*</span>
            </label>

            <input
              id="person-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={150}
              placeholder="Enter the person's full name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="person-age"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Age
              </label>

              <input
                id="person-age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="Enter age"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label
                htmlFor="person-gender"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Gender
              </label>

              <select
                id="person-gender"
                name="gender"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="person-location"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Last seen location
            </label>

            <input
              id="person-location"
              name="last_seen_location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={250}
              placeholder="City, area, or last known location"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label
              htmlFor="person-date"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Last seen date
            </label>

            <input
              id="person-date"
              name="last_seen_date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label
              htmlFor="person-photo"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Photograph <span className="text-red-500">*</span>
            </label>

            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-cyan-500">
              <div className="flex items-start gap-3">
                <FileImage
                  className="mt-1 h-6 w-6 shrink-0 text-cyan-700"
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <input
                    id="person-photo"
                    name="photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required={!photo}
                    onChange={(event) => {
                      const selectedFile = event.target.files?.[0] ?? null
                      setError('')

                      if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
                        setPhoto(null)
                        event.target.value = ''
                        setError('Please select an image smaller than 10 MB.')
                        return
                      }

                      setPhoto(selectedFile)
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-800"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Upload a clear, front-facing photo in JPG, PNG, or WebP
                    format. Maximum size: 10 MB.
                  </p>

                  {photo && (
                    <p className="mt-2 break-all text-sm font-medium text-cyan-800">
                      Selected: {photo.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
              aria-hidden="true"
            />
            <p>
              The backend checks the photograph for a detectable face before
              saving the record. Only submit information you are authorized
              to provide.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                Adding Record...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" aria-hidden="true" />
                Add Missing Person
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  )
}