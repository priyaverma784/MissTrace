import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, Search } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Logo } from '../components/Logo'

const tab = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
    isActive ? 'text-blue-600' : 'text-slate-500'
  }`

export function UserLayout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div key={pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="hidden border-t border-slate-200 bg-white py-6 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 text-sm text-slate-500">
          <Logo />
          <p>AI results indicate potential matches and should be verified by authorized personnel.</p>
          <Link to="/" className="font-medium text-blue-600 hover:underline">
            Back to landing
          </Link>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Bottom"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavLink to="/user" end className={tab}>
          <Home className="h-5 w-5" aria-hidden /> Home
        </NavLink>
        <NavLink to="/user/search" className={tab}>
          <Search className="h-5 w-5" aria-hidden /> Search
        </NavLink>
      </nav>
    </div>
  )
}
