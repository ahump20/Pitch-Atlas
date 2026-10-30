/*
  The softball domain barrel. One import surface for the whole wing: the arsenal,
  the craftsmen (Cat Osterman leads), the fastpitch fundamentals, the slowpitch
  sketch, and the slow-pitch Flight Lab's rulebooks, example lobs and measured
  batter. The pages and routes read from here.
*/
export type {
  SoftballPitch,
  SoftballPitchFamily,
  SoftballPitchStatus,
  WindmillPhase,
  FundamentalBlock,
  SlowpitchNote,
  FlightLabRulebook,
  FlightLabLob,
  FlightLabPitch,
  MeasuredBatter,
  MeasuredSwing,
} from './types'

export { SOFTBALL_CRAFTSMEN, softballCraftsmanBySlug } from './craftsmen'
export { SOFTBALL_PITCHES, softballPitchBySlug } from './pitches'
export { WINDMILL_PHASES, FUNDAMENTAL_BLOCKS } from './fundamentals'
export { SLOWPITCH_NOTES, SLOWPITCH_CRAFT, SLOWPITCH_FORMATS } from './slowpitch'
export { FLIGHT_LAB_RULEBOOKS, EXAMPLE_LOBS, MEASURED_BATTER, FLIGHT_LAB_NOTES, SLOWPITCH_ARSENAL } from './flightLab'
