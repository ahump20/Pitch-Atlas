import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The sweeper. The slider's loud cousin: a slider grip turned further around the
  side of the ball so the spin axis tilts toward pure sidespin instead of the gyro
  slider's bullet spin. The result is a wide, mostly flat, glove-side sweep — the
  defining new pitch of these last few seasons. Grip prose paraphrased from MLB.com
  and Driveline, never copied. No player image, no likeness.

  Movement is described as shape, never a measured number: the owner was never
  tracked, so a gauge would be invented. Each arm's version carries a vivid one-line
  read of what makes it distinct, sourced where the cited pages support it.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.36, lift: 0.02, label: 'Index', finger: 'index', note: 'Set further around the side of the ball than a slider — the hand is getting around it.' },
  { seamT: 0.4, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Riding a seam on the outer third, the primary sidespin finger.' },
  { seamT: 0.72, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath and around, helping the hand stay on the side at release.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'side',
  ballDepth: 'neutral',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'middle',
  orientation: {
    knuckleLine: 'Knuckles carried around the outside of the ball, past where a slider sits.',
    palmFacing: 'Palm staying on the side through release — the frisbee hand, not a pull-down.',
  },
  provenance: claim(
    'Finger placement solved from the cited descriptions: a slider hold carried further around the side, middle finger riding a seam on the outer third for sidespin. Schematic geometry, not an athlete scan.',
    'mlb-glossary-sweeper',
    'reputable-analysis',
    { note: 'The around-the-side posture is what tilts the gyro slider toward pure sidespin; spiked and two-seam variants differ.' },
  ),
  thumbRole: 'Thumb sits under and slightly around so the hand can stay on the side of the ball.',
  palmGapCue: 'Firm but free — the ball has to roll from the side, not be muscled down.',
  releaseCue: 'Sweep the fingers around the outside of the ball, like spinning a frisbee, instead of pulling straight down.',
  visualCaveat: 'Grip geometry is schematic and shows the side-spin family; spiked and two-seam sweeper grips shift the finger posture.',
  contacts: [
    {
      finger: 'index',
      label: 'Index around the side',
      seamT: 0.36,
      lift: 0.02,
      seamOffset: -0.02,
      azimuth: 20,
      engagement: 'pad',
      pressureTier: 'support',
      seamRelation: 'Further around the ball than a slider',
      pressureRole: 'Sets the around-the-side path',
      cue: 'Get around it',
      curl: 0.34,
    },
    {
      finger: 'middle',
      label: 'Middle seam',
      seamT: 0.4,
      lift: 0.02,
      seamOffset: 0,
      azimuth: 22,
      engagement: 'pad',
      pressureTier: 'primary',
      seamRelation: 'Rides a seam on the outer third',
      pressureRole: 'Primary sidespin pressure',
      cue: 'Spin it off the side',
      curl: 0.38,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.72,
      lift: 0,
      seamOffset: 0.05,
      azimuth: 40,
      engagement: 'inside',
      pressureTier: 'support',
      seamRelation: 'Under and around as support',
      pressureRole: 'Keeps the hand on the side of the ball',
      cue: 'Support, stay around',
      curl: 0.42,
    },
  ],
}

export const sweeper: PitchAtlasEntry = {
  canonical: {
    id: 'sweeper',
    name: 'Sweeper',
    family: 'breaking',
    grip: claim(
      'A slider grip rotated further around the side of the ball. The index and middle fingers sit toward the outer third, the hand "gets around" the ball at release rather than cutting down through it, and a wider arm path lets the fingers sweep across the outside. That tilts the spin axis toward pure sidespin.',
      'mlb-glossary-sweeper',
      'reputable-analysis',
      { note: 'Paraphrased. MLB.com: the sweeper is thrown with side-spin, "getting around" the ball, or with a two-seam grip — the gyro slider, by contrast, is thrown with bullet spin.' },
    ),
    gripDetails: [
      claim(
        'MLB.com frames the sweeper grip as side-spin first: the pitcher gets around the outside of the ball, or uses a two-seam orientation, where a traditional gyro slider is thrown with bullet spin that spirals like a football.',
        'mlb-glossary-sweeper',
        'reputable-analysis',
        { note: 'Paraphrased from the glossary entry, not quoted.' },
      ),
      claim(
        'It is, mechanically, a slider family member — Driveline\'s slider grips, with the fingers set off-center and the ball allowed to roll from the hand, are the same starting point; the sweeper just rotates the hand further around the side for lateral spin.',
        'driveline-slider',
        'reputable-analysis',
        { note: 'Paraphrased. The off-center grip and let-it-slide-off cue are Driveline\'s; the further-around rotation is the sweeper variation.' },
      ),
      claim(
        'A big-league pitcher will often carry two distinct slider grips — one for the sweeper, one for the gyro slider — and pick by intent: the sweeper to sweep a same-handed hitter off the plate, the gyro slider to bury one with a late, short bite.',
        'mlb-sweeper-explained',
        'reputable-analysis',
        { note: 'Paraphrased. MLB.com\'s explainer cites a pitcher describing his two separate slider grips.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is thrown a touch slower than a slider, with the hand staying on the side and the fingers sweeping around the outside instead of pulling down. The wide break is bought with that around-the-ball action and a spin axis tilted toward pure sidespin.',
      'mlb-sweeper-explained',
      'reputable-analysis',
      { note: 'Paraphrased from MLB.com\'s sweeper explainer; the grip and feel description is in the atlas\'s own words.' },
    ),
    physics: {
      spinAxis: claim(
        'Tilted toward pure sidespin: the axis lies nearly sideways for a right-hander, almost flat across the ball, so the spin does its Magnus work across the side. That is the sweeper\'s whole identity and the opposite of the gyro slider, whose axis points at the catcher and spins like a thrown football.',
        'mlb-glossary-sweeper',
        'reputable-analysis',
        { note: 'MLB.com states the side-spin-vs-bullet-spin contrast that drives the axis difference. Described in words, no clock figure.' },
      ),
      shape: claim(
        'A wide, mostly flat sweep to the glove side. It neither rides like a four-seam nor tumbles like a curve — almost all of its movement runs sideways, with little drop beyond gravity. It looks like a fastball, then runs off the plate well before it arrives.',
        'mlb-sweeper-explained',
        'reputable-analysis',
        { note: 'Described as shape, not a measured number. MLB.com defines the sweeper by its big horizontal movement with little vertical; how far it sweeps depends on the arm.' },
      ),
      teaching: claim(
        'A gyro slider points its spin axis at the catcher and spirals like a football, so the spin makes almost no Magnus force and the pitch breaks late and short. A sweeper tilts that axis toward pure sidespin, so the same Magnus force that lifts a four-seam now pushes sideways — a wide, glove-side sweep with little drop. Same family as the slider, opposite Magnus budget.',
        'mlb-glossary-sweeper',
        'reputable-analysis',
        { note: 'Synthesis of MLB.com\'s side-spin-vs-bullet-spin contrast and the Magnus framing the atlas uses throughout.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Sidespin-dominant: the axis is mostly vertical in render space (points down,
    // -y), so the Magnus force is almost entirely horizontal to the glove side. A
    // small -x gives the slight drop below a spinless ball; the z component is the
    // gyro share a real sweeper still carries. verticalShape 'drop' = it falls a
    // little below a spinless ball; magnusStrength stays high (a true Magnus pitch).
    spinAxis: { x: -0.12, y: -0.92, z: 0.37 },
    forceLabel: 'Magnus: glove-side sweep',
    gyro: false,
    verticalShape: 'drop',
    horizontalDir: 'glove-side',
    breakView: 'movement',
  },

  display: {
    slug: 'sweeper',
    shortName: 'Sweeper',
    specimenNo: '08',
    heroSub: 'A frisbee, sideways.',
    heroIntro:
      'Take a slider grip and get further around the side of the ball. The axis tilts toward pure sidespin, and the same force that lifts a fastball now pushes the ball sideways — a wide, glove-side sweep with little drop. The defining pitch of the last few seasons.',
    foundationCaption: 'Sidespin, not bullet spin: the Magnus force points sideways, so it sweeps wide and flat instead of biting late like a gyro slider.',
    mastersIntro:
      'Three reference sweepers, three ways to win with the side-spin sweep. The visual is our own seam schematic. What sets each version apart is in the read — how the arm shapes the sweep — not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Shohei Ohtani',
      context: 'The reference sweeper — "maybe the best sweeper in the Majors," per MLB.com — and a study in reshaping a pitch year to year as he hunts the best shape.',
      verifiedPro: true,
      distinction: claim(
        'The widest, most violent sweep in the game, and never the same shape two years running — he keeps recutting it, hunting more reach off the side. The benchmark every other sweeper gets measured against by eye.',
        'mlb-ohtani-2025-statcast',
        'reputable-analysis',
        { note: 'MLB.com calls it maybe the best sweeper in the Majors and documents his year-to-year reshaping. Described as shape, no measured gauge.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Freddy Peralta',
      context: 'A swing-and-miss sweeper folded into a four-seam-heavy arsenal — shown because the shape is the lesson, not the sample size.',
      verifiedPro: true,
      distinction: claim(
        'A sharp, late sweep that plays off his fastball-first look: hitters geared for the ride get the floor pulled sideways instead. The break does the work; gravity carries most of the small drop.',
        'savant-peralta',
        'reputable-analysis',
        { note: 'Savant page documents the sweeper as a chase-oriented secondary on a small sample. Described as shape, no break or swing-miss figure.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Yu Darvish',
      context: 'The arsenal artist: the sweeper is one shape among many he files away, thrown sparingly and precisely rather than as a primary.',
      verifiedPro: true,
      distinction: claim(
        'One sweep among a deep deck of shapes — thrown sparingly and placed precisely, a glove-side look he reaches for to keep a hitter from sitting on anything. Craft over volume.',
        'savant-darvish',
        'reputable-analysis',
        { note: 'Savant page documents the sweeper as a low-usage pitch in a deep arsenal. Described as shape and intent, no break or usage figure.' },
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
    family: 'The wide one',
    tagline: 'A slider grip turned around the side of the ball, so it sweeps wide and flat to the glove side instead of biting late.',
    feel: 'Stay on the side of the ball and sweep your fingers around the outside, like spinning a frisbee. Not a downward pull.',
    steps: [
      'Start from your slider grip: index and middle on the outer third of the ball.',
      'Rotate your hand further around the side, so you are getting around the ball, not on top of it.',
      'Use a slightly wider arm path and let the fingers sweep across the outside at release.',
      'Throw it with fastball intent; the wide break comes from the sidespin, not from muscling it.',
    ],
    does: {
      headline: 'It spins on its side, so the air pushes it sideways.',
      plain:
        'A sweeper spins almost like a frisbee — its axis lying on its side instead of pointing at the catcher. That turns the same air force that lifts a fastball into a sideways push, so the ball sweeps a long way to the glove side and barely drops. It looks like a fastball, then runs off the plate well before it gets there.',
    },
  },

  seam: sharedSeam,
}
