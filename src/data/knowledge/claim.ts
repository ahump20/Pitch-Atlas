import type { Claim, ClaimConfidence, Source } from '../types'

/*
  The knowledge-wing claim helper, kept in its own module so the per-wing data
  files can import it without a circular dependency on the wing registry (index.ts
  imports the wings; the wings import only this).

  Wing citations are kept on their own retrieval date and out of the specimen
  SOURCES registry (which is keyed to per-pitch claims); knowledgeSources() in
  index.ts folds them back into the colophon so /sources stays complete.
*/

/** The date the knowledge wings were researched and verified. Real, not hardcoded freshness. */
export const KNOWLEDGE_RETRIEVED = '2026-06-06'

function idFromUrl(url: string): string {
  return (
    'k-' +
    url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 56)
      .toLowerCase()
  )
}

/**
 * Build a knowledge-wing claim. Mirrors the specimen claim helpers but takes an
 * inline source (label + url) instead of a registry id, because the wings cite a
 * far wider literature than the per-pitch registry. Enforces the same contract:
 * a confident claim needs a source; a weak claim needs a note.
 */
export function kc(
  value: string,
  confidence: ClaimConfidence,
  source: { label: string; url: string; season?: string } | null,
  note?: string,
): Claim<string> {
  const src: Source | undefined = source
    ? {
        id: idFromUrl(source.url),
        label: source.label,
        url: source.url,
        retrievedAt: KNOWLEDGE_RETRIEVED,
        ...(source.season ? { season: source.season } : {}),
      }
    : undefined

  if (confidence === 'unverified') {
    return {
      value,
      confidence,
      note: note ?? 'No source corroborated this value this run.',
      ...(src ? { source: src } : {}),
    }
  }
  if (confidence === 'secondhand-attributed') {
    if (!src) throw new Error(`knowledge claim "${value.slice(0, 40)}": secondhand requires a source`)
    return { value, confidence, source: src, note: note ?? 'Relayed through a secondary source.' }
  }
  if (!src) throw new Error(`knowledge claim "${value.slice(0, 40)}": ${confidence} requires a source`)
  return { value, confidence, source: src, ...(note ? { note } : {}) }
}

/**
 * The educational-use framing shown on every health/youth wing. Replaces the old
 * no-prescription policy: the atlas now teaches arm health and youth development as
 * sourced reference, but it is education, not medical care.
 */
export const EDUCATIONAL_DISCLAIMER =
  'Sourced educational reference, not medical care. Nothing here is a diagnosis or a prescription. ' +
  'Anyone changing a throwing program — especially for a young pitcher — should run it past a qualified coach or physician first.'
