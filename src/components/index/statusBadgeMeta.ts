import type { RepertoireStatus } from '../../data/types'

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
