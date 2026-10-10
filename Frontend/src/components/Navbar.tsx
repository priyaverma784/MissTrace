
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { MapPin, Menu, X, ArrowUpRight } from 'lucide-react'

const navItems = [
  { label: 'Home', to: '/', end: true },
  { label: 'About', to: '/#about', end: false },
  { label: 'Features', to: '/#features', end: false },
  { label: 'Find Missing Person', to: '/search', end: false },
  { label: 'Help', to: '/#help', end: false },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setMenuOpen(false)

  const isCurrent = (to: string, end?: boolean) => {
    if (to.startsWith('/#')) {
      return location.pathname === '/' && location.hash === to.slice(1)
    }

    return end
      ? location.pathname === to
      : to === '/search'
        ? location.pathname.startsWith('/search')
        : false
  }

  const linkClass = (active: boolean) =>
    `whitespace-nowrap px-1.5 py-2 text-[16px] tracking-[-0.2px] transition-colors duration-200 ${
      active ? 'text-cyan-300' : 'text-slate-300 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#061329]/95 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
      <div className="mx-auto grid h-[76px] w-full max-w-[1600px] grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        {/* MissTrace brand */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="MissTrace home"
          className="group flex w-fit shrink-0 items-center gap-3"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_22px_rgba(37,99,235,0.22)] transition group-hover:shadow-[0_0_28px_rgba(34,211,238,0.22)]">
            <MapPin className="h-[22px] w-[22px] text-white" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#061329] bg-cyan-300" />
          </span>
          <span className="flex flex-col">
            <span className="font-['Inter',sans-serif] text-[22px] font-extrabold leading-none tracking-[-0.8px] text-white sm:text-2xl">
              Miss<span className="text-cyan-300">Trace</span>
            </span>
            <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[2px] text-slate-400 sm:block">
              Find hope. Reconnect.
            </span>
          </span>
        </Link>

        {/* Larger center navigation */}
        <nav
          aria-label="Main navigation"
          className="ml-[-28px] hidden items-center justify-center gap-5 lg:flex xl:gap-7"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={linkClass(isCurrent(item.to, item.end))}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Login and signup */}
        <div className="hidden shrink-0 items-center justify-end gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-lg border border-blue-400/40 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/70 hover:text-white"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
          >
            Sign Up
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-white transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#07162d] px-5 pb-5 pt-3 shadow-2xl lg:hidden sm:px-8">
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-w-xl flex-col gap-1"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                onClick={closeMenu}
                className={() =>
                  `${linkClass(isCurrent(item.to, item.end))} flex min-h-12 items-center px-3 text-base`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <Link
                to="/login"
                onClick={closeMenu}
                className="flex min-h-11 items-center justify-center rounded-lg border border-blue-400/40 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/70"
              >
                Login
              </Link>

              <Link
                to="/signup"
                onClick={closeMenu}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Sign Up
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[1.8px] text-slate-500">
              Find hope. Reconnect.
            </p>
          </nav>
        </div>
      )}
    </header>
  )
}
