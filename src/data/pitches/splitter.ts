import type { GripModel, PitchAtlasEntry, SeamAnchoredPoint } from '../types'
import { claim } from '../sources'
import { sharedSeam } from './_shared-seam'

/*
  The split-finger fastball. Index and middle fingers wedged wide to opposite
  sides of the ball, thrown like a fastball, the wide grip and a stiff wrist
  killing the backspin that keeps a four-seamer riding. It leaves the hand on the
  fastball's path and drops off the table late. A descendant of the older
  forkball, held farther forward and wider between the fingers. Grip prose
  paraphrased from Wikipedia and Driveline, never copied. No player likeness.
*/

const fingerPlacement: SeamAnchoredPoint[] = [
  { seamT: 0.265, lift: 0.03, label: 'Index', finger: 'index', note: 'Wedged to the outside of the ball, well off the middle finger.' },
  { seamT: 0.43, lift: 0.03, label: 'Middle', finger: 'middle', note: 'Wedged to the opposite side, the wide split that kills the spin.' },
  { seamT: 0.83, lift: 0.0, label: 'Thumb', finger: 'thumb', note: 'Underneath on the leather, centered between the split fingers.' },
]

const gripModel: GripModel = {
  defaultView: 'top',
  ballDepth: 'neutral',
  fingerSpacing: 'wide',
  primaryPressureFinger: 'index',
  thumbRole: 'Thumb supports underneath, centered between the two split fingers.',
  palmGapCue: 'The ball sits up between the split fingers, farther forward than a forkball.',
  releaseCue: 'Throw it like the fastball and let the wide split take the spin off.',
  visualCaveat: 'Grip geometry is schematic and shows the wide split-finger family; the depth and spread vary with hand size, and large hands make it easier. On shorter fingers the split can look close to a two-seam; read whether the fingers sit outside the seam tracks instead of directly on them.',
  contacts: [
    {
      finger: 'index',
      label: 'Index pad',
      seamT: 0.265,
      lift: 0.03,
      seamRelation: 'Wedged to the outside of the ball',
      pressureRole: 'Half of the wide split',
      cue: 'Split wide, fingers off the seams',
      curl: 0.16,
    },
    {
      finger: 'middle',
      label: 'Middle pad',
      seamT: 0.43,
      lift: 0.03,
      seamRelation: 'Wedged to the opposite side',
      pressureRole: 'The other half of the split that kills the backspin',
      cue: 'As wide as the hand allows, stiff wrist',
      curl: 0.16,
    },
    {
      finger: 'thumb',
      label: 'Thumb',
      seamT: 0.83,
      lift: 0,
      seamRelation: 'Under smooth leather, centered',
      pressureRole: 'Balances the ball between the split fingers',
      cue: 'Centered underneath',
      curl: 0.42,
    },
  ],
}

export const splitter: PitchAtlasEntry = {
  canonical: {
    id: 'split-finger-fastball',
    name: 'Splitter',
    family: 'offspeed',
    grip: claim(
      'The index and middle fingers are wedged to opposite sides of the ball, spread wide on the outside of the leather, wider and farther back than a forkball, with the ball coming off the inside of the fingers rather than the fingertips. Thrown with the arm action of a fastball.',
      'wiki-splitter',
      'reputable-analysis',
      { note: 'Paraphrased from Wikipedia (Split-finger fastball) and corroborated by Driveline; not quoted.' },
    ),
    gripDetails: [
      claim(
        'A descendant of the forkball, the splitter is held farther forward in the hand with a wider split between the fingers, which is why it can be thrown harder than the deep-jammed forkball.',
        'wiki-splitter',
        'reputable-analysis',
        { note: 'Wikipedia describes the splitter as a faster, shallower cousin of the forkball.' },
      ),
      claim(
        'Driveline files the splitter under the same family and notes its defining trait: it spins significantly less than a fastball. The reduced backspin, not any added force, is what makes it drop.',
        'driveline-splitters',
        'reputable-analysis',
        { note: 'Paraphrased from Driveline. Specific RPM figures vary and are not asserted here.' },
      ),
      claim(
        "Bruce Sutter's unusually large hands let him spread the split far enough to execute it; he learned it from instructor Fred Martin after his fastball faded post-surgery and never changed the grip after the first day.",
        'sutter-hof',
        'reputable-analysis',
        { note: 'From the Hall of Fame tribute to Sutter; the hand-size detail is corroborated on his Wikipedia page.' },
      ),
    ],
    fingerPlacement,
    gripModel,
    mechanics: claim(
      'It is thrown with the arm speed and release of a fastball. The wide split and a stiffer wrist dramatically reduce the backspin, weakening the Magnus lift that keeps a four-seamer riding, so gravity wins late and the ball drops sharply, the classic trap-door look.',
      'gausman-conversation',
      'reputable-analysis',
      { note: 'Paraphrased from The Conversation\'s physics breakdown of Gausman\'s splitter.' },
    ),
    voice: claim(
      'I’d like to tell you I worked and worked at it but I’d be lying to you because it did come to me right away. The first day I threw it I’d get it to break ... I never adjusted my grip after the first day.',
      'sutter-hof',
      'pitcher-own-words',
      { note: 'Bruce Sutter, recalling learning the split-finger from Fred Martin, in the Hall of Fame tribute.' },
    ),
    physics: {
      spinAxis: claim(
        'A fastball-like backspin axis out of the hand, so the two look identical at release; the deception lives in matching the fastball\'s spin axis until the pitch separates in flight.',
        'wiki-splitter',
        'reputable-analysis',
      ),
      spinRateRpm: claim(
        'Much lower than the four-seam. The pitch spins significantly less than a fastball, which is the entire point: less backspin, less lift, more drop.',
        'driveline-splitters',
        'reputable-analysis',
        { note: 'Driveline states the splitter spins significantly less than fastballs; specific RPM figures are not asserted.' },
      ),
      primaryBreak: {
        label: 'Late tumbling drop',
        accent: true,
        claim: claim(
          "Gausman's splitter drops roughly 50 to 75 cm before the plate, against about 25 to 30 cm for his fastball, the extra fall arriving late.",
          'gausman-conversation',
          'reputable-analysis',
          { approximate: true, note: 'Illustrative figures from The Conversation\'s physics analysis of Gausman\'s splitter.' },
        ),
      },
      secondaryBreak: {
        label: 'Velocity off the fastball',
        claim: claim(
          'A few mph below the fastball it imitates: league-average splitters sat near 85 mph against about 92 mph four-seamers in 2010.',
          'wiki-splitter',
          'reputable-analysis',
          { approximate: true, note: '2010 PITCHf/x league averages for right-handers, per Wikipedia; a roughly 7 mph gap.' },
        ),
      },
      teaching: claim(
        'Because it leaves the hand looking like the fastball, the hitter starts a fastball swing; then the low backspin lets gravity pull it under the barrel at the last instant. Take the split away or add backspin and it just becomes a slow fastball.',
        'gausman-conversation',
        'reputable-analysis',
        { note: 'Synthesized from The Conversation and Wikipedia: the reduced-Magnus drop off a fastball look is the whole pitch.' },
      ),
    },
    rights: 'original',
  },

  motion: {
    // Weak backspin: a fastball-like axis but a short force arrow, so the ball
    // barely rides and falls close to the spinless phantom. breakView 'carry'
    // shows exactly that gap closing.
    spinAxis: { x: 0.92, y: 0.18, z: 0.16 },
    forceLabel: 'Magnus, weak',
    ivbInches: 3,
    horizontalInches: 4,
    horizontalDir: 'arm-side',
    breakView: 'carry',
  },

  display: {
    slug: 'splitter',
    shortName: 'Splitter',
    specimenNo: '05',
    heroSub: 'A fastball look, a trap-door drop.',
    heroIntro:
      'Wedge the fingers wide, throw it like the fastball, and let the lost backspin drop it off the table at the plate. The same arm, the same path, then the floor falls out.',
    foundationCaption: 'It barely rides, so it falls almost like a spinless ball, late and under the barrel.',
    mastersIntro:
      'From the pitch\'s pioneer to its modern swing-and-miss kings. The visual is our own seam schematic. Every figure is season-stamped and links to its source.',
  },

  masterVariants: [
    {
      tier: 'verified-attributed',
      pitcher: 'Bruce Sutter',
      context: 'The pioneer. Taught the split-finger by instructor Fred Martin after arm surgery, he rode it to the Hall of Fame as one of the first dominant closers.',
      verifiedPro: true,
      numbers: [
        { label: 'Career saves', claim: claim('300', 'sutter-wiki', 'reputable-analysis') },
        { label: 'Cy Young', claim: claim('1979 NL', 'sutter-wiki', 'reputable-analysis') },
        { label: 'Career ERA', claim: claim('2.83', 'sutter-wiki', 'reputable-analysis', { note: 'Inducted into the Hall of Fame in 2006.' }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Roger Clemens',
      context: 'Added the splitter in the 1990s, nicknamed it "Mr. Splitty," and made it his out pitch, one of the most devastating in the pitch\'s history. He has his own chapter in the Craftsmen.',
      verifiedPro: true,
      numbers: [
        { label: 'Career strikeouts', claim: claim('4,672', 'clemens-wiki', 'official-data', { note: 'Built late around the split-finger.' }) },
        { label: 'Nickname', claim: claim('Mr. Splitty', 'clemens-wiki', 'reputable-analysis') },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Kevin Gausman',
      context: 'The modern volume king. His splitter has produced more swinging strikes than any other pitcher\'s since the Statcast era began, by a wide margin.',
      verifiedPro: true,
      numbers: [
        { label: 'Swinging strikes since 2015', claim: claim('1,712 (most in MLB)', 'gausman-jays', 'reputable-analysis', { note: 'Far ahead of the next-most (Hector Neris, 1,013).' }) },
        { label: 'Velocity', claim: claim('83.6 mph', 'gausman-rpp', 'reputable-analysis', { note: '2021.' }) },
        { label: 'Drop vs. fastball', claim: claim('~50-75 cm vs ~25-30 cm', 'gausman-conversation', 'reputable-analysis', { approximate: true }) },
      ],
      rights: 'original',
    },
    {
      tier: 'verified-attributed',
      pitcher: 'Shohei Ohtani',
      context: 'The unhittable one. In 2021 his trap-door splitter posted the highest swing-and-miss rate of any pitch in MLB.',
      verifiedPro: true,
      numbers: [
        { label: 'Velocity', claim: claim('89.9 mph', 'ohtani-mlb-splitter', 'reputable-analysis', { note: '2021, up from 87.3 mph as a 2018 rookie.' }) },
        { label: 'PA ending on the splitter', claim: claim('0-for-19, 18 K', 'ohtani-mlb-splitter', 'reputable-analysis', { note: '2021; the highest swing-and-miss rate of any MLB pitch that year.' }) },
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
    family: 'The trap door',
    tagline: 'It looks like the fastball the whole way, then the floor drops out at the plate.',
    feel: 'Throw it as hard as the fastball. The wide split does the work, not a softer arm.',
    steps: [
      'Wedge your index and middle fingers wide, to opposite sides of the ball, outside the seam tracks rather than directly on them.',
      'Let the ball sit up between them, farther forward than a deep forkball.',
      'Rest your thumb underneath, centered between the split fingers.',
      'Throw it with fastball arm speed and a firm wrist; the split kills the spin for you.',
    ],
    does: {
      headline: 'A fastball that quits on the hitter.',
      plain:
        'The wide grip strips the backspin a fastball lives on, so the ball stops riding and gravity takes it down late. The hitter has already swung where the fastball should be, and the pitch falls under the barrel.',
    },
  },

  seam: sharedSeam,
}
