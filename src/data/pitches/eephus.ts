import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The eephus. The one pitch in the atlas whose weapon is not movement at all, but
  time: a high, slow rainbow lobbed in at half a fastball's speed, dropping into
  the zone on a steep arc to scramble a hitter geared up for 95. Rip Sewell's
  "folly floater," alive today in Zack Greinke's hands. Prose paraphrased from
  MLB.com and The Hardball Times, never copied. No player image, no likeness.

  Authored against an adversarial verification pass that fetched every cited page.
  Corrections it forced: the spin axis is presented as inference from the reported
  backspin, not as a figure the LeDoux study publishes (it publishes the spin RATE,
  ~2,301 rpm, which is what is cited to it); the 25 ft arc, low-40s velocity, and
  Williams home run are the confirmed Hardball Times figures.
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
  visualCaveat: 'Grip geometry is schematic and barely matters here; the eephus is defined by trajectory and velocity, not grip.',
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
        'MLB.com calls it, by design, the easiest pitch in baseball to hit — no unexpected movement, no velocity. Its only weapon is the disruption: a hitter timed for a fastball has to wait on a pitch that floats in at half the speed.',
        'mlb-glossary-eephus',
        'reputable-analysis',
        { note: 'Paraphrased. MLB.com: "it is the easiest pitch to hit in baseball" — the timing scramble is the point.' },
      ),
      claim(
        'Oddly, it is not a no-spin pitch. A Statcast study of tagged eephus pitches found they average about 2,301 rpm of backspin — roughly 100 rpm above an average fastball. The spin just barely matters at 50 mph next to gravity.',
        'ledoux-eephus',
        'reputable-analysis',
        { note: 'Paraphrased. The ~2,301 rpm average is from James LeDoux\'s Statcast study of 2,090 tagged eephus pitches.' },
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
      'It is thrown anywhere from the mid-30s to the mid-60s mph — often the low 40s at its slowest — on a rainbow that can climb as high as 25 feet before dropping into the zone on a steep angle. It is a once-a-game weapon: it works on timing, not stuff, and a hitter who is ready for it can crush it.',
      'tht-sewell-eephus',
      'reputable-analysis',
      { note: 'Paraphrased. The ~25 ft arc apex and the low-40s slowest velocity are from The Hardball Times.' },
    ),
    physics: {
      spinAxis: claim(
        'A near-12:00 backspin orientation with little side tilt, so there is essentially no horizontal break and no platoon side. This is inferred from the reported backspin, not a published axis figure — at this speed the orientation hardly changes the flight anyway.',
        'mlb-glossary-eephus',
        'reputable-analysis',
        { note: 'Inferred from the backspin profile; no source publishes a spin-axis figure for the eephus.' },
      ),
      spinRateRpm: claim(
        'Surprisingly normal: a Statcast study put the average eephus at about 2,301 rpm of backspin, roughly 100 rpm above a typical fastball. The twist is that at eephus speeds the spin does almost nothing — gravity, not Magnus, shapes the pitch.',
        'ledoux-eephus',
        'reputable-analysis',
        { approximate: true, note: 'James LeDoux\'s Statcast study, across 2,090 tagged eephus pitches.' },
      ),
      primaryBreak: {
        label: 'The arc',
        accent: true,
        claim: claim(
          'The "break" is not sideways or late — it is up, then down. The ball can climb to roughly 25 feet at its peak between the mound and the plate, then fall into the strike zone on a steep descending angle. The arc and the hang time are the whole pitch.',
          'tht-sewell-eephus',
          'reputable-analysis',
          { approximate: true, note: '~25 ft apex per The New Dickson Baseball Dictionary, cited in The Hardball Times.' },
        ),
      },
      secondaryBreak: {
        label: 'Velocity, not movement',
        claim: claim(
          'No unexpected movement — the effect is entirely the speed gap. Modern eephus pitches have dipped to the low 50s for called strikes: Zack Greinke landed one at 53.5 mph in 2020, and Henderson Alvarez threw a 52.5 mph eephus for a called strike in 2017.',
          'mlb-greinke-54',
          'reputable-analysis',
          { note: 'Greinke 53.5 mph (2020) and Alvarez 52.5 mph called strike (2017), MLB.com.' },
        ),
      },
      teaching: claim(
        'Every other pitch in the atlas uses spin to move or to resist gravity. The eephus does neither — it surrenders to gravity. Thrown at half a fastball\'s speed on a high arc, it hangs in the air far longer than anything a hitter has timed, and the hardest thing in hitting is recalibrating to a pitch that takes twice as long to arrive.',
        'mlb-glossary-eephus',
        'reputable-analysis',
        { note: 'Synthesis of the MLB glossary\'s timing-disruption framing and the gravity-driven trajectory.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // The eephus carries ordinary backspin (small +x -> slight ride), but it is
    // thrown so slow that gravity, not Magnus, shapes its huge arc. We show a small
    // positive IVB from the backspin and no horizontal; the rainbow arc itself is
    // outside what an induced-break plot can draw. magnusForceRender.y = axis.x > 0
    // matches the positive IVB.
    spinAxis: { x: 0.3, y: 0, z: 0.95 },
    forceLabel: 'Backspin, but gravity wins',
    gyro: false,
    ivbInches: 2,
    horizontalInches: 0,
    horizontalDir: 'none',
    breakView: 'movement',
  },

  display: {
    slug: 'eephus',
    shortName: 'Eephus',
    specimenNo: '12',
    heroSub: 'The rainbow.',
    heroIntro:
      'Lob it. The eephus floats in on a high arc at half a fastball\'s speed, peaking well above the batter before dropping into the zone — a pitch whose only weapon is time. The easiest pitch in baseball to hit, and one of the hardest to time.',
    foundationCaption: 'It carries normal backspin, but thrown this slow, gravity — not spin — shapes the giant arc the plot cannot draw.',
    mastersIntro:
      'Two eephus throwers, eighty years apart: the man who invented it and the modern artist who still dares it. The visual is our own seam schematic; the pre-tracking figures are descriptive estimates, labeled as such.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Rip Sewell',
      context: 'The originator. His "folly floater" was a wartime novelty that became a genuine weapon — until the one man who solved it did so on the biggest stage.',
      verifiedPro: false,
      numbers: [
        { label: 'Arc apex', claim: claim('~25 ft', 'tht-sewell-eephus', 'reputable-analysis', { approximate: true, note: 'The peak between mound and plate, per The New Dickson Baseball Dictionary.' }) },
        { label: 'Velocity', claim: claim('low 40s mph', 'tht-sewell-eephus', 'reputable-analysis', { approximate: true, note: 'At its slowest; a pre-tracking estimate.' }) },
        { label: 'First documented use', claim: claim('June 1, 1943', 'wiki-eephus', 'reputable-analysis', { note: 'Against the Boston Braves at Forbes Field.' }) },
        { label: 'Williams 1946 HR', claim: claim('380 ft', 'tht-sewell-eephus', 'reputable-analysis', { note: 'Ted Williams stepped forward and homered off it in the 1946 All-Star Game — the only home run ever hit off the pitch.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Zack Greinke',
      context: 'The modern keeper of the flame: a cerebral pitcher who will drop a 50-something-mph eephus into the zone when the moment calls for it — even when he did not quite plan to.',
      verifiedPro: true,
      numbers: [
        { label: 'Slowest strike', claim: claim('53.5 mph', 'mlb-greinke-54', 'reputable-analysis', { note: '2020, landed in the zone to Trent Grisham.' }) },
        { label: 'Era context', claim: claim('52.5 mph', 'mlb-greinke-54', 'reputable-analysis', { note: 'Henderson Alvarez\'s 2017 called strike, the slowest-by-a-pitcher mark Greinke approached.' }) },
      ],
      quote: claim(
        "It definitely wasn't planned. It worked out, but, hopefully, I don't do that again anymore.",
        'mlb-greinke-54',
        'pitcher-own-words',
        { note: 'Greinke on his 53.5 mph eephus, 2020.' },
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
    tagline: 'A high, slow rainbow at half a fastball\'s speed — its only weapon is throwing off a hitter\'s timing.',
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
        'An eephus is a giant, slow rainbow — lobbed in at maybe half the speed of a fastball. It does not dart or dive; it just hangs in the air much longer than a hitter expects, then drops into the zone. A batter geared up for 95 has to wait, and waiting is the hardest thing to do at the plate.',
    },
  },

  seam: sharedSeam,
}
