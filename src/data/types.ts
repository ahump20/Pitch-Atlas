/*
  The provenance model. Sourced, not corrected.

  Nothing here is marked right or wrong. Every claim is labeled by where it came
  from and how confident the source is. A measured Statcast number and a coaching
  cue paraphrased from a blog are both welcome, but they do not wear the same
  badge. The reader judges. The atlas only sources.
*/

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

export interface PhysicsReference {
  spinAxis: Claim<string>
  spinRateRpm: Claim<string>
  activeSpinPct: Claim<string>
  inducedVerticalBreakIn: Claim<string>
  /** The one sentence that dissolves the "rising fastball" myth. */
  magnus: Claim<string>
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

/** v1: structure only, never populated with fabricated posts or counts. */
export interface CommunityVariantPreview {
  enabled: false
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

export interface PitchAtlasEntry {
  canonical: CanonicalPitchRecord
  masterVariants: MasterVariantRecord[]
  community: CommunityVariantPreview
  seam: SeamGeometryReference
}
