import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CircleHelp,
  FileImage,
  LifeBuoy,
  LockKeyhole,
  Search,
  ShieldCheck,
  Upload,
  Wrench,
} from 'lucide-react'

const categories = [
  'All Questions',
  'Getting Started',
  'Image Upload',
  'Search Results',
  'Account & Login',
] as const

type Category = (typeof categories)[number]

const faqs: {
  question: string
  answer: string
  category: Exclude<Category, 'All Questions'>
}[] = [
  {
    question: 'How do I start a missing-person search?',
    answer:
      'Open the Find Missing Person page, choose a suitable photograph, and submit it using the search form. Wait for processing to finish, then review the potential matches returned by the application.',
    category: 'Getting Started',
  },
  {
    question: 'Do I need an account to use MissTrace?',
    answer:
      'Access depends on how the application routes are configured. If the search page requires authentication, sign in or create an account before continuing.',
    category: 'Getting Started',
  },
  {
    question: 'Which photograph should I use?',
    answer:
      'Choose a clear, well-lit photograph with the face visible. Avoid blurry images, heavy obstructions, and photographs in which the face is too small to distinguish.',
    category: 'Image Upload',
  },
  {
    question: 'Why is my photograph not uploading?',
    answer:
      'Check your connection, confirm that the file is an image format supported by your application, and verify that it is within the server’s upload-size limit. If the problem persists, try another image.',
    category: 'Image Upload',
  },
  {
    question: 'Why were no potential matches found?',
    answer:
      'The image may not contain a detectable face, its quality may be insufficient, or the relevant person may not appear in the records available to MissTrace. A result with no matches does not establish that a person cannot be found.',
    category: 'Search Results',
  },
  {
    question: 'Does a high similarity score prove identity?',
    answer:
      'No. A similarity score represents an algorithmic comparison, not a confirmed identity. Any possible match must be independently verified by authorized personnel.',
    category: 'Search Results',
  },
  {
    question: 'Why is the search returning an error?',
    answer:
      'The backend may be unavailable, the request may have failed, or the uploaded image may not have been processed successfully. Confirm that the server is running and try again.',
    category: 'Search Results',
  },
  {
    question: 'I cannot sign in. What should I check?',
    answer:
      'Confirm that you entered the correct email address and password. Check that the backend is available. If the application supports password recovery, use the recovery process provided there.',
    category: 'Account & Login',
  },
  {
    question: 'What should I do if I suspect a result is a match?',
    answer:
      'Do not make a conclusion based only on facial similarity. Follow the appropriate official reporting procedure and allow authorized personnel to verify the identity using independent information.',
    category: 'Search Results',
  },
]

export default function Help() {
  const [category, setCategory] = useState<Category>('All Questions')
  const [openQuestion, setOpenQuestion] = useState<string | null>(
    faqs[0].question,
  )

  const filteredFaqs = faqs.filter((faq) => {
    return category === 'All Questions' || faq.category === category
  })

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory)
    setOpenQuestion(null)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Support heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="page-container py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-950 text-cyan-300 shadow-lg shadow-navy-950/10">
              <LifeBuoy className="h-7 w-7" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
              MissTrace Support
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
              How can we help you?
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Browse topics or learn how to use the missing-person search
              workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Support categories */}
      <section className="page-container py-10 sm:py-14">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Getting Started',
              description: 'Learn the basic search workflow.',
              icon: BookOpen,
              value: 'Getting Started' as Category,
            },
            {
              title: 'Image Upload',
              description: 'Photographs and upload errors.',
              icon: Upload,
              value: 'Image Upload' as Category,
            },
            {
              title: 'Search Results',
              description: 'Understand potential matches.',
              icon: FileImage,
              value: 'Search Results' as Category,
            },
            {
              title: 'Account & Login',
              description: 'Sign-in and account access.',
              icon: LockKeyhole,
              value: 'Account & Login' as Category,
            },
          ].map((item) => {
            const Icon = item.icon
            const selected = category === item.value

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => selectCategory(item.value)}
                aria-pressed={selected}
                className={`rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  selected
                    ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      selected
                        ? 'bg-navy-950 text-cyan-300'
                        : 'bg-slate-100 text-navy-950'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>

                <h2 className="mt-4 text-sm font-bold text-navy-950">
                  {item.title}
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {/* FAQ and sidebar */}
      <section className="page-container pb-16 sm:pb-20">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                  Knowledge Base
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-navy-950 sm:text-3xl">
                  Frequently asked questions
                </h2>
              </div>

              <span className="rounded-full bg-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {filteredFaqs.length}{' '}
                {filteredFaqs.length === 1 ? 'answer' : 'answers'}
              </span>
            </div>

            {/* Category filter */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => selectCategory(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    category === item
                      ? 'bg-navy-950 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-navy-950'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openQuestion === faq.question

                return (
                  <article
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border bg-white transition ${
                      isOpen
                        ? 'border-cyan-200 shadow-sm'
                        : 'border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenQuestion(isOpen ? null : faq.question)
                      }
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span className="text-sm font-bold leading-6 text-navy-950 sm:text-base">
                        {faq.question}
                      </span>

                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-cyan-700 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">
                        <p className="text-sm leading-7 text-slate-600">
                          {faq.answer}
                        </p>

                        <span className="mt-4 inline-flex rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800">
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </article>
                )
              })}

              {filteredFaqs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <CircleHelp className="mx-auto h-9 w-9 text-slate-400" />

                  <h3 className="mt-4 font-bold text-navy-950">
                    No answers found
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose another category.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCategory('All Questions')
                      setOpenQuestion(null)
                    }}
                    className="mt-5 text-sm font-bold text-cyan-800 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Practical sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl bg-navy-950 p-6 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Search className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-lg font-bold">Ready to search?</h3>

              <p className="mt-2 text-sm leading-7 text-slate-300">
                Open the search tool to upload a photograph and review
                potential matches.
              </p>

              <Link
                to="/search"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
              >
                Open Search
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-700" />

                <h3 className="font-bold text-navy-950">Safety Reminder</h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                A similarity score is not proof of identity. Potential matches
                require independent verification.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-cyan-700" />

                <h3 className="font-bold text-navy-950">
                  Still having trouble?
                </h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                If the application returns an error, verify that the backend
                is running and try again.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer note */}
      <section className="border-t border-slate-200 bg-white">
        <div className="page-container py-8">
          <p className="text-center text-xs leading-6 text-slate-500">
            MissTrace provides AI-assisted search support. Its results are
            potential matches and must not be treated as confirmed identities.
          </p>
        </div>
      </section>
    </main>
  )
}
