import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim, secondhand } from '../sources'
import { gripPhotosFor } from '../grips'
import { sharedSeam } from './_shared-seam'

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

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'out-in-fingers',
  fingerSpacing: 'slight-spread',
  primaryPressureFinger: 'middle',
  thumbRole: 'Thumb supports underneath, centered below the top two fingers.',
  palmGapCue: 'A little daylight stays between ball and palm so the ball leaves clean.',
  releaseCue: 'Let the index and middle pads roll the ball off the top with backspin.',
  visualCaveat: 'Grip geometry is schematic, tuned from sourced grip descriptions and private visual reference, not measured from an athlete scan. In a live photo, the tell is two fingertips crossing a seam path, not riding parallel seam tracks.',
  contacts: [
    {
      finger: 'index',
      label: 'Index pad',
      seamT: 0.305,
      lift: 0.02,
      seamRelation: 'Across the wide horseshoe seam',
      pressureRole: 'Guides the straight release',
      cue: 'Close to middle, not spread wide',
      curl: 0.18,
    },
    {
      finger: 'middle',
      label: 'Middle pad',
      seamT: 0.355,
      lift: 0.02,
      seamRelation: 'Across the wide horseshoe seam',
      pressureRole: 'Primary fastball pressure',
      cue: 'Flat pad across the seam',
      curl: 0.18,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.83,
      lift: 0,
      seamRelation: 'Under smooth leather, sometimes touching seam',
      pressureRole: 'Balances the ball under the finger pair',
      cue: 'Under the index-middle window',
      curl: 0.42,
    },
  ],
}

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
    gripModel,
    mechanics: claim(
      'Thrown over the top with the fingers behind the ball. The release rolls the ball from the fingertips with backspin so all four seams cross the oncoming air each revolution. That is the name: four seams biting the airflow per turn.',
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
      shape: claim(
        'Rides through the top of the zone. Backspin fights the fall the whole way, so it drops less than a spinless ball and looks like it holds its line. It carries; it never literally rises.',
        'mlb-ivb',
        'reputable-analysis',
        { note: 'Described as shape, not a measured number. The carry is real; how far it carries depends on the arm.' },
      ),
      teaching: claim(
        'Backspin throws a Magnus force upward, but it stays smaller than the ball weight, so the pitch drops less than a spinless one. It rides. It does not rise.',
        'tht-kagan',
        'reputable-analysis',
        {
          note: "Kagan, citing Nathan: the Magnus force runs a touch under the ball's weight, so the pitch falls less than a spinless one. The official MLB.com definition frames the same effect as induced rise, not literal rising.",
        },
      ),
    },
    rights: 'original',
    gripImages: gripPhotosFor('four-seam'),
  },

  motion: {
    // The four-seam's render axis: near-horizontal backspin with a slight tilt so the
    // ball does not read as lifeless. The Magnus arrow points straight up off this axis.
    // breakView 'carry' keeps the gravity ghost. verticalShape 'ride' = it carries.
    spinAxis: { x: 1, y: 0.12, z: 0 },
    forceLabel: 'Magnus',
    verticalShape: 'ride',
    horizontalDir: 'none',
    breakView: 'carry',
  },

  display: {
    slug: 'four-seam',
    shortName: 'Four-seam',
    specimenNo: '00',
    heroSub: 'Read by feel, not by a gun.',
    heroIntro:
      'Pure backspin across the horseshoe. A Magnus force against the fall. This is how the pitch rides.',
    foundationCaption: 'It rides less than a spinless ball. It never literally rises.',
    mastersIntro:
      'Three arms, one pitch, three ways to win with it. The visual is our own schematic of the four-seam reference. What sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Gerrit Cole',
      context: 'The carry-ceiling case: a clean backspin read and a top-zone finish hitters keep swinging under.',
      verifiedPro: true,
      distinction: claim(
        'A clean carry read taken to its ceiling. His four-seam plays at the top of the zone because hitters keep swinging under the ride.',
        'mlb-cole',
        'official-data',
      ),
      // No quote: the research found no Cole spin quote in the verified sources, and we
      // do not fabricate one. The read stands on what the pitch does, in words.
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Spencer Strider',
      context: 'The carry case. Elite ride from a flat approach, the pitch hitters swing under.',
      verifiedPro: true,
      distinction: claim(
        'Big ride from a low, flat slot. The ball stays on a flatter plane than the eye expects, so it finishes above where the swing is aimed — carry as a weapon at the top.',
        'savant-strider',
        'official-data',
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Hunter Greene',
      context: 'The axis-cleanup case. He raised his slot, cut the arm-side run, and converted that lost run into ride.',
      verifiedPro: true,
      distinction: claim(
        'He raised his arm slot, traded away arm-side run, and converted it into pure ride — the same pitch, recut for carry.',
        'savant-greene',
        'official-data',
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
    family: 'The straight one',
    tagline: 'The pitch you trust for a strike. It takes the truest line and gives the hand the cleanest exit.',
    feel: 'Least resistance. Loose in the fingertips, shallow in the hand. Let it sling cleanly off the pads.',
    steps: [
      'Lay your index and middle fingers flat across the wide part of the horseshoe seam, the part that faces away from you.',
      'Keep them about a finger-width apart. Pressed close is fine; just do not spread them wide.',
      'Rest your thumb underneath on smooth leather, centered below the two fingers.',
      'Hold it out toward the fingertips with a little daylight to the palm. Stay loose so the hand adds the least resistance it can.',
    ],
    does: {
      headline: 'It fights gravity longer than your eye expects.',
      plain:
        'Clean backspin pushes up on the ball the whole way to the plate, so it falls less than a ball thrown with no spin. The hitter swings where they expect it, and it arrives a touch higher. That is carry. It rides; it never literally rises.',
    },
  },

  seam: sharedSeam,
}
