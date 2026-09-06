/**
 * Framework-independent learning surface maintained by Pitch Atlas.
 *
 * This entrypoint deliberately re-exports the canonical modules rather than
 * maintaining a second registry or translating provenance-bearing records.
 */
export { PITCHES, pitchBySlug } from '../data/pitches'
export { CONFIDENCE_META } from '../data/types'
export type * from '../data/types'

export {
  COMPARE_KEY,
  EMPTY_SELECTION,
  compareUrl,
  normalizeSelection,
  parseSelection,
  validSlug,
} from '../components/compare/selection'
export type { CompareSelection, CompareView } from '../components/compare/selection'

export {
  SEAM_VIEW_TILT,
  SPIN_AXIS,
  orientedSeamPolyline,
  seamPoint,
  seamPolyline,
  seamRaw,
  seamSamples,
  surfaceNormal,
  v,
} from '../lib/seam'
export type { Vec3 } from '../lib/seam'
export { buildLacing, buildStitches, pathOf, projectSeam, splitRuns } from '../lib/seam2d'
export type { Stitch } from '../lib/seam2d'
