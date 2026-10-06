import { useState } from 'react'
import { deleteMissingPerson } from '../api/personApi'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useToast } from '../context/ToastContext'
import type { ApiError, MissingPerson } from '../types'

/**
 * Shared delete flow: confirm dialog → DELETE /api/persons/:id → toast → callback.
 * Render `dialog` somewhere in the page.
 */
export function useDeletePerson(onDeleted: (id: string) => void) {
  const [target, setTarget] = useState<MissingPerson | null>(null)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const confirm = async () => {
    if (!target || deleting) return
    setDeleting(true)
    try {
      await deleteMissingPerson(target.id)
      toast.success('Missing person record deleted successfully.')
      onDeleted(target.id)
      setTarget(null)
    } catch (err) {
      toast.error((err as ApiError).message)
    } finally {
      setDeleting(false)
    }
  }

  const dialog = (
    <ConfirmDialog
      open={target !== null}
      title="Delete Missing Person?"
      message="Are you sure you want to permanently remove this record?"
      loading={deleting}
      onCancel={() => setTarget(null)}
      onConfirm={() => void confirm()}
    />
  )

  return { requestDelete: setTarget, dialog }
}
