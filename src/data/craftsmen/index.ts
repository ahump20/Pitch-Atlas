import type { Craftsman } from '../types'
import { claim, secondhand, src } from '../sources'
import { byEraStart } from '../../lib/era'

/*
  The Craftsmen wing. Six arms who defined a pitch, plus one pitch that is a
  legend rather than a person. Same discipline as the specimen records: the intro
  and tagline are our own framing, but every quote and every number is a Claim
  carrying its real source and the honest confidence tier an adversarial
  verification pass recommended. Quotes that could not be tied to a reachable
  source were left out, not reconstructed. Where the record and the reputation
  disagree (Santana's changeup deception, reputed as a huge speed drop but
  measured as an ordinary one), the tension is shown, not smoothed.
*/

const gibson: Craftsman = {
  slug: 'bob-gibson',
  name: 'Bob Gibson',
  kind: 'craftsman',
  era: '1959-1975',
  hand: 'right',
  signaturePitch: 'Slider',
  signaturePitchSlug: 'slider',
  specimenNo: 'C-01',
  tagline: 'The most feared arm of his era, who pitched as though the plate were his to defend.',
  intro:
    'Gibson did not negotiate with hitters. He worked from a low three-quarter slot and an explosive fall toward first base, and he treated the strike zone as territory he owned. The slider was the put-away pitch, including a back-up version that started inside on a same-handed hitter and bent back over the plate, the opposite of what the eyes told the batter to expect.',
  signature: secondhand(
    'His slider, thrown hard, was the strikeout pitch; the famous "back-up slider" started in on a same-handed hitter and swept back over the plate, breaking the wrong way on purpose. The final out of his record 17-strikeout 1968 World Series Game 1 was Willie Horton frozen on that pitch.',
    'gibson-cbs-backup',
    'Described by CBS Sports from film of the back-up slider; the grip itself is not documented in a reachable source, so none is asserted.',
  ),
  mentalEdge: claim(
    'He wanted to own the outside corner; the only reason to throw inside, he said, was to keep a hitter from leaning out over the plate. He framed his reputation as intensity rather than anger, and called pitching roughly ninety percent mental.',
    'gibson-fangraphs',
    'reputable-analysis',
    { note: 'Paraphrased from the FanGraphs appreciation, which quotes Gibson on owning the outside half. The knockdown was part of the toolkit: he listed "knockdown, brushback, and hit-batsman" among his nine pitches.' },
  ),
  quote: secondhand(
    'The part of pitching that separates the stars from everyone else is about 90 percent mental. That is why I considered it so important to mess with a batter’s head without letting him inside mine.',
    'gibson-wiki',
    // Gibson's words, but relayed through Wikipedia rather than a primary record
    // of him saying it — so the label is the source's tier, not the speaker's.
    "Gibson's own phrasing, but reachable only through the Wikipedia biography — no primary interview, autobiography passage, or transcript placing this exact sentence in his direct words was located. The label reflects the secondary pathway, not doubt about the sentiment.",
  ),
  record: [
    claim(
      'The summer of 1968 is the file. He allowed earned runs at the stingiest rate any starter has managed in the live-ball era, won twenty-two games and finished thirteen of them as shutouts, and was so thoroughly unhittable that the league lowered the mound the following spring — partly because of him.',
      'gibson-hof-1968',
      'official-data',
    ),
    claim(
      'That October he opened the World Series by striking out seventeen Tigers, still the record for a single Series game, and froze Willie Horton on the back-up slider for the last of them.',
      'gibson-cbs-backup',
      'official-data',
    ),
  ],
  recordLinks: [src('bref-gibson')],
  rights: 'original',
}

const ryan: Craftsman = {
  slug: 'nolan-ryan',
  name: 'Nolan Ryan',
  kind: 'craftsman',
  era: '1966-1993',
  hand: 'right',
  signaturePitch: 'Four-seam fastball',
  signaturePitchSlug: 'four-seam',
  specimenNo: 'C-02',
  tagline: 'Twenty-seven seasons, seven no-hitters, and a fastball he would not throw down the middle for anyone.',
  intro:
    'Ryan paired the most overpowering fastball of his generation with a hard overhand curve and a refusal to give in. He would rather walk a hitter than throw a pitch he did not trust, and he kept doing it into his forties, throwing his seventh no-hitter at age 44.',
  signature: claim(
    'A four-seam fastball that, on September 7, 1974, became the first officially radar-clocked at the top of the recorded range, paired with a power overhand curve that fell hard out of the same overhand slot. The conviction to never throw it down the middle is the rest of the pitch.',
    'ryan-wiki',
    'reputable-analysis',
    { note: 'Sources differ on the exact date of the 1974 reading (some place it August 20, 1974); the measurement was taken ten feet in front of the plate.' },
  ),
  mentalEdge: claim(
    'Ryan accepted record walk totals as the price of never giving in. Told he was not pitching the way a man of his ability should, his answer was that if he was going to lose, he would lose his own way. He framed the gap between good and great as mental: stay exact about the pitch you need, or the arm is wasted.',
    'ryan-espn',
    'reputable-analysis',
  ),
  quote: claim(
    'If I’m going to lose, I’m going to lose my way. Who gets the L?',
    'ryan-espn',
    'pitcher-own-words',
    { note: 'To Tony Kornheiser, on his conviction-first approach.' },
  ),
  record: [
    claim(
      'Nobody has struck out more hitters, and nobody is close — the career total sits more than eight hundred clear of the runner-up, piled up across twenty-seven seasons from 1966 to 1993. The seven no-hitters are also the record. The seventh came at forty-four.',
      'ryan-hof',
      'official-data',
    ),
    claim(
      'The same refusal that built the strikeout record built the walk record: he holds the career mark for both, the cost of three decades of never giving a hitter the pitch he wanted.',
      'ryan-almanac',
      'official-data',
    ),
  ],
  recordLinks: [src('bref-ryan')],
  rights: 'original',
}

const clemens: Craftsman = {
  slug: 'roger-clemens',
  name: 'Roger Clemens',
  kind: 'craftsman',
  era: '1984-2007',
  hand: 'right',
  signaturePitch: 'Split-finger fastball',
  signaturePitchSlug: 'splitter',
  specimenNo: 'C-03',
  tagline: 'The only pitcher with two twenty-strikeout games, built late on a splitter he called Mr. Splitty.',
  intro:
    'Clemens started on a heavy power fastball and a ferocious, confrontational presence, then in the 1990s added the split-finger he jokingly nicknamed "Mr. Splitty" and made it his out pitch. He is the only pitcher in history with two twenty-strikeout games in nine innings.',
  signature: claim(
    'From the 1990s on, the strikeouts ran through a split-finger fastball he nicknamed "Mr. Splitty." It left his hand looking like the fastball and dropped off the table late, the wide grip killing the backspin that keeps a four-seamer riding.',
    'clemens-wiki',
    'reputable-analysis',
    { note: 'The nickname and the splitter’s role are documented on Wikipedia; the "Mr. Splittee" spelling sometimes seen is a typo. No Clemens-specific splitter tracking data exists for most of his career.' },
  ),
  mentalEdge: claim(
    'Clemens drew a hard line between game day and every other day, cultivating an unfriendly, intimidating presence on the mound that he called motivation, not anger. Strikeouts, he said, were a situational tool to apply pressure, not the point of every at-bat.',
    'clemens-espn-classic',
    'reputable-analysis',
  ),
  quote: claim(
    'If someone met me on a game day, he wouldn’t like me. The days in between, I’m the goodest guy you can find.',
    'clemens-espn-classic',
    'pitcher-own-words',
    { note: 'Said in 1990 with the Red Sox, on his game-day persona.' },
  ),
  record: [
    claim(
      'Seven Cy Young Awards, still the record — the first in 1986, the last in 2004, a span long enough to be two careers. The win and strikeout totals underneath them rank with the deepest the game has recorded.',
      'clemens-wiki',
      'official-data',
    ),
    claim(
      'The first twenty-strikeout game ever pitched in nine innings was his: April 29, 1986, against Seattle, without walking a man.',
      'clemens-sabr-1986',
      'official-data',
    ),
    claim(
      'A decade later he did it again — September 18, 1996, in Detroit, his last win in a Red Sox uniform. He is still the only pitcher with two.',
      'clemens-mlb-1996',
      'official-data',
    ),
  ],
  recordLinks: [src('bref-clemens')],
  rights: 'original',
}

const maddux: Craftsman = {
  slug: 'greg-maddux',
  name: 'Greg Maddux',
  kind: 'craftsman',
  era: '1986-2008',
  hand: 'right',
  signaturePitch: 'Two-seam fastball',
  signaturePitchSlug: 'two-seam',
  specimenNo: 'C-04',
  tagline: 'The thinking pitcher: four straight Cy Youngs on command, deception, and a fastball that traded power for placement.',
  intro:
    'Maddux won with location and changing speeds where others won with raw power. A two-seam fastball that ran, a circle change off the same arm action, and a near-religious commitment to locating the fastball down and away made hitters unable to trust their own eyes.',
  signature: claim(
    'A two-seam fastball with arm-side run, paired with a circle changeup thrown off identical arm action, all governed by command. The two-seamer was his natural fastball; he said it played up once he learned a cutter, giving him late movement both ways off the same look.',
    'maddux-wiki',
    'reputable-analysis',
  ),
  mentalEdge: claim(
    'Maddux’s edge was perceptual. A hitter cannot reliably judge the speed of a pitch in the moment, he argued, so if every pitch leaves the same release point at the same arm speed and only the arrival changes, the hitter is helpless. Where most pitchers reach back for more in a jam, he tried to locate better.',
    'maddux-daringfireball',
    'reputable-analysis',
  ),
  quote: claim(
    'But if a pitcher can change speeds, every hitter is helpless, limited by human vision. Except for that (expletive) Tony Gwynn.',
    'maddux-daringfireball',
    'pitcher-own-words',
    { note: 'To Thomas Boswell, originally in his January 7, 2014 Washington Post column; confirmed verbatim at two reachable reproductions.' },
  ),
  record: [
    claim(
      'Four Cy Young Awards in a row, 1992 through 1995, a run only one other pitcher has matched — and he won them in the loudest hitting era of the modern game, on placement rather than power. The career wins cleared three hundred fifty; the strikeouts cleared three thousand; the walks never came.',
      'maddux-wiki',
      'reputable-analysis',
    ),
    claim(
      'Eighteen Gold Gloves, the most by any player at any position. The fielding was the same craft as the pitching: one motion, finished balanced, ready for what came back.',
      'maddux-wiki',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('bref-maddux')],
  rights: 'original',
}

const skenes: Craftsman = {
  slug: 'paul-skenes',
  name: 'Paul Skenes',
  kind: 'craftsman',
  era: '2024-present',
  hand: 'right',
  signaturePitch: 'Splinker',
  signaturePitchSlug: 'splinker',
  specimenNo: 'C-07',
  tagline: 'The modern phenom whose splinker, a pitch he found by accident, is already one of the best in baseball.',
  intro:
    'Skenes reached the majors in 2024 and was the NL Rookie of the Year that fall. His signature is the "splinker," a sinker-splitter hybrid his catcher named, thrown hard with splitter-like dive off a power four-seam look. He still thinks of it as a sinker.',
  signature: claim(
    'A "splinker," held with a light two-seam split rather than a deep splitter wedge, fired hard off the same power four-seam look. A loose, low-spin grip gives it heavy, late drop, deeper than a normal splitter, with arm-side run into right-handers; it leaves the hand on nearly the same path as the fastball, then falls off the table.',
    'skenes-mlb-arsenal',
    'reputable-analysis',
    { note: 'He discovered the modern version by feel: the grip did not change, but the release and the feel at release did, on one random throw.' },
  ),
  mentalEdge: claim(
    'Skenes leans on deception by sameness, the splinker emerging on the same arm slot and release as his four-seam so hitters cannot tell the rising fastball from the diving hybrid out of the hand. He treats it as a confidence pitch, reaching for it in the highest-leverage counts and using it differently every outing.',
    'skenes-mlb-confidence',
    'reputable-analysis',
  ),
  quote: claim(
    'I still think of it as a sinker. It’s funny to see guys swing at fastballs in the dirt.',
    'skenes-mlb-confidence',
    'pitcher-own-words',
  ),
  record: [
    claim(
      'He reached the majors in the spring of 2024 and was the National League Rookie of the Year by fall — the record so far is short because the career is, and the splinker is the reason everyone expects the file to grow.',
      'skenes-mlb-arsenal',
      'official-data',
    ),
  ],
  recordLinks: [src('bref-skenes')],
  rights: 'original',
}

const santana: Craftsman = {
  slug: 'johan-santana',
  name: 'Johan Santana',
  kind: 'craftsman',
  era: '2000-2012',
  hand: 'left',
  signaturePitch: 'Circle changeup',
  signaturePitchSlug: 'circle-change',
  specimenNo: 'C-05',
  tagline: 'A circle changeup widely called the best of its era, built entirely on looking exactly like the fastball.',
  intro:
    'Santana’s 2000s peak ran on a circle changeup that scouts and hitters called the best of its era. Its deception came not from exotic movement but from identical arm action, release point, and effort, so hitters committed early and the ball arrived later and slower than they expected. He won the AL Cy Young unanimously in 2004 and 2006.',
  signature: claim(
    'A circle changeup launched with arm action, release point, and effort indistinguishable from his fastball, so the two looked like twins until the change arrived late and slow with fade down and away from righties. The weapon was the disguise: hitters committed to the fastball look and were left reaching for the fade.',
    'santana-sabr',
    'reputable-analysis',
  ),
  mentalEdge: claim(
    'The whole design was disguise. The Twins sent him to Triple-A in 2002 specifically to force-feed the changeup, where a coach made him throw one to nearly every hitter until he trusted it completely. The reputation cast it as a huge separation pitch, but the more useful lesson is cleaner: the deception, not a published gap, is what made it elite.',
    'santana-sabr',
    'reputable-analysis',
    { note: 'A real, sourced tension worth keeping: scouting lore cast the change as an enormous separation pitch, while tracking-era readings made the disguise look more important than any headline gap.' },
  ),
  quote: claim(
    'I was challenging myself and forcing myself to take command of that pitch.',
    'santana-sabr',
    'pitcher-own-words',
    { note: 'On developing the changeup at Triple-A Edmonton in 2002.' },
  ),
  record: [
    claim(
      'Two Cy Young Awards, 2004 and 2006, both unanimous — the writers could not find a reason to split a vote either year. Both seasons he led the league in run prevention and piled up strikeouts behind a fastball nobody feared and a changeup everybody did.',
      'santana-twinsalmanac',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('bref-santana')],
  rights: 'original',
}

const wainwright: Craftsman = {
  slug: 'adam-wainwright',
  name: 'Adam Wainwright',
  kind: 'craftsman',
  era: '2005-2023',
  hand: 'right',
  signaturePitch: '12-6 curveball',
  signaturePitchSlug: 'twelve-six',
  specimenNo: 'C-06',
  tagline: 'One curveball, one team, eighteen seasons: a big, slow hook so trusted it ended a pennant on a called strike three.',
  intro:
    'Wainwright spent his whole career with the St. Louis Cardinals, and he spent it leaning on one pitch. The curveball was big and slow and arrived at the same speed no matter how hard he threw it, and it buckled knees from his rookie September to his final start. His brother taught it to him as a kid. He threw it on top of the ball and well out in front, with a double-jointed thumb that put extra spin on the end of it, and when the biggest at-bat of his life arrived, he threw it again.',
  signature: claim(
    'A big, slow curveball thrown on top of the ball and released well out in front, so it stayed hidden until it broke. His grip was a little around the seam, and he had a double-jointed thumb he could turn over at release to add spin on the end of the pitch. In his prime it was a true over-the-top 12-6; as his arm slot dropped with age it took on more side-to-side, a two-plane 2-to-7 shape.',
    'wainwright-fangraphs-grip',
    'pitcher-own-words',
    { note: 'His own account to FanGraphs: the around-the-seam grip, the double-jointed thumb, the out-front release, and the 12-6 flattening toward 2-to-7 as he aged.' },
  ),
  mentalEdge: claim(
    'His edge was one pitch he trusted completely. No matter how hard he threw the curve it came out the same slow speed, the same every time, so he could throw it in any count without tipping how fast it would arrive. He was blunt about how much rested on it: without the curveball, he said, he never gets out of A-ball. Hitters knew it was coming and could not lay off; Joey Votto compared reading it to a ball dropped off a ladder, impossible to tell ball from strike.',
    'wainwright-espn-curve',
    'pitcher-own-words',
    { note: 'The "same speed however hard I throw it" and "out of A-ball" lines are Wainwright\'s own, via ESPN. Votto\'s "ladder" description is a hitter\'s, from the same piece.' },
  ),
  quote: claim(
    'If I didn’t have my curveball, I don’t get out of A-ball.',
    'wainwright-espn-curve',
    'pitcher-own-words',
    { note: 'To ESPN, on how completely his career rested on the one pitch.' },
  ),
  record: [
    claim(
      'Eighteen seasons, one uniform. He won two hundred games as a Cardinal and struck out more than two thousand hitters without ever throwing a pitch for anyone else — he and Bob Gibson are the only two arms to collect that many strikeouts entirely in St. Louis.',
      'wainwright-bref',
      'official-data',
    ),
    claim(
      'The signature at-bat came first: a rookie closing Game 7 of the 2006 NLCS, bases loaded, two outs, Carlos Beltran looking — and the curveball froze him for the pennant.',
      'wainwright-nlcs-wiki',
      'reputable-analysis',
    ),
    claim(
      'Fifteen years later, the two-thousandth strikeout came on the same pitch. The curve, again, in 2021.',
      'wainwright-2000-stlredbirds',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('wainwright-bref')],
  rights: 'original',
}

const gyroball: Craftsman = {
  slug: 'gyroball',
  name: 'The gyroball',
  kind: 'legend',
  era: 'Designed 2001',
  signaturePitch: 'Bullet spin, zero Magnus',
  specimenNo: 'L-01',
  tagline: 'The pitch designed on a computer, mythologized into a monster, and quietly debunked by physics.',
  intro:
    'The gyroball is real but heavily mythologized. It was not discovered on a mound but designed on a computer by a Japanese pitching coach and a computer scientist, who modeled its properties and published them in a 2001 book. The legend that grew around it, a "double-spin" pitch that breaks twice and that Daisuke Matsuzaka threw as a secret weapon, is the part that does not survive contact with the data.',
  signature: claim(
    'A ball thrown with "bullet" spin, the spin axis aligned with the direction of flight, so the spin never passes over the face of the ball. With the angle between spin axis and trajectory at zero, the net Magnus force is essentially zero: the pitch falls on gravity and drag alone, with no lateral break. Its only honest real-world cousin is the accidental "back-up slider," which shares the same spin signature.',
    'gyro-sabr-brj',
    'reputable-analysis',
    { note: 'From Nathan and Baldwin’s analysis: "the net Magnus force on the ball is zero. The only forces acting on the gyroball are gravity and drag."' },
  ),
  quote: secondhand(
    'I have done it in a game, but not too much. Sometimes accidentally.',
    'gyro-sabr-brj',
    'Daisuke Matsuzaka, asked whether he throws the gyroball; relayed from a 2006 Yahoo! Sports piece and cited in the SABR analysis.',
  ),
  legendNote: claim(
    'The dramatic-break legend is false: with zero Magnus force there is no break to exaggerate. Independent PITCHf/x studies of Matsuzaka’s 2007 pitches reached the same conclusion: the secret monster pitch was not really there. What the gyro idea does, against a hitter expecting a fastball, is fall well short of where the fastball would finish, a heavy, late tumble.',
    'gyro-sabr-brj',
    'reputable-analysis',
    { note: 'Two independent tracking-era studies reached the same conclusion from different samples. Both are kept here rather than merged.' },
  ),
  rights: 'original',
}

const niekro: Craftsman = {
  slug: 'phil-niekro',
  name: 'Phil Niekro',
  kind: 'craftsman',
  era: '1964-1987',
  hand: 'right',
  signaturePitch: 'Knuckleball',
  signaturePitchSlug: 'knuckleball',
  specimenNo: 'C-08',
  tagline: 'The only knuckleballer to win 300 games — a Hall of Fame career built on the one pitch nobody, himself included, could fully explain.',
  intro:
    'They called him Knucksie. On a floating knuckleball his father taught him, Phil Niekro pitched more innings than any pitcher who started in the live-ball era and threw deep into his late 40s, long after a fastball would have left him. The knuckleball is usually a last resort; for Niekro it was a 300-win, Hall of Fame career.',
  signature: claim(
    'A true no-spin knuckleball: he arched the first two fingers of his right hand so only their tips and nails touched the ball, forsaking all humanly imparted spin and letting the seams and the air do the rest. With almost nothing on it, the pitch fluttered late and unpredictably — and because it asked so little of the arm, it let him pitch into his 48th year.',
    'niekro-fangraphs',
    'reputable-analysis',
    { note: 'The fingertip-and-nail grip description is from the FanGraphs remembrance; he learned the pitch from his father and from minor-leaguer Nick McKay (SABR).' },
  ),
  mentalEdge: claim(
    'Durability as a weapon. Teammate Dale Murphy called him the ultimate gamer and competitor, and the record bears it out: the most innings of any live-ball-era starter, and the oldest pitcher ever to throw a shutout, at 46 years and 188 days — a mark that stood nearly 25 years until Jamie Moyer passed it. A pitch that spares the arm let him simply outlast everyone.',
    'niekro-wiki',
    'reputable-analysis',
    { note: 'The "ultimate gamer" characterization is Murphy\'s, via FanGraphs; the longevity records are from Wikipedia and the Hall of Fame.' },
  ),
  record: [
    claim(
      'Three hundred wins and three thousand strikeouts on a pitch most pitchers will not trust for an inning, and a Hall of Fame induction in 1997 — he is still the only knuckleballer ever to clear three hundred.',
      'niekro-hof',
      'reputable-analysis',
    ),
    claim(
      'Nobody who started in the live-ball era pitched more innings. At forty-six he became the oldest man ever to throw a shutout, a record that stood for nearly a quarter century until Jamie Moyer finally passed it.',
      'niekro-wiki',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('bref-niekro')],
  quote: claim(
    "I figured if there's any way I'm going to win my 300th game by striking the guy out, I was going to do it with the pitch that won the first game for me.",
    'niekro-fangraphs',
    'pitcher-own-words',
    { note: 'On finishing his 300th win with the knuckleball.' },
  ),
  rights: 'original',
}

const hubbell: Craftsman = {
  slug: 'carl-hubbell',
  name: 'Carl Hubbell',
  kind: 'craftsman',
  era: '1928-1943',
  hand: 'left',
  signaturePitch: 'Screwball',
  specimenNo: 'C-09',
  tagline: 'The screwball master who struck out five Hall of Famers in a row — and deformed his own arm doing it.',
  intro:
    'They called him King Carl and the Meal Ticket. Carl Hubbell threw the screwball, a pitch that breaks the wrong way, so well that in the 1934 All-Star Game he struck out Babe Ruth, Lou Gehrig, Jimmie Foxx, Al Simmons, and Joe Cronin in succession. The pitch fed him for a decade and left his throwing arm permanently turned, his palm facing outward at rest.',
  signature: claim(
    'A screwball thrown over the top with exactly the same motion as his fastball — the deception, he said, was not the break but the change of speed. To make it, he had to defy nature and twist his wrist to the right at release, so the ball broke down and to the left, away from a right-handed hitter. Years of that twist left his left palm facing out instead of in.',
    'hubbell-sabr',
    'reputable-analysis',
    { note: 'The same-motion delivery, the wrist twist, and the change-of-speed framing are from SABR; the palm-out deformity is confirmed by SABR and RetroSimba.' },
  ),
  mentalEdge: claim(
    'Matchless control, and a sequence built on it: he used the curveball to set up the screwball, so by the time the screwball arrived the hitter had already been moved off balance. It is why he could throw a backwards-breaking pitch for strikes in any count without giving the at-bat away.',
    'hubbell-sabr',
    'reputable-analysis',
  ),
  record: [
    claim(
      'The 1934 All-Star Game is the legend: Ruth, Gehrig, Foxx, Simmons, and Cronin — five Hall of Famers, struck out in succession, after a single and a walk had put two men on with nobody out.',
      'hubbell-asg-sabr',
      'reputable-analysis',
    ),
    claim(
      'The career around the legend held up its end: two MVP awards, the second of them the first unanimous MVP the National League ever produced.',
      'hubbell-wiki',
      'reputable-analysis',
    ),
    claim(
      'Across 1936 and 1937 he won twenty-four decisions in a row, a streak no pitcher has touched since.',
      'hubbell-hof',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('bref-hubbell')],
  quote: claim(
    "The screwball's an unnatural pitch. Nature never intended a man to turn his hand like that throwing rocks at a bear.",
    'hubbell-almanac',
    'pitcher-own-words',
  ),
  rights: 'original',
}

const rivera: Craftsman = {
  slug: 'mariano-rivera',
  name: 'Mariano Rivera',
  kind: 'craftsman',
  era: '1995-2013',
  hand: 'right',
  signaturePitch: 'Cutter',
  signaturePitchSlug: 'cutter',
  specimenNo: 'C-10',
  tagline: 'The greatest closer ever, built on one pitch he discovered by accident — and the first player voted into the Hall of Fame unanimously.',
  intro:
    'Mariano Rivera is the rarest thing in the game: a pitcher everyone knew was throwing one pitch, who threw it anyway, for nineteen years, better than anyone has thrown anything. The cutter arrived by accident in 1997, playing catch. He never really changed it, and it carried him to the all-time saves record and a unanimous Hall of Fame call.',
  signature: claim(
    'Essentially one pitch his whole career: a cutter that looked like a four-seam fastball until it broke late to his glove side, in on the hands of a left-handed hitter, splitting bats at the thin part of the barrel. Ryan Klesko famously broke three bats in a single at-bat against it in the 1999 World Series.',
    'rivera-wiki',
    'reputable-analysis',
    { note: 'The bat-breaking mechanism and the Klesko at-bat are from the Wikipedia cut-fastball article; the one-pitch career is documented in his Wikipedia biography.' },
  ),
  mentalEdge: claim(
    'Total acceptance, total repetition. By his own account he did not change a thing about the pitch once he found it — no grip, no motion — and threw it in front of hitters who knew it was coming. The edge was a closer\'s calm welded to a pitch precise enough that knowing did not help.',
    'rivera-cbs-cutter',
    'reputable-analysis',
  ),
  record: [
    claim(
      'He retired with more saves than any pitcher who ever lived, collected across nineteen seasons of throwing one pitch the whole league knew was coming.',
      'rivera-hof',
      'reputable-analysis',
    ),
    claim(
      'Among every arm with a thousand career innings, nobody has allowed earned runs at a stingier lifetime rate relative to his leagues.',
      'rivera-bref',
      'reputable-analysis',
    ),
    claim(
      'October sharpened him instead of breaking him: five World Series titles, a Series MVP, and the lowest postseason run-prevention mark the game has ever recorded, held across more than a hundred and forty pressure innings.',
      'rivera-wiki',
      'reputable-analysis',
    ),
    claim(
      'When the Hall of Fame ballot came due, every writer said yes. The first unanimous election in the history of the vote.',
      'rivera-bbwaa',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('rivera-bref')],
  quote: claim(
    'The Lord gave it to me. Oh, the Lord. Definitely.',
    'rivera-cbs-cutter',
    'pitcher-own-words',
    { note: 'On the 1997 accidental discovery of the cutter while playing catch with Ramiro Mendoza.' },
  ),
  rights: 'original',
}

const hamels: Craftsman = {
  slug: 'cole-hamels',
  name: 'Cole Hamels',
  kind: 'craftsman',
  era: '2006-2020',
  hand: 'left',
  signaturePitch: 'Circle changeup',
  signaturePitchSlug: 'circle-change',
  specimenNo: 'C-11',
  tagline: 'A left-handed changeup artist whose out-pitch carried him to a World Series MVP — the southpaw answer to Santana.',
  intro:
    'Cole Hamels threw a changeup good enough to start a championship. A power lefty with an ordinary-looking fastball, he made his living on a circle change he could throw in any count, and in October 2008 he rode it to both the NLCS and World Series MVP. Where Johan Santana was the right-handed model of the disguised changeup, Hamels was its left-handed counterpart.',
  signature: claim(
    'A circle changeup he learned in high school, thrown from the same release point as his fastball and curve so all three came out looking identical — the deception was the sameness, not the movement. He varied it on purpose: slower for swings and misses, firmer for ground balls. He developed it after breaking his arm in high school pushed him toward an off-speed pitch.',
    'hamels-espn-crasnick',
    'reputable-analysis',
    { note: 'The grip origin (HS coach Mark Furtak, Rancho Bernardo) and the slow-vs-firm variation are from ESPN; the same-release-point deception is from the FanGraphs JAWS profile; the broken-arm origin is from Wikipedia.' },
  ),
  mentalEdge: claim(
    'He turned a two-pitch guessing game into a three-way one. As he put it, adding the changeup meant a hitter went from a 50-50 fastball-or-curve guess to a one-in-three — and because all three left his hand the same way, the extra option was pure friction, not a tell.',
    'hamels-espn-crasnick',
    'reputable-analysis',
  ),
  record: [
    claim(
      'October 2008 is the headline: five starts, four wins, no losses, and a month so steady he took the NLCS MVP and the World Series MVP in the same postseason — a double almost nobody has managed.',
      'hamels-espn-2008',
      'reputable-analysis',
    ),
    claim(
      'The career around the championship was long and quietly relentless: fifteen seasons and more than twenty-five hundred strikeouts, most of them set up by the same changeup.',
      'hamels-statmuse',
      'reputable-analysis',
    ),
    claim(
      'Four All-Star selections, and run prevention comfortably better than the leagues he pitched in for a decade and a half.',
      'hamels-fangraphs-jaws',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('bref-hamels')],
  quote: claim(
    'It just rolls off my fingers.',
    'hamels-espn-crasnick',
    'pitcher-own-words',
    { note: 'On the feel of his changeup.' },
  ),
  rights: 'original',
}

/*
  The hall, in reading order: the established craftsmen oldest to newest, the
  roundout (a knuckleballer, a screwball master, a one-pitch closer, a changeup
  lefty), then the legend. Adding an arm is one const and one array entry.
*/
export const CRAFTSMEN: Craftsman[] = [gibson, ryan, clemens, maddux, santana, wainwright, skenes, niekro, hubbell, rivera, hamels, gyroball]

const BY_SLUG: Record<string, Craftsman> = Object.fromEntries(
  CRAFTSMEN.map((c) => [c.slug, c]),
)

export function craftsmanBySlug(slug: string): Craftsman | undefined {
  return BY_SLUG[slug]
}

/*
  The hall as a chronology: the masters laid out by the real year their era began
  (Hubbell, 1928, to Skenes), the gyroball legend filed last because it is a
  design, not a career. One source of truth so the hall and the chapter-to-chapter
  walk agree on which arm comes next. Derived from the era strings — re-file a
  craftsman and the order re-sorts itself.
*/
export const CRAFTSMEN_BY_ERA: Craftsman[] = [
  ...CRAFTSMEN.filter((c) => c.kind === 'craftsman').slice().sort(byEraStart),
  ...CRAFTSMEN.filter((c) => c.kind === 'legend'),
]

/*
  The reciprocal of a craftsman's signature pitch: every master who owned this
  pitch, oldest first. A specimen page used to point only at the whole hall;
  this lets it name the arm. Matches on the same slug the craftsman cross-links
  out by, so the link is two-way and never guessed — a pitch with no filed master
  simply returns none.
*/
export function craftsmenForPitch(pitchSlug: string): Craftsman[] {
  return CRAFTSMEN_BY_ERA.filter(
    (c) => c.kind === 'craftsman' && c.signaturePitchSlug === pitchSlug,
  )
}
