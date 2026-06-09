import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The knuckleball. Every other pitch moves because it spins; this one moves because
  it doesn't. The fingernails dig in and the ball is pushed, not thrown, killing
  the rotation so the seams — not the spin — steer it, erratically and late. Grip
  prose paraphrased from MLB.com and Wikipedia, never copied. No player image.

  Authored against an adversarial verification pass that fetched every cited page.
  The movement of this pitch is described as shape and feel only: a wandering,
  late, no-fixed-direction flutter. The owner has never been tracked, so no spin,
  velocity, or break figure is stated — those would be invented. What survives is
  what can be felt and seen: the ball barely turns, and the seams do the steering.
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
        'The textbook target is to barely let the ball turn at all over the whole flight from hand to plate; the slowly changing seam position is what makes the path wander.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Paraphrased. The barely-any-rotation target is Wikipedia\'s.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is thrown soft, with an even, low-effort push instead of a hard arm whip, because arm speed adds the spin the pitch is trying to avoid. A firmer knuckleball trades some flutter for less reaction time, and many throwers carry two speeds.',
      'fangraphs-dickey-knuckle',
      'reputable-analysis',
      { note: 'Paraphrased. The firm-knuckleball approach and the two-speed idea are from the FanGraphs Dickey analysis.' },
    ),
    physics: {
      spinAxis: claim(
        'Effectively none. The whole point is to kill rotation, and with almost no spin there is no stable axis and no meaningful Magnus force — which is why Statcast does not treat a knuckleball like a spinning pitch.',
        'wiki-knuckleball',
        'reputable-analysis',
        { note: 'Inferred from the no-spin goal; the cited pages describe near-zero rotation, not a spin direction.' },
      ),
      shape: claim(
        'No fixed direction and no settled shape — a late, sudden flutter that darts one way then another, unpredictable to the hitter, the catcher, and the pitcher alike. With the spin killed, the seams catch the air differently from instant to instant. It is famously almost as hard to catch as it is to hit.',
        'mlb-glossary-knuckleball',
        'reputable-analysis',
        { note: 'Described as shape, not a measured number. There is no fixed break direction — that unpredictability is the pitch.' },
      ),
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
    // the spinless reference. verticalShape 'flat' = it rides neither up nor down off
    // a spinless ball; its real, erratic flutter is a wake force this Magnus plot
    // cannot draw.
    spinAxis: { x: -0.1, y: 0, z: 0.99 },
    forceLabel: 'Almost no Magnus',
    gyro: false,
    verticalShape: 'flat',
    horizontalDir: 'none',
    breakView: 'movement',
    // No fixed break shape or direction — its shape claim says exactly that.
    // Don't headline a precise read on the one pitch defined by indeterminacy.
    indeterminateBreak: true,
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
      'Two documented knuckleballs, a generation apart. The visual is our own seam schematic; what sets each apart is in the read, not a gauge, and the movement is, by nature, not repeatable.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'R.A. Dickey',
      context: 'The only knuckleballer to win a Cy Young Award (2012), and the model of the hard, two-speed knuckleball that traded some flutter for less reaction time.',
      verifiedPro: true,
      distinction: claim(
        'The firm, two-speed knuckleball: thrown with more pace than the classic floater, he gave up a little flutter to cut the hitter\'s reaction time, and changed speeds off it to keep them guessing.',
        'fangraphs-dickey-knuckle',
        'reputable-analysis',
        { note: 'The firmer knuckleball, with a slower version off it — the read that defined his arm.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Matt Waldron',
      context: 'The modern knuckleballer who kept the pitch alive in the current game — and threw it more and more, the clearest proof that less rotation is the goal.',
      verifiedPro: true,
      distinction: claim(
        'The knuckleball\'s survivor in the tracking era: he leaned on it harder season over season and pushed it to its quietest, slowest-turning extreme, where the ball barely rotates at all on its way to the plate.',
        'fangraphs-waldron-knuckle',
        'reputable-analysis',
        { note: 'The read: he kept the pitch alive and chased the no-spin edge of it.' },
      ),
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
