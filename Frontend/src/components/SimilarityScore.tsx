interface SimilarityScoreProps {
  value: number
  /** `ring` = circular score + progress bar, `compact` = ring only. */
  variant?: 'ring' | 'compact'
}

export type Confidence = 'high' | 'medium' | 'low'

export function confidenceOf(value: number): Confidence {
  if (value >= 85) return 'high'
  if (value >= 70) return 'medium'
  return 'low'
}

const TONE: Record<Confidence, { stroke: string; bar: string; badge: string; label: string }> = {
  high: {
    stroke: 'stroke-emerald-500',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    label: 'Potential Match',
  },
  medium: {
    stroke: 'stroke-blue-500',
    bar: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
    label: 'Potential Match',
  },
  low: {
    stroke: 'stroke-amber-500',
    bar: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    label: 'Possible Match',
  },
}

export function MatchBadge({ value }: { value: number }) {
  const tone = TONE[confidenceOf(value)]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tone.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.bar}`} aria-hidden />
      {tone.label}
    </span>
  )
}

export function SimilarityScore({ value, variant = 'ring' }: SimilarityScoreProps) {
  const tone = TONE[confidenceOf(value)]
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  const ring = (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="4" className="stroke-slate-200" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${tone.stroke} transition-[stroke-dashoffset] duration-700`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
        {value}%
      </span>
    </div>
  )

  if (variant === 'compact') return ring

  return (
    <div className="flex items-center gap-3" aria-label={`Similarity ${value} percent`}>
      {ring}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">Similarity</p>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${tone.bar} transition-[width] duration-700`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  )
}
