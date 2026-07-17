import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim, secondhand } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The circle changeup. Fastball arm speed, the ball deeper in the hand, the axis
  tilted toward the arm. The ball arrives late without the arm slowing, and the
  pitch fades and tumbles under a fastball-timed swing. Grip prose paraphrased
  from MLB.com and Driveline, never copied. No player image, no likeness.

  Authored against an independent verification pass. The Devin Williams quote is
  real and correctly relayed (The Athletic 2020, re-published by MLB.com), so it
  carries the secondhand-attributed label. The arm-speed cue is attributed to the
  deception principle, not to a page that did not state it.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.305, lift: 0.02, label: 'Index', finger: 'index', note: 'Over the top, with the thumb it forms the OK circle on the inner side.' },
  { seamT: 0.355, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Across the top, leading the three fingers that grip the ball.' },
  { seamT: 0.86, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Curled to meet the index in a circle; the ball sits deeper in the hand.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'thumb',
  ballDepth: 'deep-in-hand',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'middle',
  orientation: {
    knuckleLine: 'Knuckles rolled toward the arm side so the circle shows the plate its rim.',
    palmFacing: 'Palm turning slightly out — pronated — as the hand comes through.',
  },
  provenance: claim(
    'Finger placement solved from the cited descriptions: thumb and index closed into the OK circle on the inner side, middle and ring carrying the ball across the top, the whole hold deeper in the hand than a fastball. Schematic geometry, not an athlete scan.',
    'mlb-glossary-changeup',
    'reputable-analysis',
    { note: 'Circle size varies by hand; small hands often fit a three-finger or palm change better.' },
  ),
  thumbRole: 'Thumb curls toward the index to form the inside circle.',
  palmGapCue: 'The ball sits deeper than a fastball, closer to the palm.',
  releaseCue: 'Keep fastball arm speed and let the deeper grip take speed off.',
  visualCaveat: 'Grip geometry is schematic and shows a standard circle-change family; individual circle size varies by hand. Do not call a grip a circle change unless the thumb-index circle is visible; small hands may fit a three-finger or palm/football change better.',
  contacts: [
    {
      finger: 'index',
      label: 'Index circle',
      seamT: 0.305,
      lift: 0.02,
      seamOffset: -0.04,
      azimuth: 62,
      engagement: 'inside',
      pinchesToward: 'thumb',
      pressureTier: 'light',
      seamRelation: 'Curls toward thumb on the inside of the ball',
      pressureRole: 'Forms the loose circle, not the main drive',
      cue: 'Circle, do not pinch',
      curl: 0.82,
    },
    {
      finger: 'middle',
      label: 'Middle top',
      seamT: 0.355,
      lift: 0.02,
      seamOffset: 0,
      azimuth: 78,
      engagement: 'pad',
      pressureTier: 'primary',
      seamRelation: 'Across the top of the ball',
      pressureRole: 'Main top-finger control',
      cue: 'Fastball arm, deeper hold',
      curl: 0.34,
    },
    {
      finger: 'ring',
      label: 'Ring pad',
      seamT: 0.405,
      lift: 0.02,
      seamOffset: 0.02,
      azimuth: 74,
      engagement: 'pad',
      pressureTier: 'support',
      seamRelation: 'Beside the middle, sharing the top of the ball',
      pressureRole: 'Carries weight so the index can stay in the circle',
      cue: 'Let it hold real weight',
      curl: 0.36,
    },
    {
      finger: 'thumb',
      label: 'Thumb circle',
      seamT: 0.86,
      lift: 0,
      seamOffset: -0.02,
      azimuth: 50,
      engagement: 'inside',
      pinchesToward: 'index',
      pressureTier: 'support',
      seamRelation: 'Meets the index on the inner side',
      pressureRole: 'Completes the OK circle',
      cue: 'Loose circle, palm side',
      curl: 0.8,
    },
  ],
}

export const circleChange: PitchAtlasEntry = {
  canonical: {
    id: 'circle-changeup',
    name: 'Circle changeup',
    family: 'offspeed',
    grip: claim(
      'The thumb and index finger form an OK circle against the inner side of the ball while the other three fingers lay across the top. The ball rests deeper in the hand, which deadens the exit, and the off-center grip tilts the axis toward the arm for fade.',
      'mlb-glossary-changeup',
      'official-data',
      { note: 'Paraphrased from MLB.com Glossary, not quoted.' },
    ),
    gripDetails: [
      claim(
        'MLB.com calls the circle change the most common changeup grip: thumb and index in a circle on the inner side, the other three fingers over the rest of the ball. Held farther back in the hand, sometimes toward the palm, which is what takes the speed off.',
        'mlb-glossary-changeup',
        'official-data',
        { note: 'Paraphrased from the official glossary.' },
      ),
      claim(
        'Driveline cues the fade by rolling the hand over the ball or swiping its inside: the more the hand turns over, the more arm-side run. The more the axis leans toward the arm, the more the ball runs that way.',
        'driveline-changeup',
        'reputable-analysis',
        { note: 'Mechanical cues paraphrased from Driveline.' },
      ),
      claim(
        'The deception is the late arrival on identical arm action, so the standard cue is to keep fastball arm speed and let the grip deaden the pitch, not the throw.',
        'mlb-glossary-changeup',
        'official-data',
        { note: 'The "start the swing before the pitch arrives" deception is the glossary definition; the maintain-arm-speed cue is standard and widely taught.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'The arm matches the fastball; the deeper grip and loosened circle deaden the exit, not a softer throw. A slight pronation at release tilts the axis arm-side, so the ball fades toward the throwing hand and tumbles as it crosses.',
      'driveline-changeup',
      'reputable-analysis',
      { note: 'Paraphrased. Maintaining fastball arm speed is a standard changeup cue echoed across MLB.com and instructional sources.' },
    ),
    physics: {
      spinAxis: claim(
        'A fastball-like backspin rotated toward the arm. The axis leans arm-side rather than pointing straight up, and the harder it leans, the harder the ball fades toward the throwing hand.',
        'driveline-changeup',
        'reputable-analysis',
        { note: 'Where the tilt sits depends on how the hand turns over; observed and spin-based reads of the axis differ by method.' },
      ),
      shape: claim(
        'It runs toward the throwing hand and tumbles under the barrel, late and on the arm-side. The fade is real and the drop is real; how wide it runs depends on how hard the arm turns the axis over.',
        'savant-webb',
        'official-data',
        { note: 'Described as shape, not a measured number. The arm-side run and the drop are both genuine; the amount varies arm to arm.' },
      ),
      teaching: claim(
        'The late arrival and the fade work because the arm action is identical to the fastball. The eyes read fastball, the swing starts on fastball timing, then the ball arrives a beat late while fading down and toward the arm, and the barrel passes over it. Take the arm speed off and the deception collapses.',
        'mlb-glossary-changeup',
        'official-data',
        { note: 'Synthesizes the MLB.com deception definition with Driveline mechanics. The whole pitch lives on the gap between the look and the clock.' },
      ),
    },
    voice: secondhand(
      "It's just an outlier pitch. The spin I'm able to create makes it different from every other changeup.",
      'mlb-williams-airbender',
      'Devin Williams to The Athletic in 2020, re-published in MLB.com\'s Airbender explainer. It speaks to his own changeup, the extreme tail of the family, not the circle change in general.',
    ),
    rights: 'original',
  },

  motion: {
    // Fastball-like backspin rotated hard toward the arm: a strongly leaned force
    // arrow, the visible difference from the four-seam's straight-up Magnus.
    // verticalShape 'flat' = it neither carries like a fastball nor sharply drops; it
    // tumbles under the barrel while running arm-side.
    spinAxis: { x: 0.62, y: 0.52, z: 0.59 },
    forceLabel: 'Magnus, arm-side',
    verticalShape: 'flat',
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'circle-change',
    shortName: 'Circle change',
    specimenNo: '02',
    heroSub: 'Fastball arm, a beat late.',
    heroIntro:
      'The same arm action, the ball deeper in the hand. It arrives late, fading toward the arm and tumbling under the barrel while the swing is already gone.',
    foundationCaption: 'It fades toward the arm and drops under a fastball-timed swing, all on identical arm speed.',
    mastersIntro:
      'Four documented changeups, four answers. The visual is our own seam schematic. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Cole Hamels',
      context: 'The textbook circle change and one of the defining changeups of his generation, a bat-missing pitch built on identical arm action and late arrival.',
      verifiedPro: true,
      distinction: claim(
        'The bat-missing standard. Hitters chased it because the arm action read fastball and the ball was simply gone by the time the barrel arrived — the textbook everyone since has measured against.',
        'fangraphs-changeup-2011',
        'reputable-analysis',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Devin Williams',
      context: 'The extreme tail, the Airbender. We show it as the outer limit of the circle grip while flagging that its movement pushes toward screwball territory.',
      verifiedPro: true,
      distinction: claim(
        'The outer limit of the grip. His Airbender fades so hard and so late that it reads less like a changeup than a screwball — the same family, taken past where the family usually ends.',
        'mlb-williams-airbender',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Logan Webb',
      context: 'The other archetype: a high-volume shape-and-location change built for weak contact and ground balls, not empty swings, the counterweight to the bat-missers.',
      verifiedPro: true,
      distinction: claim(
        'The ground-ball answer. His change wins on shape and location instead of a huge timing gap, beating the ball into the dirt rather than past the bat — proof a great changeup need not be a chase pitch.',
        'savant-webb',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Johan Santana',
      context: 'The historical benchmark, and the honest one. Widely called the best changeup of its era, built on identical arm action rather than raw movement; the record shows the disguise did the work. He has his own chapter in the Craftsmen.',
      verifiedPro: true,
      distinction: claim(
        'The deception case, fully honest. The legend was the speed drop; the more useful lesson is the disguise — same arm, same look, late arrival.',
        'santana-fangraphs-nohit',
        'reputable-analysis',
      ),
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
    family: 'The deception',
    tagline: 'It looks exactly like the fastball and arrives a beat slower. It wrecks a hitter’s timing.',
    feel: 'Fastball arm speed, always. More surface area and deeper hand contact take the speed off, not a slower arm.',
    steps: [
      'Make an OK sign: curl your index down to meet your thumb on the side of the ball, forming a visible circle.',
      'Let the ball sit deeper in your hand, toward the palm, with more surface on the ball than a fastball.',
      'Throw it with fastball arm speed and the same release; the deep grip deadens the pitch for you.',
      'Let the palm turn out toward your arm side at release. Never try to spin it by hand.',
    ],
    does: {
      headline: 'It lies. Same look, slower clock.',
      plain:
        'Buried in the hand, the ball comes out slower with a little arm-side fade. The hitter has already committed to fastball timing, so the swing starts early, and the barrel passes over the top of it.',
    },
  },

  seam: sharedSeam,
}
