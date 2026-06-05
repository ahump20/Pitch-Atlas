import type { Craftsman } from '../types'
import { claim, secondhand } from '../sources'

/*
  The Craftsmen wing. Six arms who defined a pitch, plus one pitch that is a
  legend rather than a person. Same discipline as the specimen records: the intro
  and tagline are our own framing, but every quote and every number is a Claim
  carrying its real source and the honest confidence tier an adversarial
  verification pass recommended. Quotes that could not be tied to a reachable
  source were left out, not reconstructed. Where the record and the reputation
  disagree (Santana's velocity gap), the gap is shown, not smoothed.
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
  quote: claim(
    'The part of pitching that separates the stars from everyone else is about 90 percent mental. That is why I considered it so important to mess with a batter’s head without letting him inside mine.',
    'gibson-wiki',
    'pitcher-own-words',
  ),
  numbers: [
    { label: 'ERA (1968)', claim: claim('1.12', 'gibson-hof-1968', 'official-data', { note: 'The lowest live-ball-era ERA for a qualifier; it helped trigger the mound being lowered for 1969.' }) },
    { label: 'Record (1968)', claim: claim('22-9', 'gibson-hof-1968', 'official-data') },
    { label: 'Strikeouts (1968)', claim: claim('268', 'gibson-hof-1968', 'official-data') },
    { label: 'Shutouts (1968)', claim: claim('13', 'gibson-hof-1968', 'official-data') },
    { label: 'World Series Game 1 K (1968)', claim: claim('17', 'gibson-cbs-backup', 'official-data', { note: 'A single-game World Series record, vs. Detroit; the last strikeout came on the back-up slider.' }) },
    { label: 'Slider velocity (described)', claim: claim('about 90 mph', 'gibson-fangraphs', 'secondhand-attributed', { approximate: true, note: 'A descriptive estimate from FanGraphs. No radar tracking existed in his era.' }) },
  ],
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
    'A four-seam fastball that, on September 7, 1974, became the first officially radar-clocked above 100 mph, paired with a power overhand curve. The conviction to never throw it down the middle is the rest of the pitch.',
    'ryan-wiki',
    'reputable-analysis',
    { note: 'Sources differ on the exact date of the 100.8 mph reading (some place it August 20, 1974); the measurement was taken ten feet in front of the plate.' },
  ),
  mentalEdge: claim(
    'Ryan accepted record walk totals as the price of never giving in. Told he was not pitching the way a man of his ability should, his answer was that if he was going to lose, he would lose his own way. He framed the gap between good and great as mental: stay exact about the pitch you need, or the velocity is wasted.',
    'ryan-espn',
    'reputable-analysis',
  ),
  quote: claim(
    'If I’m going to lose, I’m going to lose my way. Who gets the L?',
    'ryan-espn',
    'pitcher-own-words',
    { note: 'To Tony Kornheiser, on his conviction-first approach.' },
  ),
  numbers: [
    { label: 'Career strikeouts', claim: claim('5,714', 'ryan-hof', 'official-data', { note: 'The MLB record, 839 ahead of the runner-up.' }) },
    { label: 'No-hitters', claim: claim('7', 'ryan-hof', 'official-data', { note: 'The MLB record; the seventh came at age 44.' }) },
    { label: 'Seasons pitched', claim: claim('27', 'ryan-hof', 'official-data', { note: '1966 to 1993.' }) },
    { label: 'Career record', claim: claim('324-292', 'ryan-almanac', 'official-data') },
    { label: 'Career walks', claim: claim('2,795', 'ryan-almanac', 'official-data', { note: 'Also the MLB record: the trade-off of never throwing to contact.' }) },
    { label: 'Fastball, radar-clocked (1974)', claim: claim('100.8 mph', 'ryan-wiki', 'reputable-analysis', { note: 'The first fastball officially clocked over 100 mph, measured ten feet in front of the plate.' }) },
  ],
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
    'Clemens started on a mid-90s fastball and a ferocious, confrontational presence, then in the 1990s added the split-finger he jokingly nicknamed "Mr. Splitty" and made it his out pitch. He is the only pitcher in history with two twenty-strikeout games in nine innings.',
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
  numbers: [
    { label: 'Career wins', claim: claim('354', 'clemens-wiki', 'official-data') },
    { label: 'Career strikeouts', claim: claim('4,672', 'clemens-wiki', 'official-data') },
    { label: 'Cy Young Awards', claim: claim('7', 'clemens-wiki', 'official-data', { note: '1986, 1987, 1991, 1997, 1998, 2001, 2004. A record.' }) },
    { label: '20-K game, April 29, 1986', claim: claim('20 K, 0 BB, vs. Seattle', 'clemens-sabr-1986', 'official-data', { note: 'The first nine-inning 20-strikeout game in MLB history.' }) },
    { label: '20-K game, Sept 18, 1996', claim: claim('20 K, 0 BB, vs. Detroit', 'clemens-mlb-1996', 'official-data', { note: 'Tied his own record; his last win in a Red Sox uniform.' }) },
  ],
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
  tagline: 'The thinking pitcher: four straight Cy Youngs on command, deception, and a fastball that rarely touched 89.',
  intro:
    'Maddux won with location and changing speeds where others won with velocity. A two-seam fastball that ran, a circle change off the same arm action, and a near-religious commitment to locating the fastball down and away made hitters unable to trust their own eyes.',
  signature: claim(
    'A two-seam fastball with arm-side run, paired with a circle changeup thrown off identical arm action, all governed by command. The two-seamer was his natural fastball; he said it played up once he learned a cutter, giving him late movement both ways off the same look.',
    'maddux-wiki',
    'reputable-analysis',
  ),
  mentalEdge: claim(
    'Maddux’s edge was perceptual. A hitter cannot reliably judge the speed of a pitch in the moment, he argued, so if every pitch leaves the same release point at the same arm speed and only the velocity changes, the hitter is helpless. Where most pitchers reach back for more in a jam, he tried to locate better.',
    'maddux-daringfireball',
    'reputable-analysis',
  ),
  quote: claim(
    'But if a pitcher can change speeds, every hitter is helpless, limited by human vision. Except for that (expletive) Tony Gwynn.',
    'maddux-daringfireball',
    'pitcher-own-words',
    { note: 'To Thomas Boswell, originally in his January 7, 2014 Washington Post column; confirmed verbatim at two reachable reproductions.' },
  ),
  numbers: [
    { label: 'Career wins', claim: claim('355', 'maddux-wiki', 'reputable-analysis') },
    { label: 'Career ERA', claim: claim('3.16', 'maddux-wiki', 'reputable-analysis') },
    { label: 'Career strikeouts', claim: claim('3,371', 'maddux-wiki', 'reputable-analysis', { note: 'On a fastball that rarely touched 89 mph late in his career.' }) },
    { label: 'Cy Young Awards', claim: claim('4 (consecutive)', 'maddux-wiki', 'reputable-analysis', { note: '1992 through 1995, a feat matched by only one other pitcher.' }) },
    { label: 'Gold Gloves', claim: claim('18', 'maddux-wiki', 'reputable-analysis', { note: 'The most by any player at any position.' }) },
  ],
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
    'Skenes reached the majors in 2024 and was the NL Rookie of the Year that fall. His signature is the "splinker," a sinker-splitter hybrid his catcher named, thrown in the mid-90s with splitter-like dive off a 98 mph four-seam look. He still thinks of it as a sinker.',
  signature: claim(
    'A "splinker," held with a light two-seam split rather than a deep splitter wedge, fired around 94 mph off a 98 mph four-seam look. Low spin gives it more drop than a normal splitter and arm-side run into right-handers; it leaves the hand on nearly the same path as the fastball, then falls.',
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
  numbers: [
    { label: 'Splinker velocity', claim: claim('about 94 mph', 'skenes-mlb-arsenal', 'official-data', { note: 'Roughly 4 mph under his four-seam and nearly 8 mph above the average MLB splitter.' }) },
    { label: 'Splinker spin rate', claim: claim('about 1,750 rpm', 'skenes-mlb-arsenal', 'official-data', { note: 'Far below the average sinker (about 2,150 rpm), which is why it behaves like neither a true sinker nor a true splitter.' }) },
    { label: 'Run value since debut', claim: claim('+18 (top-five pitch in baseball)', 'skenes-mlb-arsenal', 'official-data') },
    { label: 'Opponent average vs. splinker (first 6 starts)', claim: claim('.073 (3-for-41)', 'skenes-mlb-confidence', 'official-data') },
  ],
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
    'Santana’s 2000s peak ran on a circle changeup that scouts and hitters called the best of its era. Its deception came not from exotic movement but from identical arm action, release point, and effort, so hitters committed early and the ball arrived more than ten mph slower than they expected. He won the AL Cy Young unanimously in 2004 and 2006.',
  signature: claim(
    'A circle changeup launched with arm action, release point, and effort indistinguishable from his low-90s fastball, so the two looked like twins until the change arrived late and slow with fade down and away from righties. By one pitch-value measure he is the career leader in changeup value since tracking began in 2002.',
    'santana-sabr',
    'reputable-analysis',
  ),
  mentalEdge: claim(
    'The whole design was disguise. The Twins sent him to Triple-A in 2002 specifically to force-feed the changeup, where a coach made him throw one to nearly every hitter until he trusted it completely. The reputation said a 15-to-20 mph gap; the 2007 tracking data put the real fastball-to-change gap near 10 mph, meaning the deception, not the separation, is what made it elite.',
    'santana-sabr',
    'reputable-analysis',
    { note: 'A real, sourced tension worth keeping: Bret Boone and scouting lore cite a 15-20 mph gap; PITCHf/x measured about 10 mph in 2007.' },
  ),
  quote: claim(
    'I was challenging myself and forcing myself to take command of that pitch.',
    'santana-sabr',
    'pitcher-own-words',
    { note: 'On developing the changeup at Triple-A Edmonton in 2002.' },
  ),
  numbers: [
    { label: 'ERA (2004, unanimous Cy Young)', claim: claim('2.61', 'santana-twinsalmanac', 'reputable-analysis', { note: 'Led the majors; won the AL Cy Young unanimously.' }) },
    { label: 'Strikeouts (2004)', claim: claim('265', 'santana-twinsalmanac', 'reputable-analysis') },
    { label: 'ERA (2006, unanimous Cy Young)', claim: claim('2.77', 'santana-twinsalmanac', 'reputable-analysis') },
    { label: 'Fastball vs. changeup gap (2007 PITCHf/x)', claim: claim('about 10 mph (93.0 / 83.1)', 'santana-fastballs', 'reputable-analysis', { note: 'Close to a normal MLB changeup separation, and well under the 15-20 mph the pitch was reputed to have.' }) },
    { label: 'Career changeup value (since 2002)', claim: claim('133.4 runs (the leader)', 'santana-fangraphs-nohit', 'reputable-analysis') },
  ],
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
  tagline: 'One curveball, one team, eighteen seasons: a 75-mph hook so trusted it ended a pennant on a called strike three.',
  intro:
    'Wainwright spent his whole career with the St. Louis Cardinals, and he spent it leaning on one pitch. The curveball was big and slow and arrived at the same speed no matter how hard he threw it, and it buckled knees from his rookie September to his final start. His brother taught it to him as a kid. He threw it on top of the ball and well out in front, with a double-jointed thumb that put extra spin on the end of it, and when the biggest at-bat of his life arrived, he threw it again.',
  signature: claim(
    'A big, slow curveball thrown on top of the ball and released well out in front, so it stayed hidden until it broke. His grip was a little around the seam, and he had a double-jointed thumb he could turn over at release to add spin on the end of the pitch. In his prime it was a true over-the-top 12-6; as his arm slot dropped with age it took on more side-to-side, a two-plane 2-to-7 shape.',
    'wainwright-fangraphs-grip',
    'pitcher-own-words',
    { note: 'His own account to FanGraphs: the around-the-seam grip, the double-jointed thumb, the out-front release, and the 12-6 flattening toward 2-to-7 as he aged.' },
  ),
  mentalEdge: claim(
    'His edge was one pitch he trusted completely. He could throw the curve as hard as he wanted and it still came out 75 mph, the same every time, so he could throw it in any count without tipping speed. He was blunt about how much rested on it: without the curveball, he said, he never gets out of A-ball. Hitters knew it was coming and could not lay off; Joey Votto compared reading it to a ball dropped off a ladder, impossible to tell ball from strike.',
    'wainwright-espn-curve',
    'pitcher-own-words',
    { note: 'The "75 mph however hard I throw it" and "out of A-ball" lines are Wainwright\'s own, via ESPN. Votto\'s "ladder" description is a hitter\'s, from the same piece.' },
  ),
  quote: claim(
    'If I didn’t have my curveball, I don’t get out of A-ball.',
    'wainwright-espn-curve',
    'pitcher-own-words',
    { note: 'To ESPN, on how completely his career rested on the one pitch.' },
  ),
  numbers: [
    { label: 'Career strikeouts', claim: claim('2,202', 'wainwright-bref', 'official-data', { note: 'All with the Cardinals; the 2,000th came on the curve in 2021.' }) },
    { label: 'Career wins', claim: claim('200', 'wainwright-bref', 'official-data', { note: 'Plus two Gold Gloves, three All-Star selections, and four top-three Cy Young finishes, all in St. Louis.' }) },
    { label: 'Opponent line vs. the curve (career)', claim: claim('26 wRC+', 'wainwright-fangraphs-curve', 'official-data', { note: 'Roughly 74% below league-average offense against the pitch over his career; 100 is average.' }) },
    { label: 'Curve, 2023 (Statcast)', claim: claim('71.5 mph · 16.5 in glove-side · 13.5 in drop', 'savant-wainwright', 'official-data', { note: 'Late-career the curve swept as a two-plane 2-to-7, not the over-the-top 12-6 of his prime.' }) },
    { label: 'The Beltran strikeout', claim: claim('NLCS Game 7, 2006', 'wainwright-nlcs-wiki', 'reputable-analysis', { note: 'Rookie Wainwright froze Carlos Beltran on a 0-2 curve, bases loaded and two outs, to clinch the pennant and send St. Louis to the World Series.' }) },
    { label: '2,000th strikeout', claim: claim('on the curve, 2021', 'wainwright-2000-stlredbirds', 'reputable-analysis', { note: 'The 85th pitcher to reach 2,000; with Bob Gibson, the only two to collect all 2,000 as Cardinals.' }) },
  ],
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
    'The dramatic-break legend is false: with zero Magnus force there is no break to exaggerate. Two independent PITCHf/x studies of Matsuzaka’s 2007 pitches, one of 790 pitches and one of 586, both concluded he threw essentially no gyroballs. What it does do, against a hitter expecting a fastball, is drop roughly 15 inches more than that fastball would.',
    'gyro-sabr-brj',
    'reputable-analysis',
    { note: 'The two studies (SABR’s 790 pitches and Baseball Prospectus’s 586) reached the same conclusion from different samples. Both are kept here rather than merged.' },
  ),
  numbers: [
    { label: 'Net Magnus force (pure gyroball)', claim: claim('zero', 'gyro-sabr-brj', 'reputable-analysis', { note: 'Spin axis aligned with the trajectory, so no spin-induced force.' }) },
    { label: 'Extra drop vs. an expected fastball', claim: claim('about 15 in', 'gyro-sabr-brj', 'reputable-analysis', { approximate: true, note: 'Alan Nathan elsewhere estimates closer to 18 inches.' }) },
    { label: 'Matsuzaka gyroballs found (790 pitches, 2007)', claim: claim('very few, if any', 'gyro-sabr-brj', 'reputable-analysis') },
    { label: 'Matsuzaka gyroballs found (586 pitches, 2007)', claim: claim('no room for one', 'gyro-bp', 'reputable-analysis', { note: 'A separate Baseball Prospectus study, same conclusion.' }) },
  ],
  rights: 'original',
}

/*
  The hall, in reading order: six craftsmen oldest to newest, then the legend.
  Adding an arm is one import and one array entry.
*/
export const CRAFTSMEN: Craftsman[] = [gibson, ryan, clemens, maddux, santana, wainwright, skenes, gyroball]

const BY_SLUG: Record<string, Craftsman> = Object.fromEntries(
  CRAFTSMEN.map((c) => [c.slug, c]),
)

export function craftsmanBySlug(slug: string): Craftsman | undefined {
  return BY_SLUG[slug]
}
