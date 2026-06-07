/*
  The softball domain barrel. One import surface for the whole wing: the arsenal,
  the craftsmen (Cat Osterman leads), the fastpitch fundamentals, and the slowpitch
  sketch. The pages and routes read from here.
*/
export type {
  SoftballPitch,
  SoftballPitchFamily,
  SoftballPitchStatus,
  WindmillPhase,
  FundamentalBlock,
  SlowpitchNote,
} from './types'

export { SOFTBALL_CRAFTSMEN, softballCraftsmanBySlug } from './craftsmen'
export { SOFTBALL_PITCHES, softballPitchBySlug } from './pitches'
export { WINDMILL_PHASES, FUNDAMENTAL_BLOCKS } from './fundamentals'
export { SLOWPITCH_NOTES, SLOWPITCH_CRAFT, SLOWPITCH_FORMATS } from './slowpitch'
