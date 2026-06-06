import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The knuckleball. Every other pitch moves because it spins; this one moves because
  it doesn't. The fingernails dig in and the ball is pushed, not thrown, killing
  the rotation so the seams — not the spin — steer it, erratically and late. Grip
  prose paraphrased from MLB.com and Wikipedia, never copied. No player image.

  Authored against an adversarial verification pass that fetched every cited page.
  Corrections it forced: the thumb-for-balance detail is re-sourced to Wikipedia
  (not the glossary, which does not state it); the spin-axis and active-spin claims
  are framed as inference from the no-spin goal, not as glossary text; and the
  record-low spin figure is the confirmed 64 rpm (SI), not a lower unverified one.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.06, lift: 0.04, label: 'Index nail', finger: 'index', note: 'Fingernail dug into the leather just behind a seam, knuckle bent.' },
  { seamT: 0.12, lift: 0.04, label: 'Middle nail', finger: 'middle', note: 'Second fingernail beside the first; together they brace, not grip.' },
  { seamT: 0.7, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath for balance, so the ball can be pushed flat off the nails.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'out-in-fingers',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'index',
  thumbRole: 'Thumb sits underneath for balance while the fingernails hold the ball off the palm.',
  palmGapCue: 'Ball held off the palm on the fingernails, never buried — the palm must not add spin.',
  releaseCue: 'Push the ball flat toward the plate and let it leave with as little rotation as possible. No wrist snap.',
  visualCaveat: 'Grip geometry is schematic; some throwers use bent knuckles instead of nails, and small hands change the placement.',
  contacts: [
    {
      finger: 'index',
      label: 'Index nail',
      seamT: 0.06,
      lift: 0.04,
      seamRelation: 'Nail dug in behind a seam',
      pressureRole: 'Braces the ball to kill spin',
      cue: 'Dig the nail in',
      curl: 0.7,
    },
    {
      finger: 'middle',
      label: 'Middle nail',
      seamT: 0.12,
      lift: 0.04,
      seamRelation: 'Nail beside the index',
      pressureRole: 'Second brace point',
      cue: 'Push, do not spin',
      curl: 0.7,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.7,
      lift: 0,
      seamRelation: 'Underneath for balance',
      pressureRole: 'Stabilizes the no-spin push',
      cue: 'Balance underneath',
      curl: 0.3,
    },
  ],
}

export const knuckleball: PitchAtlasEntry = {
  canonical: {
    id: 'knuckleball',
    name: 'Knuckleball',
    family: 'offspeed',
    grip: claim(
      'The fingernails (or, for smaller hands, the bent knuckles) dig into the leather while the thumb braces underneath. The ball is held off the palm and pushed toward the plate with no wrist snap, so it leaves the hand with almost no rotation. Killing the spin is the entire goal.',
      'mlb-glossary-knuckleball',
      'reputable-analysis',
      { note: 'Paraphrased. MLB.com: knuckles on the ball or hovering over it while the fingernails dig into the surface; the goal is to eliminate almost all spin.' },
    ),
    gripDetails: [
      claim(
        'MLB.com names the grip for the no-spin goal: knuckles on or just over the ball with the fingernails dug into the surface, thrown to eliminate almost all rotation so the ball flutters unpredictably.',
        'mlb-glossary-knuckleball',
        'reputable-analysis',
        { note: 'Paraphrased from the glossary, not quoted.' },
      ),
      claim(
        'In practice most throwers use the fingertips and nails rather than true knuckles, with the thumb resting underneath for balance — young pitchers with smaller hands are the ones who actually use their knuckles.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Paraphrased. The fingertip-vs-knuckle distinction and the thumb-for-balance point are Wikipedia\'s, not the MLB glossary\'s.' },
      ),
      claim(
        'The textbook target is to have the ball complete only a quarter to a half rotation over the whole flight from hand to plate; the slowly changing seam position is what makes the path wander.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Paraphrased. The quarter-to-half-rotation target is Wikipedia\'s.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is thrown slow — usually 60 to 78 mph — with an even, low-effort push instead of a hard arm whip, because arm speed adds the spin the pitch is trying to avoid. A harder knuckleball (R.A. Dickey threw his in the high 70s to low 80s) trades some flutter for less reaction time, and many throwers carry two speeds.',
      'fangraphs-dickey-knuckle',
      'reputable-analysis',
      { note: 'Paraphrased. The hard-knuckleball velocity band and the two-speed approach are from the FanGraphs Dickey analysis.' },
    ),
    physics: {
      spinAxis: claim(
        'Effectively none. The whole point is to kill rotation, and with almost no spin there is no stable axis and no meaningful Magnus force — which is why Statcast does not treat a knuckleball like a spinning pitch.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Inferred from the no-spin goal; the cited pages describe near-zero rotation, not a spin direction.' },
      ),
      spinRateRpm: claim(
        'Near zero, the lowest in the game. R.A. Dickey\'s made about 1.5 rotations hand-to-plate, roughly 150 rpm; Matt Waldron averaged 276 rpm in 2024 and once spun one at just 64 rpm for a called strike — the lowest-spin called strike of the Statcast era.',
        'fangraphs-waldron-knuckle',
        'reputable-analysis',
        { approximate: true, note: 'Dickey ~150 rpm from Alan Nathan; Waldron 276 rpm avg from FanGraphs; the 64 rpm record from SI.' },
      ),
      activeSpinPct: claim(
        'Not meaningful. With almost no spin and no stable axis there is no active-spin figure to report; the knuckleball is excluded from the spin-efficiency picture entirely.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Inferred from the near-zero spin; no published active-spin value exists for a knuckleball.' },
      ),
      primaryBreak: {
        label: 'Erratic flutter',
        accent: true,
        claim: claim(
          'Unpredictable — to the hitter, the catcher, and the pitcher alike. With the spin killed, the seams catch the air differently from instant to instant, so the ball darts late in no fixed direction. It is famously almost as hard to catch as it is to hit.',
          'mlb-glossary-knuckleball',
          'reputable-analysis',
          { note: 'Paraphrased. There is no fixed break magnitude or direction — that unpredictability is the pitch.' },
        ),
      },
      secondaryBreak: {
        label: 'Why it moves',
        claim: claim(
          'The slowly changing position of the raised seams alters the drag on the ball as it travels, bending its flight. The exact mechanism — vortex shedding, an asymmetric wake, boundary-layer effects — is still debated; what is agreed is that it is the seams, not spin, doing the steering.',
          'wiki-knuckleball',
          'reputable-analysis',
          { note: 'Paraphrased. Wikipedia notes the seam-drag mechanism and that the precise cause is debated.' },
        ),
      },
      teaching: claim(
        'Every other pitch in the atlas moves because it spins. The knuckleball moves because it doesn\'t. Kill the rotation, and the raised seams — whose position when the ball leaves the hand is never quite the same twice — catch the air and wander the ball off line. No spin, no Magnus, no two pitches alike.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Synthesis of the no-spin grip goal and the seam-drag movement mechanism.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // A knuckleball has essentially NO induced break: with almost no spin it sits on
    // the spinless reference. We show a barely-negative IVB and no horizontal so the
    // ball plots right at center; its real, erratic flutter is a wake force this
    // Magnus plot cannot draw. magnusStrength is tiny, as it should be.
    spinAxis: { x: -0.1, y: 0, z: 0.99 },
    forceLabel: 'Almost no Magnus',
    gyro: false,
    ivbInches: -1,
    horizontalInches: 0,
    horizontalDir: 'none',
    breakView: 'movement',
  },

  display: {
    slug: 'knuckleball',
    shortName: 'Knuckleball',
    specimenNo: '09',
    heroSub: "The pitch that doesn't spin.",
    heroIntro:
      'Dig the fingernails in, brace the thumb, and push the ball flat with no spin. Strip away the rotation and the raised seams catch the air on their own, fluttering the ball late in any direction — almost as hard to catch as it is to hit.',
    foundationCaption: 'With the spin killed, there is almost no Magnus force: the ball sits on the spinless reference and the seams do the steering, erratically.',
    mastersIntro:
      'Two documented knuckleballs, a generation apart. The visual is our own seam schematic; every spin figure is season-stamped and sourced, and the movement is, by nature, not repeatable.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'R.A. Dickey',
      context: 'The only knuckleballer to win a Cy Young Award (2012), and the model of the hard, two-speed knuckleball that traded some flutter for less reaction time.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('78-83 mph', 'fangraphs-dickey-knuckle', 'reputable-analysis', { approximate: true, note: 'The hard knuckleball, with a slower version off it.' }) },
        { label: 'Spin', claim: claim('~150 rpm', 'illinois-dickey-knuckle', 'reputable-analysis', { approximate: true, note: 'About 1.5 rotations hand-to-plate, from Alan Nathan\'s study of the June 13, 2012 one-hitter.' }) },
        { label: 'Movement swing', claim: claim('over 8 in', 'illinois-dickey-knuckle', 'reputable-analysis', { note: 'The plate-location difference between the same pitch making 1.0 vs 1.5 rotations — a tiny change in spin, a big change in where it ends up.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Matt Waldron',
      context: 'The modern knuckleballer who kept the pitch alive in the Statcast era — and set its record low for spin, the clearest proof that less rotation is the goal.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('76.7 mph', 'fangraphs-waldron-knuckle', 'reputable-analysis', { note: '2024 average.' }) },
        { label: 'Spin', claim: claim('276 rpm', 'fangraphs-waldron-knuckle', 'reputable-analysis', { approximate: true, note: '2024 average, about 2.2 rotations to the plate.' }) },
        { label: 'Usage', claim: claim('35.4%', 'fangraphs-waldron-knuckle', 'reputable-analysis', { note: '2024, up from 26.7% in 2023.' }) },
        { label: 'Lowest-spin strike', claim: claim('64 rpm', 'si-waldron-knuckle', 'reputable-analysis', { note: '2024 — the lowest-spin called strike of the Statcast era; he threw a 28-rpm pitch (a ball) that same inning.' }) },
      ],
      rights: 'original',
    },
  ],

  community: {
    enabled: true,
    safetyNote: 'When the community layer opens, every note will carry a source and confidence label, a content filter will block abusive language, and any note can be flagged. A note hides automatically once enough people report it.',
    provenanceNote:
      'When they open, every community variant will carry the same source and confidence labels as the records above. Nothing appears here unsourced, and no count is shown until it is real.',
    columns: ['Rank', 'Variant', 'Adoption', 'Source tier'],
  },

  guide: {
    family: 'The flutter',
    tagline: "Pushed with no spin so the seams catch the air and the ball wanders late — almost as hard to catch as to hit.",
    feel: 'Hold the ball off your palm on your fingernails. Push it flat toward the plate, no wrist, no spin. Stay smooth and slow.',
    steps: [
      'Dig your index and middle fingernails into the leather, thumb underneath for balance.',
      'Keep the ball off your palm so the palm cannot add spin.',
      'Push the ball toward the plate with an even arm, not a whip.',
      'Let it leave with as little rotation as you can manage — the less it spins, the more it moves.',
    ],
    does: {
      headline: 'It barely spins, so the stitches steer it.',
      plain:
        'A knuckleball is thrown to not spin at all. Without spin there is nothing holding its path steady, so the raised stitches catch the moving air and nudge the ball one way, then another, late and unpredictably. Nobody — not the hitter, not the catcher, not even the pitcher — knows exactly where it will end up.',
    },
  },

  seam: sharedSeam,
}
