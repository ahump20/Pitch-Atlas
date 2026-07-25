import type { RepertoireFamily } from '../../data/types'

/*
  Family accent — the per-family worlds, as lifts on the charcoal. One source so
  the index rows, their seam marks, the binder tabs, and the header ledger all dip
  the same inkwells.

  Cast in Electric Burnt Chrome rather than the old collegiate jewels (pennant
  navy, varsity forest, letterman burgundy). Those were already muted, but forest
  green and burgundy sit outside the palette and read foreign next to burnt orange
  and chromium. The families keep the same job and the same separation; they are
  simply struck in the platform's metals. These match the movement-map and
  tunnel-plot family colors exactly, so a family wears one color everywhere.
*/
export const FAMILY_ACCENT: Record<RepertoireFamily, string> = {
  fastball: '#FF6A29', // electric burnt orange — the fastball family burns
  offspeed: '#E4B45A', // brass
  breaking: '#5FE0EA', // cyan
  specialty: '#B9D4E5', // powder ice
  banned: '#FF4D46', // seam red
}
