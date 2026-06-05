import { describe, expect, it } from 'vitest'
import { RANK_WEIGHTS } from '../data/field-notes'
import type { FieldNote } from '../data/field-notes'
import { rankFieldNotes, type FieldNoteCounts } from './field-notes-rank'

function note(over: Partial<FieldNote> & Pick<FieldNote, 'id'>): FieldNote {
  return {
    pitchSlug: 'circle-change',
    displayName: 'RHP',
    tweak: 'Thumb tucked deeper under the leather.',
    context: { playerLevel: 'high-school', armSlot: 'three-quarter' },
    intent: 'more-movement',
    claimedResult: { kind: 'more-movement' },
    sourceTier: 'community-firsthand',
    submittedAt: '2026-05-01T00:00:00.000Z',
    visibility: 'approved',
    ...over,
  }
}

const noCounts = new Map<string, FieldNoteCounts>()

describe('RANK_WEIGHTS', () => {
  it('sums to exactly 1.0', () => {
    const total = Object.values(RANK_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBeCloseTo(1.0, 10)
  })
})

describe('rankFieldNotes', () => {
  it('ranks a coach-observed sourced note above an unsourced firsthand note with equal adoption', () => {
    const coach = note({ id: 'coach', sourceTier: 'coach-observed', evidence: { url: 'https://example.com', label: 'video' } })
    const crowd = note({ id: 'crowd', sourceTier: 'community-firsthand' })
    const counts = new Map<string, FieldNoteCounts>([
      ['coach', { adoptionCount: 1, helpfulCount: 1, viewCount: 10 }],
      // crowd is wildly more "popular" but unsourced
      ['crowd', { adoptionCount: 1, helpfulCount: 50, viewCount: 50 }],
    ])
    const ranked = rankFieldNotes([crowd, coach], counts)
    expect(ranked[0].note.id).toBe('coach')
  })

  it('gives zero context-match score when the visitor declares no context', () => {
    const ranked = rankFieldNotes([note({ id: 'a' })], noCounts, {})
    expect(ranked[0].contextMatchScore).toBe(0)
  })

  it('raises a note for a visitor whose context matches', () => {
    const ranked = rankFieldNotes([note({ id: 'a' })], noCounts, { armSlot: 'three-quarter' })
    expect(ranked[0].contextMatchScore).toBe(1)
  })

  it('never produces NaN with zero counts', () => {
    const ranked = rankFieldNotes([note({ id: 'a' })], noCounts)
    expect(Number.isNaN(ranked[0].rankScore)).toBe(false)
    expect(ranked[0].rankScore).toBeGreaterThanOrEqual(0)
    expect(ranked[0].rankScore).toBeLessThanOrEqual(1)
  })

  it('is deterministic for equal scores via id tie-break', () => {
    const a = note({ id: 'b' })
    const b = note({ id: 'a' })
    const ranked = rankFieldNotes([a, b], noCounts)
    expect(ranked.map((r) => r.note.id)).toEqual(['a', 'b'])
  })
})
