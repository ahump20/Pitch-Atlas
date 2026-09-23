import type { ClaimConfidence } from '../../data/types'

/* Three trust tiers, one color each (Austin, 2026-09-23): burnt orange for the
   source itself (official data, the pitcher, a coach who saw it), powder blue for
   anything relayed or analyzed, red for unverified. The label always prints, so
   the tier is never read from hue alone. Tuned for the dark field; the cream plate
   uses the deeper inks in CARD_INK. */
export const CONFIDENCE_COLOR: Record<ClaimConfidence, string> = {
  'official-data': 'var(--color-tier-first)',
  'pitcher-own-words': 'var(--color-tier-first)',
  'coach-observed': 'var(--color-tier-first)',
  'reputable-analysis': 'var(--color-tier-relayed)',
  'secondhand-attributed': 'var(--color-tier-relayed)',
  'community-firsthand': 'var(--color-tier-relayed)',
  unverified: 'var(--color-tier-unverified)',
}

/* The ChromeWall card backs sit on the same dark field, so they share the map. */
export const STAGE_TIER_DOT = CONFIDENCE_COLOR
