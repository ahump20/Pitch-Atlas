import type { Source } from '../types'
import type { KnowledgeWing } from './types'

import { mechanicsWing } from './mechanics'
import { pitchDesignWing } from './pitch-design'
import { sequencingWing } from './sequencing'
import { spinWing } from './spin'
import { metricsWing } from './metrics'
import { armHealthWing } from './arm-health'
import { youthWing } from './youth'
import { trendsWing } from './trends'
import { handednessWing } from './handedness'
import { canonWing } from './canon'

/*
  The teaching layer. Each wing is a sourced essay rendered by one template
  (components/sections/KnowledgePage). The same Claim model the specimen pages use
  backs every teaching claim here, so a teaching page can never make an unsourced
  claim the rest of the atlas would refuse. The claim helper and the educational
  disclaimer live in ./claim to keep this registry free of a circular import.
*/

export { kc, KNOWLEDGE_RETRIEVED, EDUCATIONAL_DISCLAIMER } from './claim'

/** Route and SEO copy shared by /learn and its regression coverage. */
export const KNOWLEDGE_HUB_COPY = {
  description:
    'The craft-record layer of Pitch Atlas: mechanics, pitch design, sequencing, tunneling, spin literacy, provenance, and clear scope boundaries. Every teaching claim is sourced and labeled by confidence.',
  heroSub:
    'The specimens say what each pitch is. These wings explain the craft underneath it and mark the subjects Pitch Atlas does not cover. Every teaching claim is sourced and labeled by confidence.',
} as const

/** Every wing, in teaching order. Hub and prerender read from this. */
export const WINGS: KnowledgeWing[] = [
  mechanicsWing,
  pitchDesignWing,
  sequencingWing,
  spinWing,
  metricsWing,
  armHealthWing,
  youthWing,
  trendsWing,
  handednessWing,
  canonWing,
]

export function wingBySlug(slug: string): KnowledgeWing | undefined {
  return WINGS.find((w) => w.slug === slug)
}

/** Unique sources cited across all wings, for the colophon. Deduped by URL. */
export function knowledgeSources(): Source[] {
  const byUrl = new Map<string, Source>()
  for (const w of WINGS) {
    for (const s of w.sections) {
      const claims = [...(s.claims ?? [])]
      if (s.pullStat) claims.push(s.pullStat.claim)
      for (const c of claims) {
        if (c.source && !byUrl.has(c.source.url)) byUrl.set(c.source.url, c.source)
      }
    }
  }
  return [...byUrl.values()].sort((a, b) => a.label.localeCompare(b.label))
}
