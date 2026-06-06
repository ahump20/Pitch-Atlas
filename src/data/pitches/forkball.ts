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

  Authored against an adversarial verification pass that fetched every cited page.
  Corrections it forced: the Japan-vs-MLB prevalence point is re-sourced to
  Wikipedia (not the glossary); the four-seam/two-seam orientation detail was
  dropped (the Sasaki article does not state it); and the explicit ~1,000-1,200 rpm
  range was replaced with the confirmed Sasaki (578 rpm) and Senga (~1,047 rpm)
  figures plus BP's "about half a typical pitch."
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.18, lift: 0.0, label: 'Index', finger: 'index', note: 'Split wide and jammed deep against the side of the ball.' },
  { seamT: 0.82, lift: 0.0, label: 'Middle', finger: 'middle', note: 'The other fork, split wider than a splitter, the ball wedged to the knuckles.' },
  { seamT: 0.5, lift: 0.02, label: 'Thumb', finger: 'thumb', note: 'Underneath, holding the deep ball in place.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'deep-in-hand',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'index',
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
      seamRelation: 'Split wide, jammed deep',
      pressureRole: 'One side of the deep fork',
      cue: 'Bury it deep',
      curl: 0.2,
    },
    {
      finger: 'middle',
      label: 'Middle fork',
      seamT: 0.82,
      lift: 0,
      seamRelation: 'Split wider than a splitter',
      pressureRole: 'Other side of the deep fork',
      cue: 'Wider than a split',
      curl: 0.2,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.5,
      lift: 0.02,
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
      'The ball is jammed deep between the index and middle fingers — forked wider than a splitter, wedged down toward the knuckles — and released with a downward snap of the wrist. That deep grip and snap strip the spin off the ball so it tumbles down sharply, like a 12-to-6 curve.',
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
      'It is thrown around 78 to 87 mph with a fastball arm action, but the ball squirts out from between the deep-forked fingers with almost no spin rather than being spun. The downward wrist snap that gives it its tumble also puts real torque on the elbow, which is why MLB.com calls it one of the more taxing pitches to throw.',
      'mlb-glossary-forkball',
      'reputable-analysis',
      { note: 'Paraphrased. The squirt-out release and the taxing-on-the-arm point are from the MLB glossary.' },
    ),
    physics: {
      spinAxis: claim(
        'Very little spin, so no strong axis. What there is leans toward topspin and arm-side: Kodai Senga\'s ghost fork measures a spin axis near 246 degrees, consistent with a pitch that tumbles down with some arm-side run.',
        'fangraphs-senga-ghostfork',
        'reputable-analysis',
        { note: 'Senga ghost-fork spin axis 246.1 degrees, FanGraphs.' },
      ),
      spinRateRpm: claim(
        'Among the lowest of any pitch that isn\'t a knuckleball. Roki Sasaki\'s forkball spun just 578 rpm in 2026 (492 the year before) — the lowest spin of any non-knuckleball pitch type since his debut — and Senga\'s ghost fork sits near 1,047 rpm. Baseball Prospectus puts a forkball at about half the spin of a typical pitch.',
        'mlb-sasaki-fork',
        'official-data',
        { approximate: true, note: 'Sasaki 578 rpm (2026) / 492 rpm (2025) from MLB.com; Senga ~1,047 rpm from FanGraphs; "about half" from Baseball Prospectus.' },
      ),
      primaryBreak: {
        label: 'Tumbling drop',
        accent: true,
        claim: claim(
          'Big and slow. Jose Contreras\'s forkball dropped anywhere from about 18 inches, like a changeup, to nearly three feet, like a big curve; Roki Sasaki\'s averages around 41 inches of total drop. The drop is the pitch.',
          'bp-forkball',
          'reputable-analysis',
          { approximate: true, note: 'Contreras 18 in to ~3 ft range from Baseball Prospectus; Sasaki ~41 in total drop (with gravity) from MLB.com.' },
        ),
      },
      secondaryBreak: {
        label: 'Arm-side run (modern)',
        claim: claim(
          'A modern ghost fork can add arm-side run on top of the tumble: Kodai Senga\'s went from about 7.2 inches of arm-side movement to 9.9 as he reshaped it — which may be making it easier for hitters to pick up.',
          'fangraphs-senga-kodai',
          'reputable-analysis',
          { approximate: true, note: 'Senga arm-side run 7.2 in (2023) to 9.9 in (2025), FanGraphs.' },
        ),
      },
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
    // Near-zero spin: only a faint backspin lean (small +x -> barely rides) tilted
    // arm-side. magnusStrength is very low (~0.27), so the force arrow is short and
    // the ball sits near the spinless reference; the huge tumble hitters see is
    // gravity acting on a ball with almost no lift, which this plot cannot draw.
    spinAxis: { x: 0.18, y: 0.2, z: 0.96 },
    forceLabel: 'Magnus, weak: tumble',
    gyro: false,
    ivbInches: 1,
    horizontalInches: 3,
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
      'Three forkballs: the modern ghost fork, the lowest-spin version tracked, and the arm that brought the pitch to the majors. The visual is our own seam schematic; every figure is season-stamped and sourced.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Kodai Senga',
      context: 'The modern ace forkball — the "ghost fork" — a low-spin tumble with enough arm-side life to be a primary out-pitch.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('84.4 mph', 'fangraphs-senga-ghostfork', 'reputable-analysis', { note: 'Average.' }) },
        { label: 'Spin', claim: claim('~1,047 rpm', 'fangraphs-senga-ghostfork', 'reputable-analysis', { approximate: true, note: '1,046.8 rpm — very low.' }) },
        { label: 'Spin axis', claim: claim('246°', 'fangraphs-senga-ghostfork', 'reputable-analysis', { note: 'Measured, consistent with a tumbling, arm-side-running pitch.' }) },
        { label: 'Arm-side run', claim: claim('7.2 → 9.9 in', 'fangraphs-senga-kodai', 'reputable-analysis', { approximate: true, note: '2023 to 2025, as he reshaped it.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Roki Sasaki',
      context: 'The lowest-spin non-knuckleball forkball Statcast has tracked — so little rotation it behaves almost like a knuckleball with a fastball arm.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('85.0 mph', 'mlb-sasaki-fork', 'official-data', { note: '2026.' }) },
        { label: 'Spin', claim: claim('578 rpm', 'mlb-sasaki-fork', 'official-data', { note: '2026 (492 rpm in 2025) — the lowest spin of any non-knuckleball pitch type since his debut.' }) },
        { label: 'Total drop', claim: claim('~41 in', 'mlb-sasaki-fork', 'official-data', { approximate: true, note: '2026, with gravity.' }) },
        { label: 'Horizontal', claim: claim('~3 in', 'mlb-sasaki-fork', 'official-data', { approximate: true, note: 'On average; it has reached 15 in arm-side and 7 in glove-side.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Hideo Nomo',
      context: 'The "Tornado": the forkball that broke into the majors from Japan in 1995 and led both leagues in strikeouts on opposite sides of the Pacific.',
      verifiedPro: true,
      numbers: [
        { label: 'Career strikeouts', claim: claim('1,918', 'bref-nomo', 'reputable-analysis', { note: 'Across a 12-year MLB career.' }) },
        { label: '1995 NL strikeouts', claim: claim('236', 'sabr-nomo', 'reputable-analysis', { note: 'Led the NL as a rookie, in 191.1 innings.' }) },
        { label: '1990 NPB strikeouts', claim: claim('287', 'sabr-nomo', 'reputable-analysis', { note: 'Led the Pacific League in his Japanese debut, in 235 innings.' }) },
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
