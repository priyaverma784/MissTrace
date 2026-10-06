import { Check, Loader2 } from 'lucide-react'

const STAGES = [
  'Uploading photo',
  'Detecting face',
  'Analysing facial features',
  'Comparing records',
  'Preparing results',
] as const

interface ProcessingLoaderProps {
  stage: number
  preview: string | null
}

export function ProcessingLoader({ stage, preview }: ProcessingLoaderProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card sm:p-10">
      <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 sm:h-48 sm:w-48">
        {preview && <img src={preview} alt="" className="h-full w-full object-cover" />}
        {/* scanning line */}
        <div className="absolute inset-x-0 h-12 animate-scan bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent" />
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/50" />
      </div>

      <h2 className="mt-6 text-xl font-semibold text-slate-900">Searching records...</h2>
      <p className="mt-1 text-sm text-slate-500">This usually takes a few seconds. Please keep this page open.</p>

      <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left" aria-live="polite">
        {STAGES.map((label, i) => {
          const done = i < stage
          const active = i === stage
          return (
            <li
              key={label}
              className={`flex items-center gap-3 text-sm transition ${
                done ? 'text-slate-700' : active ? 'font-medium text-slate-900' : 'text-slate-400'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  done ? 'bg-emerald-500 text-white' : active ? 'text-blue-600' : 'bg-slate-100'
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
              </span>
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
