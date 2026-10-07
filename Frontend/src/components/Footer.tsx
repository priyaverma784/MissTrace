import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  const linkClass = 'rounded text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="page-container grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-start md:gap-12">
        <div className="max-w-2xl">
          <Logo light />
          <p className="mt-3 text-sm">
            AI-assisted missing-person search for faster potential identification.
          </p>
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden />
            AI results indicate potential matches and should be verified by authorized personnel.
          </p>
        </div>

        <nav aria-label="Footer" className="flex gap-6 text-sm font-medium">
          <Link to="/" className={linkClass}>
            Home
          </Link>
          <Link to="/search" className={linkClass}>
            Search
          </Link>
          <Link to="/login" className={linkClass}>
            Login
          </Link>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <p className="page-container py-4 text-xs text-slate-500">
          © {new Date().getFullYear()} MissTrace. Because every missing person matters.
        </p>
      </div>
    </footer>
  )
}
