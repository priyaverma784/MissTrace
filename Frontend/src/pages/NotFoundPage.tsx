import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { buttonClasses } from '../components/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Compass className="h-8 w-8" aria-hidden />
      </div>
      <p className="mt-6 text-sm font-semibold text-blue-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-600">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className={`${buttonClasses('primary', 'lg')} mt-8`}>
        Back to MissTrace
      </Link>
    </div>
  )
}
