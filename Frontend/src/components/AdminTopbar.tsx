import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Menu, Search, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function AdminTopbar({ onMenu }: { onMenu: () => void }) {
  const [query, setQuery] = useState('')
  const [bellOpen, setBellOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { signOut } = useAuth()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (bellRef.current && !bellRef.current.contains(target)) setBellOpen(false)
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/admin/persons?q=${encodeURIComponent(q)}` : '/admin/persons')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-6 w-6" />
      </button>

      <form onSubmit={submit} role="search" className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search records..."
          aria-label="Search missing person records"
          className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-base placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 sm:text-sm"
        />
      </form>

      <div className="ml-auto flex items-center gap-1">
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={() => setBellOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Notifications"
            aria-expanded={bellOpen}
          >
            <Bell className="h-5 w-5" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] animate-fade-in rounded-xl border border-slate-200 bg-white p-4 text-center shadow-lift">
              <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" aria-hidden />
              <p className="mt-2 text-sm font-medium text-slate-700">You&apos;re all caught up</p>
              <p className="mt-0.5 text-xs text-slate-500">No new notifications.</p>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white">
              AD
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">Admin</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
          </button>
          {profileOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-48 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-lift">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  signOut()
                  navigate('/')
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <LogOut className="h-4 w-4" aria-hidden /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
