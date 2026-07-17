import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { gripPhotosFor } from '../grips'
import { sharedSeam } from './_shared-seam'

/*
  The 12-6 curveball. The four-seam's mirror: topspin instead of backspin, so the
  Magnus force points down and adds to gravity. A big, late, straight-down drop with
  little sideways run. Grip prose paraphrased from Driveline, never copied. No player
  image, no likeness.

  Movement is read as shape, never as a measured figure. The owner has never been
  tracked, so any number describing how this pitch moves would be invented. What the
  ball does is described by direction and character; the biography of named pitchers
  stays real and sourced.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.3, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Leverages a seam, commonly the inside edge of the horseshoe.' },
  { seamT: 0.255, lift: 0.02, label: 'Index', finger: 'index', note: 'Rests on the leather beside the middle finger.' },
  { seamT: 0.8, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath on a seam; the ball is tucked back toward the palm to load spin.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'side',
  ballDepth: 'deep-in-hand',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'middle',
  orientation: {
    knuckleLine: 'Knuckles up and slightly forward, the hand cocked to pull down the front.',
    palmFacing: 'Palm toward the body at release as the wrist carries over the top.',
  },
  provenance: claim(
    'Finger placement solved from the cited description: middle finger lined along a long seam as the engine, index resting beside it, thumb braced on the back seam as the opposing pressure. Schematic geometry, not an athlete scan.',
    'driveline-curveball',
    'reputable-analysis',
    { note: 'The straight-curve family; spike and knuckle variants change the index shape, not the middle-finger seam leverage.' },
  ),
  thumbRole: 'Thumb anchors the back seam under the middle finger.',
  palmGapCue: 'The ball can sit deeper than a fastball to load the pull-down feel.',
  releaseCue: 'Middle finger pulls down through the front of the ball to create topspin.',
  visualCaveat: 'Grip geometry is schematic and shows the straight-curve family; spike and knuckle variants change the index shape. In a live photo, look for two fingers lined or cornered against the seam with the thumb as the main opposing pressure.',
  contacts: [
    {
      finger: 'middle',
      label: 'Middle seam',
      seamT: 0.3,
      lift: 0.02,
      seamOffset: 0,
      azimuth: -14,
      engagement: 'inside',
      pressureTier: 'primary',
      seamRelation: 'Lined along the seam, leveraging it for the pull-down',
      pressureRole: 'Primary curveball pressure',
      cue: 'This finger owns the pitch',
      curl: 0.36,
    },
    {
      finger: 'index',
      label: 'Index light',
      seamT: 0.255,
      lift: 0.02,
      seamOffset: -0.03,
      azimuth: -30,
      engagement: 'pad',
      pressureTier: 'light',
      seamRelation: 'Rests beside the middle finger',
      pressureRole: 'Light guide or spiked variant',
      cue: 'Minimal pressure',
      curl: 0.55,
    },
    {
      finger: 'thumb',
      label: 'Back thumb',
      seamT: 0.8,
      lift: 0,
      seamOffset: 0,
      azimuth: 20,
      engagement: 'inside',
      pressureTier: 'support',
      seamRelation: 'Braced underneath on the back seam',
      pressureRole: 'Opposes the middle-finger pull',
      cue: 'Anchor under the seam',
      curl: 0.5,
    },
  ],
}

export const twelveSix: PitchAtlasEntry = {
  canonical: {
    id: 'twelve-six-curveball',
    name: '12-6 curveball',
    family: 'breaking',
    grip: claim(
      'The hand gets on top of the ball so the fingers impart pure topspin. The middle finger leverages a seam, the index rests on the leather beside it, the thumb sits underneath on a seam, and the ball is tucked back toward the palm to load spin.',
      'driveline-curveball',
      'reputable-analysis',
      { note: 'Paraphrased from Driveline, not quoted. Spike and knuckle variants are a common feel-based alternative.' },
    ),
    gripDetails: [
      claim(
        'Driveline\'s standard curve grip leverages the middle finger on the seam with the index on the leather and the thumb on a seam underneath. Topspin comes from getting the fingers in front of the ball and pulling down, the cue being to yank it down with the middle finger.',
        'driveline-curveball',
        'reputable-analysis',
        { note: 'Paraphrased. Spike "CB 3-4" variants live on the same page.' },
      ),
      claim(
        'The name is the clock face: the break runs in a straight line from 12 to 6. A higher arm slot makes it more vertical, a true 12-6; a lower slot tilts it toward a 1-7 slurve with more sideways movement.',
        'baseballmonkey-curveball',
        'reputable-analysis',
        { note: 'Paraphrased coaching reference for the clock-face naming and the arm-slot relationship.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'Topspin is generated by getting on top of the ball and driving the fingers over the front of it, pulling down so it rotates forward rather than with a slider\'s lateral tilt. Per Driveline, a higher release point leads to a more top-down shape, the classic 12-6, while lower slots add sideways run and turn it into a slurve.',
      'driveline-curveball',
      'reputable-analysis',
      { note: 'Paraphrased from Driveline. The fastball-mirror framing is grounded in MLB.com vertical-movement context.' },
    ),
    physics: {
      spinAxis: claim(
        'Near-pure topspin: the axis lies roughly flat and points the Magnus force straight down. Kershaw\'s curve, the cleanest modern 12-6, sits near the bottom of the clock with almost all of its spin doing work. More glove-side tilt makes a diagonal power curve instead.',
        'savant-kershaw',
        'official-data',
        { note: 'Kershaw\'s curve reads as near-pure topspin from Savant\'s spin-direction table.' },
      ),
      shape: claim(
        'A heavy, late, straight-down drop. Topspin and gravity pull the same way, so the floor falls out far harder than a spinless ball would, with little sideways run. The cleanest ones drop almost straight; tilt the axis glove-side and it sweeps into a diagonal power curve.',
        'mlb-ivb',
        'official-data',
        { note: 'Described as shape, not a measured number. The curveball is the game\'s biggest-dropping pitch; the straight-down read is the signature of a true 12-6.' },
      ),
      teaching: claim(
        'The curve is the four-seam fastball\'s mirror. The fastball spins backspin, so its Magnus force points up and it rides; the 12-6 spins topspin, so its Magnus force points down and it drops. Same physics, flipped axis: where the fastball fights the fall, the curve doubles it.',
        'mlb-ivb',
        'official-data',
        { note: 'The mirror relationship: a backspun fastball carries, a topspun curveball drops, the same effect run in opposite directions.' },
      ),
    },
    rights: 'original',
    gripImages: gripPhotosFor('twelve-six'),
  },

  motion: {
    // Topspin: the axis flips toward -x so the Magnus force points down, the down arrow
    // running nearly full length. verticalShape 'drop' = the floor falls out.
    spinAxis: { x: -0.85, y: -0.05, z: 0.52 },
    forceLabel: 'Magnus, down',
    verticalShape: 'drop',
    horizontalDir: 'glove-side',
    breakView: 'movement',
  },

  display: {
    slug: 'twelve-six',
    shortName: '12-6 curve',
    specimenNo: '03',
    heroSub: 'The fastball, mirrored.',
    heroIntro:
      'Topspin instead of backspin, so the Magnus force points down and joins gravity. It falls straight, 12 to 6, far harder than a spinless ball would.',
    foundationCaption: 'Topspin points the Magnus force down. It drops far more than a spinless ball, with little sideways break.',
    mastersIntro:
      'A textbook 12-6, the curve that anchored a career beside it, and a power curve to show where the straight-down line ends. The visual is our own seam schematic. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Clayton Kershaw',
      context: 'The textbook pure 12-6: almost all of its movement is straight-down drop with minimal sideways run. MLB\'s vertical-movement context names him as a large-drop curveball thrower.',
      verifiedPro: true,
      distinction: claim(
        'The straight-down standard. His curve falls almost on a vertical line, with so little sideways run that it reads as pure 12-to-6 — the drop everyone else\'s curve is measured against.',
        'savant-kershaw',
        'official-data',
      ),
      accolades: [
        { label: 'Honors', claim: claim('Three-time Cy Young Award winner and a 2014 NL MVP.', 'savant-kershaw', 'reputable-analysis', { note: 'Career honors, biography not pitch behavior.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Adam Wainwright',
      context: 'The "Uncle Charlie" that anchored a long Cardinals career and ended the 2006 pennant on a called strike three. A true over-the-top 12-6 in his prime; as his arm slot dropped with age it flattened into a two-plane sweep, the bridge between Kershaw\'s straight-down curve and Morton\'s power 1-7. He said it came out the same speed no matter how hard he threw it.',
      verifiedPro: true,
      distinction: claim(
        'The curve as a career. A true straight-down 12-6 in his prime that flattened with age into a two-plane sweep, glove-side run creeping in as the slot dropped — the same pitch aging from a vertical drop toward a diagonal break.',
        'savant-wainwright',
        'official-data',
      ),
      accolades: [
        { label: 'Career', claim: claim('A 200-game winner across a long career, almost all of it with the Cardinals.', 'savant-wainwright', 'reputable-analysis', { note: 'Career win total, biography not pitch behavior.' }) },
      ],
      quote: claim(
        'I could throw it as hard as I could possibly throw it, and it’s going to come out the same speed.',
        'wainwright-espn-curve',
        'pitcher-own-words',
        { note: 'To ESPN, on the curve’s built-in pace limit. Lightly trimmed to keep the meaning without quoting a speed figure.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Charlie Morton',
      context: 'The power-curve contrast. Big drop with heavy glove-side tilt, so it reads as a 1-7 power curve rather than a pure straight-down 12-6. It marks where the line ends.',
      verifiedPro: true,
      distinction: claim(
        'Where the straight line ends. The axis tilts glove-side until the drop turns diagonal — a hard, sweeping 1-7 power curve, the curveball pushed off its vertical line until it stops being a 12-6.',
        'savant-morton',
        'official-data',
      ),
      accolades: [
        { label: 'Profile', claim: claim('A two-time World Series champion whose curveball is his most-thrown pitch.', 'savant-morton', 'reputable-analysis', { note: 'Career profile, biography not pitch behavior.' }) },
      ],
      rights: 'original',
    },
  ],

  community: {
    enabled: true,
    safetyNote: 'Field Notes are live for grip and technique only. No medical, injury, workload, or youth-training prescriptions. Every note carries a source and confidence label, and contributors can report problems.',
    provenanceNote:
      'Every community variant carries the same source and confidence labels as the records above. Nothing appears here unsourced, and no count is shown until it is real.',
    columns: ['Rank', 'Variant', 'Adoption', 'Source tier'],
  },

  guide: {
    family: 'The drop',
    tagline: 'It falls straight off a table, twelve o’clock to six. Same arm speed, late and hard.',
    feel: 'Get on top and pull down through the front of the ball. Stay over it; finish short.',
    steps: [
      'Run your middle finger along a seam and rest your thumb on the back seam, the ball pinched between them.',
      'Let your index lie alongside with almost no pressure, or tuck its knuckle for a sharper bite.',
      'Throw the front of the ball, not the back. That is what makes the topspin.',
      'Keep fastball arm speed and pull down hard and short, like chopping straight down.',
    ],
    does: {
      headline: 'Topspin drags it down off a cliff.',
      plain:
        'Where the fastball spins backward, the curve spins forward. That topspin pulls the ball down late. It looks like a fastball out of the hand, then the floor drops out. A true twelve-to-six falls almost straight, with little sideways break.',
    },
  },

  seam: sharedSeam,
}
