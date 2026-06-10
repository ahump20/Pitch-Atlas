import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CONFIDENCE_META } from './types'

/*
  Gate: the seven-tier source model is canonical and singular. The ids and the
  badge wording live in CONFIDENCE_META and nowhere else. A parallel label map
  (the old PitchSpecimenCard "Secondhand" / "Community" shortenings) fails here.
*/

const CANONICAL_IDS = [
  'official-data',
  'pitcher-own-words',
  'coach-observed',
  'reputable-analysis',
  'secondhand-attributed',
  'community-firsthand',
  'unverified',
] as const

const CANONICAL_LABELS: Record<(typeof CANONICAL_IDS)[number], string> = {
  'official-data': 'Official data',
  'pitcher-own-words': "Pitcher's own words",
  'coach-observed': 'Coach-observed',
  'reputable-analysis': 'Reputable analysis',
  'secondhand-attributed': 'Secondhand, attributed',
  'community-firsthand': 'Community, firsthand',
  unverified: 'Unverified',
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.(ts|tsx)$/.test(name)) out.push(full)
  }
  return out
}

describe('canonical source tiers', () => {
  it('CONFIDENCE_META carries exactly the canonical seven ids', () => {
    expect(Object.keys(CONFIDENCE_META).sort()).toEqual([...CANONICAL_IDS].sort())
  })

  it('every tier wears its canonical label, character for character', () => {
    for (const id of CANONICAL_IDS) {
      expect(CONFIDENCE_META[id].label).toBe(CANONICAL_LABELS[id])
    }
  })

  it('no source file outside types.ts declares a parallel confidence-label map', () => {
    const srcRoot = join(__dirname, '..')
    const offenders = walk(srcRoot).filter((file) => {
      if (file.endsWith(join('data', 'types.ts'))) return false
      const text = readFileSync(file, 'utf8')
      // A Record keyed by ClaimConfidence whose values carry a `label` is a
      // second badge vocabulary — the pattern step one removed.
      return /Record<\s*ClaimConfidence\s*,[^>]*label/.test(text)
    })
    expect(offenders).toEqual([])
  })
})
