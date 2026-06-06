import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The sweeper. The slider's loud cousin: a slider grip turned further around the
  side of the ball so the spin axis tilts toward pure sidespin instead of the gyro
  slider's bullet spin. The result is a wide, mostly flat, glove-side sweep — the
  defining new pitch of 2023-26. Grip prose paraphrased from MLB.com and Driveline,
  never copied. No player image, no likeness.

  Authored against an adversarial verification pass that fetched every cited page.
  Corrections it forced: the per-arm spin-rate figures that did not surface on the
  readable Savant pages were dropped rather than asserted; Ohtani's 2025 sweeper is
  cited from the MLB.com Statcast breakdown (86.6 mph, ~12 in) with his 2022/2023
  shapes alongside; his whiff rate (41.0%) is the confirmed Savant figure, and the
  put-away number the first pass mislabeled was removed.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.36, lift: 0.02, label: 'Index', finger: 'index', note: 'Set further around the side of the ball than a slider — the hand is getting around it.' },
  { seamT: 0.4, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Riding a seam on the outer third, the primary sidespin finger.' },
  { seamT: 0.72, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath and around, helping the hand stay on the side at release.' },
]

const gripModel: GripModel = {
  defaultView: 'side',
  ballDepth: 'neutral',
  fingerSpacing: 'touching',
  primaryPressureFinger: 'middle',
  thumbRole: 'Thumb sits under and slightly around so the hand can stay on the side of the ball.',
  palmGapCue: 'Firm but free — the ball has to spin off the side, not be muscled down.',
  releaseCue: 'Sweep the fingers around the outside of the ball, like spinning a frisbee, instead of pulling straight down.',
  visualCaveat: 'Grip geometry is schematic and shows the side-spin family; spiked and two-seam sweeper grips shift the finger posture.',
  contacts: [
    {
      finger: 'index',
      label: 'Index around the side',
      seamT: 0.36,
      lift: 0.02,
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
        'It is, mechanically, a slider family member — Driveline\'s slider grips, with the fingers set off-center and the ball allowed to spin off the hand, are the same starting point; the sweeper just rotates the hand further around the side for lateral spin.',
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
      'It is thrown a touch slower than a slider — the league sweeper averages about 82.2 mph against 85.1 for a slider — with the hand staying on the side and the fingers sweeping around the outside instead of pulling down. The big horizontal break is bought with that around-the-ball action and a spin axis tilted toward pure sidespin.',
      'mlb-sweeper-explained',
      'official-data',
      { note: 'Velocity averages (82.2 vs 85.1 mph) are MLB.com\'s; the grip/feel description is paraphrased.' },
    ),
    physics: {
      spinAxis: claim(
        'Tilted toward pure sidespin: roughly 9:00 to 9:30 for a right-hander, the axis lying nearly sideways so the spin does its Magnus work across the ball. That is the sweeper\'s whole identity and the opposite of the gyro slider, whose axis points at the catcher and spins like a thrown football.',
        'mlb-glossary-sweeper',
        'reputable-analysis',
        { note: 'The clock figure is the coaching reference, not a glossary quote. MLB.com states the side-spin-vs-bullet-spin contrast that drives the axis difference.' },
      ),
      spinRateRpm: claim(
        'High, like a slider — but unlike the gyro slider, most of that spin is transverse and does Magnus work. Statcast publishes no single league sweeper spin number, and a per-arm rpm did not surface on the readable player pages, so no exact figure is asserted here.',
        'fangraphs-ssw-mainstream',
        'reputable-analysis',
        { note: 'Spin rate kept qualitative on purpose: the verification pass could not confirm a per-arm rpm on a readable page, so none is claimed as fact.' },
      ),
      activeSpinPct: claim(
        'High, and the point of the pitch. Where a gyro slider runs mostly bullet spin (a small active-spin share), the sweeper tilts the axis toward pure sidespin so far more of the spin deflects the ball. No single league active-spin figure is published; the defining contrast is with the gyro slider.',
        'fangraphs-ssw-mainstream',
        'reputable-analysis',
        { note: 'Qualitative. The FanGraphs seam-shifted piece frames most pitches as a mix of gyro and transverse spin; there is no published league sweeper active-spin percentage.' },
      ),
      primaryBreak: {
        label: 'Glove-side sweep',
        accent: true,
        claim: claim(
          'Wide and mostly flat. The average sweeper breaks about 15 inches to the glove side against about 6 inches for a regular slider, and 98% of sweepers break more than 6 inches; the biggest reach 19 to 22 inches.',
          'mlb-sweeper-explained',
          'official-data',
          { approximate: true, note: 'MLB.com: sweepers average 15 in glove-side vs 6 in for sliders; 98% exceed 6 in; cited examples reach 19-22 in.' },
        ),
      },
      secondaryBreak: {
        label: 'Induced vertical break',
        claim: claim(
          'Small. A sweeper neither rides like a four-seam nor tumbles like a curve — almost all of its movement is sideways, with little drop beyond gravity. Shown here as a slight drop below a spinless ball.',
          'mlb-glossary-sweeper',
          'reputable-analysis',
          { approximate: true, note: 'MLB.com defines the sweeper by its horizontal movement with little vertical; the exact induced-vertical figure varies by arm and is not a single published number.' },
        ),
      },
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
    // small -x gives the slight drop (negative IVB); the z component is the gyro
    // share a real sweeper still carries. magnusForceRender.y = axis.x < 0 matches
    // the negative ivbInches; magnusStrength stays high (a true Magnus pitch).
    spinAxis: { x: -0.12, y: -0.92, z: 0.37 },
    forceLabel: 'Magnus: glove-side sweep',
    gyro: false,
    ivbInches: -2,
    horizontalInches: 15,
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
      'Three reference sweepers, season-stamped from the readable Statcast pages. The visual is our own seam schematic; per-arm spin rates that did not surface on the pages were left out rather than guessed.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Shohei Ohtani',
      context: 'The reference sweeper — "maybe the best sweeper in the Majors," per MLB.com — and a study in reshaping a pitch year to year as he hunts the best shape.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('86.6 mph', 'mlb-ohtani-2025-statcast', 'official-data', { note: '2025; topped 88.4 mph that day.' }) },
        { label: 'Glove-side break', claim: claim('~12 in', 'mlb-ohtani-2025-statcast', 'official-data', { approximate: true, note: '2025. His 2022 sweeper averaged 14 in and his 2023 version 16 in — he reshapes it year to year.' }) },
        { label: 'Whiff rate', claim: claim('41.0%', 'savant-ohtani', 'official-data', { note: '2025 sweeper.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Freddy Peralta',
      context: 'A high-whiff sweeper folded into a four-seam-heavy arsenal. Shown on a small sample, honestly labeled, because the shape is the lesson.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('80.2 mph', 'savant-peralta', 'official-data', { note: '2025 sweeper.' }) },
        { label: 'Glove-side break', claim: claim('~10.7 in', 'savant-peralta', 'official-data', { approximate: true, note: '2025.' }) },
        { label: 'Total drop', claim: claim('~43.1 in', 'savant-peralta', 'official-data', { approximate: true, note: '2025, total drop including gravity — the sweeper rides little, so gravity drives most of the vertical.' }) },
        { label: 'Whiff rate', claim: claim('61.5%', 'savant-peralta', 'official-data', { note: '2025, on a small 33-pitch sample — shown with the caveat.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Yu Darvish',
      context: 'The arsenal artist: the sweeper is one shape among many he files away, thrown sparingly and precisely rather than as a primary.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('82.8 mph', 'savant-darvish', 'official-data', { note: '2025 sweeper.' }) },
        { label: 'Glove-side break', claim: claim('~13.8 in', 'savant-darvish', 'official-data', { approximate: true, note: '2025.' }) },
        { label: 'Usage', claim: claim('~10.1%', 'savant-darvish', 'official-data', { note: '2025; one pitch among many in a deep arsenal.' }) },
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
