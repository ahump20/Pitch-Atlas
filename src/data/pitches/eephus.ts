import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The eephus. The one pitch in the atlas whose weapon is not movement at all, but
  time: a high, slow rainbow lobbed in at a fraction of a fastball's pace, dropping
  into the zone on a steep arc to scramble a hitter geared up for heat. Rip Sewell's
  "folly floater," alive today in Zack Greinke's hands. Prose paraphrased from
  MLB.com and The Hardball Times, never copied. No player image, no likeness.

  Authored against an adversarial verification pass that fetched every cited page.
  Movement, spin, and speed figures are deliberately absent: the owner has never
  been tracked, and this pitch is described by the shape of its arc and the feel of
  its delivery, never by a gauge. The Sewell origin and the lone home run ever hit
  off it are sourced biography, kept as such.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.02, lift: 0.0, label: 'Index', finger: 'index', note: 'Across the seams, as on a fastball or curve — the grip barely matters.' },
  { seamT: 0.08, lift: 0.0, label: 'Middle', finger: 'middle', note: 'Beside the index; the pitch is about the lob, not the grip.' },
  { seamT: 0.66, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath for control of a very slow release.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'neutral',
  fingerSpacing: 'slight-spread',
  primaryPressureFinger: 'index',
  thumbRole: 'Thumb underneath for control; the grip is ordinary because the arc, not the spin, is the pitch.',
  palmGapCue: 'Held loosely like a fastball or curve — almost any grip works.',
  releaseCue: 'Throw it on a high, exaggerated overhand arc with drastically reduced arm speed, aiming to peak well above the batter and drop in.',
  visualCaveat: 'Grip geometry is schematic and barely matters here; the eephus is defined by arc and timing, not grip.',
  contacts: [
    {
      finger: 'index',
      label: 'Index',
      seamT: 0.02,
      lift: 0,
      seamRelation: 'Across the seams',
      pressureRole: 'Ordinary backspin grip',
      cue: 'Any normal grip',
      curl: 0.3,
    },
    {
      finger: 'middle',
      label: 'Middle',
      seamT: 0.08,
      lift: 0,
      seamRelation: 'Beside the index',
      pressureRole: 'Ordinary backspin grip',
      cue: 'Lob it',
      curl: 0.3,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.66,
      lift: 0,
      seamRelation: 'Underneath',
      pressureRole: 'Controls a slow release',
      cue: 'Stay under it',
      curl: 0.4,
    },
  ],
}

export const eephus: PitchAtlasEntry = {
  canonical: {
    id: 'eephus',
    name: 'Eephus',
    family: 'offspeed',
    grip: claim(
      'Almost any grip — usually an ordinary fastball or curve hold — thrown with drastically reduced arm speed on a high, exaggerated overhand lob. The grip barely matters: the pitch is defined by its trajectory and its speed, not by how the ball is held.',
      'mlb-glossary-eephus',
      'reputable-analysis',
      { note: 'Paraphrased. MLB.com describes a pitch thrown very high in the air, resembling a slow-pitch softball trajectory; the overhand-lob delivery is the craft consensus.' },
    ),
    gripDetails: [
      claim(
        'MLB.com calls it, by design, the easiest pitch in baseball to hit — no unexpected movement, nothing on it. Its only weapon is the disruption: a hitter timed for heat has to wait on a pitch that floats in at a crawl.',
        'mlb-glossary-eephus',
        'reputable-analysis',
        { note: 'Paraphrased. MLB.com: "it is the easiest pitch to hit in baseball" — the timing scramble is the point.' },
      ),
      claim(
        'Oddly, it is not a no-spin pitch — it carries ordinary backspin, a touch more than a typical fastball. But thrown this slow, that spin barely matters. Gravity, not the spin, owns the flight.',
        'ledoux-eephus',
        'reputable-analysis',
        { note: 'Paraphrased from James LeDoux\'s Statcast study of tagged eephus pitches. Described as shape and feel, not a measured figure.' },
      ),
      claim(
        'Rip Sewell invented it during World War II — the story ties it to a 1941 hunting accident — and the name comes from a teammate\'s line that "eephus ain\'t nothing, and that\'s a nothing pitch."',
        'tht-sewell-eephus',
        'reputable-analysis',
        { note: 'Paraphrased. The Sewell origin and the Maurice Van Robays "nothing pitch" naming are documented in The Hardball Times.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is lobbed in at a small fraction of fastball pace on a towering rainbow that climbs well above head height before dropping into the zone on a steep angle. It is a once-a-game weapon: it works on timing, not stuff, and a hitter who is ready for it can crush it.',
      'tht-sewell-eephus',
      'reputable-analysis',
      { note: 'Paraphrased. The towering arc and crawling pace are described as shape and feel, per The Hardball Times.' },
    ),
    physics: {
      spinAxis: claim(
        'A near-12:00 backspin orientation with little side tilt, so there is essentially no horizontal run and no platoon side. Inferred from the backspin it carries — and at this crawl the orientation hardly changes the flight anyway.',
        'mlb-glossary-eephus',
        'reputable-analysis',
        { note: 'Inferred from the backspin profile; no source publishes a spin-axis figure for the eephus.' },
      ),
      shape: claim(
        'The shape is up, then down — a towering rainbow, not a sideways dart. The ball climbs high above head height between mound and plate, hangs there, then falls into the strike zone on a steep descending angle. The arc and the hang time are the whole pitch; nothing about it is late or sudden.',
        'tht-sewell-eephus',
        'reputable-analysis',
        { note: 'Described as shape, not a measured arc height. The towering climb and the steep drop are the read.' },
      ),
      teaching: claim(
        'Every other pitch in the atlas uses spin to move or to resist gravity. The eephus does neither — it surrenders to gravity. Lobbed in at a fraction of fastball pace on a high arc, it hangs in the air far longer than anything a hitter has timed, and the hardest thing in hitting is recalibrating to a pitch that floats in slow and late.',
        'mlb-glossary-eephus',
        'reputable-analysis',
        { note: 'Synthesis of the MLB glossary\'s timing-disruption framing and the gravity-driven trajectory.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // The eephus carries ordinary backspin (small +x -> slight ride), but it is
    // thrown so slow that gravity, not Magnus, shapes its huge arc. verticalShape
    // 'ride' reflects that faint backspin lift; the rainbow arc itself is outside
    // what an induced-shape plot can draw. magnusForceRender.y = axis.x > 0.
    spinAxis: { x: 0.3, y: 0, z: 0.95 },
    forceLabel: 'Backspin, but gravity wins',
    gyro: false,
    verticalShape: 'ride',
    horizontalDir: 'none',
    breakView: 'movement',
  },

  display: {
    slug: 'eephus',
    shortName: 'Eephus',
    specimenNo: '12',
    heroSub: 'The rainbow.',
    heroIntro:
      'Lob it. The eephus floats in on a high arc at a fraction of fastball pace, peaking well above the batter before dropping into the zone — a pitch whose only weapon is time. The easiest pitch in baseball to hit, and one of the hardest to time.',
    foundationCaption: 'It carries normal backspin, but thrown this slow, gravity — not spin — shapes the giant arc the plot cannot draw.',
    mastersIntro:
      'Two eephus throwers, eighty years apart: the man who invented it and the modern artist who still dares it. The visual is our own seam schematic; what sets each version apart is in the read, not a gauge.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Rip Sewell',
      context: 'The originator. His "folly floater," born in wartime, became a genuine weapon — until the one man who solved it did so on the biggest stage.',
      verifiedPro: false,
      distinction: claim(
        'The towering wartime original — a sky-high rainbow that hitters of the era simply could not handle, until Ted Williams stepped forward and homered off it in the 1946 All-Star Game, the only home run ever hit off the pitch.',
        'tht-sewell-eephus',
        'reputable-analysis',
        { note: 'The Sewell origin and the lone Williams home run are documented in The Hardball Times — sourced biography, not pitch behavior.' },
      ),
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Zack Greinke',
      context: 'The modern keeper of the flame: a cerebral pitcher who will drop an eephus into the zone when the moment calls for it — even when he did not quite plan to.',
      verifiedPro: true,
      distinction: claim(
        'The thinking man\'s version — a crawling lob dropped in for a called strike, slower than anything the modern game expects, deployed with a chess player\'s timing rather than as a novelty.',
        'mlb-greinke-54',
        'reputable-analysis',
        { note: 'Greinke\'s called-strike eephus, paraphrased from MLB.com as feel and timing rather than a speed figure.' },
      ),
      quote: claim(
        "It definitely wasn't planned. It worked out, but, hopefully, I don't do that again anymore.",
        'mlb-greinke-54',
        'pitcher-own-words',
        { note: 'Greinke on his eephus called strike.' },
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
    family: 'The lob',
    tagline: 'A high, slow rainbow at a crawl — its only weapon is throwing off a hitter\'s timing.',
    feel: 'Lob it on a high arc with way less arm speed than a fastball. Aim to peak above the batter and drop it into the top of the zone.',
    steps: [
      'Take any ordinary grip — a fastball or curve hold is fine.',
      'Throw it overhand on an exaggerated high arc, with drastically reduced arm speed.',
      'Aim for the ball to peak well above the hitter and fall into the strike zone.',
      'Pick your spot: it works once in a while, when a hitter is sitting dead-red, and gets crushed if they are ready.',
    ],
    does: {
      headline: 'It floats in so slowly that timing falls apart.',
      plain:
        'An eephus is a giant, slow rainbow — lobbed in at a fraction of fastball pace. It does not dart or dive; it just hangs in the air much longer than a hitter expects, then drops into the zone. A batter geared up for heat has to wait, and waiting is the hardest thing to do at the plate.',
    },
  },

  seam: sharedSeam,
}
