import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The cutter. A fastball with a small, late glove-side bite — thrown like a
  four-seam but with the grip shifted off-center, so it trades a little ride for a
  short cut that misses barrels and breaks bats. Mariano Rivera built a Hall of
  Fame career on this one pitch. Grip prose paraphrased from MLB.com and Wikipedia,
  never copied. No player image, no likeness.

  This record describes movement as shape, not as a measured gauge. The owner has
  never been tracked, so no spin, speed, or break figure appears in any
  visitor-facing string. Career biography for named arms (usage habits, titles)
  stays where it is real and sourced; pitch behavior is read in words.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.0, lift: 0.02, label: 'Index', finger: 'index', note: 'On the leather, both fingers shifted slightly toward the glove side of the ball.' },
  { seamT: 0.06, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Beside the index, carrying a touch more pressure to set the cut.' },
  { seamT: 0.68, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath, centered, as on a four-seam.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'neutral',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'middle',
  thumbRole: 'Thumb stays centered underneath, as on the four-seam it is built from.',
  palmGapCue: 'Held like a fastball, not buried — the cut is from the grip, not from squeezing.',
  releaseCue: 'Throw it like a four-seam with a hair of supination — let the ball cut off the fingers rather than pulling down the side like a slider.',
  visualCaveat: 'Grip geometry is schematic; the more a pitcher supinates and shifts off-center, the closer it drifts to a hard slider.',
  contacts: [
    {
      finger: 'index',
      label: 'Index off-center',
      seamT: 0.0,
      lift: 0.02,
      seamRelation: 'Shifted toward the glove side from a four-seam',
      pressureRole: 'Sets the off-center grip',
      cue: 'Just off center',
      curl: 0.3,
    },
    {
      finger: 'middle',
      label: 'Middle pressure',
      seamT: 0.06,
      lift: 0.02,
      seamRelation: 'Beside the index, slightly more pressure',
      pressureRole: 'Drives the late cut',
      cue: 'Lead with this finger',
      curl: 0.32,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.68,
      lift: 0,
      seamRelation: 'Centered underneath',
      pressureRole: 'Fastball support',
      cue: 'Stay centered',
      curl: 0.4,
    },
  ],
}

export const cutter: PitchAtlasEntry = {
  canonical: {
    id: 'cutter',
    name: 'Cutter',
    family: 'fastball',
    grip: claim(
      'A four-seam grip with both fingers shifted slightly toward one side of the ball — the glove side for the handedness — and thrown like a fastball. That off-center placement produces a short cutting movement at the plate without a slider\'s pronounced finger pull.',
      'mlb-glossary-cutter',
      'official-data',
      { note: 'Paraphrased. MLB.com: both fingers placed toward one side (the right of the ball for a righty, the left for a lefty) to produce the cutting movement.' },
    ),
    gripDetails: [
      claim(
        'A common build is a four-seam fastball grip with the ball set slightly off center in the hand — the same fastball, just nudged off the middle.',
        'wiki-cut-fastball',
        'reputable-analysis',
        { note: 'Paraphrased from Wikipedia\'s grip description.' },
      ),
      claim(
        'The cut comes from that finger placement and a touch of supination at release, not from a big wrist action — it is a fastball that bites. Lean harder into the supination and the off-center grip and it drifts toward hard-slider territory.',
        'mlb-glossary-cutter',
        'reputable-analysis',
        { note: 'Paraphrased. MLB confirms the grip-driven cut and fastball delivery; the supination/slider-drift framing is coaching-standard.' },
      ),
      claim(
        'It is the most ride-or-die-able single pitch in the game: Mariano Rivera threw almost nothing but his cutter across his whole career, and Kenley Jansen leans on his nearly as hard — proof that one great cutter can be a whole career.',
        'wiki-cut-fastball',
        'reputable-analysis',
        { note: 'Paraphrased. Rivera and Jansen are among the most cutter-reliant arms ever tracked.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is thrown a hair softer than the four-seam, with the same arm action, so it tunnels off the fastball. The late glove-side cut comes from the off-center grip and a slightly supinated release rather than from a slider\'s downward finger pull.',
      'mlb-glossary-cutter',
      'reputable-analysis',
      { note: 'Paraphrased. The fastball-minus feel and same-arm-action tunneling are coaching-standard, anchored to the MLB glossary\'s fastball-with-a-cut framing.' },
    ),
    physics: {
      spinAxis: claim(
        'A fastball axis tilted toward the glove side, just shy of upright for a right-hander, with a little of the spin turned gyro. That mix is why it rides like a fastball but cuts instead of running true.',
        'mlb-glossary-cutter',
        'reputable-analysis',
        { note: 'The tilt is the coaching reference, not a glossary quote; MLB frames the cutter as a fastball that moves glove-side.' },
      ),
      shape: claim(
        'Rides almost like a four-seam, then bites short and late to the glove side at the very end — a small, sudden cut, far shorter than a slider\'s sweep. The harder a pitcher leans on it, the more ride he trades for that bite.',
        'savant-clase',
        'official-data',
        { note: 'Described as shape, not a measured number. The cut is real and late; how far it bites depends on the arm — some ride high and fastball-like, some cut harder and shorter.' },
      ),
      teaching: claim(
        'A four-seam rides on pure backspin: the axis is sideways to flight, so the Magnus force points straight up and the ball carries. Tilt that axis toward the glove side and let a little of the spin go gyro, and the ball trades some of its ride for a short, late cut to the glove side — a fastball that bites just enough to miss the barrel.',
        'mlb-glossary-cutter',
        'reputable-analysis',
        { note: 'Synthesis of the four-seam Magnus model and the MLB glossary\'s fastball-with-a-cut description.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // A fastball axis (mostly +x backspin -> rides) tilted glove-side, with a gyro
    // share (z) that turns some ride into cut. verticalShape 'ride' = it carries
    // like a fastball; magnusForceRender.y = axis.x > 0 matches that ride. The cut
    // is the late glove-side bite, shown as horizontalDir, not a magnitude.
    spinAxis: { x: 0.85, y: -0.18, z: 0.5 },
    forceLabel: 'Magnus, cut',
    gyro: false,
    verticalShape: 'ride',
    horizontalDir: 'glove-side',
    breakView: 'movement',
  },

  display: {
    slug: 'cutter',
    shortName: 'Cutter',
    specimenNo: '10',
    heroSub: 'A fastball that bites.',
    heroIntro:
      'Take a four-seam grip, shift it slightly off-center, and throw it like a fastball. The ball rides almost like a heater, then cuts to the glove side at the last moment — just enough to find the end of the bat instead of the barrel. Rivera built a career on one.',
    foundationCaption: 'It rides like a fastball but its axis is tilted glove-side, so a little of the lift becomes a short, late cut.',
    mastersIntro:
      'Three cutters across eras: the archetype, the modern extreme, and the cutter as a primary fastball. The visual is our own seam schematic. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Mariano Rivera',
      context: 'The archetype: one cutter, thrown almost every pitch, all the way to the Hall of Fame. The proof that a single great pitch can be a whole career.',
      verifiedPro: true,
      distinction: claim(
        'A modest, almost gentle cut — but so late and so repeatable that hitters who knew it was coming still could not square it. The whole career rode on one pitch that bit just enough, every single time.',
        'br-rivera-cutter',
        'reputable-analysis',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Emmanuel Clase',
      context: 'The modern extreme: a cutter thrown two of every three pitches, with a high-ride shape that behaves more like a fastball than a breaking ball.',
      verifiedPro: true,
      distinction: claim(
        'The cutter pushed to fastball intent, riding high and biting hard at once — so heavy and so firm that it plays like a heater that happens to cut, and hitters have to honor it like a true breaking ball.',
        'savant-clase',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Corbin Burnes',
      context: 'The cutter as a primary fastball, leaned on hard enough to anchor a Cy Young arsenal — a shorter, harder-to-square shape than Clase\'s.',
      verifiedPro: true,
      distinction: claim(
        'A shorter, tighter cut than Clase\'s, leaned on as the everyday fastball — the bite is small and the ride is honest, which is exactly what makes it so hard to barrel across a whole start.',
        'savant-burnes',
        'official-data',
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
    family: 'The late cut',
    tagline: 'A fastball thrown off-center, so it rides like a heater and then bites to the glove side at the end.',
    feel: 'Throw it like your fastball. Shift the grip slightly off-center and let the ball cut off your fingers — do not pull down the side like a slider.',
    steps: [
      'Start from your four-seam grip and shift both fingers slightly toward the glove side of the ball.',
      'Let the middle finger carry a touch more pressure.',
      'Throw it with full fastball arm speed and just a hair of supination.',
      'Let the ball cut off the fingers; the bite is small and late, and that is the point.',
    ],
    does: {
      headline: 'It rides like a fastball, then jumps to the glove side at the end.',
      plain:
        'A cutter looks like a fastball almost the whole way, then darts to the glove side right before it gets to the plate. That tiny, late move is enough to catch the thin part of the bat instead of the barrel — which is why a great one breaks so many bats.',
    },
  },

  seam: sharedSeam,
}
