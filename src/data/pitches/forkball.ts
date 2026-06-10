import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The forkball. The splitter's deeper, older cousin: the ball jammed all the way
  down between the first two fingers and released with a downward wrist snap, so it
  leaves with almost no spin and tumbles down hard and late. Taxing on the arm and
  rare in the majors, it lives on in Japan and, lately, in a new low-spin ghost
  fork. Grip prose paraphrased from MLB.com, Baseball Prospectus, and Wikipedia,
  never copied. No player image, no likeness.

  Movement is described as SHAPE — direction and character — never as a measured
  number. The owner has never been tracked, so any tracked spin, speed, or break
  figure would be invented filler. What survives is the read: a heavy, late tumble
  off a fastball arm. Named-pitcher biography (strikeout totals, the seasons they
  led a league) is kept, because that is real sourced history, not pitch behavior.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.18, lift: 0.0, label: 'Index', finger: 'index', note: 'Split wide and jammed deep against the side of the ball.' },
  { seamT: 0.82, lift: 0.0, label: 'Middle', finger: 'middle', note: 'The other fork, split wider than a splitter, the ball wedged to the knuckles.' },
  { seamT: 0.5, lift: 0.02, label: 'Thumb', finger: 'thumb', note: 'Underneath, holding the deep ball in place.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'top',
  ballDepth: 'deep-in-hand',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'index',
  orientation: {
    knuckleLine: 'Knuckles forced apart by the wedged ball, the fork riding to the finger bases.',
    palmFacing: 'Palm to the plate until the wrist snaps down through release.',
  },
  provenance: claim(
    'Finger placement solved from the cited descriptions: the ball jammed to the base of the forked fingers, each riding the inside of its finger on the open leather outside the seams, visibly deeper than a splitter. Schematic geometry, not an athlete scan.',
    'mlb-glossary-forkball',
    'reputable-analysis',
    { note: 'Splitter versus forkball is depth, not spread: the splitter rides the fingertips, the forkball is wedged to the knuckles.' },
  ),
  thumbRole: 'Thumb underneath supports a ball wedged deep against the base of the fingers.',
  palmGapCue: 'No gap — the ball is jammed all the way down between the forked fingers, deeper than a splitter.',
  releaseCue: 'Snap the wrist down as the ball squirts out from between the fingers; the deep grip kills the spin.',
  visualCaveat: 'Grip geometry is schematic; the deep, wide fork demands extreme finger flexibility and is hard on the arm.',
  contacts: [
    {
      finger: 'index',
      label: 'Index fork',
      seamT: 0.18,
      lift: 0,
      seamOffset: 0.13,
      azimuth: 15,
      engagement: 'inside',
      pressureTier: 'primary',
      seamRelation: 'Split wide, jammed deep along the inside of the finger',
      pressureRole: 'One side of the deep fork',
      cue: 'Bury it deep',
      curl: 0.2,
    },
    {
      finger: 'middle',
      label: 'Middle fork',
      seamT: 0.82,
      lift: 0,
      seamOffset: 0.13,
      azimuth: 15,
      engagement: 'inside',
      pressureTier: 'support',
      seamRelation: 'Split wider than a splitter, wedged to the knuckles',
      pressureRole: 'Other side of the deep fork',
      cue: 'Wider than a split',
      curl: 0.2,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.5,
      lift: 0.02,
      seamOffset: 0,
      azimuth: 50,
      engagement: 'pad',
      pressureTier: 'support',
      seamRelation: 'Underneath as support',
      pressureRole: 'Holds the deep ball',
      cue: 'Support underneath',
      curl: 0.4,
    },
  ],
}

export const forkball: PitchAtlasEntry = {
  canonical: {
    id: 'forkball',
    name: 'Forkball',
    family: 'offspeed',
    grip: claim(
      'The ball is jammed deep between the index and middle fingers — forked wider than a splitter, wedged down toward the knuckles — and released with a downward snap of the wrist. That deep grip and snap deaden the spin so it tumbles down sharply, like a 12-to-6 curve.',
      'mlb-glossary-forkball',
      'official-data',
      { note: 'Paraphrased. MLB.com: the ball is jammed between the index and middle fingers and released with a downward wrist snap, causing extreme downward movement.' },
    ),
    gripDetails: [
      claim(
        'MLB.com sets it apart from its cousin the splitter: the splitter is gripped closer to the fingertips and needs no wrist snap, while the forkball is buried deeper and is snapped — and is far rarer.',
        'mlb-glossary-forkball',
        'reputable-analysis',
        { note: 'Paraphrased from the glossary contrast between the forkball and the splitter.' },
      ),
      claim(
        'The deep fork demands unusual finger flexibility — Jose Contreras famously carried a softball to keep his index and middle fingers stretched apart enough to wedge a baseball that far down.',
        'bp-forkball',
        'reputable-analysis',
        { note: 'Paraphrased. The Contreras softball-stretch detail is from Baseball Prospectus.' },
      ),
      claim(
        'What separates a forkball from a splitter today is mostly how wide the fingers fork and how hard it is thrown: Roki Sasaki throws both, a wider, slower fork and a narrower, harder splitter, and Statcast files them separately. It is common in Japan and seldom adopted in the majors, where it has a reputation as an arm-taxing pitch.',
        'wiki-forkball',
        'reputable-analysis',
        { note: 'Paraphrased. The wide-fork-vs-narrow-split distinction is from the MLB Sasaki article; the Japan-vs-MLB prevalence is from Wikipedia.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is thrown with a fastball arm action, but the ball squirts out from between the deep-forked fingers with almost no spin rather than being spun. The downward wrist snap that gives it its tumble also puts real torque on the elbow, which is why MLB.com calls it one of the more taxing pitches to throw.',
      'mlb-glossary-forkball',
      'reputable-analysis',
      { note: 'Paraphrased. The squirt-out release and the taxing-on-the-arm point are from the MLB glossary.' },
    ),
    physics: {
      spinAxis: claim(
        'Very little spin, so no strong axis. What there is leans toward topspin tilted arm-side — consistent with a pitch that tumbles down with a touch of arm-side run.',
        'fangraphs-senga-ghostfork',
        'reputable-analysis',
        { note: 'The faint axis on a near-spinless ball leans toward a downward, arm-side tumble.' },
      ),
      shape: claim(
        'A heavy, late, almost straight-down tumble — like the floor dropping out at the last instant. With almost no spin there is nothing to hold it up, so it falls off the table, and a modern ghost fork can fade a little arm-side on the way down. The drop is the pitch.',
        'bp-forkball',
        'reputable-analysis',
        { note: 'Described as shape, not a measured number. The tumble is the read; how far it falls depends on the arm. The arm-side fade is a modern ghost-fork variation.' },
      ),
      teaching: claim(
        'Most pitches fight gravity: backspin makes a Magnus force that holds the ball up. The forkball does the opposite. Jamming the ball deep and snapping it out kills the spin, so there is almost no lift, and gravity tumbles the ball down hard and late. The price for that free fall is torque on the arm.',
        'mlb-glossary-forkball',
        'reputable-analysis',
        { note: 'Synthesis of the low-spin grip and the MLB glossary\'s downward-snap / taxing description.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Near-zero spin: only a faint lean tilted arm-side. The force arrow is short and
    // the ball sits near the spinless reference; the heavy tumble hitters see is
    // gravity acting on a ball with almost no lift, which this plot cannot draw.
    // verticalShape 'flat' = almost no Magnus lift either way (the drop is gravity).
    spinAxis: { x: 0.18, y: 0.2, z: 0.96 },
    forceLabel: 'Magnus, weak: tumble',
    gyro: false,
    verticalShape: 'flat',
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'forkball',
    shortName: 'Forkball',
    specimenNo: '11',
    heroSub: 'Jammed deep, tumbles down.',
    heroIntro:
      'Wedge the ball all the way down between two split fingers, wider than a splitter, and snap the wrist as it squirts out. It leaves with almost no spin, so there is nothing to hold it up — gravity takes over and it tumbles down late. The catch: it is hard on the arm.',
    foundationCaption: 'Almost no spin means almost no lift, so gravity dominates: the ball plots near the spinless ball and falls off the table.',
    mastersIntro:
      'Three forkballs: the modern ghost fork, the deadest-spin version anyone has thrown, and the arm that brought the pitch to the majors. The visual is our own seam schematic. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Kodai Senga',
      context: 'The modern ace forkball — the "ghost fork" — a low-spin tumble with enough arm-side life to be a primary out-pitch.',
      verifiedPro: true,
      distinction: claim(
        'The "ghost fork" — a dead-spin tumble he gave just enough arm-side fade to use as a primary out-pitch. The reshaping that added that fade may also be making it a touch easier for hitters to pick up: a sharper, straighter drop is harder to read than one that drifts.',
        'fangraphs-senga-ghostfork',
        'reputable-analysis',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Roki Sasaki',
      context: 'The deadest-spin non-knuckleball forkball anyone has thrown — so little rotation it behaves almost like a knuckleball off a fastball arm.',
      verifiedPro: true,
      distinction: claim(
        'So nearly spinless it acts like a knuckleball thrown with fastball intent: nothing holds it up, so it falls off the table about as hard as a non-knuckleball pitch can, with only a small, unpredictable drift to either side. The straightest, heaviest tumble in the wing.',
        'mlb-sasaki-fork',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Hideo Nomo',
      context: 'The "Tornado": the forkball that broke into the majors from Japan in 1995 and led both leagues in strikeouts on opposite sides of the Pacific.',
      verifiedPro: true,
      distinction: claim(
        'The arm that sold the pitch to the majors — a deep, tumbling fork hidden behind a whirling, back-to-the-plate windup that led a league in strikeouts on each side of the Pacific. His version won on deception as much as drop.',
        'sabr-nomo',
        'reputable-analysis',
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
    family: 'The tumble',
    tagline: 'Jammed deep between two fingers and snapped out with no spin, so gravity tumbles it down late.',
    feel: 'Bury the ball deep between your fingers, wider than a split. Snap your wrist down as it squirts out. Expect it to feel hard on the arm.',
    steps: [
      'Split your index and middle fingers wide and wedge the ball deep, toward the base of the fingers.',
      'Keep your thumb underneath to hold it in place.',
      'Throw with fastball arm speed and snap the wrist down as the ball leaves.',
      'Let it squirt out with as little spin as possible — the less it spins, the harder it tumbles.',
    ],
    does: {
      headline: 'It leaves with no spin, so it just falls.',
      plain:
        'A forkball is squeezed so deep between the fingers that it comes out almost without spinning. With no spin there is nothing holding it up, so it tumbles down late and hard, like the floor dropped out. It fools hitters who are geared up for a fastball — but the snap that makes it work is tough on the arm.',
    },
  },

  seam: sharedSeam,
}
