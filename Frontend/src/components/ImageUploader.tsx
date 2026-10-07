import { useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react'

interface ImageUploaderProps {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

// Click-to-upload or drag-and-drop photo box. Shows a preview with Replace / Remove.
export default function ImageUploader({ file, onChange, disabled = false }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  // Make a preview address for the chosen photo, and clean it up afterwards.
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Check the picked file, then pass it up to the page.
  const choose = (picked: File | undefined) => {
    if (!picked) return
    if (picked.type !== 'image/jpeg' && picked.type !== 'image/png') {
      setError('Invalid image. Please choose a JPG or PNG photo.')
      return
    }
    if (picked.size > MAX_SIZE) {
      setError('This image is larger than 10 MB. Please choose a smaller one.')
      return
    }
    setError('')
    onChange(picked)
  }

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!disabled) choose(event.dataTransfer.files[0])
  }

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          choose(event.target.files?.[0])
          event.target.value = '' // lets the user pick the same file again
        }}
      />

      {preview ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <img
            src={preview}
            alt="Selected photo preview"
            className="max-h-72 w-full rounded-lg bg-slate-100 object-contain"
          />
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button type="button" onClick={openPicker} disabled={disabled} className="btn btn-outline">
              <ImagePlus className="h-4 w-4" aria-hidden /> Replace photo
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="btn border border-red-200 bg-white text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={disabled}
          className={`flex min-h-[280px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:min-h-[320px] ${
            dragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
        >
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UploadCloud className="h-7 w-7" aria-hidden />
          </span>
          <span className="text-base font-semibold text-slate-900">Upload a clear face photo</span>
          <span className="mt-1 text-sm text-slate-600">Click to upload or drag and drop</span>
          <span className="mt-1 text-xs text-slate-500">JPG or PNG, up to 10 MB</span>
        </button>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
