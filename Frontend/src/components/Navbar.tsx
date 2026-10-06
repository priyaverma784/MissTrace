import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ChevronDown, CircleHelp, Info, LogOut, Menu, Search, User, X } from 'lucide-react'
import { Logo } from './Logo'
import { InfoModal } from './InfoModal'
import type { InfoKind } from './InfoModal'
import { useAuth } from '../context/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-1 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
    isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
  }`

/** Public / user-panel top navigation. */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [info, setInfo] = useState<InfoKind | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const { signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const openInfo = (kind: InfoKind) => {
    setInfo(kind)
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const logout = () => {
    signOut()
    navigate('/')
  }

  const itemBtn =
    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/user" aria-label="MissTrace home" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <NavLink to="/user" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/user/search" className={linkClass}>
            Search
          </NavLink>
          <button type="button" onClick={() => openInfo('about')} className={linkClass({ isActive: false })}>
            About
          </button>
          <button type="button" onClick={() => openInfo('help')} className={linkClass({ isActive: false })}>
            Help
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-100 text-navy-700">
                <User className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-medium text-slate-700">User</span>
              <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
            </button>
            {profileOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-48 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-lift">
                <button type="button" role="menuitem" className={itemBtn} onClick={logout}>
                  <LogOut className="h-4 w-4" aria-hidden /> Back to home
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="animate-fade-in border-t border-slate-100 bg-white p-3 md:hidden" aria-label="Mobile">
          <Link to="/user/search" onClick={() => setMenuOpen(false)} className={itemBtn}>
            <Search className="h-4 w-4" aria-hidden /> Search
          </Link>
          <button type="button" className={itemBtn} onClick={() => openInfo('about')}>
            <Info className="h-4 w-4" aria-hidden /> About
          </button>
          <button type="button" className={itemBtn} onClick={() => openInfo('help')}>
            <CircleHelp className="h-4 w-4" aria-hidden /> Help
          </button>
          <button type="button" className={itemBtn} onClick={logout}>
            <LogOut className="h-4 w-4" aria-hidden /> Back to home
          </button>
        </nav>
      )}

      <InfoModal kind={info} onClose={() => setInfo(null)} />
    </header>
  )
}
