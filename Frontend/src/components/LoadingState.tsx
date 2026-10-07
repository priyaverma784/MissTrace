import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

const steps = ['Upload', 'Analyze', 'Compare', 'Results']

// Shown while the photo is being searched.
export default function LoadingState() {
  const [current, setCurrent] = useState(0)

  // The server does everything in one request, so we only move the first steps
  // along to show progress. The page changes to Results when the server replies.
  useEffect(() => {
    const first = window.setTimeout(() => setCurrent(1), 1000)
    const second = window.setTimeout(() => setCurrent(2), 2500)
    return () => {
      window.clearTimeout(first)
      window.clearTimeout(second)
    }
  }, [])

  return (
    <div
      role="status"
      className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card sm:p-10"
    >
      <ol className="mx-auto flex max-w-xl items-start">
        {steps.map((label, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={label} className="relative flex flex-1 flex-col items-center">
              {index > 0 && (
                <span
                  aria-hidden
                  className={`absolute right-1/2 top-4 h-0.5 w-full ${index <= current ? 'bg-blue-600' : 'bg-slate-200'}`}
                />
              )}
              <span
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                  done || active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : `0${index + 1}`}
              </span>
              <span
                className={`mt-2 text-xs font-medium sm:text-sm ${done || active ? 'text-slate-900' : 'text-slate-400'}`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>

      <Loader2 className="mx-auto mt-8 h-9 w-9 animate-spin text-blue-600" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">Searching for potential matches...</h2>
      <p className="mt-1 text-sm text-slate-500">This can take a few seconds. Please keep this page open.</p>
    </div>
  )
}
