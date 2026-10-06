import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AdminTopbar } from '../components/AdminTopbar'
import { ADMIN_NAV, Sidebar } from '../components/Sidebar'

const tab = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
    isActive ? 'text-blue-600' : 'text-slate-500'
  }`

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const bottomItems = ADMIN_NAV.slice(0, 4)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-64">
        <AdminTopbar onMenu={() => setOpen(true)} />
        <main className="px-4 py-6 pb-24 sm:px-6 lg:pb-8">
          <div key={pathname} className="mx-auto max-w-6xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Bottom"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {bottomItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={tab}>
            <Icon className="h-5 w-5" aria-hidden />
            {label === 'Missing Persons' ? 'Persons' : label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
