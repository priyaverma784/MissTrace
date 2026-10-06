import { Link } from 'react-router-dom'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { MissingPerson } from '../types'
import { formatDate } from '../utils/format'
import { PersonAvatar } from './PersonAvatar'

interface PersonTableProps {
  persons: MissingPerson[]
  onDelete: (person: MissingPerson) => void
  basePath?: string
}

function RowActions({
  person,
  basePath,
  onDelete,
}: {
  person: MissingPerson
  basePath: string
  onDelete: (p: MissingPerson) => void
}) {
  const btn =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`${basePath}/${person.id}`}
        aria-label={`View ${person.name}`}
        className={`${btn} text-slate-500 hover:bg-slate-100 hover:text-blue-600`}
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        to={`${basePath}/${person.id}/edit`}
        aria-label={`Edit ${person.name}`}
        className={`${btn} text-slate-500 hover:bg-slate-100 hover:text-blue-600`}
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(person)}
        aria-label={`Delete ${person.name}`}
        className={`${btn} text-slate-500 hover:bg-red-50 hover:text-red-600`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Table on md+ screens, stacked cards on mobile. */
export function PersonTable({ persons, onDelete, basePath = '/admin/persons' }: PersonTableProps) {
  return (
    <>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Last Seen Location</th>
              <th className="px-4 py-3">Last Seen Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {persons.map((p) => (
              <tr key={p.id} className="transition hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <PersonAvatar name={p.name} src={p.photoUrl} className="h-10 w-10" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link to={`${basePath}/${p.id}`} className="hover:text-blue-600">
                    {p.name || '—'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.age ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{p.gender || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{p.lastSeenLocation || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(p.lastSeenDate)}</td>
                <td className="px-4 py-3">
                  <RowActions person={p} basePath={basePath} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {persons.map((p) => (
          <li key={p.id} className="flex items-start gap-3 p-4">
            <PersonAvatar name={p.name} src={p.photoUrl} className="h-14 w-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <Link to={`${basePath}/${p.id}`} className="block truncate font-semibold text-slate-900">
                {p.name || '—'}
              </Link>
              <p className="text-sm text-slate-500">
                {p.age ?? '—'} yrs · {p.gender || '—'}
              </p>
              <p className="truncate text-sm text-slate-500">
                {p.lastSeenLocation || '—'} · {formatDate(p.lastSeenDate)}
              </p>
              <div className="-ml-2 mt-1">
                <RowActions person={p} basePath={basePath} onDelete={onDelete} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
