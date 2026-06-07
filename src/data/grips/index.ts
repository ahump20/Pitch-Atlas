import type { ClaimConfidence, GripView, PitchFamily, RepertoireEntry, VisualReference } from '../types'

/*
  The visual grip library — the clean-channel photo layer.

  Every image here is a real photograph of one grip in one hand: Austin Humphrey's,
  on his own ball, shot 2026-06-06. That makes the whole set `first-party` /
  `rights: original` by construction — owned outright, no agency photo, no
  identifiable third party, nothing scraped. The captions and the per-grip notes
  are his own first-person account of how he holds and thinks about each pitch.
  His words are the primary source; we restate, we do not invent.

  Sourced, not corrected: this is one pitcher's hand, not the canonical "right"
  grip. Where his grip diverges from the textbook (short fingers on the splitter,
  no circle change at all), the note says so plainly. The library teaches the
  *tells* a flat schematic can't — fingertips crossing a seam vs. riding it, the
  splitter sitting just outside the laces, the four-finger smother of a football
  change. The specimen pages reuse these same references through `gripImages`.
*/

const CAPTURED = '2026-06-06'
export const GRIP_PHOTO_PROOF_LIMIT =
  'Grip photo only; does not prove velocity, spin, movement, command, injury risk, or outcome.'
const CLAIM_TIER: Extract<ClaimConfidence, 'pitcher-own-words'> = 'pitcher-own-words'

function shot(file: string, view: GripView, caption: string, alt: string): VisualReference {
  return {
    src: `/grips/${file}`,
    view,
    caption,
    alt,
    kind: 'first-party',
    rights: 'original',
    attribution: 'Austin Humphrey',
    capturedAt: CAPTURED,
  }
}

export interface GripLibraryEntry {
  /** Library slug (also the gripImages lookup key). */
  id: string
  label: string
  family: PitchFamily
  /** Links to the filed specimen chapter when one exists. */
  specimenSlug?: string
  /** Links to the basic repertoire file when the grip lives there instead. */
  repertoireId?: string
  /** Austin's first-person note on the grip — the primary source for this entry. */
  note: string
  /** His own account of how the pitch moved and how he used it. A pitcher's report, not tracked data. */
  movement?: string
  /** Small index-row cue. */
  shortCue: string
  /** What the photo or note can support visually. */
  visibleCue: string
  /** The confidence lane for Austin's own account. */
  claimTier: Extract<ClaimConfidence, 'pitcher-own-words'>
  /** Boundary on what still photos can prove. */
  proofLimit: string
  /** Circle change is intentionally note-only for Austin. */
  photoStatus?: 'photographed' | 'note-only'
  photos: VisualReference[]
}

export const AUSTIN_GRIPS: GripLibraryEntry[] = [
  {
    id: 'four-seam',
    label: 'Four-seam fastball',
    family: 'fastball',
    specimenSlug: 'four-seam',
    shortCue: 'Fingertips cross the seam path',
    visibleCue:
      'Two-finger fastball family grip with the fingertips crossing the seam path instead of riding inside two parallel seams.',
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'Two fingers on the ball, and the four-seam should be a dead giveaway. The fingertips cross the seam slightly — the very ends of the pads catching across it, not riding parallel to it. There is barely any pressure on it at all, and that is why it goes the fastest and the truest. It is the bread and butter of everything: the easiest pitch to place in the zone and the most consistent pitch in the game.',
    movement:
      'My best pitch, and the one I had pinpoint command of — it went straight and I could put it anywhere in the zone. The life came late: it tended to explode into the glove at the very last second. That last-second hop is the carry the four-seam is known for — the eye reads it as rising when it is really just falling less than expected.',
    photos: [
      shot(
        'four-seam-7163.webp',
        'top',
        'Top of the grip: index and middle fingertips laid across the seam at the wide horseshoe, thumb tucked underneath.',
        'A right hand gripping a baseball four-seam style, two fingertips crossing the horseshoe seam with the thumb underneath.',
      ),
      shot(
        'four-seam-7164.webp',
        'thumb',
        'From underneath — the thumb on smooth leather, centered below the two top fingers.',
        'The underside of a four-seam grip, the thumb supporting the ball centered below the two top fingers.',
      ),
      shot(
        'four-seam-7165.webp',
        'side',
        'The same hold from the side, the fingertips just catching across the seam.',
        'A side view of a four-seam fastball grip, fingertips crossing the seam.',
      ),
    ],
  },
  {
    id: 'two-seam',
    label: 'Two-seam fastball',
    family: 'fastball',
    specimenSlug: 'two-seam',
    shortCue: 'Fingers ride the lace tracks',
    visibleCue:
      'Two fingers are lined with the seams like train tracks, which is the visible tell Austin uses to separate it from the four-seam.',
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'Two fingers on the ball again, but here they line up with the seams like the ball is running down a train track — both fingers riding along the narrow seams instead of crossing them. That is the tell that separates it from the four-seam.',
    movement:
      'The second pitch I mastered. I lived with it in on the hands to right-handed hitters, because it had explosive late tail — it ran arm-side at the very last second, right in on a righty.',
    photos: [
      shot(
        'two-seam-7166.webp',
        'top',
        'Two fingers running along the narrow seams — the train-track look that names the pitch.',
        'A hand gripping a baseball two-seam style, index and middle fingers running along the two narrow parallel seams.',
      ),
      shot(
        'two-seam-7168.webp',
        'side',
        'The seams as rails: the fingers sit on the two seams where they run closest together.',
        'A two-seam fastball grip viewed from the front, fingers resting on the parallel seams.',
      ),
      shot(
        'two-seam-7167.webp',
        'thumb',
        'From beneath, the thumb braced under the ball.',
        'The underside of a two-seam grip, the thumb supporting from below.',
      ),
    ],
  },
  {
    id: 'twelve-six',
    label: '12-6 curveball',
    family: 'breaking',
    specimenSlug: 'twelve-six',
    shortCue: 'Two fingers set against the seam',
    visibleCue:
      'Two fingers are set against the seam with the thumb acting as the main opposing support cue.',
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'Two fingers lined up and cornered against the seam, with no other pressure on the ball but the thumb. The grip is so distinct you do not even need to see the release slot to know it is a 12-6 — the fingers tucked tight to one seam give it away.',
    movement:
      'A genuine 12-6 when it was working: it came in with real loop and then fell off the table at the last second. The down-mover in my mix — more loop than the changeup, and a sharper drop.',
    photos: [
      shot(
        'twelve-six-7170.webp',
        'top',
        'Top-down: the two fingers tucked together and cornered against a single seam, the rest of the ball left open.',
        'A hand gripping a baseball for a 12-6 curveball, two fingers together cornered against one seam.',
      ),
      shot(
        'twelve-six-7169.webp',
        'side',
        'From the side — the fingers pinched to the seam, thumb braced underneath.',
        'A side view of a 12-6 curveball grip, two fingers against the seam with the thumb under the ball.',
      ),
      shot(
        'twelve-six-7171.webp',
        'side',
        'Set in the hand, the knuckles bent over the seam before the spin goes on.',
        'A 12-6 curveball grip held in the hand, the fingers bent over the seam.',
      ),
    ],
  },
  {
    id: 'splitter',
    label: 'Split-finger fastball',
    family: 'offspeed',
    specimenSlug: 'splitter',
    shortCue: 'Fingers outside the lace tracks',
    visibleCue:
      "The tell is subtle: it can look close to a two-seam in Austin's hand, but the cue is the fingers spreading outside the lace tracks instead of sitting on them.",
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'Gripped almost exactly like the two-seam, except the fingers spread out wider — just outside the laces instead of right on them. With short, stubby fingers like mine you can barely see the difference. Those same short fingers are the reason I have never been able to throw a circle change.',
    movement:
      'I threw this some as a harder version of the changeup — it let me stay at full arm velocity and feel more like a fastball than a traditional change at release, then drop. The fastball-tilt change, not a soft one.',
    photos: [
      shot(
        'splitter-7175.webp',
        'top',
        'Index and middle split wide, sitting just outside the seams rather than on them.',
        'A hand gripping a baseball splitter style, index and middle fingers spread wide just outside the seams.',
      ),
      shot(
        'splitter-7177.webp',
        'top',
        'Top-down — the gap between the two fingers is the whole pitch.',
        'A top view of a split-finger grip, two fingers spread apart over the ball.',
      ),
      shot(
        'splitter-7176.webp',
        'side',
        'From the side, the fingers straddle the seams with the ball set back in the hand.',
        'A side view of a splitter grip, the fingers straddling the seams.',
      ),
    ],
  },
  {
    id: 'palmball',
    label: 'Football change (palmball)',
    family: 'offspeed',
    repertoireId: 'palmball',
    shortCue: 'Four fingers and more hand surface',
    visibleCue:
      'The fingers sit close together with more hand surface on the ball, matching the football-change or palmball family cue.',
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'My football change. The giveaway is the hand together, all four fingers touching the ball. The more fingers you put on it, the more it slows down coming out — instead of getting slingshotted off the fingertips and snapped with the wrist, the whole hand drags the speed off it while the arm still looks like a fastball.',
    movement:
      'I only threw this much for about one summer, here and there. It sat between my curve and my three-finger change: the same release slot as the 12-6 — palm pointed back toward me instead of out at the batter — but a break in between the two.',
    photos: [
      shot(
        'palmball-7179.webp',
        'top',
        'Four fingers laid together across the top of the ball, seated deep toward the palm — the football-change smother.',
        'A hand gripping a baseball with all four fingers together across the top, the football change or palmball grip.',
      ),
      shot(
        'palmball-7178.webp',
        'side',
        'From the side, the ball buried deep in the hand under all four fingers.',
        'A side view of a football-change grip with the ball set deep in the palm under four fingers.',
      ),
    ],
  },
  {
    id: 'three-finger-change',
    label: 'Three-finger changeup',
    family: 'offspeed',
    repertoireId: 'straight-three-finger-changeup',
    shortCue: 'Three close fingers on the ball',
    visibleCue:
      'Three close fingers sit on the ball, adding contact area and pressure compared with a two-finger fastball grip.',
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'Three fingers set very close together across the ball. Same idea as the football change, just a touch less hand on it — more fingers than a fastball means more surface and more drag, so it leaves softer than the arm speed says it should.',
    movement:
      'My fourth pitch, and one I threw a lot in games. It came in looking like a fastball and dropped with less break than the curve — not as sharp or as consistent, but it sold the fastball look right up until it died.',
    photos: [
      shot(
        'three-finger-change-7174.webp',
        'top',
        'Three fingers seated close together across the top of the ball.',
        'A hand gripping a baseball with three fingers close together across the top, a three-finger changeup grip.',
      ),
      shot(
        'three-finger-change-7172.webp',
        'side',
        'From the side, the three fingers across the top with the ball set back in the hand.',
        'A side view of a three-finger changeup grip.',
      ),
      shot(
        'three-finger-change-7173.webp',
        'thumb',
        'From underneath, the three fingertips coming over the top edge.',
        'The underside of a three-finger changeup grip.',
      ),
    ],
  },
  {
    id: 'circle-change',
    label: 'Circle change',
    family: 'offspeed',
    specimenSlug: 'circle-change',
    photoStatus: 'note-only',
    shortCue: 'No Austin grip photo attached',
    visibleCue:
      'No Austin grip photo is attached here. The app should not imply that these photos show Austin throwing a circle change.',
    claimTier: CLAIM_TIER,
    proofLimit: GRIP_PHOTO_PROOF_LIMIT,
    note:
      'Austin says he could not throw a circle change comfortably because his hands were too small to form the grip.',
    photos: [],
  },
]

/** The grips a hitter cannot see — the through-line that ties the library together. */
export const GRIP_LIBRARY_INTRO =
  'Every grip here answers one question: how much resistance is the hand putting on the ball? The four-seam has almost none, so it leaves the fastest and the truest. Stack on fingers and surface — the three-finger and football changes — and the ball drags out softer while the arm still sells a fastball. That is the whole game at the plate: a hitter sits on the fastball and adjusts, because if he sits off-speed the fastball is already in the mitt.'

/** Austin's actual in-game arsenal — the mix he leaned on versus the ones he carried. */
export const GRIP_LIBRARY_ARSENAL =
  'In games I worked a four-pitch mix: the four-seam and two-seam fastballs, the three-finger changeup, and the 12-6 curve. The splitter and the football change were situational — pitches I carried and threw here and there, not ones I leaned on. What follows is a pitcher’s own account of his own pitches, not tracked data.'

/** His own note on command and the arm slot — why the variation cost him nothing. */
export const GRIP_LIBRARY_COMMAND_NOTE =
  'I never noticed a big difference in movement or control from switching pitches — or from switching it up — because I never really had issues with velocity, command, or movement. Those were fundamentals, drilled into me. And I would seamlessly, sometimes intentionally, drop down to three-quarters. It felt the same to me, but it gives a different look to a hitter who is already guessing anyway.'

/** How Austin attacked hitters — his own game plan, in his words. A pitcher's account. */
export interface AttackStep {
  label: string
  detail: string
}
export const ATTACK_PLAN: {
  intro: string
  sequenceTitle: string
  sequenceNote: string
  sequence: AttackStep[]
} = {
  intro:
    'I always established the four-seam high and inside — the first pitch of the game, and pretty much everything after it, until a hitter could catch up to something hard and on the hands. From there I liked to dot the four-seam low and away on the corner, and high and in on the corner, often as the strikeout pitch later in the count.',
  sequenceTitle: 'The lefty putaway',
  sequenceNote:
    'My go-to against a left-handed hitter: set him up early, move his eyes and his clock around, then freeze him with the fastball in a spot I had cleared. Most effective when I was already up in the count.',
  sequence: [
    { label: 'High and inside', detail: 'Heat up and on the hands to start — establish the fastball where he has to respect it.' },
    { label: 'High and outside', detail: 'Same eye level, the other side of the plate — widen the look without lowering his eyes.' },
    { label: 'Below the zone', detail: 'Something slowed down in the dirt or barely under the zone — change his clock and pull his eyes down.' },
    { label: 'High and tight', detail: 'Back up and in with heat — eyes back up, hands honest again.' },
    { label: 'Dotted low and in', detail: 'The putaway: a four-seam dotted low and in to freeze him — a spot and level I had not buried there yet. Deadliest when I am already ahead.' },
  ],
}

/** Photos for a grip, looked up by library id, specimen slug, or repertoire id. */
export function gripPhotosFor(key: string): VisualReference[] {
  const entry = AUSTIN_GRIPS.find(
    (g) => g.id === key || g.specimenSlug === key || g.repertoireId === key,
  )
  return entry?.photos ?? []
}

/** The library entry for a grip, by any of its keys. */
export function gripEntryFor(key: string): GripLibraryEntry | undefined {
  return AUSTIN_GRIPS.find((g) => g.id === key || g.specimenSlug === key || g.repertoireId === key)
}

export function gripEntryForRepertoire(entry: RepertoireEntry): GripLibraryEntry | undefined {
  return gripEntryFor(entry.filedSlug ?? entry.id)
}
