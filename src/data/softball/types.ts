import type { Claim } from '../types'
import type { ArcRule, LobParams, PitchKind, PitchSpinInput, RuleKey, Stance } from '../../lib/slowpitch'

/*
  The softball data model. A deliberately lighter record than the baseball
  `PitchAtlasEntry` (no baseball seam geometry) because the underhand windmill
  game is a different craft and the soft launch leads with the honest words and
  the sourced movement. The slow-pitch Flight Lab's 3D scene reads its own model
  in `src/lib/slowpitch`, not these records. It reuses
  the sport-agnostic provenance engine (`Claim` + `Source` + confidence) so every
  figure on a softball page is sourced exactly like the baseball wing. Depth — full
  grip geometry, a 12" seam, master variants — comes later.
*/

/** Softball pitch families. The rise and the drop are their own families because
    they are the spine of the fastpitch game and have no clean baseball analog. */
export type SoftballPitchFamily = 'fastball' | 'rise' | 'drop' | 'breaking' | 'offspeed'

/** How established the pitch is in the competitive fastpitch game. */
export type SoftballPitchStatus =
  | 'standard' // taught and thrown across the game
  | 'advanced' // real and current, but harder to command (the rise)
  | 'developing' // filed light this launch; a fuller breakdown is coming

/** A fastpitch pitch, filed light. Every measured or contested figure is a Claim. */
export interface SoftballPitch {
  /** URL slug for /softball/pitch/<slug>. Stable, kebab-case. */
  slug: string
  name: string
  family: SoftballPitchFamily
  /** Hall index for the plate, e.g. "S-01". */
  specimenNo: string
  status: SoftballPitchStatus
  /** Our one-line framing of what the pitch is for. Original words, no figures. */
  tagline: string
  /** Original framing paragraph. Carries no measured figure it cannot source. */
  intro: string
  /** One-line sourced grip. */
  grip: Claim<string>
  /** One-line sourced spin direction / axis. */
  spin: Claim<string>
  /** One-line sourced movement — what the pitch does. */
  movement: Claim<string>
  /** Plain-language role in an arsenal. */
  role: string
  /** The honest physics note — used most on the riseball ("does it actually rise?"). */
  physicsNote?: Claim<string>
  /**
   * The honest open question this entry leaves on file, when the sources
   * genuinely record one (the riseball's rise dispute, the peel drop's
   * backspin-vs-topspin teaching split). Never invented to fill the row:
   * absent means the provenance row reads "none on file".
   */
  openQuestion?: string
  /** Representative arms, plain text. Never a likeness. */
  notableThrowers?: string
  /** The flagship of the arsenal (the riseball): leads the hub and gets the deepest read. */
  flagship?: boolean
}

/** One phase of the windmill delivery, sourced. */
export interface WindmillPhase {
  /** Two-char phase index, e.g. "01". */
  num: string
  name: string
  what: Claim<string>
}

/** A sourced teaching block on the fundamentals page (kinetic chain, arm health). */
export interface FundamentalBlock {
  id: string
  /** Marker index, e.g. "02". */
  index: string
  label: string
  /** Plain-language lede above the sourced claims. Original words, no figures. */
  lede: string
  /** The sourced claims that carry the figures. */
  claims: Claim<string>[]
  /** Set for the arm-health block so the page can carry the education-only note. */
  educational?: boolean
}

/** A sourced rule/craft line on the slowpitch page. */
export interface SlowpitchNote {
  label: string
  claim: Claim<string>
}

/** A slow-pitch rulebook as the Flight Lab reads it. The numbers are the model's
    inputs; every line a visitor reads is a sourced Claim. */
export interface FlightLabRulebook {
  key: RuleKey
  name: string
  short: string
  /** The model's arc and strike-call inputs. */
  arc: ArcRule
  /** The legal arc, in plain words. */
  arcText: Claim<string>
  /** What a strike is under this book. */
  zoneText: Claim<string>
  /** What happens on an illegal arc. */
  illegalText: Claim<string>
}

/** One of the lab's example lobs. The arc is set by hand, so it is labelled so. */
export interface FlightLabLob {
  key: 'belt' | 'low' | 'deep' | 'inside' | 'flat' | 'rainbow'
  name: string
  /** Swatch colour for the path and its list row. */
  color: string
  /** Peak, landing, side and the internal spin inputs (rpm is never shown). */
  params: Claim<LobParams>
}

/** One pitch in the lab's slow-pitch arsenal: a spin laid over any lob. */
export interface FlightLabPitch {
  key: PitchKind
  name: string
  /** Colour of the ring the ball turns in, in every view. */
  color: string
  /** What the batter sees, in the lab's own words. No figures. */
  read: string
  /** What the pitch is, sourced. */
  what: Claim<string>
  /** The spin the model throws it with. Set by hand; the rpm is never shown. */
  spin: Claim<PitchSpinInput>
}

/** The proportions of the measured swing, as fractions of standing height
    unless named in inches or degrees. */
export interface MeasuredSwing {
  landmarks: { knee: number; belt: number; chest: number; shoulder: number }
  stanceDepthPerHeight: number
  stridePerHeight: number
  armReachPerHeight: number
  handsFromKnobIn: number
}

/** The lab's default batter: one batter's measured swing, never named. */
export interface MeasuredBatter {
  /** Height, toes to plate, box and bat, as measured. */
  stance: Claim<Stance>
  /** Landmark ratios, stance depth, stride and reach. */
  swing: Claim<MeasuredSwing>
  /** The bat they swing: length and barrel diameter, inches. */
  bat: Claim<{ lengthIn: number; diameterIn: number }>
  /** Barrel angle below level at contact, degrees. */
  barrelAngleDeg: Claim<number>
}
