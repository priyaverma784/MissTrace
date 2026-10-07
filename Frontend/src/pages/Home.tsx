import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowRight,
  Database,
  FileSearch,
  Gauge,
  GitCompareArrows,
  ListChecks,
  MapPin,
  ScanFace,
  ShieldCheck,
  Upload,
  Zap,
} from 'lucide-react'
import HeroGlobe from '../components/HeroGlobe'
import FaceScan from '../components/FaceScan'

const steps = [
  { icon: Upload, title: 'Upload Photo', text: 'Upload a clear photo of the person you are searching for.' },
  { icon: ScanFace, title: 'AI Face Analysis', text: 'MissTrace detects the face and prepares it for comparison.' },
  { icon: GitCompareArrows, title: 'Compare Records', text: 'The face is compared with the stored missing-person records.' },
  { icon: FileSearch, title: 'Potential Match', text: 'The most similar records are shown with a similarity score.' },
]

const features = [
  { icon: ScanFace, title: 'AI Face Matching', text: 'Compares faces to find records that look similar.' },
  { icon: Zap, title: 'Fast Search', text: 'Search the whole database in a few seconds.' },
  { icon: Database, title: 'Missing Person Records', text: 'Organised records with photos and key details.' },
  { icon: Gauge, title: 'Similarity Score', text: 'Every potential match comes with a clear score.' },
  { icon: MapPin, title: 'Location Information', text: 'See where and when each person was last seen.' },
  { icon: ListChecks, title: 'Simple Search Process', text: 'Upload a photo, press search, review the results.' },
]

export default function Home() {
  const { hash, key } = useLocation()

  // Links like /#how-it-works scroll to that section.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash, key])

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        {/* Globe in the background, fading out towards the text */}
        <div className="pointer-events-none absolute inset-0 opacity-70 sm:opacity-100" aria-hidden>
          <div className="absolute -right-24 top-1/2 h-[520px] w-[520px] -translate-y-1/2 sm:right-0 lg:h-[680px] lg:w-[680px]">
            <HeroGlobe />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-transparent" aria-hidden />

        <div className="page-container relative grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0 animate-fade-up">
            <span className="inline-block rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
              AI-Powered Missing Person Identification
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Find. Identify.
              <br />
              <span className="text-cyan-300">Reconnect.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              MissTrace uses AI-powered facial recognition to help identify potential matches for missing persons
              and make the search process faster and more organized.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/search" className="btn btn-primary btn-lg">
                Find a Missing Person <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link to="/#how-it-works" className="btn btn-light btn-lg">
                Learn How It Works
              </Link>
            </div>
          </div>

          {/* Face-analysis picture, shown on large screens */}
          <div className="hidden justify-center lg:flex">
            <FaceScan />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-12 sm:py-16">
        <div className="page-container">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">How MissTrace Works</h2>
          <p className="mt-2 max-w-2xl text-slate-600">Four simple steps from a photo to a list of potential matches.</p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <span className="text-sm font-bold text-slate-300">0{index + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
                {index < steps.length - 1 && (
                  <ArrowRight
                    className="absolute -right-6 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 lg:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-12 sm:py-16">
        <div className="page-container">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">Features</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">{title}</h3>
                  <p className="mt-0.5 text-sm text-slate-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section className="bg-white py-12 sm:py-16">
        <div className="page-container">
          <div className="flex flex-col gap-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck className="h-7 w-7" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-navy-900">Trust &amp; Safety</h2>
              <p className="mt-1 text-slate-700">
                AI results indicate potential matches and should be verified by authorized personnel.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                A similarity score is a guide for further checking. It is never proof of identity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
