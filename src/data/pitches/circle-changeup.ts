import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim, secondhand } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The circle changeup. Fastball arm speed, the ball deeper in the hand, the axis
  tilted toward the arm. The velocity comes off without the arm slowing, and the
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
  defaultView: 'thumb',
  ballDepth: 'deep-in-hand',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'middle',
  thumbRole: 'Thumb curls toward the index to form the inside circle.',
  palmGapCue: 'The ball sits deeper than a fastball, closer to the palm.',
  releaseCue: 'Keep fastball arm speed and let the deeper grip take speed off.',
  visualCaveat: 'Grip geometry is schematic and shows a standard circle-change family; individual circle size varies by hand.',
  contacts: [
    {
      finger: 'index',
      label: 'Index circle',
      seamT: 0.305,
      lift: 0.02,
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
      seamRelation: 'Across the top of the ball',
      pressureRole: 'Main top-finger control',
      cue: 'Fastball arm, deeper hold',
      curl: 0.34,
    },
    {
      finger: 'thumb',
      label: 'Thumb circle',
      seamT: 0.86,
      lift: 0,
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
      'The thumb and index finger form an OK circle against the inner side of the ball while the other three fingers lay across the top. The ball rests deeper in the hand, which bleeds velocity, and the off-center grip tilts the axis toward the arm for fade.',
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
        'Driveline cues the fade by rolling the hand over the ball or swiping its inside: the more side-spin, the more arm-side run. They place most right-handers between roughly 1:30 and 2:30 on the spin clock.',
        'driveline-changeup',
        'reputable-analysis',
        { note: 'Mechanical cues paraphrased from Driveline.' },
      ),
      claim(
        'The deception is the velocity gap on identical arm action, so the standard cue is to keep fastball arm speed and let the grip take the speed off, not the throw.',
        'mlb-glossary-changeup',
        'official-data',
        { note: 'The "start the swing before the pitch arrives" deception is the glossary definition; the maintain-arm-speed cue is standard and widely taught.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'The arm matches the fastball; the velocity comes off from the deeper grip and the loosened circle, not a softer throw. A slight pronation at release tilts the axis arm-side, so the ball fades toward the throwing hand and tumbles as it crosses.',
      'driveline-changeup',
      'reputable-analysis',
      { note: 'Paraphrased. Maintaining fastball arm speed is a standard changeup cue echoed across MLB.com and instructional sources.' },
    ),
    physics: {
      spinAxis: claim(
        'A fastball-like backspin rotated toward the arm. Driveline puts most right-handers between about 1:30 and 2:30 on the spin clock; on Savant the arm-side tilt reads near 3:00 for a right-hander. The more tilt, the more arm-side fade.',
        'driveline-changeup',
        'reputable-analysis',
        { approximate: true, note: 'Webb read near 3:00 on Savant in 2024; the exact clock is method-dependent (observed vs spin-based axes differ).' },
      ),
      spinRateRpm: claim(
        'Lower than the four-seam. The league-average changeup runs about 1,750 rpm. The pitch is defined less by spin rate than by how that spin is aimed.',
        'mlb-spin-vs-velo',
        'official-data',
        { approximate: true, note: 'About 1,746 rpm league average since 2015 per MLB.com. Individual versions vary widely; Williams is an extreme outlier.' },
      ),
      activeSpinPct: claim(
        'High on elite versions, but re-aimed. Webb sat 82% and Williams 90% active spin in 2024; most of the spin is useful, it just points arm-side instead of up.',
        'savant-williams',
        'official-data',
        { note: 'Active-spin percentages from Savant, 2024. The fade comes from the axis tilt, not from dead spin.' },
      ),
      primaryBreak: {
        label: 'Arm-side fade',
        accent: true,
        claim: claim(
          'Several inches toward the throwing hand. Webb ran 9.8 inches of arm-side break in 2024; the extreme end, Williams, reached 19.4 inches, wider than home plate.',
          'savant-webb',
          'official-data',
          { note: '9.8 in is Webb 2024; 19.4 in is Williams 2024, an outlier, not typical.' },
        ),
      },
      secondaryBreak: {
        label: 'Drop under the barrel',
        claim: claim(
          'It tumbles lower than the four-seam because it carries less ride, arriving 8 to 12 mph slower on the same arm action, so the barrel passes over the top of it.',
          'mlb-glossary-changeup',
          'official-data',
          { note: 'The 8 to 12 mph separation is the typical fastball-to-changeup gap; elite circle changes sit near 10 mph.' },
        ),
      },
      teaching: claim(
        'The velocity gap and the fade work because the arm action is identical to the fastball. The eyes read fastball, the swing starts on fastball timing, then the ball arrives ten miles slower while fading down and toward the arm, and the barrel passes over it. Take the arm speed off and the deception collapses.',
        'mlb-glossary-changeup',
        'official-data',
        { note: 'Synthesizes the MLB.com deception definition with Driveline mechanics. Elite circle changes (Hamels, Williams) sit near a 10 mph gap.' },
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
    // Fastball-like backspin rotated hard toward the arm: high active spin (~0.81
    // strength) but a strongly leaned force arrow, the visible difference from the
    // four-seam's straight-up Magnus.
    spinAxis: { x: 0.62, y: 0.52, z: 0.59 },
    forceLabel: 'Magnus, arm-side',
    ivbInches: 4,
    horizontalInches: 14,
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'circle-change',
    shortName: 'Circle change',
    specimenNo: '02',
    heroSub: 'Fastball arm, ten miles slower.',
    heroIntro:
      'The same arm action, the ball deeper in the hand. It arrives late, fading toward the arm and tumbling under the barrel. This is how the pitch fools timing.',
    foundationCaption: 'It fades toward the arm and drops under a fastball-timed swing, all on identical arm speed.',
    mastersIntro:
      'Three documented changeups, three answers. The visual is our own seam schematic. Every figure is season-stamped and links to its source.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Cole Hamels',
      context: 'The textbook circle change and, by run value, the best changeup of the past two decades, a whiff-first pitch built on a ten-mile gap and identical arm action.',
      verifiedPro: true,
      numbers: [
        { label: 'Whiff rate', claim: claim('46.0%', 'fangraphs-changeup-2011', 'reputable-analysis', { note: '2011. Led every pitch in baseball in whiff rate among pitches thrown as often.' }) },
        { label: 'Swinging-strike rate', claim: claim('27.1%', 'fangraphs-changeup-2011', 'reputable-analysis', { note: '2011, first in MLB.' }) },
        { label: 'Run value (wCH)', claim: claim('+28.8', 'fangraphs-changeup-2011', 'reputable-analysis', { note: '2011, first in baseball.' }) },
        { label: 'Velocity', claim: claim('83.4 mph', 'fangraphs-changeup-2011', 'reputable-analysis', { note: '2011, with +8.4 horizontal and +6.0 vertical movement vs an average changeup.' }) },
        { label: 'Velocity gap', claim: claim('~10 mph', 'fangraphs-hamels-2019', 'reputable-analysis', { approximate: true, note: 'Held about a 10 mph separation throughout his career.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Devin Williams',
      context: 'The extreme tail, the Airbender: the highest-spin changeup on record. We show it as the outer limit of the circle grip while flagging that its movement pushes toward screwball territory.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('84.4 mph', 'savant-williams', 'official-data', { note: '2024, 176 changeups thrown.' }) },
        { label: 'Velocity gap', claim: claim('~10.3 mph', 'savant-williams', 'official-data', { approximate: true, note: 'Off his four-seam in 2024; the precise four-seam figure varies by sample.' }) },
        { label: 'Spin rate', claim: claim('2,752 rpm', 'mlb-williams-airbender', 'official-data', { note: 'Highest-spin changeup on record per MLB.com; other sources put it at 2,827 to 2,852 for other samples. All agree it leads.' }) },
        { label: 'Arm-side break', claim: claim('19.4 in', 'mlb-williams-airbender', 'official-data', { note: '2024, wider than the 17-inch plate; the lone arm-side pitch among the season\'s six biggest movers.' }) },
        { label: 'Whiff rate', claim: claim('48.8%', 'savant-williams', 'official-data', { note: '2024, .162 batting average against.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Logan Webb',
      context: 'The other archetype: a high-volume movement-and-location change built for weak contact and ground balls, not whiffs, the counterweight to the bat-missers.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('87.4 mph', 'savant-webb', 'official-data', { approximate: true, note: '2024; ~945 to 990 thrown depending on the cut, one of the highest changeup usages in baseball.' }) },
        { label: 'Velocity gap', claim: claim('5.2 mph', 'savant-webb', 'official-data', { approximate: true, note: 'Off his sinker, tighter than the norm; his change wins on movement and location, not velocity separation.' }) },
        { label: 'Arm-side break', claim: claim('9.8 in', 'savant-webb', 'official-data', { note: '2024, with 82% active spin.' }) },
        { label: 'Whiff vs RHH', claim: claim('18.5% (2024), 38.5% (2025)', 'mccovey-webb', 'reputable-analysis', { note: 'Deliberately shown: a circle change that does not live on whiffs is a legitimate, high-ground-ball profile.' }) },
      ],
      rights: 'original',
    },
  ],

  community: {
    enabled: false,
    safetyNote: 'When the community layer opens, every note will carry a source and confidence label, a content filter will block abusive language, and any note can be flagged. A note hides automatically once enough people report it.',
    provenanceNote:
      'When they open, every community variant will carry the same source and confidence labels as the records above. Nothing appears here unsourced, and no count is shown until it is real.',
    columns: ['Rank', 'Variant', 'Adoption', 'Source tier'],
  },

  guide: {
    family: 'The deception',
    tagline: 'It looks exactly like the fastball and arrives a beat slower. It wrecks a hitter’s timing.',
    feel: 'Fastball arm speed, always. Let the grip take the speed off, never your arm.',
    steps: [
      'Make an OK sign: curl your index down to meet your thumb on the side of the ball, forming a circle.',
      'Let the ball sit deeper in your hand, toward the palm, with the middle and ring fingers across the top.',
      'Throw it with fastball arm speed and the same release; the deep grip eats the velocity for you.',
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
