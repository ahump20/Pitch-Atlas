import type { Claim } from '../types'

/*
  The softball data model. A deliberately lighter record than the baseball
  `PitchAtlasEntry` — no baseball seam geometry, no 3D render space — because the
  underhand windmill game is a different craft and the soft launch leads with the
  honest words and the sourced movement, not a 12" ball rebuilt in WebGL. It reuses
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
  /** Velocity band as plain text, when one is worth stating. */
  velocity?: string
  /** The honest physics note — used most on the riseball ("does it actually rise?"). */
  physicsNote?: Claim<string>
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
