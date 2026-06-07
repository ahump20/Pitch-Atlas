import type { SlowpitchNote } from './types'
import { claim } from '../sources'

/*
  Slowpitch, filed honestly and light. The craft is thinner than fastpitch — there
  is no windmill, no velocity, no rise — but it is not nothing: arc, spin to deaden
  the landing, and placement to the mat are real skills. The one figure that matters
  most, the legal arc, genuinely differs between sanctioning bodies, so we name the
  discrepancy instead of picking a number.
*/

export const SLOWPITCH_NOTES: SlowpitchNote[] = [
  {
    label: 'Legal arc (USSSA)',
    claim: claim(
      'The pitch must arc at least 3 feet after leaving the hand and may not rise higher than 10 feet above the ground.',
      'sb-usssa-slowpitch-rules',
      'official-data',
    ),
  },
  {
    label: 'Why the arc number is not one number',
    claim: claim(
      'The legal window depends on the sanctioning body: USSSA’s rulebook sets 3-to-10 feet, while a 6-to-12-foot window is commonly cited under other sanctions. The exact ceiling varies, and umpire judgment governs the call.',
      'sb-usssa-slowpitch-rulebook-2025',
      'reputable-analysis',
      { note: 'Named rather than smoothed: different leagues (USSSA vs. USA Softball and others) publish different arc limits, so any single "6-to-12" or "3-to-10" claim is only true for its own rulebook.' },
    ),
  },
  {
    label: 'Where the call lives',
    claim: claim(
      'The speed of the pitch and the height of the arc are left to the umpire’s judgment.',
      'sb-usssa-slowpitch-rules',
      'official-data',
    ),
  },
]

/*
  The craft framing — our own words, no figures (those stay in the notes above).
  Kept out of the Claim model on purpose: these are honest characterizations of how
  slowpitch pitching is approached, not measured assertions.
*/
export const SLOWPITCH_CRAFT: string[] = [
  'Inside the legal arc, the real skills are arc height, backspin that deadens the ball so it drops dead on the back of the plate instead of sitting up to be crushed, placement to the corners of the strike mat, and changing the arc and speed to break a hitter’s timing.',
  'It is a game of inches and touch rather than power — the opposite end of the craft from the fastpitch riseball, and worth filing for exactly that contrast.',
]

export const SLOWPITCH_FORMATS: string[] = [
  'Men’s slowpitch is a power-hitting game; the pitcher’s job is arc, spin, and placement, not speed — the contest is keeping a lineup of big bats off balance with where and how the ball lands.',
  'Coed slowpitch mixes the genders on the field and shifts the strategic emphasis around that; the pitching craft itself — arc, deadening spin, placement — is the same toolkit applied to a different game.',
]
