import { AlertTriangle, WifiOff } from 'lucide-react'
import type { ApiError } from '../types'

export function ErrorBanner({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const Icon = error.kind === 'network' ? WifiOff : AlertTriangle
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 animate-fade-in"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-medium">{error.message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold underline underline-offset-2 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
