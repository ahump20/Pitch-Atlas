import type { ClaimConfidence } from '../../data/types'

export const CONFIDENCE_COLOR: Record<ClaimConfidence, string> = {
  'official-data': 'var(--color-ok-bright)',
  'pitcher-own-words': 'var(--color-cyan)',
  'coach-observed': 'var(--color-teal-glow)',
  'reputable-analysis': 'var(--color-amber-bright)',
  'secondhand-attributed': 'var(--color-sand-bright)',
  'community-firsthand': 'var(--color-sand-bright)',
  unverified: 'var(--color-seam-bright)',
}
