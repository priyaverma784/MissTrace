import { Link } from 'react-router-dom'
import logoMark from '../assets/images/logo-mark.svg'

// Use light={true} on dark backgrounds (like the footer).
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="MissTrace home"
      className="inline-flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <img src={logoMark} alt="" className="h-9 w-9" />
      <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
        MissTrace
      </span>
    </Link>
  )
}
