import { useNavigate } from 'react-router-dom'
import { ScanFace, ShieldCheck, Sun } from 'lucide-react'
import { SearchPanel } from '../../components/SearchPanel'

const TIPS = [
  { icon: Sun, title: 'Good lighting', text: 'Use a clear, well-lit photo.' },
  { icon: ScanFace, title: 'Face visible', text: 'One person, facing the camera.' },
  { icon: ShieldCheck, title: 'Verified by people', text: 'Matches must be confirmed by authorities.' },
]

/** Used for both /user (with tips) and /user/search. */
export function UserSearchPage({ showTips = false }: { showTips?: boolean }) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SearchPanel
        title="Find a Missing Person"
        subtitle="Upload a clear photo and let our AI help you find potential matches from our database."
        onSuccess={() => navigate('/user/results')}
      />

      {showTips && (
        <ul className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
          {TIPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <Icon className="mx-auto h-6 w-6 text-blue-600" aria-hidden />
              <h2 className="mt-2 text-sm font-semibold text-slate-900">{title}</h2>
              <p className="mt-0.5 text-xs text-slate-500">{text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
