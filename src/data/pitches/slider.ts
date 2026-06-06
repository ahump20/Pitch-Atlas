import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The slider. Gyro, or bullet, spin: the axis points largely at the plate, so
  most of the spin does no Magnus work. It sweeps glove-side, late and short, and
  shows the hitter a red dot. Grip prose paraphrased from Driveline, never copied.
  No player image, no likeness.

  Authored against an independent verification pass. Corrections it forced: the
  league-average slider breaks about 6 inches glove-side per MLB.com (not 3.8);
  Sale's horizontal break is view-dependent and labeled so; and the per-pitch spin
  rates, which render in a Savant widget that would not re-fetch, are approximate.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.4, lift: 0.02, label: 'Index', finger: 'index', note: 'Toward the outer third of the ball, close to the middle finger.' },
  { seamT: 0.44, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Riding a seam, pressure biased to the index side.' },
  { seamT: 0.74, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath, supporting; the ball slides off the hand at release.' },
]

const gripModel: GripModel = {
  defaultView: 'side',
  ballDepth: 'neutral',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'middle',
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
      'It lives in the gap between the fastball and the curve, about 6 to 10 mph off the four-seam, thrown with a firmer wrist and a side-of-the-ball finger pull rather than a curve\'s over-the-top snap. The arm mimics the fastball; the late, short glove-side bite comes from gyro-dominant spin and from gravity acting on a ball with little Magnus lift.',
      'driveline-slider',
      'reputable-analysis',
      { note: 'Paraphrased. The 6 to 10 mph gap is corroborated by MLB.com\'s slider framing.' },
    ),
    physics: {
      spinAxis: claim(
        'The axis points largely toward the plate, bullet spin, so much of the spin is gyroscopic and does no Magnus work. Statcast measures that as low active spin: Cease ran about 25% in 2024, Glasnow about 19%. The measured clock sits near 9:00 to 9:45 for a right-hander.',
        'tht-gyro-physics',
        'reputable-analysis',
        { note: 'Active-spin figures from Savant, 2024. Axis-toward-plate physics from the Hardball Times gyro analysis.' },
      ),
      spinRateRpm: claim(
        'High rpm, little of it useful: the gyro signature. Cease averaged about 2,780 rpm and Glasnow about 2,720 in 2024, hard spin that mostly points at the plate.',
        'savant-cease',
        'official-data',
        { approximate: true, note: 'Per-pitch rpm renders in a Savant widget that would not re-fetch; treated as approximate, season-specific.' },
      ),
      activeSpinPct: claim(
        'Low, which defines the pitch. Cease about 25% active spin in 2024, Glasnow about 19%, roughly three-quarters to four-fifths gyro. A sweeper-shaped slider (Sale, ~62%) is doing sidespin work instead.',
        'savant-cease',
        'official-data',
        { note: 'Active spin is the share of spin that deflects the ball; the rest is bullet spin pointed at the plate.' },
      ),
      primaryBreak: {
        label: 'Glove-side break',
        accent: true,
        claim: claim(
          'Late and short. A tight gyro slider (Cease, 2024) bends only about 2 inches glove-side; the average slider breaks about 6 inches, where a sweeper reaches about 15.',
          'savant-slider-movement',
          'official-data',
          { approximate: true, note: 'Cease ~2.2 in glove-side (leaderboard view). MLB.com gives the average slider ~6 in and the average sweeper ~15 in glove-side.' },
        ),
      },
      secondaryBreak: {
        label: 'Induced vertical break',
        claim: claim(
          'Near zero or slightly positive: it neither rides like a four-seam nor tumbles like a curve. Cease sits about +2 inches, so gravity drives most of the drop while the gyro spin adds almost no lift.',
          'savant-cease',
          'official-data',
          { note: 'Cease +1.9 in induced vertical break, 2024. Small movement in both planes is why a flat gyro slider becomes a cement mixer.' },
        ),
      },
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
    // Gyro: the axis points mostly toward the camera (+z), so magnusStrength is
    // low (~0.28) and the force arrow is short. The red dot shows on the near pole.
    spinAxis: { x: 0.26, y: -0.1, z: 0.96 },
    forceLabel: 'Gyro: minimal Magnus',
    gyro: true,
    ivbInches: 1.9,
    horizontalInches: 2.2,
    horizontalDir: 'glove-side',
    breakView: 'movement',
  },

  display: {
    slug: 'slider',
    shortName: 'Slider',
    specimenNo: '04',
    heroSub: 'Spun like a football.',
    heroIntro:
      'The axis points at the plate, so the spin does almost no work. It stays straight, then breaks late and short to the glove side. The hitter sees a red dot.',
    foundationCaption: 'Bullet spin means almost no Magnus lift, so it drops more than the fastball and bends late, glove-side.',
    mastersIntro:
      'Two reference gyro sliders and the sweeper boundary beside them. The visual is our own seam schematic; every figure is season-stamped and sourced.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Dylan Cease',
      context: 'The reference-grade modern gyro slider: thrown at high volume, bullet-spin dominant, the textbook tight-dot shape and a top swing-and-miss weapon.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('87.7 mph', 'savant-cease', 'official-data', { note: '2024.' }) },
        { label: 'Active spin', claim: claim('~25%', 'savant-cease', 'official-data', { approximate: true, note: '2024, about three-quarters gyro (Savant 24.9%).' }) },
        { label: 'Induced vertical break', claim: claim('+1.9 in', 'savant-cease', 'official-data', { note: '2024, barely above a spinless ball.' }) },
        { label: 'Glove-side break', claim: claim('~2.2 in', 'savant-slider-movement', 'official-data', { approximate: true, note: '2024 leaderboard view; the signed player-page value reads near zero.' }) },
        { label: 'Whiff rate', claim: claim('44.7%', 'savant-cease', 'official-data', { note: '2024, .208 wOBA against; thrown 43% of the time, the most valuable pitch in MLB by run value.' }) },
        { label: 'Spin rate', claim: claim('~2,780 rpm', 'savant-cease', 'official-data', { approximate: true, note: 'High spin, little of it useful.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Tyler Glasnow',
      context: 'The purest gyro of the set: the lowest active spin, thrown harder than most sliders. It shows what almost-all-gyro looks like, near-zero induced break, yet still a plus whiff pitch.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('90.0 mph', 'savant-glasnow', 'official-data', { note: '2024.' }) },
        { label: 'Active spin', claim: claim('~19%', 'savant-glasnow', 'official-data', { approximate: true, note: '2024, over four-fifths gyro (Savant 18.7%), the lowest of the set.' }) },
        { label: 'Induced vertical break', claim: claim('~+0.5 in', 'savant-glasnow', 'official-data', { approximate: true, note: '2024, near zero, consistent with its near-pure gyro spin.' }) },
        { label: 'Glove-side break', claim: claim('~2.5 in', 'savant-glasnow', 'official-data', { approximate: true, note: '2024, minimal, the low-movement gyro profile.' }) },
        { label: 'Whiff rate', claim: claim('40.4%', 'savant-glasnow', 'official-data', { note: '2024.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Chris Sale',
      context: 'The boundary case, included honestly, not as a gyro exemplar. Statcast called it a slider in 2024, but at about 62% active spin and double-digit glove-side break, its shape is sweeper-like. It marks where the gyro slider ends and the sweeper begins.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('78.6 mph', 'savant-sale', 'official-data', { note: '2024.' }) },
        { label: 'Active spin', claim: claim('~62%', 'savant-sale', 'official-data', { note: '2024, far higher than Cease or Glasnow, the sidespin end of the family.' }) },
        { label: 'Induced vertical break', claim: claim('-4.7 in', 'savant-sale', 'official-data', { note: '2024, it drops below a spinless ball, unlike the gyro sliders.' }) },
        { label: 'Glove-side break', claim: claim('~11 to 13 in', 'savant-sale', 'official-data', { approximate: true, note: '2024, view-dependent: ~6 in signed on the player page, ~12 to 13.6 in on total-movement views.' }) },
        { label: 'Whiff rate', claim: claim('42.7%', 'savant-sale', 'official-data', { note: '2024.' }) },
      ],
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
