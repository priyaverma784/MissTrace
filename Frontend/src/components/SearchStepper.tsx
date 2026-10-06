import { Check } from 'lucide-react'

const STEPS = ['Upload', 'AI Analysis', 'Matching', 'Results'] as const

/** `current` is 0-based index of the active step (0..3). */
export function SearchStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-start justify-between" aria-label="Search progress">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {index > 0 && (
              <span
                aria-hidden
                className={`absolute right-1/2 top-4 h-0.5 w-full ${index <= current ? 'bg-blue-600' : 'bg-slate-200'}`}
              />
            )}
            <span
              aria-current={active ? 'step' : undefined}
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ring-4 ring-white transition ${
                done
                  ? 'bg-blue-600 text-white'
                  : active
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </span>
            <span
              className={`mt-2 text-xs font-medium sm:text-sm ${active || done ? 'text-slate-900' : 'text-slate-400'}`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
