import type { RefractorAccent } from './RefractorCard'

/*
  The refractor accent triad for every filed pitch, keyed by slug, plus the neutral
  fallback. Extracted from SpecimenSet so the specimen cards, the Pitch Index plates,
  the craftsmen plates, and the specimen chapter all pull one pitch's "world" from a
  single source — a pitch wears the same color everywhere it appears. The `c3` value
  is the bright family accent used for plate/row edges (--gc); the full triad drives a
  RefractorCard's --c1/--c2/--c3.
*/
export const ACCENT: Record<string, RefractorAccent> = {
  'four-seam': { c1: '#0A1B3A', c2: '#114A8C', c3: '#37D6FF' },
  'two-seam': { c1: '#07261F', c2: '#0E7A5E', c3: '#1CF0A6' },
  'circle-change': { c1: '#2A0E2E', c2: '#9C2C7A', c3: '#FF6FB3' },
  'twelve-six': { c1: '#160B33', c2: '#4A35B5', c3: '#8A6BFF' },
  slider: { c1: '#2A0712', c2: '#B01133', c3: '#FF3B63' },
  splitter: { c1: '#08220F', c2: '#2C9E2E', c3: '#7CFF52' },
  splinker: { c1: '#2A0E06', c2: '#C2470F', c3: '#FF8A2B' },
  sweeper: { c1: '#06262A', c2: '#0E6E7A', c3: '#22E0E0' },
  cutter: { c1: '#0A1626', c2: '#2C5A8C', c3: '#6CB4E4' },
  knuckleball: { c1: '#1A1326', c2: '#4A3A6E', c3: '#A99AD0' },
  forkball: { c1: '#0E1230', c2: '#2E2E8C', c3: '#6B6BE0' },
  eephus: { c1: '#2A1E06', c2: '#9C7A1E', c3: '#FFD24D' },

  // The softball wing. Distinct from the baseball slugs (no collisions): the rise
  // wears a climbing sky, the drop a grounded amber, the breakers the violet/magenta
  // two-way pair. So a softball pitch wears one color across hub, chapter, and plate.
  riseball: { c1: '#08203A', c2: '#1A6FB8', c3: '#6FD3FF' },
  drop: { c1: '#2A1606', c2: '#9C5A12', c3: '#FFB23C' },
  fastball: { c1: '#0A1B2E', c2: '#2C6A9C', c3: '#5CB4E4' },
  changeup: { c1: '#08220F', c2: '#2C9E5E', c3: '#5CF0A6' },
  curve: { c1: '#160B33', c2: '#5A35B5', c3: '#9A7BFF' },
  screwball: { c1: '#2A0E2E', c2: '#9C2C7A', c3: '#FF6FB3' },
}

export const FALLBACK_ACCENT: RefractorAccent = { c1: '#10131C', c2: '#2C3650', c3: '#8A93AB' }

/** The refractor accent triad for a filed specimen, by slug. Shared by the cards,
    the index plates, and the specimen chapter so a pitch wears the same world on
    every surface. Unknown slugs fall back to a neutral slate triad. */
export function accentForSlug(slug: string): RefractorAccent {
  return ACCENT[slug] ?? FALLBACK_ACCENT
}
