import type { PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim, secondhand } from '../sources'

/*
  The four-seam fastball record. v1 content.

  Every number traces to the citation registry. Where the research could only
  reach a secondary source, the claim says so. Where a figure is rounded,
  era-dependent, or methodology-bound, it carries `approximate`. The grip prose
  is paraphrased from cited references, never copied. No player image, no
  likeness, no copied instruction.
*/

// Grip contacts placed by seam parameter (0..1 along the closed curve).
// Schematic placements tuned visually against the render, not measured anchors.
// Documented as schematic in docs/seam-calibration.md.
const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.305, lift: 0.02, label: 'Index', finger: 'index', note: 'Across the seam at the open end of the horseshoe.' },
  { seamT: 0.355, lift: 0.02, label: 'Middle', finger: 'middle', note: 'Beside the index, about a finger-width over.' },
  { seamT: 0.83, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath, on the leather, centered below the two fingers.' },
]

export const fourSeam: PitchAtlasEntry = {
  canonical: {
    id: 'four-seam-fastball',
    name: 'Four-seam fastball',
    family: 'fastball',
    grip: claim(
      'Index and middle fingers laid across the seams at the open end of the horseshoe, the seam that faces away from the body. Thumb underneath on the leather. Held loose toward the fingertips.',
      'wiki-four-seam',
      'reputable-analysis',
      { note: 'Paraphrased from the cited reference, not quoted. Corroborated by Wikipedia (Fastball) and eFastball.' },
    ),
    gripDetails: [
      claim(
        'Fingers cross the outward-facing horseshoe seam, pads resting where the two seams run closest together.',
        'wiki-four-seam',
        'reputable-analysis',
        { note: 'Wikipedia (Four-seam fastball) and (Fastball) agree: across the cross-seam that faces away from the body. eFastball corroborates.' },
      ),
      claim(
        'Roughly a finger-width apart. Secondary instruction puts the gap near half an inch to an inch.',
        'platecrate',
        'reputable-analysis',
        {
          approximate: true,
          note: 'The weakest grip claim. Primary references prescribe no numeric gap, and Driveline treats spacing as athlete preference, from pressed-together to widened.',
        },
      ),
      claim(
        'Thumb directly underneath the ball on smooth leather, its base sometimes overlaying a lower seam, centered between the two top fingers.',
        'wiki-four-seam',
        'reputable-analysis',
        { note: 'Strongly corroborated across Wikipedia (Four-seam fastball), Wikipedia (Fastball), and eFastball.' },
      ),
      claim(
        'Held loosely toward the fingertips with a gap to the palm, the usual cue for a quick, clean release. Not universal.',
        'efastball',
        'reputable-analysis',
        {
          note: 'Surfaced disagreement: eFastball also says to squeeze, and Driveline declines to prescribe pressure at all. Shown as the standard cue, not an absolute.',
        },
      ),
    ],
    fingerPlacement,
    mechanics: claim(
      'Thrown over the top with the fingers behind the ball. The release rolls backspin off the fingertips so all four seams cross the oncoming air each revolution. That is the name: four seams biting the airflow per turn.',
      'wiki-four-seam',
      'reputable-analysis',
      { note: 'Paraphrased from the cited reference.' },
    ),
    voice: secondhand(
      'A fastball could rise in principle, if you could get enough spin on it.',
      'tht-kagan',
      'Alan Nathan, relayed by David Kagan in The Hardball Times. No human reaches the spin a literal rise would need, so a four-seam only drops less. It does not rise.',
    ),
    physics: {
      spinAxis: claim('Near-horizontal backspin, the axis lying close to flat across the ball.', 'wiki-fastball', 'reputable-analysis'),
      spinRateRpm: claim('2,100 to 2,500 rpm, league average near 2,300.', 'mlb-spin-rate', 'reputable-analysis', {
        approximate: true,
        note: '2,300 is the 2019 baseline; recent seasons have crept toward 2,400. The bulk of four-seamers sit in the 2,100 to 2,500 band.',
      }),
      activeSpinPct: claim('Near 100% for elite arms. Verlander led four-seamers at 98.5% in 2019.', 'mlb-active-spin', 'official-data', {
        note: 'Active spin is the transverse share of total spin that drives movement. The league mean sits well below elite.',
      }),
      inducedVerticalBreakIn: claim('League average about +16 in. Good near +18, elite +20 and up.', 'mlb-ivb', 'official-data', {
        note: 'The +16 in average is the official 2024 league mean. The good and elite tiers are analyst conventions, not MLB-defined.',
      }),
      magnus: claim(
        'Backspin throws a Magnus force upward, but it stays smaller than the ball weight, so the pitch drops less than a spinless one. It rides. It does not rise.',
        'tht-kagan',
        'reputable-analysis',
        {
          note: 'Kagan, citing Nathan: about 0.28 lb of Magnus force against about 0.32 lb of ball weight. The official MLB.com IVB definition frames the same effect as induced rise, not literal rising.',
        },
      ),
    },
    rights: 'original',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Gerrit Cole',
      context: 'The spin ceiling. Among the highest-spin elite four-seams Statcast has measured, and nearly all of that spin does work.',
      verifiedPro: true,
      numbers: [
        { label: 'Spin rate', claim: claim('2,530 rpm', 'mlb-cole', 'official-data') },
        { label: 'Active spin', claim: claim('97.1%', 'mlb-cole', 'official-data') },
        { label: 'Velocity', claim: claim('97.1 mph', 'mlb-cole', 'official-data') },
        {
          label: 'Rise vs avg',
          claim: claim('+2.8 in', 'mlb-cole', 'official-data', { note: 'Statcast rise above the average four-seam at his velocity.' }),
        },
      ],
      // No quote: the plan expected a Cole quote relayed by Bleacher Report, but the
      // research found BR never carried these figures and no Cole spin quote exists in
      // the verified sources. We do not fabricate one. The numbers stand on Statcast.
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Spencer Strider',
      context: 'The carry case. Elite induced ride from a flat approach, the pitch hitters swing under.',
      verifiedPro: true,
      numbers: [
        {
          label: 'Induced vertical break',
          claim: claim('18.4 in', 'savant-strider', 'official-data', { note: '2023, his best season. AJC confirms 18.4 in verbatim.' }),
        },
        {
          label: 'Rise vs MLB avg',
          claim: claim('+2.6 in (about 21%)', 'thescore-strider', 'reputable-analysis', {
            approximate: true,
            note: "theScore's relative-rise framing. A simple break-minus-league subtraction against a ~16 in average yields a smaller gap; the two methods differ.",
          }),
        },
        {
          label: 'Velocity',
          claim: claim('97.2 mph', 'savant-strider', 'official-data', { note: '2023 season average. theScore cites ~98 mph over a longer running window.' }),
        },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Hunter Greene',
      context: 'The axis-cleanup case. He raised his slot, cut the arm-side run, and converted that lost run into ride.',
      verifiedPro: true,
      numbers: [
        {
          label: 'Spin rate',
          claim: claim('2,378 rpm', 'mlb-greene', 'official-data', {
            note: '2024. Read via the search index when MLB.com blocked a direct fetch; Baseball Savant confirms the companion figures.',
          }),
        },
        {
          label: 'Induced vertical break',
          claim: claim('16.6 in', 'savant-greene', 'official-data', { note: '2024, up from 15.4 in in 2023.' }),
        },
        {
          label: 'Arm-side run',
          claim: claim('8.9 in', 'savant-greene', 'official-data', { note: '2024, cut from 11.6 in in 2023. The trade that bought the ride.' }),
        },
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

  seam: {
    equationPlain: 'x = 2 sin t + sin 3t,   y = 2 cos t - cos 3t,   z = 2√2 cos 2t',
    parameterization: 't from 0 to 2π, each point normalized to the ball radius, the whole curve rotated by the spin-axis quaternion.',
    stitchCount: claim('108 double stitches, 216 individual', 'wiki-baseball-ball', 'reputable-analysis', {
      note: 'A manufacturing convention, not a number written into the rulebook, which fixes only weight and circumference.',
    }),
    accuracyLevel: 'seam-informed schematic',
    accuracyNote: claim(
      'The published closed-form figure-eight seam curve is laid on the sphere, but the exact regulation cover constants and the full 108-stitch pattern are approximated, not measured.',
      'mathcurve',
      'reputable-analysis',
      {
        approximate: true,
        note: 'The canonical degree-6 cover constants were not pinnable this run, so the documented figure-eight closed form stands in. The honest label is seam-informed schematic, never seam-accurate.',
      },
    ),
    calibrationDoc: 'docs/seam-calibration.md',
  },
}
