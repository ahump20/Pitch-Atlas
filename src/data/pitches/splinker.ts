import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The splinker. A sinker-splitter hybrid, the portmanteau coined for the pitch
  Jhoan Duran popularized and Paul Skenes made famous: a light two-seam split
  thrown with fastball arm speed, so it leaves the hand looking like the heater,
  then carries the late, arm-side, downward dive of a splitter. Statcast has no
  "splinker" label, so it is logged as a splitter or a sinker depending on the
  arm. Grip prose is reporter paraphrase, marked as such, not the pitchers' own
  words. No player likeness.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.3, lift: 0.025, label: 'Index', finger: 'index', note: 'Lightly split on a two-seam orientation; extra index pressure adds the arm-side tail.' },
  { seamT: 0.4, lift: 0.025, label: 'Middle', finger: 'middle', note: 'Split off the index but held shallow, not jammed deep like a splitter.' },
  { seamT: 0.83, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath on the leather, centered.' },
]

const gripModel: GripModel = {
  status: 'filed',
  defaultView: 'top',
  ballDepth: 'out-in-fingers',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'index',
  orientation: {
    knuckleLine: 'Knuckles opened into a shallow V along the narrow seam lanes.',
    palmFacing: 'Palm to the plate at fastball intent; the split, not the wrist, takes the ride off.',
  },
  provenance: claim(
    'Finger placement solved from the cited reporting: a light split laid on a two-seam orientation, fingers near the narrow lanes rather than wedged outside them, index pressure adding the tail. Schematic geometry from reporter paraphrase, not an athlete scan.',
    'skenes-mlb-arsenal',
    'reputable-analysis',
    { note: 'Statcast has no splinker label; the grip detail is reporter paraphrase of Skenes, marked as such.' },
  ),
  thumbRole: 'Thumb supports underneath, centered between the lightly split fingers.',
  palmGapCue: 'A light two-seam split, the ball held shallow, not wedged deep between the fingers.',
  releaseCue: 'Fastball arm and full intent; the light split and index pressure add the sink and tail.',
  visualCaveat: 'Grip geometry is schematic. Skenes shows a clearly split grip on a two-seam orientation; the index-finger-pressure detail is reporter paraphrase, not a verbatim quote.',
  contacts: [
    {
      finger: 'index',
      label: 'Index pad',
      seamT: 0.3,
      lift: 0.025,
      seamOffset: 0.05,
      azimuth: 12,
      engagement: 'pad',
      pressureTier: 'primary',
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
      seamOffset: 0.05,
      azimuth: 12,
      engagement: 'pad',
      pressureTier: 'support',
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
      seamOffset: 0,
      azimuth: 55,
      engagement: 'inside',
      pressureTier: 'support',
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
      'Thrown with fastball arm speed and full intent. The light, low-spin split lets the ball drop and run to the arm side, and because it leaves the hand on nearly the same path as the four-seam, hitters cannot separate the riding fastball from the diving hybrid until it falls.',
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
        'A low-spin, sinker-like axis with arm-side tilt, but the flight path stays close to the four-seam\'s out of the hand, so the two look alike before the splinker dives.',
        'skenes-mlb-confidence',
        'reputable-analysis',
      ),
      shape: claim(
        'It holds the four-seam line for most of the way, then drops late and runs to the throwing-arm side — a sudden, heavy dive off a fastball look. Down and arm-side, arriving where the four-seam never does.',
        'skenes-mlb-debut',
        'official-data',
        { note: 'Described as shape, not a measured number. The dive is real; how sharp depends on the arm.' },
      ),
      teaching: claim(
        'It is a second fastball shape: fastball arm speed off the same slot and release as the four-seam, then a late dive and arm-side run the four-seam never makes. The hitter has to choose between the riding pitch and the diving one out of the same hand.',
        'skenes-mlb-confidence',
        'reputable-analysis',
        { note: 'Synthesized from MLB.com; the pitch tunnels off the four-seam, then separates.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Low-spin sinker axis tilted arm-side and down: a short, leaned force arrow,
    // so the catcher's-eye plot shows arm-side run plus sink. verticalShape 'flat'
    // = it neither carries like a four-seam nor drops like a true splitter; it
    // holds the line, then dives late, sitting close to flat off a spinless ball.
    spinAxis: { x: 0.74, y: -0.36, z: 0.57 },
    forceLabel: 'Magnus, arm-side + sink',
    verticalShape: 'flat',
    horizontalDir: 'arm-side',
    breakView: 'movement',
  },

  display: {
    slug: 'splinker',
    shortName: 'Splinker',
    specimenNo: '06',
    heroSub: 'A fastball that sinks like a splitter.',
    heroIntro:
      'A light two-seam split, thrown with fastball arm speed. It looks like the four-seam out of the hand, then dives arm-side and down. A pitch only a handful of arms throw.',
    foundationCaption: 'A fastball look off the same arm, then a late dive and arm-side run.',
    mastersIntro:
      'The few arms throwing it: the one who popularized it, the one who made it famous, and the closers chasing it. The visual is our own seam schematic. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Paul Skenes',
      context: 'Made the pitch famous. Discovered it by accident playing catch after the 2023 College World Series, then turned it into one of the most valuable pitches in baseball.',
      verifiedPro: true,
      distinction: claim(
        'The definitive modern splinker: a fastball look that holds the four-seam line, then dives arm-side and down so late hitters keep waving over it. It plays like a second fastball with a trapdoor.',
        'skenes-mlb-arsenal',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Jhoan Duran',
      context: 'The arm who first popularized the splinker, discovering it in a 2018 bullpen after widening a sinker grip. The power version of the pitch.',
      verifiedPro: true,
      distinction: claim(
        'The power version: splitter-grade arm-side dive carried with fastball intent, so the dive lands without the usual soft-pitch tell.',
        'duran-fangraphs',
        'reputable-analysis',
        { note: '2025; Statcast classifies it as a splitter.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Mason Miller',
      context: 'Added the splinker to a triple-digit fastball and a wipeout slider, unveiling it in a May 2024 game with extra horizontal ride.',
      verifiedPro: true,
      distinction: claim(
        'Bolted onto an elite power arsenal — his version leans hard to extra arm-side run, a third look off the same upper-tier heat and the wipeout slider.',
        'miller-mlb',
        'official-data',
        { note: 'Unveiled May 28, 2024.' },
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
    family: 'The hybrid',
    tagline: 'It leaves the hand like the fastball, then sinks and runs like a splitter.',
    feel: 'Throw it like the fastball. The light split and a little index pressure add the dive.',
    steps: [
      'Split your index and middle fingers wide across a two-seam orientation.',
      'Hold the ball shallow between them, not wedged deep like a splitter.',
      'Add a little extra pressure with your index finger to pull the arm-side tail.',
      'Throw it with fastball arm speed; the light, low-spin split gives you the late dive.',
    ],
    does: {
      headline: 'A second fastball that falls off the table.',
      plain:
        'It tunnels off the four-seam, leaving the hand on nearly the same path at fastball speed. Then the light split lets it dive down and toward the throwing arm, so the hitter has to guess which fastball is coming.',
    },
  },

  seam: sharedSeam,
}
