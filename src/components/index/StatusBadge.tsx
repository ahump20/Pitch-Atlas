import type { RepertoireStatus } from '../../data/types'
import { isEdgeStatus, STATUS_LABEL } from './statusBadgeMeta'

/*
  The repertoire status badge, shared by the index cards and the basic detail page
  so an alias / illusion / banned / not-a-pitch always reads the same: the honest
  edge cases take the seam jolt, the live pitches read navy. Extracted from
  RepertoireEntryCard so the catalog and the chapter never drift.
*/
export function StatusBadge({ status }: { status: RepertoireStatus }) {
  const flagged = isEdgeStatus(status)
  return (
    <span className={`mono-label shrink-0 ${flagged ? 'text-seam' : 'text-bone-2'}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
