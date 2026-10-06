import { lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Database,
  FileSearch,
  Gauge,
  GitCompareArrows,
  LayoutDashboard,
  MapPin,
  ScanFace,
  ShieldCheck,
  Smartphone,
  Upload,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { FaceScan } from '../components/landing/FaceScan'
import { useAuth } from '../context/AuthContext'

const GlobeScene = lazy(() => import('../components/landing/GlobeScene'))

const STEPS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: Upload, title: 'Upload Photo', text: 'Upload a clear photo of the person.' },
  { icon: ScanFace, title: 'AI Face Analysis', text: 'The face is detected and analysed securely.' },
  { icon: GitCompareArrows, title: 'Compare Records', text: 'It is compared against stored missing-person records.' },
  { icon: FileSearch, title: 'Potential Matches', text: 'The most similar records are shown for review.' },
]

const FEATURES: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: ScanFace, title: 'AI Face Matching', text: 'Face comparison to surface similar records.' },
  { icon: Database, title: 'Missing Person Database', text: 'Organised records with photos and details.' },
  { icon: MapPin, title: 'Location Information', text: 'Last seen location and date at a glance.' },
  { icon: Gauge, title: 'Similarity Score', text: 'Every potential match comes with a score.' },
  { icon: Zap, title: 'Fast Search', text: 'Search the whole database in seconds.' },
  { icon: LayoutDashboard, title: 'Admin Management', text: 'Add, edit and remove records securely.' },
  { icon: Smartphone, title: 'Responsive Interface', text: 'Works on phones, tablets and desktops.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const goUser = () => {
    signIn('user')
    navigate('/user')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-70 sm:opacity-100" aria-hidden>
          <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 sm:right-0 lg:h-[680px] lg:w-[680px]">
            <Suspense fallback={null}>
              <GlobeScene />
            </Suspense>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-transparent" aria-hidden />

        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Logo dark />
          <Button variant="dark-outline" size="sm" onClick={goUser}>
            Start a Search
          </Button>
        </header>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:grid-cols-2 lg:px-8 lg:pb-28 lg:pt-14">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> AI-Powered Missing Person Identification
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find. Identify.
              <br />
              Reconnect.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              MissTrace uses AI-powered facial recognition to help identify potential matches for
              missing persons and make the search process faster and more organized.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={goUser} icon={<ArrowRight className="h-4 w-4" aria-hidden />}>
                Find a Missing Person
              </Button>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <FaceScan />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-bold text-navy-900 sm:text-3xl">
          How MissTrace Works
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <span className="absolute right-4 top-4 text-sm font-bold text-slate-300">0{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="features-heading" className="text-2xl font-bold text-navy-900 sm:text-3xl">
            Key Features
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="trust-heading">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 id="trust-heading" className="text-lg font-semibold text-navy-900">
              Safety &amp; Trust
            </h2>
            <p className="mt-1 text-sm text-slate-700 sm:text-base">
              AI results indicate potential matches and should be verified by authorized personnel.
              Facial recognition is a tool to assist a search — it does not prove anyone&apos;s identity.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <Logo />
          <p>Because every missing person matters.</p>
        </div>
      </footer>
    </div>
  )
}
