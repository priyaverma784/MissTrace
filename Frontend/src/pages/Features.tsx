import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  FileImage,
  Fingerprint,
  Gauge,
  Image as ImageIcon,
  ScanFace,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    id: 'upload',
    number: '01',
    label: 'Image Upload',
    title: 'Start with a photograph.',
    description:
      'Provide a suitable photograph to begin the search process. A clear, front-facing image can help the system detect facial information.',
    icon: FileImage,
    bullets: [
      'Select an image from your device.',
      'Use a clear, well-lit photograph.',
      'Submit the image through the search form.',
    ],
    metric: 'IMAGE INPUT',
    display: 'Photograph',
  },
  {
    id: 'analysis',
    number: '02',
    label: 'Facial Analysis',
    title: 'Analyze facial information.',
    description:
      'The backend uses facial analysis to detect a face and generate a representation that can be used for comparison with available records.',
    icon: ScanFace,
    bullets: [
      'Detect facial information in the image.',
      'Generate a facial representation.',
      'Continue when processing succeeds.',
    ],
    metric: 'PROCESSING',
    display: 'Face Analysis',
  },
  {
    id: 'comparison',
    number: '03',
    label: 'Face Comparison',
    title: 'Compare available records.',
    description:
      'Facial representations can be compared to estimate similarity between the submitted photograph and records available to the system.',
    icon: Fingerprint,
    bullets: [
      'Compare against accessible records.',
      'Calculate similarity using the matching workflow.',
      'Remember that similarity is not identity.',
    ],
    metric: 'COMPARISON',
    display: 'Similarity Analysis',
  },
  {
    id: 'results',
    number: '04',
    label: 'Search Results',
    title: 'Review potential matches.',
    description:
      'Examine the records returned by the search. Results may help identify candidates for further investigation but do not establish identity.',
    icon: Search,
    bullets: [
      'Review returned candidate records.',
      'Examine available person information.',
      'Arrange independent verification.',
    ],
    metric: 'OUTPUT',
    display: 'Potential Matches',
  },
]

export default function Features() {
  const [activeId, setActiveId] = useState('analysis')

  const activeFeature =
    features.find((feature) => feature.id === activeId) ?? features[1]

  const ActiveIcon = activeFeature.icon

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Compact introduction */}
      <section className="border-b border-slate-200 bg-white">
        <div className="page-container py-12 sm:py-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                <Sparkles className="h-4 w-4" />
                Inside MissTrace
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
                Explore the technology.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Discover how image input, facial analysis, record comparison,
                and potential-match results fit together.
              </p>
            </div>

            <Link
              to="/search"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Try the Search
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive technology dashboard */}
      <section className="page-container py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Search Workflow
            </p>

            <div className="space-y-1">
              {features.map((feature) => {
                const Icon = feature.icon
                const selected = activeId === feature.id

                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => setActiveId(feature.id)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      selected
                        ? 'bg-navy-950 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-navy-950'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        selected
                          ? 'bg-cyan-400/15 text-cyan-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        {feature.label}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${
                          selected ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Stage {feature.number}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
              <ShieldCheck className="h-5 w-5 text-cyan-800" />

              <p className="mt-3 text-xs font-bold text-navy-950">
                Responsible Use
              </p>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                AI-generated results are leads for verification, not proof of
                identity.
              </p>
            </div>
          </aside>

          {/* Main detail panel */}
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-8">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                  Feature Overview
                </span>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Stage {activeFeature.number} / 04
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_0.85fr]">
              <div className="p-6 sm:p-9">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-950 text-cyan-300">
                  <ActiveIcon className="h-7 w-7" />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
                  {activeFeature.metric}
                </p>

                <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy-950 sm:text-4xl">
                  {activeFeature.title}
                </h2>

                <p className="mt-5 text-sm leading-8 text-slate-600">
                  {activeFeature.description}
                </p>

                <div className="mt-8 space-y-4">
                  {activeFeature.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-800">
                        <Check className="h-3 w-3" />
                      </span>

                      <p className="text-sm leading-6 text-slate-600">
                        {bullet}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/search"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                  >
                    Start a Search
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/help"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-navy-950 transition hover:bg-slate-50"
                  >
                    Get Help
                  </Link>
                </div>
              </div>

              {/* Visual panel changes with selected feature */}
              <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-navy-950 p-6 text-white sm:p-8 lg:min-h-full">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"
                  aria-hidden="true"
                />

                <div className="relative flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    System Preview
                  </span>

                  <span className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold text-cyan-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    {activeFeature.display}
                  </span>
                </div>

                <div className="relative mx-auto my-10 w-full max-w-xs">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-3xl" />

                  <div className="relative rounded-2xl border border-cyan-400/30 bg-white/[0.03] p-6">
                    <div className="absolute left-4 top-4 h-5 w-5 border-l-2 border-t-2 border-cyan-400" />
                    <div className="absolute right-4 top-4 h-5 w-5 border-r-2 border-t-2 border-cyan-400" />
                    <div className="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-cyan-400" />

                    <div className="flex h-40 flex-col items-center justify-center">
                      <ActiveIcon className="h-16 w-16 text-cyan-300" strokeWidth={1.1} />

                      <div className="mt-5 h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                      <p className="mt-4 text-sm font-bold">
                        {activeFeature.display}
                      </p>
                    </div>
                  </div>

                  <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <Gauge className="h-4 w-4 text-cyan-300" />
                    <span className="text-xs text-slate-300">
                      Workflow visualization
                    </span>
                  </div>
                </div>

                <div className="relative rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />

                    <div>
                      <p className="text-sm font-semibold">
                        {activeFeature.label}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Select another workflow stage from the sidebar to
                        explore its purpose.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Limitations */}
      <section className="border-t border-slate-200 bg-white">
        <div className="page-container py-12 sm:py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Important to Understand
              </p>

              <h2 className="mt-4 text-2xl font-extrabold text-navy-950 sm:text-3xl">
                What AI can — and cannot — tell you.
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-7 text-slate-600">
                Facial analysis can identify similarities between available
                images. It cannot independently confirm that two images show
                the same person.
              </p>

              <Link
                to="/help"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-800 hover:text-blue-700"
              >
                Read the Help Center
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}