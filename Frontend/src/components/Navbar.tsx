import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LogOut, Menu, User, X } from 'lucide-react'
import Logo from './Logo'

interface MeResponse {
  name?: string
  user?: { name?: string }
}

// Menu links look the same on desktop; the active page is highlighted.
const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

// Bigger, easier-to-tap links for the phone menu.
const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[44px] items-center rounded-lg px-3 text-base font-medium ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-100'
  }`

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('misstrace_token')))
  const [name, setName] = useState('User')
  const [menuOpen, setMenuOpen] = useState(false)

  // Check the login state every time the page changes (after login or logout).
  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem('misstrace_token')))
    setMenuOpen(false)
  }, [location.pathname])

  // When logged in, ask the backend for the user's name. If it fails we just show "User".
  useEffect(() => {
    if (!loggedIn) return
    axios
      .get<MeResponse>('/api/auth/me')
      .then((res) => {
        const fullName = res.data.name ?? res.data.user?.name
        if (fullName) setName(fullName.split(' ')[0])
      })
      .catch(() => setName('User'))
  }, [loggedIn])

  const logout = () => {
    localStorage.removeItem('misstrace_token')
    setLoggedIn(false)
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop menu */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {!loggedIn && (
            <>
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <Link to="/#how-it-works" className={linkClass({ isActive: false })}>
                How It Works
              </Link>
            </>
          )}
          <NavLink to="/search" className={linkClass}>
            Find a Missing Person
          </NavLink>

          {loggedIn ? (
            <>
              <span className="ml-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4 text-slate-500" aria-hidden />
                <span className="max-w-[10rem] truncate">{name}</span>
              </span>
              <button type="button" onClick={logout} className="btn btn-outline ml-2 min-h-[40px]">
                <LogOut className="h-4 w-4" aria-hidden /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link to="/signup" className="btn btn-primary ml-2 min-h-[40px]">
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Phone / tablet menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Phone / tablet dropdown */}
      {menuOpen && (
        <nav aria-label="Mobile" className="border-t border-slate-100 bg-white lg:hidden">
          <div className="page-container flex flex-col gap-1 py-3">
            {!loggedIn && (
              <>
                <NavLink to="/" end className={mobileLinkClass}>
                  Home
                </NavLink>
                <Link to="/#how-it-works" className={mobileLinkClass({ isActive: false })}>
                  How It Works
                </Link>
              </>
            )}
            <NavLink to="/search" className={mobileLinkClass}>
              Find a Missing Person
            </NavLink>

            {loggedIn ? (
              <>
                <p className="flex min-h-[44px] items-center gap-2 px-3 text-base text-slate-500">
                  <User className="h-4 w-4" aria-hidden /> {name}
                </p>
                <button type="button" onClick={logout} className="btn btn-outline w-full">
                  <LogOut className="h-4 w-4" aria-hidden /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileLinkClass}>
                  Login
                </NavLink>
                <Link to="/signup" className="btn btn-primary mt-1 w-full">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
