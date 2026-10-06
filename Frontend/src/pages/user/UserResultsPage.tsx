import { Navigate, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '../../components/Button'
import { ProcessingLoader } from '../../components/ProcessingLoader'
import { SearchResults } from '../../components/SearchResults'
import { SearchStepper } from '../../components/SearchStepper'
import { useSearch } from '../../context/SearchContext'

export function UserResultsPage() {
  const navigate = useNavigate()
  const { status, results, stage, queryPreview, reset, rerun } = useSearch()

  // Nothing searched yet (e.g. page refreshed) – go back to the upload step.
  if (status === 'idle' || status === 'error') return <Navigate to="/user/search" replace />

  const newSearch = () => {
    reset()
    navigate('/user/search')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-slate-200 bg-white px-3 py-4 shadow-card sm:px-6">
        <SearchStepper current={3} />
      </div>

      {status === 'searching' ? (
        <div className="mx-auto max-w-2xl">
          <ProcessingLoader stage={stage} preview={queryPreview} />
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              {queryPreview && (
                <img
                  src={queryPreview}
                  alt="Photo you searched with"
                  className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-navy-900">Search Results</h1>
                <p className="mt-0.5 text-sm text-slate-600">
                  {results.length > 0
                    ? `${results.length} potential ${results.length === 1 ? 'match' : 'matches'} found for your photo, sorted by similarity.`
                    : 'Here are the results for your photo.'}
                </p>
              </div>
            </div>
            <Button onClick={newSearch} icon={<Plus className="h-4 w-4" aria-hidden />}>
              New Search
            </Button>
          </div>

          <SearchResults results={results} onTryAnother={newSearch} onSearchAgain={() => void rerun()} />
        </>
      )}
    </div>
  )
}
