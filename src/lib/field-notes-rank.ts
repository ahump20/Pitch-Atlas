import type {
  ArmSlot,
  FieldNote,
  FieldNoteVariant,
  PlayerLevel,
  VelocityBand,
} from '../data/field-notes'
import { RANK_WEIGHTS } from '../data/field-notes'

/*
  The ranking model. Pure and deterministic. Provenance is the heaviest weight by
  design: in a youth-accessible product, vote counts on grip information measure
  popularity, not evidence, so they are capped and normalized. A coach-observed,
  sourced note cannot be buried by a popular but unsupported one. This file is
  the single source of truth the future Worker imports; the client never sees raw
  scores.
*/

/** Visitor context, declared optionally per session. Never stored, never inferred. */
export interface VisitorContext {
  playerLevel?: PlayerLevel
  armSlot?: ArmSlot
  velocityBand?: VelocityBand
}

export interface FieldNoteCounts {
  adoptionCount: number
  helpfulCount: number
  viewCount: number
}

function provenanceScore(note: FieldNote): number {
  const tierBase = note.sourceTier === 'coach-observed' ? 0.8 : 0.5
  const evidenceBoost = note.evidence ? 0.2 : 0
  return Math.min(1, tierBase + evidenceBoost)
}

/** Helpful marks normalized against views, so a tiny audience cannot stuff the rank. */
function usefulnessScore(helpful: number, views: number): number {
  const h = Math.max(helpful, 0)
  if (h <= 0) return 0
  const denom = h + Math.max(views, 0)
  return denom > 0 ? h / denom : 0
}

/** Diminishing returns: 0 stays 0, replication climbs and plateaus. */
function adoptionScore(adoption: number): number {
  const a = Math.max(adoption, 0)
  return a <= 0 ? 0 : 1 - 1 / (1 + a / 3)
}

function contextMatchScore(note: FieldNote, visitor: VisitorContext): number {
  let total = 0
  let hits = 0
  if (visitor.playerLevel) {
    total++
    if (visitor.playerLevel === note.context.playerLevel) hits++
  }
  if (visitor.armSlot) {
    total++
    if (visitor.armSlot === note.context.armSlot) hits++
  }
  if (visitor.velocityBand) {
    total++
    if (visitor.velocityBand === note.context.velocityBand) hits++
  }
  return total > 0 ? hits / total : 0
}

/** Rewards a real sample size behind the claim, not a single good bullpen. */
function communityConfidenceScore(note: FieldNote): number {
  const sample = note.claimedResult.sampleSize ?? 0
  return Math.min(1, Math.max(sample, 0) / 5)
}

/**
 * Rank approved field notes for display. Pure: deterministic given the same
 * inputs. Returns a new array sorted descending by rankScore, tie-broken by id
 * so the order never wobbles.
 */
export function rankFieldNotes(
  notes: FieldNote[],
  counts: Map<string, FieldNoteCounts>,
  visitor: VisitorContext = {},
): FieldNoteVariant[] {
  return notes
    .map((note): FieldNoteVariant => {
      const c = counts.get(note.id) ?? { adoptionCount: 0, helpfulCount: 0, viewCount: 0 }
      const ctx = contextMatchScore(note, visitor)
      const rankScore =
        RANK_WEIGHTS.provenance * provenanceScore(note) +
        RANK_WEIGHTS.adoption * adoptionScore(c.adoptionCount) +
        RANK_WEIGHTS.usefulness * usefulnessScore(c.helpfulCount, c.viewCount) +
        RANK_WEIGHTS.contextMatch * ctx +
        RANK_WEIGHTS.communityConfidence * communityConfidenceScore(note)
      return {
        note,
        rankScore,
        adoptionCount: c.adoptionCount,
        helpfulCount: c.helpfulCount,
        contextMatchScore: ctx,
      }
    })
    .sort((a, b) => b.rankScore - a.rankScore || a.note.id.localeCompare(b.note.id))
}
