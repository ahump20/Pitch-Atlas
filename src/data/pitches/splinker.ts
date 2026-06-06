import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The splinker. A sinker-splitter hybrid, the portmanteau coined for the pitch
  Jhoan Duran popularized and Paul Skenes made famous: a light two-seam split
  fired near fastball velocity, so it carries a 94-to-98 mph look with the late,
  arm-side, downward dive of a splitter. Statcast has no "splinker" label, so it
  is logged as a splitter or a sinker depending on the arm. Grip prose is reporter
  paraphrase, marked as such, not the pitchers' own words. No player likeness.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.3, lift: 0.025, label: 'Index', finger: 'index', note: 'Lightly split on a two-seam orientation; extra index pressure adds the arm-side tail.' },
  { seamT: 0.4, lift: 0.025, label: 'Middle', finger: 'middle', note: 'Split off the index but held shallow, not jammed deep like a splitter.' },
  { seamT: 0.83, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath on the leather, centered.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'out-in-fingers',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'index',
  thumbRole: 'Thumb supports underneath, centered between the lightly split fingers.',
  palmGapCue: 'A light two-seam split, the ball held shallow, not wedged deep between the fingers.',
  releaseCue: 'Fastball arm and velocity; the light split and index pressure add the sink and tail.',
  visualCaveat: 'Grip geometry is schematic. Skenes shows a clearly split grip on a two-seam orientation; the index-finger-pressure detail is reporter paraphrase, not a verbatim quote.',
  contacts: [
    {
      finger: 'index',
      label: 'Index pad',
      seamT: 0.3,
      lift: 0.025,
      seamRelation: 'Lightly split on a two-seam orientation',
      pressureRole: 'Adds the arm-side tail with extra pressure',
      cue: 'Split, not wedged; press to tail',
      curl: 0.18,
    },
    {
      finger: 'middle',
      label: 'Middle pad',
      seamT: 0.4,
      lift: 0.025,
      seamRelation: 'Split off the index, held shallow',
      pressureRole: 'The other half of the light split',
      cue: 'Shallow split, not deep',
      curl: 0.18,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.83,
      lift: 0,
      seamRelation: 'Under smooth leather, centered',
      pressureRole: 'Balances the ball under the split fingers',
      cue: 'Centered underneath',
      curl: 0.42,
    },
  ],
}

export const splinker: PitchAtlasEntry = {
  canonical: {
    id: 'splinker',
    name: 'Splinker',
    family: 'fastball',
    grip: claim(
      'A light two-seam split: the index and middle fingers split wide across a two-seam orientation with the ball held shallow, not wedged deep like a traditional splitter. Skenes adds index-finger pressure for the arm-side tail.',
      'skenes-mlb-arsenal',
      'reputable-analysis',
      { note: 'Grip mechanics are reporter paraphrase (MLB.com and Yahoo Sports on Skenes demonstrating it), not the pitcher\'s verbatim words.' },
    ),
    gripDetails: [
      claim(
        'Skenes has said the grip itself did not change when the modern, sharper version emerged; his release and the feel at release changed, which he stumbled onto on one random throw and then repeated.',
        'skenes-fox',
        'reputable-analysis',
        { note: 'Paraphrased from Skenes\' FOX Sports account; his direct quote is in the chapter\'s voice.' },
      ),
      claim(
        'Duran reached his version by widening a sinker grip; the pitch surfaced by accident in a 2018 bullpen, then he kept it. Both arms hold it to look like the four-seam out of the hand.',
        'duran-mlb',
        'reputable-analysis',
        { note: 'From MLB.com\'s feature on Duran, who first popularized the pitch.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'Thrown with fastball arm speed and near-fastball velocity. The low spin produces extra drop and arm-side run, and because it leaves the hand on nearly the same path as the four-seam, hitters cannot separate the rising fastball from the diving hybrid until it falls.',
      'skenes-mlb-debut',
      'reputable-analysis',
      { note: 'Paraphrased from MLB.com\'s coverage of Skenes\' debut splinker.' },
    ),
    voice: claim(
      'It’s not like any other sinker, and it’s not like any other splitter. It’s a hybrid pitch. ... Call it whatever you want.',
      'skenes-mlb-arsenal',
      'pitcher-own-words',
      { note: 'Paul Skenes to MLB.com, on the splinker resisting classification. He himself calls it a sinker.' },
    ),
    physics: {
      spinAxis: claim(
        'A low-spin, sinker-like axis with arm-side tilt, but the spin-based flight path stays similar to the four-seam fastball, so the two look alike out of the hand before the splinker dives.',
        'skenes-mlb-confidence',
        'reputable-analysis',
      ),
      spinRateRpm: claim(
        'About 1,750 rpm, far below the average MLB sinker at roughly 2,150 rpm. The low spin is exactly why it behaves like neither a true sinker nor a true splitter.',
        'skenes-mlb-arsenal',
        'official-data',
        { approximate: true, note: 'Per MLB.com\'s arsenal breakdown; not independently re-pulled from Savant.' },
      ),
      primaryBreak: {
        label: 'Arm-side dive',
        accent: true,
        claim: claim(
          'In his MLB debut, Statcast logged 31.4 inches of vertical movement and 13.8 inches of horizontal movement, a profile nearly identical to Zack Wheeler\'s elite splitter (31.8 / 13.4) but roughly nine mph harder.',
          'skenes-mlb-debut',
          'official-data',
          { note: 'Total movement figures from MLB.com\'s debut coverage.' },
        ),
      },
      secondaryBreak: {
        label: 'Velocity off the fastball',
        claim: claim(
          'About 94 mph, roughly four mph under his four-seam (about 98 mph) and nearly eight mph above the average MLB splitter at 86.5 mph.',
          'skenes-mlb-arsenal',
          'official-data',
        ),
      },
      teaching: claim(
        'It is a second fastball shape: near-fastball velocity off the same arm slot and release as the four-seam, then a late dive and arm-side run the four-seam never makes. The hitter has to choose between the rising pitch and the diving one out of the same hand.',
        'skenes-mlb-confidence',
        'reputable-analysis',
        { note: 'Synthesized from MLB.com; the pitch tunnels off the four-seam, then separates.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Low-spin sinker axis tilted arm-side and down: a short, leaned force arrow,
    // so the catcher's-eye plot shows arm-side run plus sink.
    spinAxis: { x: 0.74, y: -0.36, z: 0.57 },
    forceLabel: 'Magnus, arm-side + sink',
    ivbInches: 6,
    horizontalInches: 14,
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'splinker',
    shortName: 'Splinker',
    specimenNo: '06',
    heroSub: 'A fastball that sinks like a splitter.',
    heroIntro:
      'A light two-seam split, fired near fastball velocity. It looks like the 98 mph four-seam out of the hand, then dives arm-side and down. A pitch only a handful of arms throw.',
    foundationCaption: 'Near-fastball velocity off the four-seam look, then a late dive and arm-side run.',
    mastersIntro:
      'The few arms throwing it: the one who popularized it, the one who made it famous, and the closers chasing it. The visual is our own seam schematic. Every figure links to its source.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Paul Skenes',
      context: 'Made the pitch famous. Discovered it by accident playing catch after the 2023 College World Series, then turned it into one of the most valuable pitches in baseball.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('~94 mph', 'skenes-mlb-arsenal', 'official-data') },
        { label: 'Spin rate', claim: claim('~1,750 rpm', 'skenes-mlb-arsenal', 'official-data') },
        { label: 'Run value since debut', claim: claim('+18 (top-five pitch in MLB)', 'skenes-mlb-arsenal', 'official-data') },
        { label: 'Opponent average (first 6 starts)', claim: claim('.073 (3-for-41)', 'skenes-mlb-confidence', 'official-data') },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Jhoan Duran',
      context: 'The arm who first popularized the splinker, discovering it in a 2018 bullpen after widening a sinker grip. The hardest version in the game.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('97.7 mph (tops 100)', 'duran-fangraphs', 'reputable-analysis', { note: '2025; Statcast classifies it as a splitter.' }) },
        { label: 'Induced horizontal break', claim: claim('13.9 in (top-10 among splitters)', 'duran-fangraphs', 'reputable-analysis' ) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Mason Miller',
      context: 'Added the splinker to a 100-plus mph fastball and a wipeout slider, unveiling it in a May 2024 game with extra horizontal ride.',
      verifiedPro: true,
      numbers: [
        { label: 'First in-game velocity', claim: claim('97.1 and 98.1 mph', 'miller-mlb', 'official-data', { note: 'May 28, 2024.' }) },
        { label: 'Horizontal movement', claim: claim('15-18 in', 'miller-mlb', 'official-data') },
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
    family: 'The hybrid',
    tagline: 'It leaves the hand like a 98 mph fastball, then sinks and runs like a splitter.',
    feel: 'Throw it like the fastball. The light split and a little index pressure add the dive.',
    steps: [
      'Split your index and middle fingers wide across a two-seam orientation.',
      'Hold the ball shallow between them, not wedged deep like a splitter.',
      'Add a little extra pressure with your index finger to pull the arm-side tail.',
      'Throw it with fastball arm speed; the low spin gives you the late dive.',
    ],
    does: {
      headline: 'A second fastball that falls off the table.',
      plain:
        'It tunnels off the four-seam, leaving the hand on nearly the same path at nearly the same speed. Then the low spin lets it dive down and toward the throwing arm, so the hitter has to guess which fastball is coming.',
    },
  },

  seam: sharedSeam,
}
