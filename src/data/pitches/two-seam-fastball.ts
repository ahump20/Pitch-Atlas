import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { gripPhotosFor } from '../grips'
import { sharedSeam } from './_shared-seam'

/*
  The two-seam fastball / sinker. The four-seam movement opposite: the same arm,
  the axis tilted toward the throwing hand, ride traded for arm-side run and sink.
  This is the craft of the grip, not a gauge. Movement is read as shape — a
  direction and a character — never as a measured number. Grip prose is
  paraphrased from Driveline, never copied. No player image, no likeness.

  The read: the seams, run along instead of across, tilt the ball away from pure
  backspin. The ball gives up the four-seam's ride, runs hard toward the throwing
  arm, and finishes at the knees. Thrown low, it turns barrels into ground balls.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.12, lift: 0.02, label: 'Index', finger: 'index', note: 'Along one of the two narrow seams, not across the horseshoe.' },
  { seamT: 0.17, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Beside the index, the pair running with the seams.' },
  { seamT: 0.62, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath on the leather, slightly off-center for control.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'top',
  ballDepth: 'out-in-fingers',
  fingerSpacing: 'slight-spread',
  primaryPressureFinger: 'index',
  orientation: {
    knuckleLine: 'Knuckles lined up with the narrow seam lanes, not across them.',
    palmFacing: 'Palm to the plate, tilting a touch toward the arm side at release.',
  },
  provenance: claim(
    'Finger placement solved from the cited grip description: index and middle riding the paired narrow seams like rails, thumb beneath. Schematic geometry, not an athlete scan.',
    'driveline-sinker',
    'reputable-analysis',
    { note: 'The along-seam lanes are the documented two-seam/sinker tell; one-seam variants differ.' },
  ),
  thumbRole: 'Thumb supports underneath and can sit slightly off-center.',
  palmGapCue: 'Held like a fastball: out in the fingers, not choked into the palm.',
  releaseCue: 'Throw fastball effort and let the along-seam contact tilt the axis.',
  visualCaveat: 'Grip geometry is schematic and shows the standard along-seam family, not every one-seam or sinker variant. In a live photo, the tell is two fingers riding paired seams like train tracks.',
  contacts: [
    {
      finger: 'index',
      label: 'Index seam',
      seamT: 0.12,
      lift: 0.02,
      seamOffset: 0,
      azimuth: 8,
      engagement: 'pad',
      pressureTier: 'primary',
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
      seamOffset: 0,
      azimuth: 8,
      engagement: 'pad',
      pressureTier: 'support',
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
      seamOffset: 0.05,
      azimuth: 50,
      engagement: 'inside',
      pressureTier: 'support',
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
    name: 'Two-seam fastball',
    family: 'fastball',
    grip: claim(
      'Index and middle fingers run along the pair of narrow seams that sit close together, rather than across the horseshoe. That orientation tilts the ball away from pure backspin and trades ride for arm-side run and sink.',
      'driveline-sinker',
      'reputable-analysis',
      { note: 'Paraphrased from Driveline, not quoted.' },
    ),
    gripDetails: [
      claim(
        'The standard Driveline two-seam grip lays the index and middle fingers on the two close seams, thumb underneath or slightly off-center, ring finger steadying the side. It is the baseline grip most arms reach for first.',
        'driveline-sinker',
        'reputable-analysis',
        { note: 'Paraphrased. Driveline labels this the default two-seam family and the one most pitchers default to.' },
      ),
      claim(
        'For a sinker specifically, the index finger often shifts slightly inward while keeping seam contact, biasing the release toward side-spin and diving action over balanced backspin-and-run.',
        'driveline-sinker',
        'reputable-analysis',
        { note: 'Paraphrased.' },
      ),
      claim(
        'The most extreme movers ride a single seam: a one-seam grip that orients the leather to bend the airflow itself, adding run and sink beyond what the spin alone would suggest. Most of the biggest seam-shifted-wake movers Driveline studied were throwing a one-seam sinker.',
        'driveline-ssw',
        'reputable-analysis',
        { note: 'Paraphrased. The one-seam grip dominated Driveline\'s study of the largest axis-deviation pitchers.' },
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
        'Backspin tilted toward the throwing arm, the axis rolled off the four-seam\'s near-vertical toward the hand. Less of the spin lifts the ball, so it rides less and sinks. Mirror the tilt for a left-hander.',
        'driveline-sinker',
        'reputable-analysis',
        { note: 'General orientation, not a measured axis. A lower arm slot leans the tilt further; Valdez re-oriented his by dropping his arm angle.' },
      ),
      shape: claim(
        'Hard arm-side run with late sink, finishing at the knees. It gives up the four-seam\'s ride and tails toward the throwing hand instead, so it appears to dive by comparison and rolls bats over into the ground. The extreme movers run on the seams, bending later than the spin alone would suggest.',
        'savant-valdez',
        'official-data',
        { note: 'Described as shape, not a measured break. The MLB glossary defines the sinker qualitatively by hard downward and arm-side movement; it sets no benchmark.' },
      ),
      teaching: claim(
        'A four-seam rides because near-pure backspin points the Magnus force straight up. A sinker tilts that axis toward the arm and throws in less efficient spin, so the force points up and sideways instead. The ball rides less, runs toward the arm, and finishes low, which is how it turns barrels into ground balls.',
        'mlb-glossary-sinker',
        'official-data',
        { note: 'Synthesized from the MLB glossary (drops, forces grounders, thrown lower with less spin) and the Driveline axis and seam-shifted-wake mechanics.' },
      ),
    },
    rights: 'original',
    gripImages: gripPhotosFor('two-seam'),
  },

  motion: {
    // Backspin tilted toward the arm with a gyro component, so the force arrow is
    // shorter and leaned, not the four-seam's full-length vertical. verticalShape
    // 'flat' = it gives up the four-seam's ride and finishes near a spinless plane,
    // so it sinks by comparison; the run carries the read instead.
    spinAxis: { x: 0.7, y: 0.38, z: 0.61 },
    forceLabel: 'Magnus, tilted',
    verticalShape: 'flat',
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'two-seam',
    shortName: 'Two-Seam',
    specimenNo: '01',
    heroSub: 'The four-seam, tilted.',
    heroIntro:
      'Same arm, the axis rolled toward the hand. Ride becomes run, and the ball finishes at the knees. Taken to its extreme — the most movement, the least ride — this is the pitch the pros call a sinker.',
    foundationCaption: 'It rides far less than a four-seam and runs toward the arm. Thrown low, it produces ground balls.',
    mastersIntro:
      'Three documented sinkers — the two-seam taken to its extreme, three ways down. The visual is our own seam schematic. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Framber Valdez',
      context: 'The textbook modern sinker as a ground-ball engine, a whole elite starter built around one arm-side-running, diving fastball thrown at the knees.',
      verifiedPro: true,
      distinction: claim(
        'The ground-ball engine. Hard arm-side run and almost no ride leave the ball diving at the knees, and he has led the league in rolling bats over into weak contact — a whole rotation arm built around one sinker thrown low.',
        'fangraphs-valdez',
        'reputable-analysis',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Logan Webb',
      context: 'The right-handed answer to the same idea: a sinker-first starter whose wide arm-side spread rolls bats over into weak contact.',
      verifiedPro: true,
      distinction: claim(
        'The low-spin case taken to its end. He throws it with so little ride that it barely fights gravity at all, so it sinks hard and runs wide to the arm side — a sinker-first starter who manufactures ground balls in bulk.',
        'savant-webb',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Clay Holmes',
      context: 'The seam-shifted-wake case: a power sinker whose movement bends well past what its spin axis predicts, the clearest live example of a ball running on its seams.',
      verifiedPro: true,
      distinction: claim(
        'The seam-shifted-wake case. His power sinker bends well past where the spin axis says it should, the ball running late on its seams — among the most deceptive sinkers in the game because the movement arrives after the eye has committed.',
        'medium-perfect-sinker',
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
