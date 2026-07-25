import type { RefractorAccent } from './RefractorCard'

/*
  The refractor accent triad for every filed pitch, keyed by slug, plus the neutral
  fallback. Extracted from SpecimenSet so the specimen cards, the Pitch Index plates,
  the craftsmen plates, and the specimen chapter all pull one pitch's "world" from a
  single source — a pitch wears the same color everywhere it appears. The `c3` value
  is the bright family accent used for plate/row edges (--gc); the full triad drives a
  RefractorCard's --c1/--c2/--c3.
*/
/*
  Every triad lives inside Electric Burnt Chrome — burnt orange, powder ice, cyan,
  the chromium ladder, brass, and seam red, on near-black. The set used to carry
  eighteen fully-saturated neons (#1CF0A6, #7CFF52, #FF6FB3, #8A6BFF); because a
  pitch wears its accent on its card, its index plate AND its chapter, that
  saturation reached every surface and was half of why the product read cartoonish.

  Identity survives the move: the fastball family stays warm, the breaking family
  goes cold, and no two pitches share a c3. Keep new pitches inside this palette —
  a single neon re-introduces the problem sitewide.
*/
export const ACCENT: Record<string, RefractorAccent> = {
  'four-seam': { c1: '#0A141B', c2: '#3D6178', c3: '#B9D4E5' }, // powder ice — the reference
  'two-seam': { c1: '#061518', c2: '#125B63', c3: '#1F97A2' }, // deep cyan — runs and sinks
  'circle-change': { c1: '#191510', c2: '#6E6350', c3: '#D8CFBB' }, // bone — soft, deceptive
  'twelve-six': { c1: '#0A121A', c2: '#3A5F78', c3: '#8FBAD6' }, // powder blue — the big drop
  slider: { c1: '#1C0806', c2: '#8F2420', c3: '#FF4D46' }, // seam red — sharp and late
  splitter: { c1: '#111417', c2: '#5A6165', c3: '#A7ADB0' }, // chromium — drops off the table
  splinker: { c1: '#1A0A04', c2: '#A83607', c3: '#FF6A29' }, // electric burnt orange
  sweeper: { c1: '#061A1E', c2: '#1F8794', c3: '#5FE0EA' }, // cyan — the wide one
  cutter: { c1: '#0A1015', c2: '#3F5768', c3: '#7F97A8' }, // steel — small and hard
  knuckleball: { c1: '#0E1113', c2: '#3B434A', c3: '#6E757B' }, // chrome grey — no spin, no color
  forkball: { c1: '#08121A', c2: '#2E4D5E', c3: '#5B7F96' }, // slate
  eephus: { c1: '#1A1206', c2: '#8A6420', c3: '#E4B45A' }, // brass — the slow arc

  // The softball wing. Distinct from the baseball slugs (no c3 collisions): the rise
  // wears climbing ice, the drop a grounded burnt amber, the breakers the cold/warm
  // two-way pair. So a softball pitch wears one color across hub, chapter, and plate.
  riseball: { c1: '#081820', c2: '#2B7F96', c3: '#9FD8E8' },
  drop: { c1: '#1A0F05', c2: '#8A5220', c3: '#D2843C' },
  fastball: { c1: '#0A121A', c2: '#456478', c3: '#A8C4D8' },
  changeup: { c1: '#16140F', c2: '#6A6353', c3: '#C9C0AA' },
  curve: { c1: '#0A0F16', c2: '#3B5068', c3: '#6F8CB0' },
  screwball: { c1: '#1A0C07', c2: '#8A3F28', c3: '#C76A4A' },
}

export const FALLBACK_ACCENT: RefractorAccent = { c1: '#0E1113', c2: '#3B434A', c3: '#A7ADB0' }

/** The refractor accent triad for a filed specimen, by slug. Shared by the cards,
    the index plates, and the specimen chapter so a pitch wears the same world on
    every surface. Unknown slugs fall back to a neutral slate triad. */
export function accentForSlug(slug: string): RefractorAccent {
  return ACCENT[slug] ?? FALLBACK_ACCENT
}
