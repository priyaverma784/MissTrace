import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  Heart,
  ScanFace,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'

const journey = [
  {
    number: '01',
    title: 'The Challenge',
    description:
      'Searching for a missing person can be difficult when information is scattered across records and photographs.',
  },
  {
    number: '02',
    title: 'The Technology',
    description:
      'MissTrace uses AI-assisted facial analysis to compare an uploaded photograph with available records.',
  },
  {
    number: '03',
    title: 'The Possibility',
    description:
      'The resulting candidates can help guide further investigation, provided every potential match is independently verified.',
  },
]

export default function About() {
  return (
    <main className="overflow-hidden bg-white text-slate-800">
      {/* Editorial introduction */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="page-container relative py-20 sm:py-28 lg:py-32">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
            The Story Behind MissTrace
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_0.7fr] lg:items-end">
            <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Every search
              <br />
              begins with
              <span className="text-cyan-400"> hope.</span>
            </h1>

            <div className="max-w-md lg:pb-2">
              <div className="mb-5 h-1 w-16 rounded-full bg-cyan-400" />

              <p className="text-base leading-8 text-slate-300 sm:text-lg">
                MissTrace explores how technology can support the search for
                missing people by making image-based record searches more
                accessible.
              </p>

              <a
                href="#our-approach"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white"
              >
                Discover our approach
                <ArrowDownRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-16 border-t border-white/15 pt-6 sm:mt-20">
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span>Technology with a human purpose</span>
              <span>AI-assisted missing-person search</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section id="our-approach" className="page-container py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
              Why MissTrace?
            </p>

            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-navy-950 sm:text-4xl">
              A difficult search deserves thoughtful technology.
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-lg leading-9 text-slate-700">
              Finding a missing person can involve reviewing photographs,
              examining available information, and investigating possible
              leads. MissTrace is designed to support one part of that
              process through AI-assisted facial comparison.
            </p>

            <p className="text-base leading-8 text-slate-500">
              The goal is not to replace investigators, official records, or
              human judgment. It is to help users examine potential matches
              more efficiently while recognizing the limitations of facial
              recognition technology.
            </p>

            <div className="grid gap-4 border-t border-slate-200 pt-7 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 shrink-0 text-cyan-700" />

                <div>
                  <h3 className="font-bold text-navy-950">
                    A clear purpose
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Support the search process by identifying records that
                    may deserve closer examination.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-cyan-700" />

                <div>
                  <h3 className="font-bold text-navy-950">
                    Responsible use
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Treat AI-generated similarities as leads, never as
                    confirmed identities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal journey */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="page-container py-20 sm:py-24">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Our Approach
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
                From a challenge to a practical tool.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-500">
              Three ideas shape the way MissTrace approaches
              missing-person searches.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            {journey.map((item, index) => (
              <article
                key={item.number}
                className={`border-t-2 border-slate-200 py-7 md:pr-8 ${
                  index !== 0 ? 'md:border-l md:pl-8' : ''
                }`}
              >
                <span className="text-sm font-extrabold tracking-[0.2em] text-cyan-700">
                  {item.number}
                </span>

                <h3 className="mt-5 text-2xl font-bold tracking-tight text-navy-950">
                  {item.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="page-container py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
              Our Principles
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-navy-950 sm:text-4xl">
              Technology matters.
              <br />
              People matter more.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              A potential facial match is only one piece of information.
              Responsible decisions require context, independent verification,
              and appropriate handling of personal information.
            </p>

            <Link
              to="/help"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-cyan-800 transition hover:text-blue-700"
            >
              Learn about responsible use
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-cyan-50 p-6 sm:translate-y-8">
              <Heart className="h-7 w-7 text-cyan-700" />

              <h3 className="mt-5 text-lg font-bold text-navy-950">
                Human-centered
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Designed around a meaningful problem and the people affected
                by it.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-6">
              <Users className="h-7 w-7 text-navy-950" />

              <h3 className="mt-5 text-lg font-bold text-navy-950">
                Human-verified
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                AI suggestions must be checked independently before any
                conclusion is reached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing mission */}
      <section className="bg-navy-950 text-white">
        <div className="page-container py-16 sm:py-20">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3 text-cyan-300">
                <ScanFace className="h-6 w-6" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  The MissTrace Mission
                </span>
              </div>

              <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Helping turn a photograph into a lead worth investigating.
              </h2>
            </div>

            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Explore MissTrace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}