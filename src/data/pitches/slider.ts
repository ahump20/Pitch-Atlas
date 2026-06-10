import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The slider. Gyro, or bullet, spin: the axis points largely at the plate, so
  most of the spin does no Magnus work. It sweeps glove-side, late and short, and
  shows the hitter a red dot. Grip prose paraphrased from Driveline, never copied.
  No player image, no likeness.

  Movement is described as shape, not measured: a direction and a character, never
  a number. The atlas owner has never been tracked, so any gauge for how this pitch
  moves would be invented. The shape read is honest; the gauge is not.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.4, lift: 0.02, label: 'Index', finger: 'index', note: 'Toward the outer third of the ball, close to the middle finger.' },
  { seamT: 0.44, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Riding a seam, pressure biased to the index side.' },
  { seamT: 0.74, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath, supporting; the ball slides off the hand at release.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'side',
  ballDepth: 'neutral',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'middle',
  orientation: {
    knuckleLine: 'Knuckles turned toward the outer third, set to pull down the side.',
    palmFacing: 'Palm rolling slightly glove-side at release — the football spiral.',
  },
  provenance: claim(
    'Finger placement solved from the cited grip description: middle finger riding a long seam near the outer third, index alongside, the pair set to pull down the side of the ball. Schematic geometry, not an athlete scan.',
    'driveline-slider',
    'reputable-analysis',
    { note: 'The along-the-seam outer-third hold is what separates this from a cutter, which keeps a crossing four-seam anchor.' },
  ),
  thumbRole: 'Thumb supports underneath while the top fingers sit off-center.',
  palmGapCue: 'Firm but not buried; the ball needs room to slide off the side.',
  releaseCue: 'The fingers pull down the side so the ball spirals like a football.',
  visualCaveat: 'Grip geometry is schematic and shows a gyro-slider family; sweepers and spiked sliders shift the finger posture.',
  contacts: [
    {
      finger: 'index',
      label: 'Index off-center',
      seamT: 0.4,
      lift: 0.02,
      seamOffset: -0.03,
      azimuth: 30,
      engagement: 'pad',
      pressureTier: 'support',
      seamRelation: 'Close to middle, toward the outer third',
      pressureRole: 'Guides the off-center release',
      cue: 'Close, not wide',
      curl: 0.34,
    },
    {
      finger: 'middle',
      label: 'Middle seam',
      seamT: 0.44,
      lift: 0.02,
      seamOffset: 0,
      azimuth: 32,
      engagement: 'pad',
      pressureTier: 'primary',
      seamRelation: 'Rides the seam near the outer third',
      pressureRole: 'Primary slider pressure',
      cue: 'Let it slide off this side',
      curl: 0.38,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.74,
      lift: 0,
      seamOffset: 0.04,
      azimuth: 45,
      engagement: 'inside',
      pressureTier: 'support',
      seamRelation: 'Underneath as support',
      pressureRole: 'Balances the off-center top fingers',
      cue: 'Support, do not squeeze',
      curl: 0.44,
    },
  ],
}

export const slider: PitchAtlasEntry = {
  canonical: {
    id: 'slider',
    name: 'Slider',
    family: 'breaking',
    grip: claim(
      'Gripped off-center: index and middle fingers close together toward the outer third of the ball, the middle finger riding a seam, pressure biased to the index side. At release the hand stays slightly supinated and the fingers slash down the side, so the ball spirals off like a thrown football.',
      'driveline-slider',
      'reputable-analysis',
      { note: 'Paraphrased from Driveline, not quoted.' },
    ),
    gripDetails: [
      claim(
        'Driveline\'s common grip holds the two fingers close together and slightly off-center, the middle finger on or just inside a seam, the index on the leather, thumb supporting underneath, with the cue to let the ball slide off the hand.',
        'driveline-slider',
        'reputable-analysis',
        { note: 'Paraphrased. Finger placement summarized from the grip section.' },
      ),
      claim(
        'Bullet spin comes from a slightly supinated hand pulling down the side of the ball so it spirals like a football. A spiked grip, with the index finger knuckled, helps the ball slip off the middle finger to maximize the gyro and minimize back or side spin.',
        'driveline-grips-sliders',
        'reputable-analysis',
        { note: 'Paraphrased. The throw-it-like-a-football cue and the spiked-grip mechanism are Driveline\'s.' },
      ),
      claim(
        'The red dot is the visible signature of the gyro spin: as the ball spirals, the seams trace a dot on the leading face. A tighter dot means more useful spin; a perfectly gyroscopic, no-dot slider is the flat, hittable cement mixer.',
        'fangraphs-romo-no-dot',
        'reputable-analysis',
        { note: 'Paraphrased. Hitters key on this dot to read slider from fastball.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It lives in the gap between the fastball and the curve, a touch softer than the four-seam, thrown with a firmer wrist and a side-of-the-ball finger pull rather than a curve\'s over-the-top snap. The arm mimics the fastball; the late, short glove-side bite comes from gyro-dominant spin and from gravity acting on a ball with little Magnus lift.',
      'driveline-slider',
      'reputable-analysis',
      { note: 'Paraphrased. The fastball-adjacent timing read is corroborated by MLB.com\'s slider framing.' },
    ),
    physics: {
      spinAxis: claim(
        'The axis points largely toward the plate, bullet spin, so much of the spin is gyroscopic and does no Magnus work. Tracking reads that as low active spin: most of the turn is wasted as a spiral. For a right-hander the tilt sits late in the clock, biased to the glove side.',
        'tht-gyro-physics',
        'reputable-analysis',
        { note: 'Axis-toward-plate physics from the Hardball Times gyro analysis. Described as orientation, not a measured figure.' },
      ),
      shape: claim(
        'Stays on the fastball line, then bends late and short to the glove side, a sudden glove-side cut rather than a long sweep. It barely rides and barely tumbles; gravity, not lift, drives most of its fall. The hitter reads a red dot and commits a beat too soon.',
        'savant-slider-movement',
        'reputable-analysis',
        { note: 'Described as shape, not a measured number. How far it bends depends on the arm and the grip; a tight gyro slider is short and sharp, a sweeper-leaning one is broad.' },
      ),
      teaching: claim(
        'A four-seam spins backspin, its axis sideways to flight, so the Magnus force pushes up and it rides. A gyro slider spins like a thrown football, its axis pointed at the catcher, so the spin makes almost no Magnus force. With little lift to fight gravity it drops more than the fastball, and the small tilt left in the axis bends it glove-side, late and short. Same arm, opposite Magnus budget.',
        'tht-gyro-physics',
        'reputable-analysis',
        { note: 'Synthesis of the active-spin definition and the Hardball Times gyro physics: an axis toward the plate produces no Magnus force.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Gyro: the axis points mostly toward the camera (+z), so the Magnus force is
    // small and the force arrow is short. The red dot shows on the near pole.
    // verticalShape 'flat' = it neither rides like a four-seam nor tumbles like a curve.
    spinAxis: { x: 0.26, y: -0.1, z: 0.96 },
    forceLabel: 'Gyro: minimal Magnus',
    gyro: true,
    verticalShape: 'flat',
    horizontalDir: 'glove-side',
    breakView: 'movement',
  },

  display: {
    slug: 'slider',
    shortName: 'Slider',
    specimenNo: '04',
    heroSub: 'Spun like a football. Read by the late bite, not by a gun.',
    heroIntro:
      'The axis points at the plate, so the spin does almost no work. It stays on the fastball line, then breaks late and short to the glove side. The hitter sees a red dot.',
    foundationCaption: 'Bullet spin means almost no Magnus lift, so it drops more than the fastball and bends late, glove-side.',
    mastersIntro:
      'Two reference gyro sliders, then the sweeper boundary beside them. The visual is our own seam schematic. What sets each version apart is in the shape and the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Dylan Cease',
      context: 'The reference-grade modern gyro slider: thrown at high volume, bullet-spin dominant, the textbook tight-dot shape and a top swing-and-miss weapon.',
      verifiedPro: true,
      distinction: claim(
        'The textbook tight dot. Almost pure gyro, so it barely deflects in either plane and simply vanishes late, glove-side; hitters keep swinging through the spot where it used to be. The cleanest version of what the pitch is.',
        'savant-cease',
        'reputable-analysis',
        { note: 'Described as shape and read, not a gauge. A near-pure gyro slider shows the tightest red dot and the shortest, latest bite.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Tyler Glasnow',
      context: 'The purest gyro of the set, thrown firm and tight. It shows what almost-all-gyro looks like: barely any early deflection, then late chase bite.',
      verifiedPro: true,
      distinction: claim(
        'The tightest, flattest gyro of the three. Almost none of the spin does Magnus work, so it neither rides nor sweeps, it just holds the fastball line and bites a hair at the end. Deception carries it where movement does not.',
        'savant-glasnow',
        'reputable-analysis',
        { note: 'Described as shape and read, not a gauge. The near-pure gyro profile means minimal deflection in either plane.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Chris Sale',
      context: 'The boundary case, included honestly, not as a gyro exemplar. The tracking taxonomy called it a slider, but its shape is sweeper-like. It marks where the gyro slider ends and the sweeper begins.',
      verifiedPro: true,
      distinction: claim(
        'Not really a gyro at all, and that is the point. From his low slot it does real sidespin work and sweeps broad and tumbling across the zone, where the gyro sliders cut short and flat. It marks the edge of the family.',
        'savant-sale',
        'reputable-analysis',
        { note: 'Described as shape and read, not a gauge. Its sidespin-heavy, sweeping shape sits at the boundary between the gyro slider and the sweeper.' },
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
    family: 'The late bite',
    tagline: 'It looks like the fastball, then breaks late and short to the glove side. The hitter sees a red dot.',
    feel: 'Firm wrist. Stay on the side of the ball and let it slide off. Think of throwing a tight spiral.',
    steps: [
      'Set your index and middle fingers close together, just off-center toward the outer third of the ball.',
      'Ride the middle finger on a seam, bias the pressure to the index side, thumb supporting underneath.',
      'Keep the hand slightly behind the ball and let it slip off the fingers like a thrown football.',
      'Use your fastball arm; the late, short break comes from the spin, not from muscling it.',
    ],
    does: {
      headline: 'It spins like a thrown football, so it barely fights gravity.',
      plain:
        'Most of a slider’s spin points straight at the catcher, so it does almost no lifting work. With little to hold it up, it drops more than the fastball, and the small tilt left in the spin bends it glove-side: late, short, and hard to read until it is too late.',
    },
  },

  seam: sharedSeam,
}
