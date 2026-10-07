import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

// Navbar at the top, the current page in the middle, Footer at the bottom.
export default function UserLayout() {
  const { pathname, hash } = useLocation()

  // Start each new page at the top (unless we are jumping to a section like #how-it-works).
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
