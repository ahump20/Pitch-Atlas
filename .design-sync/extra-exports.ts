// Real runtime values the design system exposes beside its components
// (cfg.extraEntries merges these onto window.PitchAtlas).
//
// PITCHES — the filed pitch records, exactly as the site reads them. The
// specimen card takes one of these as `entry`. A hand-typed copy rots the moment
// the record's shape moves: `canonical.gripModel` landed after the 2026-07-24
// sync and every hand-built preview entry started throwing. Designs render real
// specimens from this list and never invent one.
//
// CONFIDENCE_META — the label and one-line meaning of each confidence tier, the
// single source of badge wording for the whole codebase (src/data/types.ts). A
// design that explains a tier quotes this instead of writing its own gloss.
//
// toast — sonner's trigger for the Toaster. A <Toaster /> is an empty container
// until toast() fires, so the component is unusable without it.
export { PITCHES } from '../src/data/pitches'
export { CONFIDENCE_META } from '../src/data/types'
export { toast } from 'sonner'
