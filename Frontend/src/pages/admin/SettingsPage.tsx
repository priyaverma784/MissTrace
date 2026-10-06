import { API_BASE_URL } from '../../api/axios'

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Connection and privacy information.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">Backend connection</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">VITE_API_BASE_URL</code> in your{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env</code> file to change this.
        </p>
        <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-700">
          {API_BASE_URL}
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">Privacy</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Face embeddings are stored for matching and are never displayed in this app.</li>
          <li>Search results are potential matches and must be verified by authorized personnel.</li>
          <li>Deleting a record is permanent and always asks for confirmation.</li>
        </ul>
      </section>
    </div>
  )
}
