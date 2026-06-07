import type { RepertoireStatus } from '../../data/types'

/*
  The repertoire status badge, shared by the index cards and the basic detail page
  so an alias / illusion / banned / not-a-pitch always reads the same: the honest
  edge cases take the seam jolt, the live pitches read navy. Extracted from
  RepertoireEntryCard so the catalog and the chapter never drift.
*/
export const SEAM_STATUSES: RepertoireStatus[] = ['banned', 'alias', 'illusion', 'not-a-pitch']

export const STATUS_LABEL: Record<RepertoireStatus, string> = {
  standard: 'Standard',
  niche: 'Niche',
  rare: 'Rare',
  'near-extinct': 'Near-extinct',
  banned: 'Banned',
  alias: 'Alias',
  illusion: 'Illusion',
  'not-a-pitch': 'Not a pitch',
}

export function isEdgeStatus(status: RepertoireStatus): boolean {
  return SEAM_STATUSES.includes(status)
}

export function StatusBadge({ status }: { status: RepertoireStatus }) {
  const flagged = isEdgeStatus(status)
  return (
    <span className={`mono-label shrink-0 ${flagged ? 'text-seam' : 'text-bone-2'}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
