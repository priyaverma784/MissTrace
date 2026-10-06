import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { ImagePlus, Trash2, UploadCloud } from 'lucide-react'

interface ImageUploaderProps {
  preview: string | null
  fileName?: string
  error?: string | null
  disabled?: boolean
  onSelect: (file: File) => void
  onRemove: () => void
  /** Larger drop area for the main search card. */
  large?: boolean
}

export function ImageUploader({
  preview,
  fileName,
  error,
  disabled = false,
  onSelect,
  onRemove,
  large = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) onSelect(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
          e.target.value = '' // allow re-selecting the same file
        }}
      />

      {preview ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row">
          <img
            src={preview}
            alt="Selected photo preview"
            className={`rounded-lg object-cover shadow-sm ${large ? 'h-44 w-44' : 'h-28 w-28'}`}
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="truncate text-sm font-medium text-slate-800">{fileName ?? 'Selected photo'}</p>
            <p className="mt-0.5 text-xs text-slate-500">Photo ready</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                onClick={openPicker}
                disabled={disabled}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              >
                <ImagePlus className="h-4 w-4" aria-hidden /> Change
              </button>
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          aria-label="Upload a photo. Click or drag and drop an image."
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            large ? 'min-h-[240px] py-10' : 'min-h-[160px] py-8'
          } ${
            dragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-slate-50/60 hover:border-blue-400 hover:bg-blue-50/50'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <UploadCloud className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-slate-800">Click to upload or drag and drop</p>
          <p className="mt-1 text-xs text-slate-500">Supported formats: JPG, PNG (max 10 MB)</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
