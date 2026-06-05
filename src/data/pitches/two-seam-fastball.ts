import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The two-seam fastball / sinker. The four-seam movement opposite: the same arm,
  the axis tilted toward the throwing hand, ride traded for arm-side run and sink.
  Every number traces to the registry. Where a figure is rounded, era- or
  method-dependent, it carries `approximate`. Grip prose is paraphrased from
  Driveline, never copied. No player image, no likeness.

  Authored against an independent verification pass. Two corrections it forced:
  the Logan Webb sinker induced vertical break is about 1.1 in (his ~15 in figure
  is arm-side run, not ride), and the Clay Holmes 28.2 degree axis deviation is
  sourced to the analysis that actually reports it, with his velocity labeled to
  the season it belongs to.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.12, lift: 0.02, label: 'Index', finger: 'index', note: 'Along one of the two narrow seams, not across the horseshoe.' },
  { seamT: 0.17, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Beside the index, the pair running with the seams.' },
  { seamT: 0.62, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath on the leather, slightly off-center for control.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'out-in-fingers',
  fingerSpacing: 'slight-spread',
  primaryPressureFinger: 'index',
  thumbRole: 'Thumb supports underneath and can sit slightly off-center.',
  palmGapCue: 'Held like a fastball: out in the fingers, not choked into the palm.',
  releaseCue: 'Throw fastball effort and let the along-seam contact tilt the axis.',
  visualCaveat: 'Grip geometry is schematic and shows the standard along-seam family, not every one-seam or sinker variant.',
  contacts: [
    {
      finger: 'index',
      label: 'Index seam',
      seamT: 0.12,
      lift: 0.02,
      seamRelation: 'Runs along one narrow seam',
      pressureRole: 'Starts the arm-side bias',
      cue: 'Along the seam, not across it',
      curl: 0.2,
    },
    {
      finger: 'middle',
      label: 'Middle seam',
      seamT: 0.17,
      lift: 0.02,
      seamRelation: 'Runs along the paired narrow seam',
      pressureRole: 'Pairs with index to guide run',
      cue: 'Same width as fastball',
      curl: 0.2,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.62,
      lift: 0,
      seamRelation: 'Under leather, slightly off-center',
      pressureRole: 'Balances control under the seam pair',
      cue: 'Do not pinch it tight',
      curl: 0.38,
    },
  ],
}

export const twoSeam: PitchAtlasEntry = {
  canonical: {
    id: 'two-seam-fastball',
    name: 'Two-seam fastball (sinker)',
    family: 'fastball',
    grip: claim(
      'Index and middle fingers run along the pair of narrow seams that sit close together, rather than across the horseshoe. That orientation tilts the spin off pure backspin and trades ride for arm-side run and sink.',
      'driveline-sinker',
      'reputable-analysis',
      { note: 'Paraphrased from Driveline, not quoted.' },
    ),
    gripDetails: [
      claim(
        'The standard Driveline two-seam grip lays the index and middle fingers on the two close seams, thumb underneath or slightly off-center, ring finger steadying the side. It is the baseline they reach for about three-quarters of the time.',
        'driveline-sinker',
        'reputable-analysis',
        { note: 'Paraphrased. The FT 1 label and the roughly 75 percent usage come from Driveline.' },
      ),
      claim(
        'For a sinker specifically, the index finger often shifts slightly inward while keeping seam contact, biasing the release toward side-spin and diving action over balanced backspin-and-run.',
        'driveline-sinker',
        'reputable-analysis',
        { note: 'Paraphrased.' },
      ),
      claim(
        'The most extreme movers ride a single seam: a one-seam grip that orients the leather to bend the airflow itself, adding run and sink beyond what spin alone predicts. Driveline found 12 of the 20 largest seam-shifted-wake movers threw a one-seam sinker.',
        'driveline-ssw',
        'reputable-analysis',
        { approximate: true, note: 'Paraphrased. The 12-of-20 figure is from the Driveline 2020 analysis of the largest axis-deviation pitchers.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'The release rolls the fingers over the outer half of the ball, adding side-spin to the backspin and tilting the axis toward the arm. A lower slot adds more of that tilt; on one-seam grips the seam orientation adds late sink without changing the slot. The cue is a downhill plane attacked at the knees, a pitch built to be hit on the ground.',
      'driveline-sinker',
      'reputable-analysis',
      { note: 'Paraphrased from Driveline; the seam-shifted-wake point is cross-referenced to the Driveline SSW article.' },
    ),
    physics: {
      spinAxis: claim(
        'Backspin tilted toward the throwing arm, around a 1:30 to 2:30 clock for a right-hander versus near 12:00 for a four-seam. Less of the spin converts to lift, so the ball rides less and sinks.',
        'driveline-sinker',
        'reputable-analysis',
        { approximate: true, note: 'General range; mirror it for a left-hander. Valdez re-oriented his to about 10:45 in 2024 by dropping his arm angle near 43 degrees.' },
      ),
      spinRateRpm: claim(
        '1,900 to 2,250 rpm for elite arms. Webb spins about 1,939, Valdez about 2,150. The point is not high spin; sinkers are often thrown with less spin to keep the ball down.',
        'savant-webb',
        'official-data',
        { approximate: true, note: 'Webb 1,939 rpm and Valdez about 2,150 rpm from Savant; the band is a rounded characterization, not a rule.' },
      ),
      activeSpinPct: claim(
        'Lower effective lift, by design. Valdez sat near 79 percent active spin in 2024; the axis tilt and any gyro or seam component point less of the force straight up.',
        'pitcherlist-valdez',
        'reputable-analysis',
        { approximate: true, note: 'Lowering it in 2024 dropped his induced vertical break to about 6.3 in and restored the ground-ball bite.' },
      ),
      primaryBreak: {
        label: 'Arm-side run',
        accent: true,
        claim: claim(
          'Strong arm-side run is the signature. Framber Valdez runs about 15.5 to 16 inches toward his arm side, well beyond a typical sinker.',
          'savant-valdez',
          'official-data',
          { approximate: true, note: 'Savant arm-side horizontal break across 2024 to 2026. The MLB glossary defines the sinker qualitatively by hard downward and arm-side movement; it sets no inch benchmark.' },
        ),
      },
      secondaryBreak: {
        label: 'Induced vertical break',
        claim: claim(
          'Far below a four-seam. The Webb sinker induces only about 1 inch of ride; it does not drop more than gravity, it just rides far less than a backspinning four-seam, so it sinks by comparison.',
          'savant-webb',
          'official-data',
          { approximate: true, note: 'Webb 2024 induced vertical break is about 1.1 in (his ~15 in figure is arm-side run, not ride). Total drop including gravity is about 31 in.' },
        ),
      },
      teaching: claim(
        'A four-seam rides because near-pure backspin points the Magnus force straight up. A sinker tilts that axis toward the arm and throws in less efficient spin, so the force points up and sideways instead. The ball rides less, runs toward the arm, and finishes low, which is how it turns barrels into ground balls.',
        'mlb-glossary-sinker',
        'official-data',
        { note: 'Synthesized from the MLB glossary (drops, forces grounders, thrown lower with less spin) and the Driveline axis and seam-shifted-wake mechanics.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Backspin tilted toward the arm with a gyro component: magnusStrength of this
    // axis lands near 0.80, matching the ~79 percent active spin, so the force
    // arrow is shorter and leaned, not the four-seam full-length vertical.
    spinAxis: { x: 0.7, y: 0.38, z: 0.61 },
    forceLabel: 'Magnus, tilted',
    ivbInches: 7,
    horizontalInches: 15,
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'two-seam',
    shortName: 'Sinker',
    specimenNo: '01',
    heroSub: 'The four-seam, tilted.',
    heroIntro:
      'Same arm, the axis rolled toward the hand. Ride becomes run, and the ball finishes at the knees. This is how the pitch sinks.',
    foundationCaption: 'It rides far less than a four-seam and runs toward the arm. Thrown low, it produces ground balls.',
    mastersIntro:
      'Three documented sinkers, three ways down. The visual is our own seam schematic. Every figure is season-stamped and links to its source.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Framber Valdez',
      context: 'The textbook modern sinker as a ground-ball engine, a whole elite starter built around one arm-side-running, diving fastball thrown at the knees.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('94.1 mph', 'pitcherlist-valdez', 'reputable-analysis', { approximate: true, note: '2024; Savant shows about 94.2 in 2025.' }) },
        { label: 'Induced vertical break', claim: claim('~6.3 in', 'pitcherlist-valdez', 'reputable-analysis', { approximate: true, note: '2024, down from 9.9 the prior year. Low for a fastball, which is the point.' }) },
        { label: 'Arm-side run', claim: claim('~15.5 in', 'savant-valdez', 'official-data', { approximate: true, note: '2024 Savant horizontal break; elite, well above the league sinker.' }) },
        { label: 'Spin rate', claim: claim('~2,150 rpm', 'savant-valdez', 'official-data', { approximate: true, note: 'A single tracked 2024 sinker read 2,153 rpm.' }) },
        { label: 'Ground-ball rate', claim: claim('60.6% (MLB leader)', 'fangraphs-valdez', 'reputable-analysis', { approximate: true, note: '2024, about 60.6 to 61.7 percent by cut; led MLB. Whole-arsenal, driven by the sinker.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Logan Webb',
      context: 'The right-handed answer to the same idea: a sinker-first starter whose wide arm-side spread rolls bats over into weak contact.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('92.6 mph', 'savant-webb', 'official-data', { note: '2024 pitch-arsenal value.' }) },
        { label: 'Induced vertical break', claim: claim('~1.1 in', 'savant-webb', 'official-data', { approximate: true, note: '2024. Almost no ride, the defining trait of a sinker. Total drop with gravity is about 31 in.' }) },
        { label: 'Arm-side run', claim: claim('~15.1 in', 'savant-webb', 'official-data', { approximate: true, note: '2024 Savant arm-side horizontal break.' }) },
        { label: 'Spin rate', claim: claim('~1,939 rpm', 'savant-webb', 'official-data', { approximate: true, note: 'A low-spin sinker, about 13.2 revolutions hand to plate, the less-spin-more-sink design.' }) },
        { label: 'Ground-ball rate', claim: claim('57.2% (4th in MLB)', 'fangraphs-webb', 'reputable-analysis', { approximate: true, note: '2024; led MLB with 353 ground balls produced.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Clay Holmes',
      context: 'The seam-shifted-wake case: a power sinker whose movement bends well past what its spin axis predicts, the clearest live example of a ball running on its seams.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('93.7 mph', 'savant-holmes', 'official-data', { approximate: true, note: '2025 to 2026 as a Mets starter; he sat 96.6 mph as a 2024 Yankees closer.' }) },
        { label: 'Axis deviation (seam-shifted wake)', claim: claim('~28 deg', 'medium-perfect-sinker', 'reputable-analysis', { approximate: true, note: 'A 28.2 degree gap between inferred and observed movement, among the most deceptive sinkers in the league.' }) },
        { label: 'Spin rate', claim: claim('~2,130 rpm', 'savant-holmes', 'official-data', { approximate: true, note: 'Current Mets sinker, about 14 revolutions hand to plate.' }) },
      ],
      rights: 'original',
    },
  ],

  community: {
    enabled: false,
    safetyNote: 'Community variants will launch with age-aware visibility, source labels, and coach and parent safeguards.',
    provenanceNote:
      'When they open, every community variant will carry the same source and confidence labels as the records above. Nothing appears here unsourced, and no count is shown until it is real.',
    columns: ['Rank', 'Variant', 'Adoption', 'Source tier'],
  },

  guide: {
    family: 'The runner',
    tagline: 'Almost as hard as the four-seam, but it tails toward your arm and sinks. A ground-ball pitch.',
    feel: 'Same effort as the four-seam. Stay behind it and let the seams do the work.',
    steps: [
      'Set your index and middle fingers along the two narrow seams where they run close together, not across the horseshoe.',
      'Keep the same width and softness as your four-seam: a finger-width apart, held out in the hand.',
      'Rest your thumb underneath on the leather; some pitchers ride the side of the thumb against a seam.',
      'Throw it like a fastball. The grip makes the movement. You do not have to.',
    ],
    does: {
      headline: 'It runs toward your arm and settles at the knees.',
      plain:
        'Running along the seams tilts the spin, so the ball tails toward your throwing hand and rides far less than a four-seam, which is why it sinks by comparison. You trade a little pure life for movement that buys ground balls and weak contact.',
    },
  },

  seam: sharedSeam,
}
