import { describe, expect, it } from 'vitest'
import { WINGS } from '.'
import type { KnowledgeWing } from './types'

function visibleWingText(wing: KnowledgeWing): string {
  return [
    wing.title,
    wing.summary,
    wing.sub,
    wing.confidenceNote,
    ...wing.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.claims ?? []).map((claim) => claim.value),
      section.pullStat?.label,
      section.pullStat?.claim.value,
      section.pullStat?.claim.note,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
}

describe('safety-source wings', () => {
  it('keeps safety literature framed as source record, not prescription', () => {
    const renderedCopy = WINGS.map(visibleWingText).join(' ')

    expect(renderedCopy).not.toMatch(/remove him/i)
    expect(renderedCopy).not.toMatch(/injury prevention/i)
    expect(renderedCopy).not.toMatch(/safest off-speed pitch/i)
    expect(renderedCopy).not.toMatch(/no pitcher shall/i)
    expect(renderedCopy).not.toMatch(/hard rule applies/i)
    expect(renderedCopy).not.toMatch(/rest immediately/i)
    expect(renderedCopy).not.toMatch(/set workloads/i)
  })
})
