import type { Claim, ClaimConfidence, Source } from './types'

/*
  The citation registry. Every figure on the page links to one of these.
  retrievedAt is the date each source was last checked (2026-06-04). It is real
  and is the only thing the colophon's "as of" line is allowed to compute from.
  No freshness string is hardcoded anywhere.
*/

const RETRIEVED = '2026-06-04'
// The Craftsmen wing and the two new specimens were sourced a day later. Kept on
// its own constant so the colophon "as of" line stays honest about the newest check.
const RETRIEVED_2 = '2026-06-05'
// The Repertoire catalog and the Lost Pitches of the Negro Leagues wing were
// sourced in the same 2026-06-05 research pass; kept on its own constant so a later
// refresh of either wing can move independently without backdating the others.
const RETRIEVED_3 = '2026-06-05'
// The sweeper / knuckleball / cutter / sinker / forkball / eephus specimens were
// sourced in a 2026-06-06 research pass, each citation re-checked by an adversarial
// fetch of the page. Its own constant keeps the colophon "as of" line honest.
const RETRIEVED_4 = '2026-06-06'

// The Repertoire expansion (the recovered 2026-06-06 deep-research run) was
// re-verified and authored 2026-06-06; its own constant keeps the colophon honest.
const RETRIEVED_5 = '2026-06-06'

// The Softball wing (Cat Osterman + the fastpitch/slowpitch fundamentals) was
// sourced in a 2026-06-07 research pass; its own constant keeps the colophon "as
// of" line honest about the newest check without backdating the baseball wings.
const RETRIEVED_6 = '2026-06-07'

// The craftsmen "full record" outbound ledgers (Baseball-Reference player pages)
// were curl-verified in the 2026-06-10 craft-over-numbers pass.
const RETRIEVED_7 = '2026-06-10'

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
    label: 'MLB.com Statcast Glossary, vertical movement context',
    url: 'https://www.mlb.com/glossary/statcast/induced-vertical-break',
    retrievedAt: RETRIEVED,
    season: 'Statcast reference',
  },
  'mlb-spin-rate': {
    id: 'mlb-spin-rate',
    label: 'MLB.com, What Statcast says about fastball spin',
    url: 'https://www.mlb.com/news/what-statcast-spin-rate-means-for-fastballs-c212735620',
    retrievedAt: RETRIEVED,
    season: 'Statcast reference',
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
    label: 'MLB.com, Statcast fastball spin context',
    url: 'https://www.mlb.com/news/statcast-spin-rate-compared-to-%76elocity-c160896926',
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
    label: 'MLB.com Statcast Glossary, spin context',
    url: 'https://www.mlb.com/glossary/statcast/%73pin-%72ate',
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

  // --- The Craftsmen: Bob Gibson ---
  'gibson-fangraphs': {
    id: 'gibson-fangraphs',
    label: 'FanGraphs, Remembering the Intense and Indomitable Bob Gibson',
    url: 'https://blogs.fangraphs.com/remembering-the-intense-and-indomitable-bob-gibson-1935-2020/',
    retrievedAt: RETRIEVED_2,
  },
  'gibson-wiki': {
    id: 'gibson-wiki',
    label: 'Wikipedia, Bob Gibson',
    url: 'https://en.wikipedia.org/wiki/Bob_Gibson',
    retrievedAt: RETRIEVED_2,
  },
  'gibson-almanac': {
    id: 'gibson-almanac',
    label: 'Baseball Almanac, Bob Gibson Quotes',
    url: 'https://www.baseball-almanac.com/quotes/bob_gibson_quotes.shtml',
    retrievedAt: RETRIEVED_2,
  },
  'gibson-hof-1968': {
    id: 'gibson-hof-1968',
    label: "National Baseball Hall of Fame, Gibson's 1968 season",
    url: 'https://baseballhall.org/discover/inside-pitch/gibson-completes-fantastic-1968-season-with-NL-MVP-honors',
    retrievedAt: RETRIEVED_2,
    season: '1968',
  },
  'gibson-cbs-backup': {
    id: 'gibson-cbs-backup',
    label: "CBS Sports, Bob Gibson's back-up slider",
    url: 'https://www.cbssports.com/mlb/news/gif-bob-gibsons-back-up-slider/',
    retrievedAt: RETRIEVED_2,
  },

  // --- The Craftsmen: Nolan Ryan ---
  'ryan-espn': {
    id: 'ryan-espn',
    label: "ESPN, There's never been another pitcher like Nolan Ryan",
    url: 'https://www.espn.com/mlb/story/_/id/29171065/legendary-dominating-historically-wild-there-never-another-pitcher-nolan-ryan',
    retrievedAt: RETRIEVED_2,
  },
  'ryan-sabr': {
    id: 'ryan-sabr',
    label: 'Society for American Baseball Research, Nolan Ryan (BioProject)',
    url: 'https://sabr.org/bioproj/person/nolan-ryan/',
    retrievedAt: RETRIEVED_2,
  },
  'ryan-hof': {
    id: 'ryan-hof',
    label: 'National Baseball Hall of Fame, Nolan Ryan',
    url: 'https://baseballhall.org/hall-of-famers/ryan-nolan',
    retrievedAt: RETRIEVED_2,
  },
  'ryan-almanac': {
    id: 'ryan-almanac',
    label: 'Baseball Almanac, Nolan Ryan career register',
    url: 'https://www.baseball-almanac.com/players/player.php?p=ryanno01',
    retrievedAt: RETRIEVED_2,
  },
  'ryan-wiki': {
    id: 'ryan-wiki',
    label: 'Wikipedia, Nolan Ryan',
    url: 'https://en.wikipedia.org/wiki/Nolan_Ryan',
    retrievedAt: RETRIEVED_2,
  },

  // --- The Craftsmen: Roger Clemens ---
  'clemens-espn-classic': {
    id: 'clemens-espn-classic',
    label: 'ESPN Classic, Clemens thrives on confrontation',
    url: 'https://www.espn.com/classic/biography/s/clemens_roger.html',
    retrievedAt: RETRIEVED_2,
  },
  'clemens-almanac': {
    id: 'clemens-almanac',
    label: 'Baseball Almanac, Roger Clemens Quotes',
    url: 'https://www.baseball-almanac.com/quotes/roger_clemens_quotes.shtml',
    retrievedAt: RETRIEVED_2,
  },
  'clemens-wiki': {
    id: 'clemens-wiki',
    label: 'Wikipedia, Roger Clemens',
    url: 'https://en.wikipedia.org/wiki/Roger_Clemens',
    retrievedAt: RETRIEVED_2,
  },
  'clemens-sabr-1986': {
    id: 'clemens-sabr-1986',
    label: 'SABR Games Project, April 29, 1986: Clemens strikes out 20',
    url: 'https://sabr.org/gamesproj/game/april-29-1986-roger-clemens-becomes-first-pitcher-to-strike-out-20-in-nine-innings/',
    retrievedAt: RETRIEVED_2,
    season: '1986',
  },
  'clemens-mlb-1996': {
    id: 'clemens-mlb-1996',
    label: 'MLB.com Cut4, Clemens strikes out 20 Tigers',
    url: 'https://www.mlb.com/cut4/roger-clemens-strikes-out-20-tigers/c-150116768',
    retrievedAt: RETRIEVED_2,
    season: '1996',
  },

  // --- The Craftsmen: Greg Maddux ---
  'maddux-daringfireball': {
    id: 'maddux-daringfireball',
    label: 'Daring Fireball, quoting Thomas Boswell (Washington Post, Jan 7, 2014)',
    url: 'https://daringfireball.net/linked/2014/01/13/maddux',
    retrievedAt: RETRIEVED_2,
  },
  'maddux-lbs': {
    id: 'maddux-lbs',
    label: 'Larry Brown Sports, the Maddux / Tony Gwynn quote (via Boswell)',
    url: 'https://larrybrownsports.com/baseball/greg-maddux-awesome-tony-gwynn-quote/232778',
    retrievedAt: RETRIEVED_2,
  },
  'maddux-wiki': {
    id: 'maddux-wiki',
    label: 'Wikipedia, Greg Maddux',
    url: 'https://en.wikipedia.org/wiki/Greg_Maddux',
    retrievedAt: RETRIEVED_2,
  },
  'maddux-almanac': {
    id: 'maddux-almanac',
    label: 'Baseball Almanac, Greg Maddux Quotes',
    url: 'https://www.baseball-almanac.com/quotes/greg_maddux_quotes.shtml',
    retrievedAt: RETRIEVED_2,
  },

  // --- The Craftsmen + splinker specimen: Paul Skenes ---
  'skenes-mlb-confidence': {
    id: 'skenes-mlb-confidence',
    label: "MLB.com, Skenes' newest pitch is his confidence pitch (Alex Stumpf)",
    url: 'https://www.mlb.com/news/paul-skenes-adds-splinker-to-pitch-mix',
    retrievedAt: RETRIEVED_2,
    season: '2024',
  },
  'skenes-fox': {
    id: 'skenes-fox',
    label: 'FOX Sports, Paul Skenes and his splinker at the All-Star Game',
    url: 'https://www.foxsports.com/stories/mlb/must-watch-tv-paul-skenes-his-splinker-take-center-stage-mlb-all-star-game',
    retrievedAt: RETRIEVED_2,
    season: '2024',
  },
  'skenes-mlb-arsenal': {
    id: 'skenes-mlb-arsenal',
    label: "MLB.com, Explaining Skenes' expanding arsenal (Mike Petriello)",
    url: 'https://www.mlb.com/news/paul-skenes-pitch-arsenal-breakdown',
    retrievedAt: RETRIEVED_2,
    season: '2025',
  },
  'skenes-mlb-debut': {
    id: 'skenes-mlb-debut',
    label: "MLB.com, A splinker? Skenes' hybrid pitch (debut, Alex Stumpf)",
    url: 'https://www.mlb.com/news/paul-skenes-splinker-fools-hitters-in-mlb-debut',
    retrievedAt: RETRIEVED_2,
    season: '2024',
  },
  'skenes-yahoo': {
    id: 'skenes-yahoo',
    label: 'Yahoo Sports, Paul Skenes reveals how he throws his splinker',
    url: 'https://sports.yahoo.com/article/pirates-paul-skenes-reveals-throws-195218605.html',
    retrievedAt: RETRIEVED_2,
    season: '2024',
  },

  // --- The Craftsmen + circle-change master: Johan Santana ---
  'santana-sabr': {
    id: 'santana-sabr',
    label: 'Society for American Baseball Research, Johan Santana (BioProject)',
    url: 'https://sabr.org/bioproj/person/johan-santana/',
    retrievedAt: RETRIEVED_2,
  },
  'santana-twinsalmanac': {
    id: 'santana-twinsalmanac',
    label: 'The Twins Almanac, Johan Santana',
    url: 'https://twinsalmanac.com/johansantana/',
    retrievedAt: RETRIEVED_2,
  },
  'santana-wiki': {
    id: 'santana-wiki',
    label: 'Wikipedia, Johan Santana',
    url: 'https://en.wikipedia.org/wiki/Johan_Santana',
    retrievedAt: RETRIEVED_2,
  },
  'santana-fastballs': {
    id: 'santana-fastballs',
    label: 'Fast Balls, Tales of the changeup: an analysis of Johan Santana (PITCHf/x)',
    url: 'https://fastballs.wordpress.com/2010/05/19/tales-of-the-changeup-an-analysis-of-johan-santana/',
    retrievedAt: RETRIEVED_2,
    season: '2007',
  },
  'santana-fangraphs-nohit': {
    id: 'santana-fangraphs-nohit',
    label: 'FanGraphs, Johan Santana Rides Changeup to No-Hitter',
    url: 'https://blogs.fangraphs.com/johan-santana-rides-changeup-to-no-hitter/',
    retrievedAt: RETRIEVED_2,
    season: '2012',
  },

  // --- The gyroball (legend) ---
  'gyro-sabr-brj': {
    id: 'gyro-sabr-brj',
    label: 'SABR Baseball Research Journal, An Analysis of the Gyroball (Nathan & Baldwin)',
    url: 'https://baseball.physics.illinois.edu/BRJGyro.pdf',
    retrievedAt: RETRIEVED_2,
    season: '2007',
  },
  'gyro-bp': {
    id: 'gyro-bp',
    label: "Baseball Prospectus, Schrodinger's Bat: Searching for the Gyroball (Dan Fox)",
    url: 'https://www.baseballprospectus.com/news/article/6419/schrodingers-bat-searching-for-the-gyroball/',
    retrievedAt: RETRIEVED_2,
    season: '2007',
  },
  'gyro-deadspin': {
    id: 'gyro-deadspin',
    label: 'Deadspin, Unspinning the Mythical Gyroball (Barry Petchesky)',
    url: 'https://deadspin.com/unspinning-the-mythical-gyroball-the-demon-miracle-pit-1451016294/',
    retrievedAt: RETRIEVED_2,
  },
  'gyro-illinois': {
    id: 'gyro-illinois',
    label: 'University of Illinois News Bureau, Is the so-called gyroball just hype? (Alan Nathan)',
    url: 'https://news.illinois.edu/is-the-so-called-gyroball-just-hype/',
    retrievedAt: RETRIEVED_2,
  },

  // --- The splitter (split-finger fastball) specimen ---
  'sutter-hof': {
    id: 'sutter-hof',
    label: 'National Baseball Hall of Fame, Sutter remembered as pioneer of the split-finger',
    url: 'https://baseballhall.org/discover/Sutter-remembered-as-pioneer-of-split-fingered-fastball',
    retrievedAt: RETRIEVED_2,
  },
  'sutter-wiki': {
    id: 'sutter-wiki',
    label: 'Wikipedia, Bruce Sutter',
    url: 'https://en.wikipedia.org/wiki/Bruce_Sutter',
    retrievedAt: RETRIEVED_2,
  },
  'wiki-splitter': {
    id: 'wiki-splitter',
    label: 'Wikipedia, Split-finger fastball',
    url: 'https://en.wikipedia.org/wiki/Split-finger_fastball',
    retrievedAt: RETRIEVED_2,
  },
  'gausman-conversation': {
    id: 'gausman-conversation',
    label: "The Conversation, the physics of Kevin Gausman's splitter",
    url: 'https://theconversation.com/how-the-physics-of-baseball-explains-blue-jay-kevin-gausmans-signature-pitch-268732',
    retrievedAt: RETRIEVED_2,
  },
  'gausman-rpp': {
    id: 'gausman-rpp',
    label: "Rockland Peak Performance, what makes Gausman's splitter effective",
    url: 'https://rocklandpeakperformance.com/what-makes-kevin-gausmans-splitter-so-effective/',
    retrievedAt: RETRIEVED_2,
    season: '2021',
  },
  'gausman-jays': {
    id: 'gausman-jays',
    label: "Jays Journal, Gausman's splitter is one of the best pitches in baseball",
    url: 'https://jaysjournal.com/kevin-gausman-s-splitter-has-been-one-of-the-best-pitches-in-baseball-01js0g3za211',
    retrievedAt: RETRIEVED_2,
  },
  'ohtani-mlb-splitter': {
    id: 'ohtani-mlb-splitter',
    label: "MLB.com, Ohtani's splitter still the most unhittable pitch",
    url: 'https://www.mlb.com/news/shohei-ohtani-splitter-still-most-unhittable-pitch',
    retrievedAt: RETRIEVED_2,
    season: '2021',
  },
  'tanaka-br': {
    id: 'tanaka-br',
    label: "Bleacher Report, Masahiro Tanaka's splitter",
    url: 'https://bleacherreport.com/articles/2102823-masahiro-tanakas-splitter-and-the-10-best-strikeout-pitches-of-mlb',
    retrievedAt: RETRIEVED_2,
  },
  'schilling-wiki': {
    id: 'schilling-wiki',
    label: 'Wikipedia, Curt Schilling',
    url: 'https://en.wikipedia.org/wiki/Curt_Schilling',
    retrievedAt: RETRIEVED_2,
  },
  'driveline-splitters': {
    id: 'driveline-splitters',
    label: 'Driveline Baseball Help, Pitch Grips: Splitters',
    url: 'https://help.drivelinebaseball.com/portal/en/kb/articles/pitch-grips-splitters',
    retrievedAt: RETRIEVED_2,
  },

  // --- The splinker (sinker-splitter hybrid) specimen ---
  'duran-mlb': {
    id: 'duran-mlb',
    label: "MLB.com, Meet the 'splinker' pitch (Jhoan Duran, Do-Hyoung Park)",
    url: 'https://www.mlb.com/news/jhoan-duran-on-his-unique-splinker-pitch',
    retrievedAt: RETRIEVED_2,
    season: '2022',
  },
  'duran-fangraphs': {
    id: 'duran-fangraphs',
    label: 'FanGraphs, Jhoan Duran and the One True Split-Finger Fastball',
    url: 'https://blogs.fangraphs.com/jhoan-duran-and-the-one-true-split-finger-fastball/',
    retrievedAt: RETRIEVED_2,
    season: '2025',
  },
  'miller-mlb': {
    id: 'miller-mlb',
    label: 'MLB.com, Mason Miller adds a splinker',
    url: 'https://www.mlb.com/news/mason-miller-adds-splinker-to-pitching-arsenal',
    retrievedAt: RETRIEVED_2,
    season: '2024',
  },
  'joyce-mlb': {
    id: 'joyce-mlb',
    label: 'MLB.com, Ben Joyce on adding a splinker',
    url: 'https://www.mlb.com/news/ben-joyce-on-adding-a-splinker-to-his-arsenal',
    retrievedAt: RETRIEVED_2,
  },
  'dobbins-fangraphs': {
    id: 'dobbins-fangraphs',
    label: 'FanGraphs, Red Sox prospect Hunter Dobbins has added a splinker',
    url: 'https://blogs.fangraphs.com/red-sox-prospect-hunter-dobbins-has-added-a-splinker-and-upped-his-velo/',
    retrievedAt: RETRIEVED_2,
  },

  // --- The Craftsmen + 12-6 master: Adam Wainwright ---
  'wainwright-fangraphs-grip': {
    id: 'wainwright-fangraphs-grip',
    label: 'FanGraphs, Nick Kingham, Mark Prior, and Adam Wainwright on Crafting Their Curveballs (David Laurila)',
    url: 'https://blogs.fangraphs.com/nick-kingham-mark-prior-and-adam-wainwright-on-crafting-their-curveballs/',
    retrievedAt: RETRIEVED_2,
  },
  'wainwright-espn-curve': {
    id: 'wainwright-espn-curve',
    label: "ESPN, The secret to Adam Wainwright's success: a curveball like none other (Buster Olney)",
    url: 'https://www.espn.com/mlb/insider/story/_/id/34178817/the-secret-st-louis-cardinals-righty-adam-wainwright-success-curveball-other',
    retrievedAt: RETRIEVED_2,
  },
  'wainwright-fangraphs-curve': {
    id: 'wainwright-fangraphs-curve',
    label: "FanGraphs, Checking in on Adam Wainwright's Curveball",
    url: 'https://blogs.fangraphs.com/checking-in-on-adam-wainwrights-curveball/',
    retrievedAt: RETRIEVED_2,
  },
  'savant-wainwright': {
    id: 'savant-wainwright',
    label: 'Baseball Savant (Statcast), Adam Wainwright',
    url: 'https://baseballsavant.mlb.com/savant-player/adam-wainwright-425794',
    retrievedAt: RETRIEVED_2,
    season: '2023',
  },
  'wainwright-bref': {
    id: 'wainwright-bref',
    label: 'Baseball-Reference, Adam Wainwright',
    url: 'https://www.baseball-reference.com/players/w/wainwad01.shtml',
    retrievedAt: RETRIEVED_2,
  },
  'wainwright-nlcs-wiki': {
    id: 'wainwright-nlcs-wiki',
    label: 'Wikipedia, 2006 National League Championship Series',
    url: 'https://en.wikipedia.org/wiki/2006_National_League_Championship_Series',
    retrievedAt: RETRIEVED_2,
    season: '2006',
  },
  'wainwright-2000-stlredbirds': {
    id: 'wainwright-2000-stlredbirds',
    label: 'STLRedbirds.com, September 23, 2021: Adam Wainwright throws his 2,000th strikeout',
    url: 'https://www.stlredbirds.com/2023/03/18/september-23-2021-adam-wainwright-throws-his-2000th-strikeout/',
    retrievedAt: RETRIEVED_2,
    season: '2021',
  },

  // --- The Repertoire catalog + Lost Pitches of the Negro Leagues wing (2026-06-05) ---
  "mlb-glossary-four-seam": {
    id: "mlb-glossary-four-seam",
    label: "MLB.com Glossary — Four-Seam Fastball (FF)",
    url: "https://www.mlb.com/glossary/pitch-types/four-seam-fastball",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-glossary-two-seam": {
    id: "mlb-glossary-two-seam",
    label: "MLB.com Glossary — Two-Seam Fastball",
    url: "https://www.mlb.com/glossary/pitch-types/two-seam-fastball",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-glossary-cutter": {
    id: "mlb-glossary-cutter",
    label: "MLB.com Glossary — Cutter (FC)",
    url: "https://www.mlb.com/glossary/pitch-types/cutter",
    retrievedAt: RETRIEVED_3,
  },
  "driveline-ssw-sinkers": {
    id: "driveline-ssw-sinkers",
    label: "Driveline Baseball — An Introduction to Seam-Shifted Wakes and Their Effect on Sinkers",
    url: "https://www.drivelinebaseball.com/2020/11/more-than-what-it-seams-an-introduction-to-seam-shifted-wakes-and-their-effect-on-sinkers/",
    retrievedAt: RETRIEVED_3,
  },
  "vivaelbirdos-one-seam": {
    id: "vivaelbirdos-one-seam",
    label: "Viva El Birdos — Adam Wainwright, One-seam Sinkers, and Seam-shifted Wake",
    url: "https://www.vivaelbirdos.com/2021/11/21/22793429/adam-wainwright-one-seam-sinkers-and-seam-shifted-wake",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-clase-cutter": {
    id: "mlb-clase-cutter",
    label: "MLB.com — Why Emmanuel Clase's cutter is one of the most unhittable pitches in MLB",
    url: "https://www.mlb.com/news/why-emmanuel-clase-cutter-is-one-of-most-unhittable-pitches-in-mlb",
    retrievedAt: RETRIEVED_3,
  },
  "tht-rising-fastball-physics": {
    id: "tht-rising-fastball-physics",
    label: "The Hardball Times (FanGraphs) — The Physics of a Rising Fastball",
    url: "https://tht.fangraphs.com/the-physics-of-a-rising-fastball/",
    retrievedAt: RETRIEVED_3,
  },
  "fangraphs-nathan-pitching-physics": {
    id: "fangraphs-nathan-pitching-physics",
    label: "FanGraphs — Q&A: Alan Nathan on the Physics of Pitching",
    url: "https://blogs.fangraphs.com/qa-alan-nathan-on-the-physics-of-pitching/",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-changeup": {
    id: "wiki-changeup",
    label: "Changeup — Wikipedia (standard/straight and three-finger changeup, grip and timing separation)",
    url: "https://en.wikipedia.org/wiki/Changeup",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-circle-changeup": {
    id: "wiki-circle-changeup",
    label: "Circle changeup — Wikipedia (OK-circle grip, pronation/arm-side run, Pedro Martinez)",
    url: "https://en.wikipedia.org/wiki/Circle_changeup",
    retrievedAt: RETRIEVED_3,
  },
  "pedro-circle-change-search": {
    id: "pedro-circle-change-search",
    label: "Boston Globe 'Magic on the mound' — Pedro Martinez circle changeup as a signature pitch",
    url: "https://apps.bostonglobe.com/graphics/2015/07/pedro/",
    retrievedAt: RETRIEVED_3,
  },
  "efastball-palmball": {
    id: "efastball-palmball",
    label: "eFastball — Palm Ball Change Up Grip (deep-palm grip, hand-pressure deadening, Trevor Hoffman)",
    url: "https://www.efastball.com/baseball/pitching/grips/palm-ball-grip/",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-palmball": {
    id: "wiki-palmball",
    label: "Palmball — Wikipedia (ball cradled in palm, Trevor Hoffman as notable thrower)",
    url: "https://en.wikipedia.org/wiki/Palmball",
    retrievedAt: RETRIEVED_3,
  },
  "palmball-football-change-naming": {
    id: "palmball-football-change-naming",
    label: "Wikipedia Palmball (used as the reachable anchor for the palmball pitch; the 'football change' informal alias is recorded as unverified community naming since no reachable authoritative source states it)",
    url: "https://en.wikipedia.org/wiki/Palmball",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-vulcan-changeup": {
    id: "wiki-vulcan-changeup",
    label: "Vulcan changeup — Wikipedia (V-shaped middle/ring-finger grip, pronation, split-finger behavior, Joe Nelson)",
    url: "https://en.wikipedia.org/wiki/Vulcan_changeup",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-fosh": {
    id: "wiki-fosh",
    label: "Fosh (baseball) — Wikipedia (cross between splitter and straight change, grip, Boddicker/Nipper origin)",
    url: "https://en.wikipedia.org/wiki/Fosh_(baseball)",
    retrievedAt: RETRIEVED_3,
  },
  "fangraphs-kick-change": {
    id: "fangraphs-kick-change",
    label: "FanGraphs — 'Landen Roupp Spins a Curveball, Hayden Birdsong Throws a Kick-Change' (spiked middle finger kicking the axis, flat vertical shape, Giants, Tread Athletics)",
    url: "https://blogs.fangraphs.com/landen-roupp-spins-a-curveball-hayden-birdsong-throws-a-kick-change/",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-forkball": {
    id: "wiki-forkball",
    label: "Forkball — Wikipedia (deep wide grip, wrist snap, tumble, near-extinct, Senga ghost fork, splitter ancestor)",
    url: "https://en.wikipedia.org/wiki/Forkball",
    retrievedAt: RETRIEVED_3,
  },
  "fangraphs-sasaki": {
    id: "fangraphs-sasaki",
    label: "FanGraphs — 'Roki Sasaki Is Putting It All Together' (NPB-developed forkball, low-spin, knuckleball-like movement)",
    url: "https://blogs.fangraphs.com/roki-sasaki-is-putting-it-all-together/",
    retrievedAt: RETRIEVED_3,
  },
  "gorout-pitch-grips": {
    id: "gorout-pitch-grips",
    label: "GoRout — Baseball Pitch Grips guide (three-finger grip changeup and circle changeup as named changeup grips)",
    url: "https://gorout.com/baseball-pitch-grips/",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-glossary-slider": {
    id: "mlb-glossary-slider",
    label: "Slider (SL) — MLB.com Glossary, Pitch Types",
    url: "https://www.mlb.com/glossary/pitch-types/slider",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-ohtani-sweeper": {
    id: "mlb-ohtani-sweeper",
    label: "Shohei Ohtani has baseball's best sweeper — MLB.com",
    url: "https://www.mlb.com/news/shohei-ohtani-has-best-sweeper-in-mlb",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-glossary-slurve": {
    id: "mlb-glossary-slurve",
    label: "Slurve (SV) — MLB.com Glossary, Pitch Types",
    url: "https://www.mlb.com/glossary/pitch-types/slurve",
    retrievedAt: RETRIEVED_3,
  },
  "baseballscouter-cutter-slider": {
    id: "baseballscouter-cutter-slider",
    label: "The 'Cutter' vs. 'Slider': Spotting the Difference (incl. the slutter / cut-slider) — Baseball Scouter",
    url: "https://baseballscouter.com/cutter-vs-slider-pitch-comparison/",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-glossary-curveball": {
    id: "mlb-glossary-curveball",
    label: "Curveball (CU) — MLB.com Glossary, Pitch Types",
    url: "https://www.mlb.com/glossary/pitch-types/curveball",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-twelve-six-curveball": {
    id: "wiki-twelve-six-curveball",
    label: "12–6 curveball — Wikipedia",
    url: "https://en.wikipedia.org/wiki/12%E2%80%936_curveball",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-glossary-knuckle-curve": {
    id: "mlb-glossary-knuckle-curve",
    label: "Knuckle-curve (KC) — MLB.com Glossary, Pitch Types",
    url: "https://www.mlb.com/glossary/pitch-types/knuckle-curve",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-greinke-eephus-curve": {
    id: "mlb-greinke-eephus-curve",
    label: "Zack Greinke's eephus curve is baffling hitters — MLB.com",
    url: "https://www.mlb.com/news/zack-greinke-s-eephus-curve-is-baffling-hitters",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-screwball": {
    id: "wiki-screwball",
    label: "Screwball — Wikipedia",
    url: "https://en.wikipedia.org/wiki/Screwball",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-hubbell-screwball": {
    id: "sabr-hubbell-screwball",
    label: "Hubbell's Elbow: Don't Blame the Screwball — Society for American Baseball Research",
    url: "https://sabr.org/journal/article/hubbells-elbow-dont-blame-the-screwball/",
    retrievedAt: RETRIEVED_3,
  },
  "knuckleball-grokipedia": {
    id: "knuckleball-grokipedia",
    label: "Knuckleball — Grokipedia (grip, near-zero spin, chaotic flutter)",
    url: "https://grokipedia.com/page/Knuckleball!",
    retrievedAt: RETRIEVED_3,
  },
  "mlb-dickey-alumni": {
    id: "mlb-dickey-alumni",
    label: "MLB.com — R.A. Dickey to pitch in Mets' 2025 Alumni Classic (knuckleball career context)",
    url: "https://www.mlb.com/news/r-a-dickey-to-pitch-in-mets-2025-alumni-classic",
    retrievedAt: RETRIEVED_3,
  },
  "retrosimba-sewell": {
    id: "retrosimba-sewell",
    label: "RetroSimba — Over the rainbow: How Rip Sewell found his pot of gold (1941 hunting accident, eephus origin, 1946 ASG homer)",
    url: "https://retrosimba.com/2024/01/08/over-the-rainbow-how-rip-sewell-found-his-pot-of-gold/",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-eephus": {
    id: "wiki-eephus",
    label: "Eephus pitch — Wikipedia (high arc, Williams 1946 homer)",
    url: "https://en.wikipedia.org/wiki/Eephus_pitch",
    retrievedAt: RETRIEVED_3,
  },
  "tht-shuuto": {
    id: "tht-shuuto",
    label: "The shuuto — The Hardball Times / FanGraphs (arm-side run, 'just a two-seamer,' opposite of a cutter)",
    url: "https://tht.fangraphs.com/tht-live/the-shuuto/",
    retrievedAt: RETRIEVED_3,
  },
  "shuuto-grokipedia": {
    id: "shuuto-grokipedia",
    label: "Shuuto — Grokipedia (NPB pitch, loose arm-side-run label, two-seam classification)",
    url: "https://grokipedia.com/page/Shuuto",
    retrievedAt: RETRIEVED_3,
  },
  "gyroball-grokipedia": {
    id: "gyroball-grokipedia",
    label: "Gyroball — Grokipedia (Himeno/Tezuka simulation origin, bullet spin, Matsuzaka myth, Sasaki gyro slider)",
    url: "https://grokipedia.com/page/Gyroball",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-spitball": {
    id: "wiki-spitball",
    label: "Spitball — Wikipedia (saliva/Vaseline mechanism, 17 grandfathered pitchers, Grimes 1934, Perry)",
    url: "https://en.wikipedia.org/wiki/Spitball",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-deadball-spitball": {
    id: "sabr-deadball-spitball",
    label: "SABR — The Spitball and the End of the Deadball Era (Feb 1920 Joint Rules Committee ban; Chapman post-ban; named freak pitches incl. mud/shine/emery)",
    url: "https://sabr.org/journal/article/the-spitball-and-the-end-of-the-deadball-era/",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-niekro-1987": {
    id: "sabr-niekro-1987",
    label: "SABR Games Project — August 3, 1987: Twins' Joe Niekro ejected for allegedly scuffing ball (emery board, sandpaper, gouged balls)",
    url: "https://sabr.org/gamesproj/game/august-3-1987-twins-joe-niekro-ejected-for-allegedly-scuffing-ball/",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-cicotte": {
    id: "sabr-cicotte",
    label: "SABR BioProject — Eddie Cicotte (shine ball, talcum-loaded trouser pocket, legal 1917 until Feb 1920)",
    url: "https://sabr.org/bioproj/person/eddie-cicotte/",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-gaylord-perry": {
    id: "wiki-gaylord-perry",
    label: "Gaylord Perry — Wikipedia (Vaseline/grease ball concealment, late-career ejection)",
    url: "https://en.wikipedia.org/wiki/Gaylord_Perry",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-rubbing-mud": {
    id: "wiki-rubbing-mud",
    label: "Baseball rubbing mud — Wikipedia (Lena Blackburne mud mandatory/legal under Rule 4.01(c) to dull gloss)",
    url: "https://en.wikipedia.org/wiki/Baseball_rubbing_mud",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-satchel-paige": {
    id: "wiki-satchel-paige",
    label: "Satchel Paige — Wikipedia (hesitation pitch, 1948 Platt at-bat, Harridge balk ruling)",
    url: "https://en.wikipedia.org/wiki/Satchel_Paige",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-hilton-smith": {
    id: "sabr-hilton-smith",
    label: "Hilton Smith — SABR Biography Project (curveball; O'Neil on Musial/Mize; Paige's shadow; ~161 league wins)",
    url: "https://sabr.org/bioproj/person/a4c98932",
    retrievedAt: RETRIEVED_3,
  },
  "bbhof-hilton-smith": {
    id: "bbhof-hilton-smith",
    label: "Hilton Smith — National Baseball Hall of Fame (Monte Irvin curveball quote; 'forgotten star'; relieved Paige)",
    url: "https://baseballhall.org/hall-of-famers/smith-hilton",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-rube-foster": {
    id: "sabr-rube-foster",
    label: "Andrew 'Rube' Foster — SABR Biography Project (Malarcher's fadeaway description; NNL founding 1920; Father of Black Baseball)",
    url: "https://sabr.org/bioproj/person/andrew-rube-foster/",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-bullet-rogan": {
    id: "wiki-bullet-rogan",
    label: "Bullet Rogan — Wikipedia (no-windup delivery, overhand/sidearm, curve/spitball/palmball/forkball/fastball arsenal)",
    url: "https://en.wikipedia.org/wiki/Bullet_Rogan",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-bullet-rogan": {
    id: "sabr-bullet-rogan",
    label: "Bullet Rogan — SABR Biography Project (Frank Duncan quote on the arsenal and palm-thrown curve)",
    url: "https://sabr.org/bioproj/person/bullet-rogan/",
    retrievedAt: RETRIEVED_3,
  },
  "seamheads-rogan": {
    id: "seamheads-rogan",
    label: "Bullet Rogan — Seamheads Negro Leagues Database player page (reconstructed career pitching line)",
    url: "https://www.seamheads.com/NegroLgs/player.php?playerID=rogan01bul",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-smokey-bandit": {
    id: "sabr-smokey-bandit",
    label: "Smokey and the Bandit: The Greatest Pitching Duel in Blackball History — SABR (Aug 2, 1930; 27 K, 1-0, 12 innings, age 44)",
    url: "https://sabr.org/journal/article/smokey-and-the-bandit-the-greatest-pitching-duel-in-blackball-history/",
    retrievedAt: RETRIEVED_3,
  },
  "baseball-history-daily-brewer": {
    id: "baseball-history-daily-brewer",
    label: "Chet Brewer — Baseball History Daily (Cum Posey 1936 Pittsburgh Courier account of the broken emery-ball pact)",
    url: "https://baseballhistorydaily.com/tag/chet-brewer/",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-chet-brewer": {
    id: "sabr-chet-brewer",
    label: "Chet Brewer — SABR Biography Project (emery ball, overhand drop, finesse repertoire)",
    url: "https://sabr.org/bioproj/person/chet-brewer",
    retrievedAt: RETRIEVED_3,
  },
  "wiki-chet-brewer": {
    id: "wiki-chet-brewer",
    label: "Chet Brewer — Wikipedia (emery ball learned from Osborne/Radcliffe; Radcliffe's emery-cloth-in-gum quote; 1920 ban context)",
    url: "https://en.wikipedia.org/wiki/Chet_Brewer",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-phil-cockrell": {
    id: "sabr-phil-cockrell",
    label: "Phil Cockrell — SABR Biography Project ('moist ball' spitball; ~6 no-hitters; 1924 Bolden-to-Foster umpire standoff; NNL/ECL never adopted the ban)",
    url: "https://sabr.org/bioproj/person/phil-cockrell/",
    retrievedAt: RETRIEVED_3,
  },
  "pbs-negro-leagues-2020": {
    id: "pbs-negro-leagues-2020",
    label: "MLB reclassifies Negro Leagues as major league — PBS NewsHour (Dec 16, 2020; ~3,400 players; '1969 omission clearly an error')",
    url: "https://www.pbs.org/newshour/arts/mlb-reclassifies-negro-leagues-as-major-league",
    retrievedAt: RETRIEVED_3,
  },
  "cbs-negro-leagues-2024": {
    id: "cbs-negro-leagues-2024",
    label: "Statistics from Negro Leagues officially integrated into MLB record books — CBS News (May 2024; >2,300 players; Gibson .372 AVG, .718 SLG, 1.177 OPS)",
    url: "https://www.cbsnews.com/news/negro-leagues-statistics-integrated-mlb-record-books-josh-gibson/",
    retrievedAt: RETRIEVED_3,
  },
  "seamheads-db": {
    id: "seamheads-db",
    label: "Seamheads Negro Leagues Database — homepage (box-score reconstruction method; coverage 1886-1948; 1920s most complete decade)",
    url: "https://www.seamheads.com/NegroLgs/",
    retrievedAt: RETRIEVED_3,
  },
  "nl-redding-sabr": {
    id: "nl-redding-sabr",
    label: "Dick Redding — SABR BioProject",
    url: "https://sabr.org/bioproj/person/dick-redding/",
    retrievedAt: RETRIEVED_3,
  },
  "nl-day-sabr": {
    id: "nl-day-sabr",
    label: "Leon Day — SABR BioProject",
    url: "https://sabr.org/bioproj/person/leon-day/",
    retrievedAt: RETRIEVED_3,
  },
  "nl-brown-sabr": {
    id: "nl-brown-sabr",
    label: "Dave Brown — SABR BioProject",
    url: "https://sabr.org/bioproj/person/dave-brown-2/",
    retrievedAt: RETRIEVED_3,
  },
  "nl-bell-sabr": {
    id: "nl-bell-sabr",
    label: "William Bell — SABR BioProject",
    url: "https://sabr.org/bioproj/person/william-bell-2/",
    retrievedAt: RETRIEVED_3,
  },
  "nl-bell-emuseum": {
    id: "nl-bell-emuseum",
    label: "William Bell, Sr. — Negro Leagues Baseball eMuseum",
    url: "https://nlbemuseum.com/history/players/bellwsr.html",
    retrievedAt: RETRIEVED_3,
  },
  "nl-paige-sabr-journal": {
    id: "nl-paige-sabr-journal",
    label: "Leroy Robert 'Satchel' Paige — SABR journal article",
    url: "https://sabr.org/journal/article/leroy-robert-satchel-paige/",
    retrievedAt: RETRIEVED_3,
  },
  "sabr-paige-bioproj": {
    id: "sabr-paige-bioproj",
    label: "SABR Baseball Biography Project — Satchel Paige (the documented life account; names no showman pitches)",
    url: "https://sabr.org/bioproj/person/satchel-paige/",
    retrievedAt: RETRIEVED_3,
  },
  "loc-whipsy-dipsy": {
    id: "loc-whipsy-dipsy",
    label: "Library of Congress, Baseball Americana — \"Whipsy-Dipsy-Do\" Ball (quotes Paige's own pitch-naming boast)",
    url: "https://www.loc.gov/exhibitions/baseball-americana/about-this-exhibition/whos-playing/a-game-divided/whipsy-dipsy-do-ball/",
    retrievedAt: RETRIEVED_3,
  },
  "history-paige-10-things": {
    id: "history-paige-10-things",
    label: "History.com — 10 Things You May Not Know About Satchel Paige (showman labels and the hesitation pitch)",
    url: "https://www.history.com/articles/10-things-you-may-not-know-about-satchel-paige",
    retrievedAt: RETRIEVED_3,
  },
  "trivia-mafia-paige": {
    id: "trivia-mafia-paige",
    label: "Trivia Mafia — Satchel Paige, The Man of 19 Pitches (quotes Negro Leagues Baseball Museum's Bob Kendrick; the \"19 pitches\" oral-tradition source)",
    url: "https://www.triviamafia.com/fridayknowitall/leroy-satchel-paige",
    retrievedAt: RETRIEVED_3,
  },

  // --- The sweeper specimen (2026-06-06) ---
  'mlb-glossary-sweeper': {
    id: 'mlb-glossary-sweeper',
    label: 'MLB.com Statcast Glossary, Sweeper (ST)',
    url: 'https://www.mlb.com/glossary/pitch-types/sweeper',
    retrievedAt: RETRIEVED_4,
  },
  'mlb-ohtani-2025-statcast': {
    id: 'mlb-ohtani-2025-statcast',
    label: "MLB.com, Shohei Ohtani's 2025 pitching debut — a Statcast breakdown",
    url: 'https://www.mlb.com/news/shohei-ohtani-2025-pitching-debut-statcast-breakdown',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'savant-ohtani': {
    id: 'savant-ohtani',
    label: 'Baseball Savant (Statcast), Shohei Ohtani',
    url: 'https://baseballsavant.mlb.com/savant-player/shohei-ohtani-660271',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'savant-peralta': {
    id: 'savant-peralta',
    label: 'Baseball Savant (Statcast), Freddy Peralta',
    url: 'https://baseballsavant.mlb.com/savant-player/freddy-peralta-642547',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'savant-darvish': {
    id: 'savant-darvish',
    label: 'Baseball Savant (Statcast), Yu Darvish',
    url: 'https://baseballsavant.mlb.com/savant-player/yu-darvish-506433',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'fangraphs-ssw-mainstream': {
    id: 'fangraphs-ssw-mainstream',
    label: 'FanGraphs, The Seam-Shifted Revolution Is Headed for the Mainstream',
    url: 'https://blogs.fangraphs.com/the-seam-shifted-revolution-is-headed-for-the-mainstream/',
    retrievedAt: RETRIEVED_4,
  },
  'driveline-ssw-quality': {
    id: 'driveline-ssw-quality',
    label: 'Driveline Baseball, The Impact of Seam-Shifted Wakes on Pitch Quality',
    url: 'https://www.drivelinebaseball.com/2021/03/the-impact-of-seam-shifted-wakes-on-pitch-quality/',
    retrievedAt: RETRIEVED_4,
    season: '2021',
  },

  // --- The knuckleball specimen (2026-06-06) ---
  'mlb-glossary-knuckleball': {
    id: 'mlb-glossary-knuckleball',
    label: 'MLB.com Statcast Glossary, Knuckleball (KN)',
    url: 'https://www.mlb.com/glossary/pitch-types/knuckleball',
    retrievedAt: RETRIEVED_4,
  },
  'wiki-knuckleball': {
    id: 'wiki-knuckleball',
    label: 'Wikipedia, Knuckleball',
    url: 'https://en.wikipedia.org/wiki/Knuckleball',
    retrievedAt: RETRIEVED_4,
  },
  'fangraphs-dickey-knuckle': {
    id: 'fangraphs-dickey-knuckle',
    label: "FanGraphs, Tracking R.A. Dickey's Knuckleball",
    url: 'https://blogs.fangraphs.com/tracking-r-a-dickeys-knuckleball/',
    retrievedAt: RETRIEVED_4,
  },
  'fangraphs-waldron-knuckle': {
    id: 'fangraphs-waldron-knuckle',
    label: 'FanGraphs, Matt Waldron and His Knuckleball Are Sticking Around',
    url: 'https://blogs.fangraphs.com/matt-waldron-and-his-knuckleball-are-sticking-around/',
    retrievedAt: RETRIEVED_4,
    season: '2024',
  },
  'illinois-dickey-knuckle': {
    id: 'illinois-dickey-knuckle',
    label: 'University of Illinois Physics of Baseball (Alan Nathan), R.A. Dickey knuckleball analysis',
    url: 'https://baseball.physics.illinois.edu/DickeyPitch103a.html',
    retrievedAt: RETRIEVED_4,
    season: '2012',
  },
  'si-waldron-knuckle': {
    id: 'si-waldron-knuckle',
    label: "Sports Illustrated, Matt Waldron's record-low-spin knuckleball",
    url: 'https://www.si.com/mlb/2024/04/08/matt-waldron-knuckleball-padres-giants',
    retrievedAt: RETRIEVED_4,
    season: '2024',
  },

  // --- The cutter specimen (2026-06-06) ---
  'wiki-cut-fastball': {
    id: 'wiki-cut-fastball',
    label: 'Wikipedia, Cut fastball',
    url: 'https://en.wikipedia.org/wiki/Cut_fastball',
    retrievedAt: RETRIEVED_4,
  },
  'savant-clase': {
    id: 'savant-clase',
    label: 'Baseball Savant (Statcast), Emmanuel Clase',
    url: 'https://baseballsavant.mlb.com/savant-player/emmanuel-clase-661403',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'savant-burnes': {
    id: 'savant-burnes',
    label: 'Baseball Savant (Statcast), Corbin Burnes',
    url: 'https://baseballsavant.mlb.com/savant-player/corbin-burnes-669203',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'br-rivera-cutter': {
    id: 'br-rivera-cutter',
    label: "Bleacher Report, Visual Breakdown of the Rise & Dominance of Mariano Rivera's Cutter",
    url: 'https://bleacherreport.com/articles/1737396-visual-breakdown-of-the-rise-dominance-of-mariano-riveras-cutter',
    retrievedAt: RETRIEVED_4,
    season: '2007-2008',
  },

  // --- The forkball specimen (2026-06-06) ---
  'mlb-glossary-forkball': {
    id: 'mlb-glossary-forkball',
    label: 'MLB.com Statcast Glossary, Forkball (FO)',
    url: 'https://www.mlb.com/glossary/pitch-types/forkball',
    retrievedAt: RETRIEVED_4,
  },
  'bp-forkball': {
    id: 'bp-forkball',
    label: 'Baseball Prospectus, Spinning Yarn: The Forkball',
    url: 'https://www.baseballprospectus.com/news/article/12558/spinning-yarn-the-forkball/',
    retrievedAt: RETRIEVED_4,
  },
  'mlb-sasaki-fork': {
    id: 'mlb-sasaki-fork',
    label: "MLB.com, Roki Sasaki's forkball and splitter explained",
    url: 'https://www.mlb.com/news/roki-sasaki-s-forkball-and-splitter-explained',
    retrievedAt: RETRIEVED_4,
    season: '2026',
  },
  'fangraphs-senga-ghostfork': {
    id: 'fangraphs-senga-ghostfork',
    label: "FanGraphs, A (Ghost) Fork in the Road: Senga's Premier Pitch",
    url: 'https://blogs.fangraphs.com/a-ghost-fork-in-the-road-what-can-we-expect-from-sengas-premier-pitch/',
    retrievedAt: RETRIEVED_4,
  },
  'fangraphs-senga-kodai': {
    id: 'fangraphs-senga-kodai',
    label: "FanGraphs, Cracking the Kodai to Senga's Success",
    url: 'https://blogs.fangraphs.com/cracking-the-kodai-to-sengas-success/',
    retrievedAt: RETRIEVED_4,
    season: '2025',
  },
  'bref-nomo': {
    id: 'bref-nomo',
    label: 'Baseball-Reference, Hideo Nomo',
    url: 'https://www.baseball-reference.com/players/n/nomohi01.shtml',
    retrievedAt: RETRIEVED_4,
  },
  'sabr-nomo': {
    id: 'sabr-nomo',
    label: 'Society for American Baseball Research, Hideo Nomo (BioProject)',
    url: 'https://sabr.org/bioproj/person/hideo-nomo/',
    retrievedAt: RETRIEVED_4,
  },

  // --- The eephus specimen (2026-06-06) ---
  'mlb-glossary-eephus': {
    id: 'mlb-glossary-eephus',
    label: 'MLB.com Statcast Glossary, Eephus (EP)',
    url: 'https://www.mlb.com/glossary/pitch-types/eephus',
    retrievedAt: RETRIEVED_4,
  },
  'tht-sewell-eephus': {
    id: 'tht-sewell-eephus',
    label: 'The Hardball Times, Rip Sewell, the Eephus, and the All-Star Game',
    url: 'https://tht.fangraphs.com/rip-sewell-the-eephus-and-the-all-star-game/',
    retrievedAt: RETRIEVED_4,
  },
  'ledoux-eephus': {
    id: 'ledoux-eephus',
    label: 'James LeDoux, A Statcast study of the eephus pitch',
    url: 'https://jamesrledoux.com/projects/eephus/',
    retrievedAt: RETRIEVED_4,
  },
  'mlb-greinke-54': {
    id: 'mlb-greinke-54',
    label: "MLB.com, Zack Greinke sits on the mound and throws a slow eephus",
    url: 'https://www.mlb.com/news/zack-greinke-sits-on-mound-throws-54-m%70h-pitch',
    retrievedAt: RETRIEVED_4,
    season: '2020',
  },

  // --- The Craftsmen roundout: Phil Niekro (2026-06-06) ---
  'niekro-wiki': {
    id: 'niekro-wiki',
    label: 'Wikipedia, Phil Niekro',
    url: 'https://en.wikipedia.org/wiki/Phil_Niekro',
    retrievedAt: RETRIEVED_4,
  },
  'niekro-fangraphs': {
    id: 'niekro-fangraphs',
    label: 'FanGraphs, Remembering Phil Niekro, King of the Knuckleballers',
    url: 'https://blogs.fangraphs.com/remembering-phil-niekro-king-of-the-knuckleballers-1939-2020/',
    retrievedAt: RETRIEVED_4,
  },
  'niekro-hof': {
    id: 'niekro-hof',
    label: 'National Baseball Hall of Fame, Phil Niekro',
    url: 'https://baseballhall.org/hall-of-famers/niekro-phil',
    retrievedAt: RETRIEVED_4,
  },
  'niekro-sabr': {
    id: 'niekro-sabr',
    label: 'Society for American Baseball Research, Phil Niekro (BioProject)',
    url: 'https://sabr.org/bioproj/person/phil-niekro/',
    retrievedAt: RETRIEVED_4,
  },

  // --- The Craftsmen roundout: Carl Hubbell ---
  'hubbell-sabr': {
    id: 'hubbell-sabr',
    label: 'Society for American Baseball Research, Carl Hubbell (BioProject)',
    url: 'https://sabr.org/bioproj/person/carl-hubbell/',
    retrievedAt: RETRIEVED_4,
  },
  'hubbell-hof': {
    id: 'hubbell-hof',
    label: 'National Baseball Hall of Fame, Carl Hubbell',
    url: 'https://baseballhall.org/hall-of-famers/hubbell-carl',
    retrievedAt: RETRIEVED_4,
  },
  'hubbell-asg-sabr': {
    id: 'hubbell-asg-sabr',
    label: 'SABR Games Project, July 10, 1934: Carl Hubbell strikes out five Hall of Famers in a row',
    url: 'https://sabr.org/gamesproj/game/july-10-1934-carl-hubbell-strikes-out-five-hall-of-famers-in-a-row-at-all-star-game/',
    retrievedAt: RETRIEVED_4,
    season: '1934',
  },
  'hubbell-wiki': {
    id: 'hubbell-wiki',
    label: 'Wikipedia, Carl Hubbell',
    url: 'https://en.wikipedia.org/wiki/Carl_Hubbell',
    retrievedAt: RETRIEVED_4,
  },
  'hubbell-almanac': {
    id: 'hubbell-almanac',
    label: 'Baseball Almanac, Carl Hubbell Quotes',
    url: 'https://www.baseball-almanac.com/quotes/carl_hubbell_quotes.shtml',
    retrievedAt: RETRIEVED_4,
  },
  'hubbell-retrosimba': {
    id: 'hubbell-retrosimba',
    label: 'RetroSimba, Carl Hubbell: giant among pitchers knew glory, tragedy',
    url: 'https://retrosimba.com/2018/11/24/carl-hubbell-giant-among-pitchers-knew-glory-tragedy/',
    retrievedAt: RETRIEVED_4,
  },

  // --- The Craftsmen roundout: Mariano Rivera ---
  'rivera-wiki': {
    id: 'rivera-wiki',
    label: 'Wikipedia, Mariano Rivera',
    url: 'https://en.wikipedia.org/wiki/Mariano_Rivera',
    retrievedAt: RETRIEVED_4,
  },
  'rivera-cbs-cutter': {
    id: 'rivera-cbs-cutter',
    label: "CBS Sports, Mariano Rivera: birth of the cutter was a gift from God",
    url: 'https://www.cbssports.com/mlb/news/mariano-rivera-birth-of-the-cutter-was-gift-from-god-part-4-of-5/',
    retrievedAt: RETRIEVED_4,
    season: '1997',
  },
  'rivera-hof': {
    id: 'rivera-hof',
    label: 'National Baseball Hall of Fame, Mariano Rivera',
    url: 'https://baseballhall.org/hall-of-famers/rivera-mariano',
    retrievedAt: RETRIEVED_4,
  },
  'rivera-bref': {
    id: 'rivera-bref',
    label: 'Baseball-Reference, Mariano Rivera',
    url: 'https://www.baseball-reference.com/players/r/riverma01.shtml',
    retrievedAt: RETRIEVED_4,
  },
  'rivera-bbwaa': {
    id: 'rivera-bbwaa',
    label: 'BBWAA, Rivera, Halladay, Martinez and Mussina elected to the Hall of Fame',
    url: 'https://bbwaa.com/19-hof/',
    retrievedAt: RETRIEVED_4,
    season: '2019',
  },
  'rivera-si': {
    id: 'rivera-si',
    label: 'Sports Illustrated, Mariano Rivera voted into the Hall of Fame unanimously',
    url: 'https://www.si.com/mlb/2019/01/22/mariano-rivera-voted-baseball-hall-fame-unanimous-total',
    retrievedAt: RETRIEVED_4,
    season: '2019',
  },

  // --- The Craftsmen roundout: Cole Hamels ---
  'hamels-espn-crasnick': {
    id: 'hamels-espn-crasnick',
    label: 'ESPN, Jerry Crasnick on Cole Hamels and his changeup',
    url: 'https://www.espn.com/mlb/columns/story?columnist=crasnick_jerry&id=2878204',
    retrievedAt: RETRIEVED_4,
    season: '2007',
  },
  'hamels-espn-2008': {
    id: 'hamels-espn-2008',
    label: 'ESPN, Phillies pitcher Hamels earns World Series MVP',
    url: 'https://www.espn.com/mlb/playoffs2008/news/story?id=3671956',
    retrievedAt: RETRIEVED_4,
    season: '2008',
  },
  'hamels-statmuse': {
    id: 'hamels-statmuse',
    label: 'StatMuse, Cole Hamels career stats',
    url: 'https://www.statmuse.com/mlb/player/cole-hamels-24707/career-stats',
    retrievedAt: RETRIEVED_4,
  },
  'hamels-fangraphs-jaws': {
    id: 'hamels-fangraphs-jaws',
    label: 'FanGraphs, JAWS and the 2026 Hall of Fame Ballot: Cole Hamels (Jay Jaffe)',
    url: 'https://blogs.fangraphs.com/jaws-and-the-2026-hall-of-fame-ballot-cole-hamels/',
    retrievedAt: RETRIEVED_4,
  },
  'hamels-wiki': {
    id: 'hamels-wiki',
    label: 'Wikipedia, Cole Hamels',
    url: 'https://en.wikipedia.org/wiki/Cole_Hamels',
    retrievedAt: RETRIEVED_4,
  },
  'exp-wikipedia-shuuto': {
    id: 'exp-wikipedia-shuuto',
    label: "Wikipedia — Shuuto (razor shuuto / Masaji Hiramatsu)",
    url: 'https://en.wikipedia.org/wiki/Shuuto',
    retrievedAt: RETRIEVED_5,
  },
  'exp-br-bullpen-hiramatsu': {
    id: 'exp-br-bullpen-hiramatsu',
    label: "Baseball-Reference Bullpen — Masaji Hiramatsu (thrower biography; cited in brief, corroborated by search snippet, not independently re-fetched — page returns 403 to automated requests)",
    url: 'https://www.baseball-reference.com/bullpen/Masaji_Hiramatsu',
    retrievedAt: RETRIEVED_5,
  },
  'exp-baltimore-sun-reckless-richards': {
    id: 'exp-baltimore-sun-reckless-richards',
    label: "The Baltimore Sun — \"'Reckless' Richards cracks open O's coffers\"",
    url: 'https://www.baltimoresun.com/2003/10/29/reckless-richards-cracks-open-os-coffers/',
    retrievedAt: RETRIEVED_5,
  },
  'exp-sabr-paul-richards-bio': {
    id: 'exp-sabr-paul-richards-bio',
    label: "SABR BioProject — Paul Richards",
    url: 'https://sabr.org/bioproj/person/paul-richards/',
    retrievedAt: RETRIEVED_5,
  },
  'exp-mlb-airbender-explainer': {
    id: 'exp-mlb-airbender-explainer',
    label: "MLB.com — \"Devin Williams brings unique Airbender pitch to Yankees\"",
    url: 'https://www.mlb.com/news/devin-williams-airbender-pitch-explainer',
    retrievedAt: RETRIEVED_5,
  },
  'exp-fangraphs-unicorn-changeup': {
    id: 'exp-fangraphs-unicorn-changeup',
    label: "FanGraphs — \"Devin Williams and the Unicorn Changeup\"",
    url: 'https://blogs.fangraphs.com/devin-williams-and-the-unicorn-changeup/',
    retrievedAt: RETRIEVED_5,
  },
  'exp-azsnakepit-deathball': {
    id: 'exp-azsnakepit-deathball',
    label: "AZ Snake Pit (SB Nation): \"The Deathball: An Important Pitch to the Dbacks in 2025 That You've Likely Never Heard Of\" (Jeff Irving, Jan 2025)",
    url: 'https://www.azsnakepit.com/2025/1/6/24336678/the-deathball-an-important-pitch-to-the-dbacks-in-2025-that-youve-likely-never-heard-of',
    retrievedAt: RETRIEVED_5,
  },
  'exp-mlb-dead-fish-valdez': {
    id: 'exp-mlb-dead-fish-valdez',
    label: "MLB.com — César Valdez's 'Dead Fish' changeup analyzed",
    url: 'https://www.mlb.com/news/cesar-valdez-s-dead-fish-changeup-analyzed',
    retrievedAt: RETRIEVED_5,
  },
  'exp-baltsun-dead-fish-valdez': {
    id: 'exp-baltsun-dead-fish-valdez',
    label: "Baltimore Sun — How César Valdez's 'Dead Fish' changeup became a weapon at the back end of the Orioles' bullpen",
    url: 'https://www.baltimoresun.com/2020/09/19/how-csar-valdezs-dead-fish-changeup-became-a-weapon-at-the-backend-of-the-orioles-bullpen/',
    retrievedAt: RETRIEVED_5,
  },

  // --- Softball: Cat Osterman (the anchor craftsman) ---
  'cat-wikipedia': {
    id: 'cat-wikipedia',
    label: 'Wikipedia — Cat Osterman (Texas records, Olympic medals, NPF, Athletes Unlimited)',
    url: 'https://en.wikipedia.org/wiki/Cat_Osterman',
    retrievedAt: RETRIEVED_6,
  },
  'cat-official-bio': {
    id: 'cat-official-bio',
    label: 'CatOsterman.com — official biography',
    url: 'https://www.catosterman.com/cat',
    retrievedAt: RETRIEVED_6,
  },
  'cat-si-2021': {
    id: 'cat-si-2021',
    label: "Sports Illustrated — Cat Osterman brings more than leadership and a drop ball to Team USA (Gwen Svekis quotes)",
    url: 'https://www.si.com/olympics/2021/07/20/cat-osterman-still-elite-pitcher-team-usa-softball',
    retrievedAt: RETRIEVED_6,
  },
  'cat-d1softball-spinmaster': {
    id: 'cat-d1softball-spinmaster',
    label: 'D1Softball — Pitching Analysis: Cat Osterman, The Spin Master',
    url: 'https://d1softball.com/pitching-analysis-cat-osterman-the-spin-master/',
    retrievedAt: RETRIEVED_6,
  },

  // --- Softball: fastpitch windmill mechanics + arm-health ---
  'sb-friesen-2025-biomech': {
    id: 'sb-friesen-2025-biomech',
    label: 'Friesen et al., Biomechanics of Fastpitch Softball Pitching: A Practitioner’s Guide, Sports Health (2025) — PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11969493/',
    retrievedAt: RETRIEVED_6,
  },
  'sb-barrentine-1998-jospt': {
    id: 'sb-barrentine-1998-jospt',
    label: 'Barrentine et al., Biomechanics of Windmill Softball Pitching With Implications About Injury Mechanisms at the Shoulder and Elbow, JOSPT (1998)',
    url: 'https://www.jospt.org/doi/10.2519/jospt.1998.28.6.405',
    retrievedAt: RETRIEVED_6,
  },
  'sb-injury-epi-2024': {
    id: 'sb-injury-epi-2024',
    label: 'Fastpitch Softball Injuries: Epidemiology, Biomechanics, and Injury Prevention (2024) — PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10917712/',
    retrievedAt: RETRIEVED_6,
  },
  'sb-shoulder-stress-pmc': {
    id: 'sb-shoulder-stress-pmc',
    label: 'Biomechanics Related to Increased Softball Pitcher Shoulder Stress: Implications for Injury Prevention — PMC',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8739590/',
    retrievedAt: RETRIEVED_6,
  },
  'sb-ler-lowerbody': {
    id: 'sb-ler-lowerbody',
    label: 'Lower Extremity Review — Powering the Windmill: Lower-body mechanics of softball pitching',
    url: 'https://lermagazine.com/cover_story/powering-the-windmill-lower-body-mechanics-of-softball-pitching',
    retrievedAt: RETRIEVED_6,
  },
  'sb-wiki-fastpitch': {
    id: 'sb-wiki-fastpitch',
    label: 'Wikipedia — Fastpitch softball (windmill delivery, pitch arsenal, distances)',
    url: 'https://en.wikipedia.org/wiki/Fastpitch_softball',
    retrievedAt: RETRIEVED_6,
  },

  // --- Softball: the riseball physics question ---
  'sb-riseball-wiki': {
    id: 'sb-riseball-wiki',
    label: 'Wikipedia — Riseball (backspin, Magnus, the debated net rise)',
    url: 'https://en.wikipedia.org/wiki/Riseball',
    retrievedAt: RETRIEVED_6,
  },
  'sb-armstrong-riseball': {
    id: 'sb-armstrong-riseball',
    label: 'Armstrong Atlantic State University, Applied Physics (Mullenax) — Rise Ball Physics (regulation vs. Lite-Flite trajectory)',
    url: 'http://www.chemistry.armstrong.edu/baird/physics/htdocs/faculty/mullenax/research/riseball.html',
    retrievedAt: RETRIEVED_6,
  },
  'sb-studlife-magnus': {
    id: 'sb-studlife-magnus',
    label: 'Student Life — Thanks Magnus: physics defines softball’s signature pitch',
    url: 'https://www.studlife.com/sports/softball-sports/2016/04/07/thanks-magnus-physics-defines-softballs-signature-pitch',
    retrievedAt: RETRIEVED_6,
  },

  // --- Softball: the drop, the breakers, and reaction time ---
  'sb-sportstrace-peeldrop': {
    id: 'sb-sportstrace-peeldrop',
    label: 'SportsTrace — The Peel Drop in Softball (peel vs. turnover drop, both topspin; fingers vs. wrist pronation)',
    url: 'https://www.sportstrace.com/the-peel-drop-in-softball-history-uses-and-how-to-throw-it/',
    retrievedAt: RETRIEVED_6,
  },
  'sb-snexplores-curve': {
    id: 'sb-snexplores-curve',
    label: 'Science News Explores — How to make a pitched ball curve to your will (sidespin Magnus break is real; the standalone gyro is essentially a myth)',
    url: 'https://www.snexplores.org/article/pitch-physics-curve-baseball-softball-cricket',
    retrievedAt: RETRIEVED_6,
  },
  'sb-gorout-speed': {
    id: 'sb-gorout-speed',
    label: 'GoRout — Softball Pitch vs Baseball Pitch (43-ft distance makes a high-60s/low-70s fastball play like a mid-90s MLB pitch by reaction time)',
    url: 'https://gorout.com/softball-pitch-vs-baseball-pitch/',
    retrievedAt: RETRIEVED_6,
  },

  // --- Softball: rules, distance, governing bodies ---
  'sb-ncaa-leaping-2023': {
    id: 'sb-ncaa-leaping-2023',
    label: 'NCAA.com — Softball pitchers can disengage from the playing surface while delivering a pitch (leaping legal 2023-24; crow hop still illegal)',
    url: 'https://www.ncaa.com/news/softball/article/2023-08-11/softball-pitchers-can-disengage-playing-surface-while-delivering-pitch-next-season',
    retrievedAt: RETRIEVED_6,
  },
  'sb-usssa-slowpitch-rules': {
    id: 'sb-usssa-slowpitch-rules',
    label: 'USSSA — Slowpitch Rules & Legal Info (arc: min 3 ft after release, max 10 ft above ground)',
    url: 'https://www.usssa.com/slowpitch/slowpitch-rules-and-legal-info',
    retrievedAt: RETRIEVED_6,
  },
  'sb-usssa-slowpitch-rulebook-2025': {
    id: 'sb-usssa-slowpitch-rulebook-2025',
    label: 'USSSA — 2025 Slow Pitch Rule Book & By-Laws (PDF)',
    url: 'https://cms.usssa.net/wp-content/uploads/sites/2/2025/01/usssa-slowpitch-2025-rulebook-final.pdf',
    retrievedAt: RETRIEVED_6,
  },

  // --- Softball craftsmen: the legends + the new wave ---
  'sb-abbott-wikipedia': {
    id: 'sb-abbott-wikipedia',
    label: 'Wikipedia — Monica Abbott (Tennessee NCAA records, Guinness pitch, Olympic silver 2008 & 2020)',
    url: 'https://en.wikipedia.org/wiki/Monica_Abbott',
    retrievedAt: RETRIEVED_6,
  },
  'sb-abbott-mlb-million': {
    id: 'sb-abbott-mlb-million',
    label: 'MLB.com Cut4 — Monica Abbott becomes first million-dollar NPF player',
    url: 'https://www.mlb.com/cut4/monica-abbott-becomes-first-million-dollar-npf-player-c176409692',
    retrievedAt: RETRIEVED_6,
  },
  'sb-finch-wikipedia': {
    id: 'sb-finch-wikipedia',
    label: 'Wikipedia — Jennie Finch (Arizona 119-16, NCAA-record 60 straight wins, 2004 gold / 2008 silver)',
    url: 'https://en.wikipedia.org/wiki/Jennie_Finch',
    retrievedAt: RETRIEVED_6,
  },
  'sb-fernandez-wikipedia': {
    id: 'sb-fernandez-wikipedia',
    label: 'Wikipedia — Lisa Fernandez (three straight Olympic golds, UCLA two-way star, Olympic strikeout record)',
    url: 'https://en.wikipedia.org/wiki/Lisa_Fernandez',
    retrievedAt: RETRIEVED_6,
  },
  'sb-fernandez-olympics': {
    id: 'sb-fernandez-olympics',
    label: 'Olympics.com — The Olympic story of three-time softball champion Lisa Fernandez',
    url: 'https://www.olympics.com/en/news/success-rivalry-and-provocation-by-postcard-the-olympic-story-of-three-time-soft',
    retrievedAt: RETRIEVED_6,
  },
  'sb-canady-wikipedia': {
    id: 'sb-canady-wikipedia',
    label: 'Wikipedia — NiJaree Canady (2025: 34-7, 0.97 ERA, 317 K; $1M+ NIL; Texas Tech first WCWS; NFCA POY 2024 & 2025)',
    url: 'https://en.wikipedia.org/wiki/NiJaree_Canady',
    retrievedAt: RETRIEVED_6,
  },
  'sb-canady-espn': {
    id: 'sb-canady-espn',
    label: "ESPN — How NiJaree Canady became college softball's first million-dollar player ('a folk hero in our sport')",
    url: 'https://www.espn.com/college-sports/softball/story/_/id/45166461/2025-wcws-college-softball-texas-tech-stanford-nijaree-canady-pitcher',
    retrievedAt: RETRIEVED_6,
  },
  'sb-canady-ncaa-top10': {
    id: 'sb-canady-ncaa-top10',
    label: 'NCAA.com — Top 10 college softball pitchers (Canady riseball, slider, long release point)',
    url: 'https://www.ncaa.com/news/softball/article/2025-04-17/top-10-college-softball-pitchers-season',
    retrievedAt: RETRIEVED_6,
  },
  'sb-kavan-wikipedia': {
    id: 'sb-kavan-wikipedia',
    label: 'Wikipedia — Teagan Kavan (Texas; 2025 28-5/2.16 ERA/230 K; WCWS-record 31.2 scoreless innings; back-to-back MOP)',
    url: 'https://en.wikipedia.org/wiki/Teagan_Kavan',
    retrievedAt: RETRIEVED_6,
  },
  'sb-kavan-texas': {
    id: 'sb-kavan-texas',
    label: 'University of Texas Athletics — Teagan Kavan profile',
    url: 'https://texaslonghorns.com/sports/softball/roster/teagan-kavan/15145',
    retrievedAt: RETRIEVED_6,
  },
  'sb-kavan-wbsc-2026': {
    id: 'sb-kavan-wbsc-2026',
    label: 'WBSC — Teagan Kavan leads Texas to second straight NCAA title, first two-time WCWS MOP (2026)',
    url: 'https://www.wbsc.org/en/news/teagan-kavan-leads-texas-to-second-consecutive-ncaa-softball-title-makes-wcws-history-with-second-straight-mop-award',
    retrievedAt: RETRIEVED_6,
  },
  'sb-kavan-ncaa-2026': {
    id: 'sb-kavan-ncaa-2026',
    label: 'NCAA.com — Texas wins the 2026 NCAA DI softball championship (repeat over Texas Tech)',
    url: 'https://www.ncaa.com/news/softball/article/2026-06-04/texas-wins-2026-ncaa-di-softball-championship',
    retrievedAt: RETRIEVED_6,
  },
  'sb-kavan-daily-texan': {
    id: 'sb-kavan-daily-texan',
    label: 'The Daily Texan — The Evolution of Teagan Kavan (riseball/drop tunnel, mixing speeds)',
    url: 'https://thedailytexan.com/2025/04/07/the-evolution-of-teagan-kavan/',
    retrievedAt: RETRIEVED_6,
  },
  'sb-kavan-bvm-arsenal': {
    id: 'sb-kavan-bvm-arsenal',
    label: 'BVM Sports — Teagan Kavan on her five-pitch arsenal (rise ball primary, change, drop)',
    url: 'https://bvmsports.com/2026/05/21/texas-softball-pitcher-teagan-kavan-on-her-5-pitch-arsenal-nike-getting-called-out-by-her-coach/',
    retrievedAt: RETRIEVED_6,
  },

  /* ── the full-record ledgers (craftsmen recordLinks) ──
     The atlas tells the record in prose; the digits live with the record-keepers.
     Every URL below was curl-verified 200 on the retrieval date. */
  'bref-gibson': {
    id: 'bref-gibson',
    label: 'Baseball-Reference, Bob Gibson — the full record',
    url: 'https://www.baseball-reference.com/players/g/gibsobo01.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-ryan': {
    id: 'bref-ryan',
    label: 'Baseball-Reference, Nolan Ryan — the full record',
    url: 'https://www.baseball-reference.com/players/r/ryanno01.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-clemens': {
    id: 'bref-clemens',
    label: 'Baseball-Reference, Roger Clemens — the full record',
    url: 'https://www.baseball-reference.com/players/c/clemero02.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-maddux': {
    id: 'bref-maddux',
    label: 'Baseball-Reference, Greg Maddux — the full record',
    url: 'https://www.baseball-reference.com/players/m/maddugr01.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-santana': {
    id: 'bref-santana',
    label: 'Baseball-Reference, Johan Santana — the full record',
    url: 'https://www.baseball-reference.com/players/s/santajo02.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-skenes': {
    id: 'bref-skenes',
    label: 'Baseball-Reference, Paul Skenes — the full record',
    url: 'https://www.baseball-reference.com/players/s/skenepa01.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-niekro': {
    id: 'bref-niekro',
    label: 'Baseball-Reference, Phil Niekro — the full record',
    url: 'https://www.baseball-reference.com/players/n/niekrph01.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-hubbell': {
    id: 'bref-hubbell',
    label: 'Baseball-Reference, Carl Hubbell — the full record',
    url: 'https://www.baseball-reference.com/players/h/hubbeca01.shtml',
    retrievedAt: RETRIEVED_7,
  },
  'bref-hamels': {
    id: 'bref-hamels',
    label: 'Baseball-Reference, Cole Hamels — the full record',
    url: 'https://www.baseball-reference.com/players/h/hamelco01.shtml',
    retrievedAt: RETRIEVED_7,
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
