import { describe, expect, it } from 'vitest'
import { EDUCATIONAL_DISCLAIMER, KNOWLEDGE_HUB_COPY } from '.'
import { mechanicsWing } from './mechanics'
import { armHealthWing } from './arm-health'
import { youthWing } from './youth'
import { canonWing } from './canon'
import { trendsWing } from './trends'
import { pitchDesignWing } from './pitch-design'
import {
  FUNDAMENTAL_BLOCKS,
  SOFTBALL_FASTPITCH_COPY,
  SOFTBALL_HUB_FASTPITCH_BLURB,
  WINDMILL_PHASES,
} from '../softball/fundamentals'
import { SOFTBALL_PITCHES } from '../softball/pitches'
import { SOFTBALL_CRAFTSMEN } from '../softball/craftsmen'
import { PITCHES } from '../pitches'
import { REPERTOIRE } from '../repertoire'
import { CRAFTSMEN } from '../craftsmen'
import { LOST_PITCHES } from '../lost-pitches'
import { LOST_PITCH_ARCHIVE_IMAGES } from '../media/archive-images'

const SKIP_KEYS = new Set([
  'source',
  'recordLinks',
  'seam',
  'gripImages',
  'slug',
  'relatedSlug',
  'id',
  'imageSrc',
])

function publicStrings(value: unknown, path = 'root'): Array<{ path: string; text: string }> {
  if (typeof value === 'string') return [{ path, text: value }]
  if (Array.isArray(value)) return value.flatMap((item, index) => publicStrings(item, `${path}[${index}]`))
  if (!value || typeof value !== 'object') return []

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    if (SKIP_KEYS.has(key)) return []
    return publicStrings(child, `${path}.${key}`)
  })
}

function isExplicitBoundary(text: string): boolean {
  return /\b(?:does not|do not|contains no|carries no|publishes no|no medical|not medical|not a sourced teaching page|not an age gate|stay outside|stays outside|outside the product|(?:scope|route-stable|health & workload|youth training) boundary|claim-free)\b/i.test(
    text,
  )
}

const PROHIBITED_ASSERTIONS = [
  { name: 'medical or health outcome', pattern: /\b(?:medical|health[- ]outcome|rehabilitation|rehab|recovery|pain)\b/i },
  { name: 'injury conclusion', pattern: /\binjur(?:y|ies|ed)\b/i },
  { name: 'workload conclusion', pattern: /\b(?:workload|workloads|workhorse|pitch[- ]count)\b/i },
  { name: 'durability conclusion', pattern: /\b(?:durability|durable (?:pitcher|arm|career|star|body))\b/i },
  { name: 'safety comparison', pattern: /\b(?:safe|safer|safest|protective|restorative|gentlest|kindest|lower[- ]load)\b/i },
  {
    name: 'arm or joint load conclusion',
    pattern:
      /\b(?:(?:arm|elbow|shoulder|joint|ucl|tissue).{0,45}(?:stress|strain|torque|load|risk)|(?:stress|strain|torque|load|risk).{0,45}(?:arm|elbow|shoulder|joint|ucl|tissue))\b/i,
  },
  {
    name: 'youth prescription',
    pattern: /\b(?:young (?:athlete|pitcher|player|thrower)|youth[- ]training|age[- ]based pitch|ages? \d|adolescent|teenager)\b/i,
  },
] as const

const OWNED_PUBLIC_SURFACES = {
  knowledge: [mechanicsWing, armHealthWing, youthWing, canonWing, trendsWing, pitchDesignWing],
  knowledgeRouteCopy: [KNOWLEDGE_HUB_COPY, EDUCATIONAL_DISCLAIMER],
  softballRouteCopy: [SOFTBALL_FASTPITCH_COPY, SOFTBALL_HUB_FASTPITCH_BLURB],
  softballFundamentals: [WINDMILL_PHASES, FUNDAMENTAL_BLOCKS],
  softballPitches: SOFTBALL_PITCHES,
  softballCraftsmen: SOFTBALL_CRAFTSMEN,
  filedPitches: PITCHES,
  repertoire: REPERTOIRE,
  craftsmen: CRAFTSMEN,
  lostPitches: LOST_PITCHES,
  lostPitchArchive: LOST_PITCH_ARCHIVE_IMAGES,
}

describe('absolute public safety boundary', () => {
  it('keeps the two route-stable boundary wings explicit and claim-free', () => {
    for (const wing of [armHealthWing, youthWing]) {
      expect(wing.boundaryOnly).toBe(true)
      expect(wing.educational).toBe(true)
      expect(wing.sections.length).toBeGreaterThan(0)
      for (const section of wing.sections) {
        expect(section.claims).toBeUndefined()
        expect(section.pullStat).toBeUndefined()
      }
    }
  })

  it('removes the fastpitch health block instead of hiding it behind a disclaimer', () => {
    expect(FUNDAMENTAL_BLOCKS.some((block) => block.educational || block.id === 'arm-health')).toBe(false)
  })

  it('rejects prohibited conclusions across owned public data and route copy', () => {
    const failures: string[] = []

    for (const { path, text } of publicStrings(OWNED_PUBLIC_SURFACES)) {
      if (isExplicitBoundary(text)) continue
      for (const rule of PROHIBITED_ASSERTIONS) {
        if (rule.pattern.test(text)) failures.push(`${rule.name} at ${path}: ${text}`)
      }
    }

    expect(failures).toEqual([])
  })
})
