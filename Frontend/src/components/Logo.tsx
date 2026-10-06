import { MapPin } from 'lucide-react'

export function Logo({ dark = false, size = 'md' }: { dark?: boolean; size?: 'md' | 'lg' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex items-center justify-center rounded-lg bg-blue-600 text-white ${size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'}`}
      >
        <MapPin className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} aria-hidden />
      </span>
      <span
        className={`font-bold tracking-tight ${size === 'lg' ? 'text-2xl' : 'text-xl'} ${dark ? 'text-white' : 'text-navy-900'}`}
      >
        MissTrace
      </span>
    </span>
  )
}
