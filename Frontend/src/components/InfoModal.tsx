import { Modal } from './Modal'
import { Button } from './Button'

export type InfoKind = 'about' | 'help'

interface InfoModalProps {
  kind: InfoKind | null
  onClose: () => void
}

export function InfoModal({ kind, onClose }: InfoModalProps) {
  return (
    <Modal
      open={kind !== null}
      title={kind === 'help' ? 'Help & Tips' : 'About MissTrace'}
      onClose={onClose}
      footer={<Button onClick={onClose}>Got it</Button>}
    >
      {kind === 'about' && (
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            MissTrace helps families and authorized personnel search stored missing-person records
            using AI-assisted face comparison.
          </p>
          <p>
            Results are shown as <strong className="text-slate-900">potential matches</strong> with a
            similarity score. They are a starting point for investigation and must be verified by
            authorized personnel — they never confirm someone&apos;s identity.
          </p>
          <p>
            Photos you upload for a search are used only to compare against existing records.
          </p>
        </div>
      )}
      {kind === 'help' && (
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>Use a clear, well-lit photo where the face is fully visible and facing the camera.</li>
          <li>Only one person should appear in the photo.</li>
          <li>JPG and PNG images up to 10 MB are supported.</li>
          <li>Recent photos match best; older photos may give lower similarity scores.</li>
          <li>If a possible match appears, contact the local authorities to verify it.</li>
        </ul>
      )}
    </Modal>
  )
}
