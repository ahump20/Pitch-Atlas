import { describe, expect, it } from 'vitest'
import { pitchAliases, pitchAliasRedirects, slugify } from './pitch-aliases'
import { REPERTOIRE } from '../data/repertoire'
import { PITCHES } from '../data/pitches'

describe('slugify', () => {
  it('lowercases, strips punctuation, and hyphenates', () => {
    expect(slugify('Four-Seam Fastball')).toBe('four-seam-fastball')
    expect(slugify('Cut Fastball')).toBe('cut-fastball')
    expect(slugify('  SI  ')).toBe('si')
    expect(slugify("Vulcan Change (Split-Change)")).toBe('vulcan-change-split-change')
  })

  it('drops apostrophes inside a word rather than splitting it', () => {
    expect(slugify("Uncle Charlie's")).toBe('uncle-charlies')
  })
})

describe('pitchAliases', () => {
  const canonical = new Set(PITCHES.map((p) => p.display.slug))
  const aliases = pitchAliases()

  it('resolves the four-seam name to its canonical filed slug', () => {
    expect(aliases).toContainEqual({ from: 'four-seam-fastball', to: 'four-seam' })
  })

  it('never redirects away from a real filed pitch page', () => {
    for (const { from } of aliases) {
      expect(canonical.has(from)).toBe(false)
    }
  })

  it('only ever points at a real canonical filed slug', () => {
    for (const { to } of aliases) {
      expect(canonical.has(to)).toBe(true)
    }
  })

  it('never emits a self-shadow (from === to)', () => {
    for (const { from, to } of aliases) {
      expect(from).not.toBe(to)
    }
  })

  it('emits each from exactly once (ambiguous collisions dropped)', () => {
    const froms = aliases.map((a) => a.from)
    expect(new Set(froms).size).toBe(froms.length)
  })

  it('drops a name that would resolve to two different filed pitches', () => {
    // Build the raw candidate->targets map the same way, and prove any name that
    // pointed at 2+ filed slugs is absent from the final list.
    const raw = new Map<string, Set<string>>()
    for (const entry of REPERTOIRE) {
      if (!entry.filedSlug) continue
      for (const c of [entry.id, entry.name, ...(entry.aka ?? [])].map(slugify).filter(Boolean)) {
        if (c === entry.filedSlug || canonical.has(c)) continue
        const set = raw.get(c) ?? new Set<string>()
        set.add(entry.filedSlug)
        raw.set(c, set)
      }
    }
    const ambiguous = [...raw].filter(([, tos]) => tos.size > 1).map(([from]) => from)
    const emitted = new Set(aliases.map((a) => a.from))
    for (const from of ambiguous) expect(emitted.has(from)).toBe(false)
  })

  it('is deterministically ordered by from', () => {
    const sorted = [...aliases].sort((a, b) => a.from.localeCompare(b.from))
    expect(aliases).toEqual(sorted)
  })
})

describe('pitchAliasRedirects', () => {
  it('emits a 301 for both the bare and trailing-slash path of every alias', () => {
    const block = pitchAliasRedirects()
    expect(block).toContain('/pitch/four-seam-fastball   /pitch/four-seam  301')
    expect(block).toContain('/pitch/four-seam-fastball/  /pitch/four-seam  301')
    // two lines per alias
    expect(block.split('\n').length).toBe(pitchAliases().length * 2)
  })

  it('every generated line is a 301', () => {
    for (const line of pitchAliasRedirects().split('\n')) {
      expect(line.endsWith('  301')).toBe(true)
    }
  })
})
