import { Lock, Sparkles } from 'lucide-react'
import { useImageFile } from '../hooks/useImageFile'
import { useSearch } from '../context/SearchContext'
import { Button } from './Button'
import { ErrorBanner } from './ErrorBanner'
import { ImageUploader } from './ImageUploader'
import { ProcessingLoader } from './ProcessingLoader'
import { SearchStepper } from './SearchStepper'

/** Maps the processing stage (0-4) to the 4-step header (0-3). */
export function stepperIndex(status: string, stage: number): number {
  if (status === 'done') return 3
  if (status !== 'searching') return 0
  if (stage <= 0) return 0
  if (stage <= 2) return 1
  return 2
}

interface SearchPanelProps {
  /** Called after a successful search. */
  onSuccess?: () => void
  title?: string
  subtitle?: string
}

/** Shared upload → processing flow used by both the user and admin search pages. */
export function SearchPanel({ onSuccess, title, subtitle }: SearchPanelProps) {
  const image = useImageFile()
  const { status, stage, error, queryPreview, run } = useSearch()
  const searching = status === 'searching'

  const submit = async () => {
    if (!image.file) {
      image.setError('Please choose a photo first.')
      return
    }
    const ok = await run(image.file)
    if (ok) onSuccess?.()
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      {(title || subtitle) && (
        <div className="mb-6 text-center">
          {title && <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>}
          {subtitle && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 sm:text-base">{subtitle}</p>}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-card sm:px-6">
        <SearchStepper current={stepperIndex(status, stage)} />
      </div>

      {searching ? (
        <ProcessingLoader stage={stage} preview={queryPreview} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
          {error && (
            <div className="mb-4">
              <ErrorBanner error={error} />
            </div>
          )}
          <ImageUploader
            large
            preview={image.preview}
            fileName={image.file?.name}
            error={image.error}
            onSelect={image.select}
            onRemove={image.clear}
          />
          <Button
            size="lg"
            fullWidth
            className="mt-5"
            onClick={submit}
            disabled={!image.file}
            icon={<Sparkles className="h-4 w-4" aria-hidden />}
          >
            Search with AI
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Your photo is only used to compare against existing records.
          </p>
        </div>
      )}
    </section>
  )
}
