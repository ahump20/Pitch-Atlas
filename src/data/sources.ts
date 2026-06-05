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

  // --- Two-seam fastball / sinker ---
  'mlb-glossary-sinker': {
    id: 'mlb-glossary-sinker',
    label: 'MLB.com Statcast Glossary, Sinker (SI)',
    url: 'https://www.mlb.com/glossary/pitch-types/sinker',
    retrievedAt: RETRIEVED,
  },
  'driveline-sinker': {
    id: 'driveline-sinker',
    label: 'Driveline Baseball, How to Throw a Sinker or Two-Seam Fastball',
    url: 'https://www.drivelinebaseball.com/2020/06/how-to-throw-a-sinker-or-two-seam-fastball/',
    retrievedAt: RETRIEVED,
  },
  'driveline-ssw': {
    id: 'driveline-ssw',
    label: 'Driveline Baseball, Seam-Shifted Wakes and their Effect on Sinkers',
    url: 'https://www.drivelinebaseball.com/2020/11/more-than-what-it-seams-an-introduction-to-seam-shifted-wakes-and-their-effect-on-sinkers/',
    retrievedAt: RETRIEVED,
    season: '2020',
  },
  'savant-valdez': {
    id: 'savant-valdez',
    label: 'Baseball Savant (Statcast), Framber Valdez',
    url: 'https://baseballsavant.mlb.com/savant-player/framber-valdez-664285',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-webb': {
    id: 'savant-webb',
    label: 'Baseball Savant (Statcast), Logan Webb',
    url: 'https://baseballsavant.mlb.com/savant-player/logan-webb-657277',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-holmes': {
    id: 'savant-holmes',
    label: 'Baseball Savant (Statcast), Clay Holmes',
    url: 'https://baseballsavant.mlb.com/savant-player/clay-holmes-605280',
    retrievedAt: RETRIEVED,
  },
  'pitcherlist-valdez': {
    id: 'pitcherlist-valdez',
    label: 'Pitcher List, How Lower Is Better for Framber Valdez',
    url: 'https://pitcherlist.com/how-lower-is-better-for-framber-valdez/',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'fangraphs-valdez': {
    id: 'fangraphs-valdez',
    label: 'FanGraphs, Framber Valdez',
    url: 'https://www.fangraphs.com/players/framber-valdez/17295/stats/pitching',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'fangraphs-webb': {
    id: 'fangraphs-webb',
    label: 'FanGraphs, Logan Webb',
    url: 'https://www.fangraphs.com/players/logan-webb/17995/stats?position=P',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'medium-perfect-sinker': {
    id: 'medium-perfect-sinker',
    label: 'Colin Hofmeister, Reverse-Engineering the Perfect Sinker',
    url: 'https://medium.com/@colinhofmeister/reverse-engineering-the-perfect-sinker-b5fbcbe06f2e',
    retrievedAt: RETRIEVED,
    season: '2026',
  },

  // --- Circle changeup ---
  'mlb-glossary-changeup': {
    id: 'mlb-glossary-changeup',
    label: 'MLB.com Statcast Glossary, Changeup (CH)',
    url: 'https://www.mlb.com/glossary/pitch-types/changeup',
    retrievedAt: RETRIEVED,
  },
  'mlb-williams-airbender': {
    id: 'mlb-williams-airbender',
    label: 'MLB.com, Devin Williams and the Airbender changeup',
    url: 'https://www.mlb.com/news/devin-williams-airbender-pitch-explainer',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'driveline-changeup': {
    id: 'driveline-changeup',
    label: 'Driveline Baseball, How to Throw a Changeup',
    url: 'https://www.drivelinebaseball.com/2020/06/how-to-throw-a-changeup/',
    retrievedAt: RETRIEVED,
    season: '2020',
  },
  'savant-williams': {
    id: 'savant-williams',
    label: 'Baseball Savant (Statcast), Devin Williams',
    url: 'https://baseballsavant.mlb.com/savant-player/devin-williams-642207',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'fangraphs-changeup-2011': {
    id: 'fangraphs-changeup-2011',
    label: 'FanGraphs, The Best Pitches of 2011: Changeup (Cole Hamels)',
    url: 'https://blogs.fangraphs.com/the-best-pitches-of-2011-changeup/',
    retrievedAt: RETRIEVED,
    season: '2011',
  },
  'fangraphs-hamels-2019': {
    id: 'fangraphs-hamels-2019',
    label: "FanGraphs, Cole Hamels' Vintage Changeup Returned in 2019",
    url: 'https://blogs.fangraphs.com/cole-hamels-vintage-changeup-returned-in-2019/',
    retrievedAt: RETRIEVED,
    season: '2019',
  },
  'mlb-spin-vs-velo': {
    id: 'mlb-spin-vs-velo',
    label: 'MLB.com, Statcast spin rate compared to velocity',
    url: 'https://www.mlb.com/news/statcast-spin-rate-compared-to-velocity-c160896926',
    retrievedAt: RETRIEVED,
    season: '2015 league averages',
  },
  'mccovey-webb': {
    id: 'mccovey-webb',
    label: "McCovey Chronicles, Logan Webb's changeup",
    url: 'https://www.mccoveychronicles.com/2024/2/22/24080658/problematic-pitches-logan-webb-edition-san-francisco-giants-2024',
    retrievedAt: RETRIEVED,
    season: '2024',
  },

  // --- 12-6 curveball ---
  'mlb-glossary-spin-rate': {
    id: 'mlb-glossary-spin-rate',
    label: 'MLB.com Statcast Glossary, Spin Rate',
    url: 'https://www.mlb.com/glossary/statcast/spin-rate',
    retrievedAt: RETRIEVED,
  },
  'savant-kershaw': {
    id: 'savant-kershaw',
    label: 'Baseball Savant (Statcast), Clayton Kershaw',
    url: 'https://baseballsavant.mlb.com/savant-player/clayton-kershaw-477132',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-morton': {
    id: 'savant-morton',
    label: 'Baseball Savant (Statcast), Charlie Morton',
    url: 'https://baseballsavant.mlb.com/savant-player/charlie-morton-450203',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'driveline-curveball': {
    id: 'driveline-curveball',
    label: 'Driveline Baseball, How to Throw a Curveball',
    url: 'https://www.drivelinebaseball.com/2020/06/how-to-throw-a-curveball/',
    retrievedAt: RETRIEVED,
  },
  'baseballmonkey-curveball': {
    id: 'baseballmonkey-curveball',
    label: 'Baseball Monkey, How to Throw a Curveball',
    url: 'https://www.baseballmonkey.com/learn/how-to-throw-curveball',
    retrievedAt: RETRIEVED,
  },

  // --- Slider ---
  'savant-slider-movement': {
    id: 'savant-slider-movement',
    label: 'Baseball Savant (Statcast), Pitch Movement Leaderboard (Sliders)',
    url: 'https://baseballsavant.mlb.com/leaderboard/pitch-movement?year=2024&pitch_type=SL',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-cease': {
    id: 'savant-cease',
    label: 'Baseball Savant (Statcast), Dylan Cease',
    url: 'https://baseballsavant.mlb.com/savant-player/dylan-cease-656302',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-glasnow': {
    id: 'savant-glasnow',
    label: 'Baseball Savant (Statcast), Tyler Glasnow',
    url: 'https://baseballsavant.mlb.com/savant-player/tyler-glasnow-607192',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'savant-sale': {
    id: 'savant-sale',
    label: 'Baseball Savant (Statcast), Chris Sale',
    url: 'https://baseballsavant.mlb.com/savant-player/chris-sale-519242',
    retrievedAt: RETRIEVED,
    season: '2024',
  },
  'mlb-sweeper-explained': {
    id: 'mlb-sweeper-explained',
    label: 'MLB.com, Explaining the sweeper (slider vs sweeper break)',
    url: 'https://www.mlb.com/news/sweeper-slider-latest-pitching-trend-explained',
    retrievedAt: RETRIEVED,
  },
  'driveline-slider': {
    id: 'driveline-slider',
    label: 'Driveline Baseball, How to Throw a Slider',
    url: 'https://www.drivelinebaseball.com/2020/06/how-to-throw-a-slider/',
    retrievedAt: RETRIEVED,
  },
  'driveline-grips-sliders': {
    id: 'driveline-grips-sliders',
    label: 'Driveline Baseball Help, Pitch Grips: Sliders',
    url: 'https://help.drivelinebaseball.com/portal/en/kb/articles/pitch-grips-sliders',
    retrievedAt: RETRIEVED,
  },
  'tht-gyro-physics': {
    id: 'tht-gyro-physics',
    label: 'The Hardball Times, The Physics of the Gyro Pitch (Alan Nathan)',
    url: 'https://tht.fangraphs.com/the-physics-of-the-gyro-pitch/',
    retrievedAt: RETRIEVED,
  },
  'fangraphs-romo-no-dot': {
    id: 'fangraphs-romo-no-dot',
    label: "FanGraphs, Sergio Romo's No-Dot Slider Revealed",
    url: 'https://blogs.fangraphs.com/sergio-romos-no-dot-slider-revealed/',
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
