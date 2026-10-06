import type { ReactNode } from 'react'
import { Skeleton } from './LoadingSpinner'

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  hint?: string
  loading?: boolean
}

export function StatCard({ label, value, icon, hint, loading = false }: StatCardProps) {
  return (
    <div className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-lift">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-9 w-20" />
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight text-navy-900">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
    </div>
  )
}
