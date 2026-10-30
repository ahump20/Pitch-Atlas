import type { FlightLabLob, FlightLabPitch, FlightLabRulebook, MeasuredBatter, SlowpitchNote } from './types'
import { claim, secondhand, unverified } from '../sources'
import { ARC_RULES, BAT_DIAMETER_IN, BATTER_MODEL, DEFAULT_STANCE, PITCH_SPIN } from '../../lib/slowpitch'

/*
  The slow-pitch Flight Lab's data: the three rulebooks, the six example lobs,
  and the measured batter. The numbers the model runs on live in
  `src/lib/slowpitch`; this file reads them from there and wraps each one in its
  source and confidence, so the figure a visitor reads and the figure the model
  uses are the same number.

  Two kinds of figure sit side by side here and must look different on the
  page: rule lines quoted from a rule book (official), and the model's own
  inputs (the example lobs, set by hand, and one batter's measured swing).
*/

export const FLIGHT_LAB_RULEBOOKS: FlightLabRulebook[] = [
  {
    key: 'usssa',
    name: 'USSSA',
    short: 'USSSA',
    arc: ARC_RULES.usssa,
    arcText: claim(
      'It must arc at least 3 ft after leaving the hand, and rise no higher than 10 ft above the ground.',
      'sb-usssa-slowpitch-rulebook-2026',
      'official-data',
      { note: 'Rule 6, Sec. 6 B–C. The lab reads the 3 ft as a rise above the release point.' },
    ),
    zoneText: claim(
      'Over any part of the plate, between the batter’s highest shoulder and the bottom of the front knee.',
      'sb-usssa-slowpitch-rulebook-2026',
      'official-data',
      { note: 'Definitions, Strike Zone; Rule 7, Sec. 4.' },
    ),
    illegalText: claim(
      'Take it and it’s a ball. Swing and it counts like any pitch.',
      'sb-usssa-slowpitch-rulebook-2026',
      'official-data',
      { note: 'Rule 6, Sec. 10: an unfairly delivered pitch is a ball, unless the batter swings.' },
    ),
  },
  {
    key: 'usa',
    name: 'USA Softball',
    short: 'USA',
    arc: ARC_RULES.usa,
    arcText: claim(
      'Peak between 6 and 10 ft above the ground.',
      'sb-usa-softball-rulebook-2026',
      'official-data',
      {
        note: 'Rule 6C, Sec. 3 H. The 12 ft ceiling in the same rule is the Senior exception; the original lab read 6–12 ft for adult play from a secondary source.',
      },
    ),
    zoneText: claim(
      'Over any part of the plate, between the back shoulder and the front knee.',
      'sb-usa-softball-rulebook-2026',
      'official-data',
      { note: 'Definitions, Strike Zone B (slow pitch).' },
    ),
    illegalText: claim(
      'Illegal pitch, called by the umpire.',
      'sb-usa-softball-rulebook-2026',
      'official-data',
      { note: 'Rule 6C, Sec. 3, Effect.' },
    ),
  },
  {
    key: 'senior',
    name: 'USA Senior',
    short: 'Senior',
    arc: ARC_RULES.senior,
    arcText: claim(
      'Peak between 6 and 12 ft above the ground.',
      'sb-usa-softball-rulebook-2026',
      'official-data',
      { note: 'Rule 6C, Sec. 3 H, Senior Slow Pitch exception.' },
    ),
    zoneText: claim(
      'A strike lands on the plate or on the mat behind it.',
      'sb-usa-softball-rulebook-2026',
      'official-data',
      { note: 'Definitions, Strike Zone C: a 17 in by 32.5 in mat; the shoulder-to-knee zone is eliminated.' },
    ),
    illegalText: claim(
      'Illegal pitch, called by the umpire.',
      'sb-usa-softball-rulebook-2026',
      'official-data',
      { note: 'Rule 6C, Sec. 3, Effect.' },
    ),
  },
]

const EXAMPLE_ARC = 'Example arc, set by hand.'

/** Six example lobs. The arcs are drawn to teach, not measured from a pitcher. */
export const EXAMPLE_LOBS: FlightLabLob[] = [
  { key: 'belt', name: 'Belt-high lob', color: '#bf5700', params: unverified({ apex: 9, land: 36, side: 0, rpm: 110, push: 0 }, EXAMPLE_ARC) },
  { key: 'low', name: 'Low strike', color: '#cdba8e', params: unverified({ apex: 6.5, land: 31, side: 0, rpm: 150, push: 0 }, EXAMPLE_ARC) },
  { key: 'deep', name: 'Deep strike', color: '#7fc6ff', params: unverified({ apex: 9, land: 85, side: 0, rpm: 110, push: 0 }, EXAMPLE_ARC) },
  { key: 'inside', name: 'Inside lob', color: '#ff2d44', params: unverified({ apex: 9, land: 36, side: -8, rpm: 110, push: 0 }, EXAMPLE_ARC) },
  { key: 'flat', name: 'Flat lob', color: '#34e27e', params: unverified({ apex: 6.5, land: 66, side: 0, rpm: 150, push: 0 }, EXAMPLE_ARC) },
  { key: 'rainbow', name: 'Rainbow', color: '#6f8cb0', params: unverified({ apex: 11.6, land: 26, side: 0, rpm: 80, push: 0 }, EXAMPLE_ARC) },
]

const SPIN_SET = 'Spin set by hand for the model. It shapes the path; it is never shown and was never measured off a pitcher.'
const GLOSSARY = 'A slow-pitch glossary site, not a rule book or a measurement.'

/**
 * The arsenal. A pitch is a spin laid over any of the six lobs: the lob says
 * where it peaks and lands, the pitch says how it turns on the way.
 */
export const SLOWPITCH_ARSENAL: FlightLabPitch[] = [
  {
    key: 'lob',
    name: 'Lob',
    color: '#f6f1e6',
    read: 'A little backspin. It lands where it’s thrown.',
    what: unverified('The six example arcs, each with the light backspin it was set with.', EXAMPLE_ARC),
    spin: unverified(PITCH_SPIN.lob, `${SPIN_SET} Each example lob keeps its own.`),
  },
  {
    key: 'knuckler',
    name: 'Knuckler',
    color: '#c9a7ff',
    read: 'The seams barely turn. It wanders off its spot, a new way every throw.',
    what: secondhand('Thrown with little or no spin, so it moves unpredictably on the way in.', 'sb-slopitchcentral-knuckler', GLOSSARY),
    spin: unverified(PITCH_SPIN.knuckler, `${SPIN_SET} Under half a turn on the way in, where the knuckleball model is wildest.`),
  },
  {
    key: 'backspin',
    name: 'Backspin',
    color: '#5fd4ff',
    read: 'The seams roll back at the pitcher. It carries deeper than it looks.',
    what: secondhand(
      'Spun backward out of the hand, it comes down slower and is harder to hit cleanly, often popped up.',
      'sb-slopitchcentral-backspin',
      GLOSSARY,
    ),
    spin: unverified(PITCH_SPIN.backspin, SPIN_SET),
  },
  {
    key: 'topspin',
    name: 'Topspin',
    color: '#ff9b3d',
    read: 'The seams roll toward you. It dives short of where it looks.',
    what: secondhand(
      'Released with forward spin, the tumbler, it often drops more sharply than a standard pitch.',
      'sb-slopitchcentral-tumbler',
      GLOSSARY,
    ),
    spin: unverified(PITCH_SPIN.topspin, SPIN_SET),
  },
  {
    key: 'sidespin',
    name: 'Side spin',
    color: '#7cf0b0',
    read: 'The ball spins like a top. It drifts across the plate.',
    what: claim('Spin about an upright axis pushes the ball sideways: the Magnus force acts across the flight.', 'sb-snexplores-curve', 'reputable-analysis', {
      note: 'Explained on baseballs and fastpitch. No slow-pitch source on file names a side-spin lob, so its place in this arsenal is the lab’s.',
    }),
    spin: unverified(PITCH_SPIN.sidespin, SPIN_SET),
  },
]

const MEASURED = 'One batter’s measured swing, calibrated off home plate in their own video.'

/** The default batter. A real swing, never named, never pictured. */
export const MEASURED_BATTER: MeasuredBatter = {
  stance: claim({ ...DEFAULT_STANCE }, 'sb-flight-lab-measured-swing', 'community-firsthand', { note: MEASURED }),
  swing: claim(
    {
      landmarks: { ...BATTER_MODEL.landmarks },
      stanceDepthPerHeight: BATTER_MODEL.stanceDepthPerHeight,
      stridePerHeight: BATTER_MODEL.stridePerHeight,
      armReachPerHeight: BATTER_MODEL.armReachPerHeight,
      handsFromKnobIn: BATTER_MODEL.handsFromKnobIn,
    },
    'sb-flight-lab-measured-swing',
    'community-firsthand',
    { note: `${MEASURED} Scaled to other heights by these ratios, which is a model assumption.` },
  ),
  bat: claim({ lengthIn: DEFAULT_STANCE.batIn, diameterIn: BAT_DIAMETER_IN }, 'sb-flight-lab-measured-swing', 'community-firsthand', {
    note: MEASURED,
  }),
  barrelAngleDeg: unverified(BATTER_MODEL.barrelAngleDeg, 'One swing. The barrel angle at contact, read from a single swing.'),
}

/** The sourced lines under the lab: the bat, the sweet spot, the air. */
export const FLIGHT_LAB_NOTES: SlowpitchNote[] = [
  {
    label: 'Bat: 34 in max',
    claim: claim(
      'The official bat is no more than 34 in long and 2¼ in across at its widest.',
      'sb-usssa-slowpitch-rulebook-2026',
      'official-data',
      { note: 'Rule 2, Sec. 2.' },
    ),
  },
  {
    label: 'Slow-pitch bats are made at 34 in',
    claim: secondhand(
      'Slow-pitch bats are sold at 34 in, so a batter coming from a shorter baseball bat gains reach they may not account for.',
      'sb-baseballmonkey-slowpitch-bats',
      'Relayed by a bat retailer’s buying guide, not a manufacturer spec sheet.',
    ),
  },
  {
    label: 'Sweet spot: about 6 in from the end',
    claim: claim(
      'The sweet spot is a region about 5 to 7 in from the barrel end; the lab places it at 6 in.',
      'sb-russell-sweetspot',
      'reputable-analysis',
      { approximate: true, note: 'It moves an inch or two between bats, so the lab’s 6 in is a middle value, not your bat’s.' },
    ),
  },
  {
    label: 'Knuckler: the seams push it',
    claim: claim(
      'A ball that barely turns is pushed around by its seams, with a force that beats four times a turn; under half a turn on the way in makes the wildest path.',
      'sb-nelson-strauss-knuckleball',
      'reputable-analysis',
      {
        approximate: true,
        note: 'A baseball model at big-league speed. The lab runs it on a 12 in softball at slow-pitch speed, so its dance is a model, not a measurement.',
      },
    ),
  },
  {
    label: 'Lift and drag: baseball fits',
    claim: claim(
      'The flight uses a constant drag coefficient and a spin-dependent lift fit from baseball aerodynamics, applied to a 12 in softball.',
      'sb-kensrud-thesis',
      'reputable-analysis',
      { approximate: true, note: 'Borrowed from baseball fits; on a slow-pitch softball the path is a close model, not a measurement.' },
    ),
  },
]
