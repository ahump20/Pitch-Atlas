/*
  The Field Notes data model. Community variants extend the provenance model
  without relaxing it: a note is a sourced claim with a confidence tier, ranked
  by evidence and context, never by popularity alone. v1 ships waitlist-gated —
  these types describe the shape every note will take when posting opens, and
  drive the structured template and the ranking explainer today. No fabricated
  posts, no fabricated counts.
*/

import type { ClaimConfidence } from './types'

export type PlayerLevel = 'youth' | 'high-school' | 'college-plus'
export type ArmSlot = 'over-the-top' | 'three-quarter' | 'sidearm' | 'submarine'
export type VelocityBand = 'low-effort' | 'developing-arm' | 'prep-arm' | 'college-arm' | 'power-arm'
export type PitchIntent =
  | 'more-movement'
  | 'less-movement'
  | 'firmer-feel'
  | 'softer-feel'
  | 'better-command'
  | 'deception'
  | 'reduce-stress'
  | 'other'
export type ClaimedResultKind =
  | 'more-movement'
  | 'better-command'
  | 'firmer-result'
  | 'reduced-discomfort'
  | 'inconsistent'
  | 'worked-in-bullpen'
  | 'worked-in-game'
  | 'no-noticeable-change'
/** Community source tiers. Extract ties them to the canonical ClaimConfidence
    union, so a non-canonical tier string fails typecheck. */
export type FieldNoteSourceTier = Extract<
  ClaimConfidence,
  'community-firsthand' | 'coach-observed'
>

export const PLAYER_LEVELS: { value: PlayerLevel; label: string }[] = [
  { value: 'youth', label: 'Youth (under 14)' },
  { value: 'high-school', label: 'High school (14-18)' },
  { value: 'college-plus', label: 'College and up' },
]

export const ARM_SLOTS: { value: ArmSlot; label: string }[] = [
  { value: 'over-the-top', label: 'Over the top' },
  { value: 'three-quarter', label: 'Three-quarter' },
  { value: 'sidearm', label: 'Sidearm' },
  { value: 'submarine', label: 'Submarine' },
]

export const VELOCITY_BANDS: { value: VelocityBand; label: string }[] = [
  { value: 'low-effort', label: 'Low-effort context' },
  { value: 'developing-arm', label: 'Developing-arm context' },
  { value: 'prep-arm', label: 'High-school pace context' },
  { value: 'college-arm', label: 'College pace context' },
  { value: 'power-arm', label: 'Power-arm context' },
]

/** Hard limits, enforced on both the client form and the future Worker. */
export const FIELD_NOTE_CONSTRAINTS = {
  displayName: { min: 2, max: 40 },
  tweakDescription: { max: 160 },
  cueNote: { max: 200 },
  claimedResultNote: { max: 200 },
  evidenceLabel: { max: 80 },
  evidenceUrl: { max: 512 },
  handSizeInches: { min: 6.0, max: 10.0 },
  maxTweaksPerNote: 4,
  maxIntentsPerNote: 3,
} as const

/** Composite-rank weights. Must sum to 1.0 (asserted in tests). */
export const RANK_WEIGHTS = {
  provenance: 0.35,
  adoption: 0.2,
  usefulness: 0.2,
  contextMatch: 0.15,
  communityConfidence: 0.1,
} as const

/** The ranking model, made legible to readers. Weights come from RANK_WEIGHTS. */
export const RANK_SIGNALS: { key: keyof typeof RANK_WEIGHTS; label: string; blurb: string }[] = [
  {
    key: 'provenance',
    label: 'Provenance',
    blurb: 'Source tier and evidence. A coach-observed note with a link outranks an unverified hunch with none.',
  },
  {
    key: 'adoption',
    label: 'Adoption',
    blurb: 'How many other pitchers independently tried the same tweak. Real replication, not passive clicks.',
  },
  {
    key: 'usefulness',
    label: 'Usefulness',
    blurb: 'Marked useful, measured against views so a small loud crowd cannot stuff the rank.',
  },
  {
    key: 'contextMatch',
    label: 'Context match',
    blurb: 'How close a note is to your level, slot, and pace context. Computed in your session, never stored.',
  },
  {
    key: 'communityConfidence',
    label: 'Community confidence',
    blurb: 'Considered practice: a real sample size behind the claim, not one good bullpen.',
  },
]

/** The vocabulary that protects the brand. Not posts and karma; notes and evidence. */
export const FIELD_NOTE_PRIMITIVES: { term: string; gloss: string }[] = [
  { term: 'Field Note', gloss: "One pitcher's report on a grip variant." },
  { term: 'Variant', gloss: 'A specific, named change from the canonical grip.' },
  { term: 'Tried This', gloss: 'A second contributor replicating the tweak.' },
  { term: 'Coach Note', gloss: 'A coach reporting on an arm they work with.' },
  { term: 'Source Challenge', gloss: 'A standing request for the evidence behind a claim.' },
  { term: 'Provenance', gloss: 'The source tier and evidence that set a note’s rank.' },
  { term: 'Adoption', gloss: 'How many others independently tried it.' },
  { term: 'Needs Evidence', gloss: 'A note flagged for missing support, kept visible.' },
]

export interface FieldNoteContext {
  playerLevel: PlayerLevel
  armSlot: ArmSlot
  velocityBand?: VelocityBand
}

/** A community field note. The read model for the future live phase. */
export interface FieldNote {
  id: string
  pitchSlug: string
  displayName: string
  tweak: string
  context: FieldNoteContext
  intent: PitchIntent
  claimedResult: { kind: ClaimedResultKind; note?: string; sampleSize?: number }
  evidence?: { url: string; label: string }
  sourceTier: FieldNoteSourceTier
  /** ISO 8601, server clock only. Display age is computed from this, never hardcoded. */
  submittedAt: string
  visibility: 'pending' | 'approved' | 'approved-youth-safe' | 'rejected'
}

export interface FieldNoteVariant {
  note: FieldNote
  rankScore: number
  adoptionCount: number
  helpfulCount: number
  contextMatchScore: number
}
