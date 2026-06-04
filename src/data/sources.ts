import type { Claim, ClaimConfidence, Source } from './types'

/*
  The citation registry. Every figure on the page links to one of these.
  retrievedAt is the date each source was last checked (2026-06-04). It is real
  and is the only thing the colophon's "as of" line is allowed to compute from.
  No freshness string is hardcoded anywhere.
*/

const RETRIEVED = '2026-06-04'

export const SOURCES = {
  'mlb-active-spin': {
    id: 'mlb-active-spin',
    label: 'MLB.com Statcast Glossary, Active Spin',
    url: 'https://www.mlb.com/glossary/statcast/active-spin',
    retrievedAt: RETRIEVED,
    season: '2019 reference (Verlander 98.5%)',
  },
  'mlb-ivb': {
    id: 'mlb-ivb',
    label: 'MLB.com Statcast Glossary, Induced Vertical Break',
    url: 'https://www.mlb.com/glossary/statcast/induced-vertical-break',
    retrievedAt: RETRIEVED,
    season: '2024 league average +16 in',
  },
  'mlb-spin-rate': {
    id: 'mlb-spin-rate',
    label: 'MLB.com, What Statcast spin rate means for fastballs',
    url: 'https://www.mlb.com/news/what-statcast-spin-rate-means-for-fastballs-c212735620',
    retrievedAt: RETRIEVED,
    season: '2019 baseline ~2,300 rpm',
  },
  'mlb-cole': {
    id: 'mlb-cole',
    label: "MLB.com, Why Cole's fastball is in a league of its own (Statcast)",
    url: 'https://www.mlb.com/news/gerrit-cole-fastball-best-of-yankees',
    retrievedAt: RETRIEVED,
    season: '2019',
  },
  'savant-strider': {
    id: 'savant-strider',
    label: 'Baseball Savant (Statcast), Spencer Strider',
    url: 'https://baseballsavant.mlb.com/savant-player/spencer-strider-675911',
    retrievedAt: RETRIEVED,
    season: '2023',
  },
  'thescore-strider': {
    id: 'thescore-strider',
    label: 'theScore, How Spencer Strider developed a cheat-code pitch',
    url: 'https://www.thescore.com/mlb/news/2631293',
    retrievedAt: RETRIEVED,
    season: '2023',
  },
  'mlb-greene': {
    id: 'mlb-greene',
    label: "MLB.com, The keys to Hunter Greene's breakout season (Statcast)",
    url: 'https://www.mlb.com/news/keys-to-hunter-greene-s-breakout-season',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-greene': {
    id: 'savant-greene',
    label: 'Baseball Savant (Statcast), Hunter Greene',
    url: 'https://baseballsavant.mlb.com/savant-player/hunter-greene-668881',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'tht-kagan': {
    id: 'tht-kagan',
    label: 'The Hardball Times, David Kagan citing Alan Nathan',
    url: 'https://tht.fangraphs.com/the-physics-of-a-rising-fastball/',
    retrievedAt: RETRIEVED,
    season: 'physics',
  },
  'wiki-four-seam': {
    id: 'wiki-four-seam',
    label: 'Wikipedia, Four-seam fastball',
    url: 'https://en.wikipedia.org/wiki/Four-seam_fastball',
    retrievedAt: RETRIEVED,
  },
  'wiki-fastball': {
    id: 'wiki-fastball',
    label: 'Wikipedia, Fastball',
    url: 'https://en.wikipedia.org/wiki/Fastball',
    retrievedAt: RETRIEVED,
  },
  efastball: {
    id: 'efastball',
    label: 'eFastball, Four-seam fastball grip',
    url: 'https://efastball.com/baseball/pitching/grips/four-seam-fastball-grip/',
    retrievedAt: RETRIEVED,
  },
  platecrate: {
    id: 'platecrate',
    label: 'Plate Crate, Mastering the four-seam fastball',
    url: 'https://www.platecrate.com/blogs/baseball-101/mastering-the-four-seam-fastball-how-to-grip-a-fastball-in-baseball',
    retrievedAt: RETRIEVED,
  },
  'wiki-baseball-ball': {
    id: 'wiki-baseball-ball',
    label: 'Wikipedia, Baseball (ball)',
    url: 'https://en.wikipedia.org/wiki/Baseball_(ball)',
    retrievedAt: RETRIEVED,
  },
  mathcurve: {
    id: 'mathcurve',
    label: 'mathcurve.com, Seam line of a tennis ball (Ferreol / Esculier)',
    url: 'https://mathcurve.com/courbes3d.gb/couture/couture.shtml',
    retrievedAt: RETRIEVED,
  },
  mathworld: {
    id: 'mathworld',
    label: 'Wolfram MathWorld, Baseball Cover (Thompson)',
    url: 'https://mathworld.wolfram.com/BaseballCover.html',
    retrievedAt: RETRIEVED,
  },
  frontiers: {
    id: 'frontiers',
    label: 'Frontiers in Applied Mathematics and Statistics (2018), aerodynamic forces on a baseball',
    url: 'https://www.frontiersin.org/journals/applied-mathematics-and-statistics/articles/10.3389/fams.2018.00066/full',
    retrievedAt: RETRIEVED,
  },
  texasleaguers: {
    id: 'texasleaguers',
    label: 'TexasLeaguers Pitch Spin Visualization Tool (red-dot method, Alan Nathan)',
    url: 'https://scout.texasleaguers.com/spin',
    retrievedAt: RETRIEVED,
  },
  'lau-github': {
    id: 'lau-github',
    label: 'Lau Sze Yui, GitHub',
    url: 'https://github.com/903124',
    retrievedAt: RETRIEVED,
  },
} satisfies Record<string, Source>

export type SourceId = keyof typeof SOURCES

/** Resolve a source by id. Throws on a typo so a bad citation can never ship. */
export function src(id: SourceId): Source {
  const s = SOURCES[id]
  if (!s) throw new Error(`Pitch Atlas: unknown source id "${id}"`)
  return s
}

/** A sourced, confident claim. */
export function claim<T>(
  value: T,
  id: SourceId,
  confidence: Exclude<ClaimConfidence, 'unverified'>,
  opts: { note?: string; approximate?: boolean } = {},
): Claim<T> {
  return { value, source: src(id), confidence, ...opts }
}

/** A claim relayed through a secondary source. Requires a note. */
export function secondhand<T>(value: T, id: SourceId, note: string): Claim<T> {
  return { value, source: src(id), confidence: 'secondhand-attributed', note }
}

/** A claim no source corroborated this run. Requires a note. Shown, not hidden. */
export function unverified<T>(value: T, note: string, id?: SourceId): Claim<T> {
  return id
    ? { value, source: src(id), confidence: 'unverified', note }
    : { value, confidence: 'unverified', note }
}

/**
 * The most recent retrievedAt across a set of sources, as an ISO date string.
 * The colophon's "as of" line computes from this. Never hardcode the date.
 */
export function latestRetrievedAt(sources: Source[]): string {
  return sources
    .map((s) => s.retrievedAt)
    .reduce((a, b) => (a > b ? a : b), '0000-00-00')
}

/** Every source in the registry, for the colophon credential list. */
export function allSources(): Source[] {
  return Object.values(SOURCES)
}
