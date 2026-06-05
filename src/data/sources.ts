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
