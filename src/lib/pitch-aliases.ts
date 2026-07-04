import { REPERTOIRE } from '../data/repertoire'
import { PITCHES } from '../data/pitches'

/*
  Name-based aliases for the /pitch/<slug> space, derived entirely from the data.

  A visitor (or an old link, or a crawler) who reaches for a filed pitch by its
  full name or a common alias — /pitch/four-seam-fastball, /pitch/cut-fastball —
  should land on the canonical specimen (/pitch/four-seam, /pitch/cutter) with a
  real 301, not the 404. The pairs are generated from each filed REPERTOIRE
  entry's id, name, and aka list; nothing is hand-listed, so a new filed pitch
  brings its own aliases and a renamed one can never leave a stale redirect.

  Two safety drops keep the map honest:
    - a candidate that IS a canonical filed slug is dropped, so a real prerendered
      /pitch/<slug> page is never redirected away from (this also covers the
      self-shadow where a candidate equals its own target);
    - a candidate that would point at two different filed pitches is ambiguous and
      dropped whole, so an alias never guesses which specimen the visitor meant.
*/

/** Lowercase, strip diacritics and apostrophes, collapse the rest to hyphens. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // combining diacritics
    .replace(/[\u0027\u2019.]/g, '') // apostrophes + periods stay inside the word
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface PitchAlias {
  /** Bare slug under /pitch, e.g. "four-seam-fastball". */
  from: string
  /** Canonical filed slug, e.g. "four-seam". */
  to: string
}

/**
 * The derived name/aka/id -> filed-slug aliases, sorted by `from` so the output
 * (and the generated _redirects block) is deterministic.
 */
export function pitchAliases(): PitchAlias[] {
  const canonical = new Set(PITCHES.map((p) => p.display.slug))
  // from -> the set of distinct targets it could resolve to (>1 => ambiguous)
  const targets = new Map<string, Set<string>>()

  for (const entry of REPERTOIRE) {
    const to = entry.filedSlug
    if (!to) continue // only filed pitches own a /pitch/<slug> to redirect to
    const candidates = [entry.id, entry.name, ...(entry.aka ?? [])].map(slugify).filter(Boolean)
    for (const from of candidates) {
      if (from === to) continue // self-shadow
      if (canonical.has(from)) continue // never redirect a real filed page
      const set = targets.get(from) ?? new Set<string>()
      set.add(to)
      targets.set(from, set)
    }
  }

  const aliases: PitchAlias[] = []
  for (const [from, tos] of targets) {
    if (tos.size !== 1) continue // ambiguous — drop whole
    aliases.push({ from, to: [...tos][0] })
  }
  aliases.sort((a, b) => a.from.localeCompare(b.from))
  return aliases
}

/**
 * The Cloudflare _redirects lines for the aliases: a 301 for the bare path and
 * its trailing-slash twin. Appended to dist/_redirects at build time. Not
 * prerendered stub HTML — a static file cannot emit a 301, and a stub would
 * break the prerender-integrity contract.
 */
export function pitchAliasRedirects(): string {
  return pitchAliases()
    .flatMap(({ from, to }) => [
      `/pitch/${from}   /pitch/${to}  301`,
      `/pitch/${from}/  /pitch/${to}  301`,
    ])
    .join('\n')
}
