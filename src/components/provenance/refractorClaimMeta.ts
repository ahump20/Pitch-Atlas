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

/* Tier dots tuned to read on the matte-black register (card backs, the read
   panel, the provenance ladder). The void/specimen palette above
   (CONFIDENCE_COLOR) is tuned for the cream plate and sinks on matte black, so
   these are deliberately muted-bright variants — not the same values. Shared by
   ChromeWall, TheRead, and ProvenanceStrip (previously triplicated inline). */
export const STAGE_TIER_DOT: Record<ClaimConfidence, string> = {
  'official-data': '#4FB286',
  'pitcher-own-words': '#6CACE4',
  'coach-observed': '#6CACE4',
  'reputable-analysis': '#D8A24A',
  'secondhand-attributed': '#C7B98F',
  'community-firsthand': '#C7B98F',
  unverified: '#FF4D5E',
}
