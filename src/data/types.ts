/*
  The provenance model. Sourced, not corrected.

  Nothing here is marked right or wrong. Every claim is labeled by where it came
  from and how confident the source is. A measured Statcast number and a coaching
  cue paraphrased from a blog are both welcome, but they do not wear the same
  badge. The reader judges. The atlas only sources.
*/

import type { Vec3 } from '../lib/seam'

export type ClaimConfidence =
  | 'official-data' // measured, published by the source of record (Statcast / MLB)
  | 'pitcher-own-words' // the athlete said it
  | 'coach-observed' // a coach reported it from watching
  | 'reputable-analysis' // a credible analyst, or our paraphrase of a cited reference
  | 'secondhand-attributed' // a quote or number relayed through a secondary source
  | 'community-firsthand' // a community member's own report (future tiers only)
  | 'unverified' // no source corroborates the value this run

/** Human-readable label + one-line meaning for each confidence level. */
export const CONFIDENCE_META: Record<
  ClaimConfidence,
  { label: string; meaning: string }
> = {
  'official-data': {
    label: 'Official data',
    meaning: 'Measured and published by the source of record (Statcast / MLB).',
  },
  'pitcher-own-words': {
    label: "Pitcher's own words",
    meaning: 'Stated by the athlete directly.',
  },
  'coach-observed': {
    label: 'Coach-observed',
    meaning: 'Reported firsthand by a coach.',
  },
  'reputable-analysis': {
    label: 'Reputable analysis',
    meaning: 'A credible analyst, or our paraphrase of a cited reference.',
  },
  'secondhand-attributed': {
    label: 'Secondhand, attributed',
    meaning: 'A quote or figure relayed through a secondary source.',
  },
  'community-firsthand': {
    label: 'Community, firsthand',
    meaning: "A community member's own report. Launches with safeguards.",
  },
  unverified: {
    label: 'Unverified',
    meaning: 'No source corroborated this value. Shown so the gap is visible.',
  },
}

export interface Source {
  id: string
  label: string
  url: string
  /** ISO date the source was last checked. Never a hardcoded freshness string. */
  retrievedAt: string
  season?: string
}

export type RightsStatus =
  | 'original' // our own geometry / diagram / words
  | 'licensed'
  | 'public-domain'
  | 'linked-only' // we link out, we do not reproduce
  | 'restricted'

export interface SafetyFlag {
  ageAware?: boolean
  note?: string
}

/**
 * A claim is one of two shapes:
 *  - sourced + confident: carries a real Source and a non-'unverified' confidence.
 *  - weak: 'unverified' or 'secondhand-attributed', and MUST carry an explanatory note.
 * `approximate` marks a real figure that is rounded, era-dependent, or methodology-bound.
 */
interface ClaimBase {
  note?: string
  approximate?: boolean
}

export type Claim<T> =
  | (ClaimBase & {
      value: T
      source: Source
      confidence: Exclude<ClaimConfidence, 'unverified'>
    })
  | (ClaimBase & {
      value: T
      confidence: 'unverified' | 'secondhand-attributed'
      note: string
      source?: Source
    })

/** A grip contact anchored to the seam curve by parameter, used to place 3D markers. */
export interface SeamAnchoredPoint {
  /** 0..1 along the closed seam curve. */
  seamT: number
  /** Small radial lift off the leather, in ball radii (0 = on the surface). */
  lift: number
  label: string
  finger: 'index' | 'middle' | 'thumb' | 'ring' | 'pinky'
  note?: string
}

export type GripView = 'top' | 'side' | 'thumb'
export type Handedness = 'right' | 'left'
export type BallDepth = 'out-in-fingers' | 'neutral' | 'deep-in-hand'
export type FingerSpacing = 'touching' | 'slight-spread' | 'wide'

export interface GripContactModel {
  finger: SeamAnchoredPoint['finger']
  label: string
  /** Shared seam parameter so the 2D fallback, 3D pad, and prose cue agree. */
  seamT: number
  lift: number
  seamRelation: string
  pressureRole: string
  cue: string
  /** 0..1 authored curl hint for the procedural hand. */
  curl: number
}

export interface GripModel {
  defaultView: GripView
  ballDepth: BallDepth
  fingerSpacing: FingerSpacing
  primaryPressureFinger: SeamAnchoredPoint['finger']
  thumbRole: string
  palmGapCue: string
  releaseCue: string
  visualCaveat: string
  contacts: GripContactModel[]
}

/** A named, sourced break figure (IVB for a fastball, drop for a curve, run for a sinker, sweep for a slider). */
export interface BreakReading {
  label: string
  claim: Claim<string>
  /** Paint this gauge as the one hero number. Use once per pitch. */
  accent?: boolean
}

export interface PhysicsReference {
  spinAxis: Claim<string>
  spinRateRpm: Claim<string>
  /** Optional: not every pitch has a clean active-spin story (changeups, sliders). */
  activeSpinPct?: Claim<string>
  /** The defining break this pitch is known for. */
  primaryBreak: BreakReading
  /** A second movement axis when the pitch has one (a sinker's sink under its run). */
  secondaryBreak?: BreakReading
  /** The one teaching sentence: what makes this pitch move the way it does. */
  teaching: Claim<string>
}

export type PitchFamily = 'fastball' | 'breaking' | 'offspeed'

export interface CanonicalPitchRecord {
  id: string
  name: string
  family: PitchFamily
  /** One-line grip summary. */
  grip: Claim<string>
  /** The grip broken into its sourced parts (placement, spacing, thumb, pressure). */
  gripDetails: Claim<string>[]
  fingerPlacement: SeamAnchoredPoint[]
  gripModel: GripModel
  mechanics: Claim<string>
  physics: PhysicsReference
  /** A representative sourced quote, when one genuinely exists. */
  voice?: Claim<string>
  rights: RightsStatus
}

export interface VariantNumber {
  label: string
  claim: Claim<string>
}

export interface MasterVariantRecord {
  tier: 'verified-attributed'
  pitcher: string
  /** Our own framing of why this arm is worth showing. Never a player likeness. */
  context: string
  verifiedPro: boolean
  numbers: VariantNumber[]
  quote?: Claim<string>
  rights: RightsStatus
  safety?: SafetyFlag
}

/** Shared master + community shape (community populated in a future tier). */
export interface PitchVariantRecord {
  id: string
  source: 'master' | 'community'
  pitcher?: string
  numbers: VariantNumber[]
  rights: RightsStatus
  safety?: SafetyFlag
}

/**
 * The community (Field Notes) layer. `enabled` gates the live write/rank/flag loop:
 * while false the surface shows an honest preview and makes no Supabase calls;
 * flip to true (with a moderator account + bot protection in place) to open it.
 * Never carries fabricated posts or counts — live notes come from the database.
 */
export interface CommunityVariantPreview {
  enabled: boolean
  safetyNote: string
  provenanceNote: string
  columns: string[]
}

/** Later. Named now so the model is whole. */
export interface ReproductionRecord {
  id: string
  variantId: string
  outcome: string
  source?: Source
}

export type SeamAccuracyLevel = 'seam-accurate' | 'seam-informed schematic'

export interface SeamGeometryReference {
  equationPlain: string
  parameterization: string
  stitchCount: Claim<string>
  accuracyLevel: SeamAccuracyLevel
  accuracyNote: Claim<string>
  calibrationDoc: string
}

/**
 * The visualization spec, in render space (rights: original; a presentation
 * choice, never a measured claim). +x camera-right, +y up, +z toward the camera;
 * the pitch flies toward -z. The spin axis drives the 3D spin, the axis arrow,
 * and the schematic; the Magnus force is derived from it, not stored.
 */
export interface PitchMotion {
  /** Unit spin axis in render space. */
  spinAxis: Vec3
  /** Label on the drawn force arrow ("Magnus", "Magnus, down", "Gyro spin"). */
  forceLabel: string
  /** Gyro-dominant pitch (slider): shows the red dot toward the viewer, short force arrow. */
  gyro?: boolean
  /** Signed induced vertical break, inches. + rides above a spinless ball, - drops below it. Sourced. */
  ivbInches: number
  /** Horizontal break magnitude, inches (absolute). Sourced. */
  horizontalInches: number
  /** Catcher's-eye direction of the horizontal break. */
  horizontalDir: 'arm-side' | 'glove-side' | 'none'
  /** Which break diagram the Foundation renders: the four-seam's carry side-view, or the catcher's-eye movement plot. */
  breakView: 'carry' | 'movement'
}

/** The pitch-specific display copy the sections render. */
export interface PitchDisplay {
  /** URL hash slug for deep-linking this specimen (#/<slug>). Short and stable. */
  slug: string
  /** Short name for the specimen index switcher ("Four-seam", "Sinker", "Slider"). */
  shortName: string
  /** Two-digit specimen number for the masthead index and hero figure label. */
  specimenNo: string
  /** The line under the hero headline. */
  heroSub: string
  /** The hero intro paragraph. */
  heroIntro: string
  /** The gauge-rail caption in Foundation. */
  foundationCaption: string
  /** The intro paragraph above the master-variant ledger. */
  mastersIntro: string
}

/**
 * The plain-language coaching layer the Grip Lab and What-it-does sections read.
 * Original paraphrase in a coach's voice, never copied from any guide. It carries
 * no measured figures: every number stays in `canonical.physics` behind its Claim
 * and Source, so the prose here can be read freely without smuggling unsourced data.
 * Optional and backwards-compatible — a pitch without a guide still renders.
 */
export interface GripGuide {
  /** Short display family label, e.g. "The straight one", "The runner". */
  family: string
  /** One-line plain-language promise of what the pitch is for. */
  tagline: string
  /** What the grip should feel like in the hand. */
  feel: string
  /** Numbered, plain-language grip steps. Paraphrased, never copied. */
  steps: string[]
  does: {
    /** Plain-English headline for the What-it-does section. */
    headline: string
    /** One jargon-free paragraph: what the pitch does. No measured numbers. */
    plain: string
  }
}

export interface PitchAtlasEntry {
  canonical: CanonicalPitchRecord
  motion: PitchMotion
  display: PitchDisplay
  masterVariants: MasterVariantRecord[]
  community: CommunityVariantPreview
  seam: SeamGeometryReference
  /** Plain-language coaching layer. Optional; sections fall back when absent. */
  guide?: GripGuide
}

/*
  The Craftsmen wing. A curated hall of arms who defined a pitch, plus the one
  pitch that is a legend rather than a person (the gyroball). Same provenance
  discipline as the pitch records: the intro and tagline are our original
  framing, but every quote and number is a Claim carrying its own Source and
  confidence, and a quote is present only when a real one was found. Nothing here
  is a likeness; the visual actor is the seam specimen of their signature pitch.
*/
export type CraftsmanKind =
  | 'craftsman' // a real pitcher
  | 'legend' // the gyroball: a pitch-as-myth, shipped flagged, never as verified fact

export interface CraftsmanNumber {
  label: string
  claim: Claim<string>
}

export interface Craftsman {
  /** URL slug for /craftsmen/<slug>. Stable, kebab-case. */
  slug: string
  name: string
  kind: CraftsmanKind
  /** Career span or status, e.g. "1959-1975" or "Active since 2024". */
  era: string
  /** Throwing hand. Omitted for a legend (the gyroball is a pitch, not a person). */
  hand?: Handedness
  /** Display name of the pitch they are known for, e.g. "Slider", "Splitter". */
  signaturePitch: string
  /** Cross-link target to a filed /pitch/<slug>, when the atlas has that pitch. */
  signaturePitchSlug?: string
  /** Hall index for the archive plate, e.g. "C-01". */
  specimenNo: string
  /** Our one-line framing of why this arm is in the hall. Original words. */
  tagline: string
  /** Original framing paragraph. Carries no measured figures. */
  intro: string
  /** How they threw or shaped the signature pitch (or, for a legend, its physics). Sourced. */
  signature: Claim<string>
  /** The competitive / psychological edge: how they thought about pitching. Sourced. Omitted for a legend. */
  mentalEdge?: Claim<string>
  /** Sourced career or pitch numbers. */
  numbers: CraftsmanNumber[]
  /** A real, verbatim, sourced quote. Present only when one was actually found. */
  quote?: Claim<string>
  /** Legend only (the gyroball): the myth-versus-physics note. Flagged, never fact. */
  legendNote?: Claim<string>
  rights: RightsStatus
}
