/*
  Era parsing for the Craftsmen chronology. Every craftsman carries a human era
  string ("1928-1943", "2024-present", "Designed 2001"); this reads the real
  years out of it for the timeline band and the chronological reading order.
  Nothing is invented — a span we cannot parse returns null and the caller simply
  omits the band. The axis is a fixed window, not a clock: a still reference frame
  the careers are laid against, so the build stays deterministic and an open
  career is drawn as open, never pinned to a fabricated end year.
*/

export const ERA_AXIS = { start: 1925, end: 2030 } as const

export interface EraSpan {
  start: number
  /** null = open-ended ("present"): the bar runs to the axis edge with an open cap. */
  end: number | null
}

export function parseEra(era: string): EraSpan | null {
  const years = era.match(/\d{4}/g)
  if (!years || years.length === 0) return null
  const start = Number(years[0])
  // "2024-present" / "Active since 2024": one year plus an open-ended cue
  if (years.length === 1 && /present|active|since|now/i.test(era)) {
    return { start, end: null }
  }
  if (years.length >= 2) return { start, end: Number(years[1]) }
  // a lone year with no open cue (e.g. "Designed 2001") is a single point
  return { start, end: start }
}

/** Fractional position [0..1] of a year along the fixed axis. */
export function axisPos(year: number): number {
  const { start, end } = ERA_AXIS
  return Math.min(1, Math.max(0, (year - start) / (end - start)))
}

/** Sort comparator: earliest era first. Unparseable eras sink to the end. */
export function byEraStart<T extends { era: string }>(a: T, b: T): number {
  const sa = parseEra(a.era)?.start ?? Infinity
  const sb = parseEra(b.era)?.start ?? Infinity
  return sa - sb
}
