import type { Craftsman } from '../types'
import { claim, secondhand } from '../sources'

/*
  The Softball Craftsmen — the arms that defined fastpitch from inside the circle.
  Same discipline as the baseball hall: the intro and tagline are our own framing,
  but every number and quote is a Claim carrying its real source and an honest
  confidence tier. Cat Osterman opens the wing the way Maddux anchors the baseball
  hall — proof that command, spin, and deception beat raw power, told from the
  underhand side of the game.

  These live in their own array and lookup so the baseball `CRAFTSMEN` registry is
  untouched and slugs never collide. The signaturePitchSlug points at a softball
  pitch (resolved against the softball arsenal, not the baseball specimens).
*/

const catOsterman: Craftsman = {
  slug: 'cat-osterman',
  name: 'Cat Osterman',
  kind: 'craftsman',
  era: '2002-2021',
  hand: 'left',
  signaturePitch: 'Drop ball',
  signaturePitchSlug: 'drop',
  specimenNo: 'SC-01',
  tagline:
    'The fastpitch answer to the thinking pitcher: a soft-tossing left arm who owned the circle on spin, command, and deception — not speed.',
  intro:
    'Cat Osterman never overpowered anyone, and that is the point. Her fastball was modest while the hardest throwers in the world brought real heat, and she was, by reputation and by record, the most untouchable pitcher of her era anyway. She won the way Greg Maddux won — by knowing exactly where the ball was going and making four different pitches leave her hand looking the same. The drop ball was the out pitch, but the command of it was the weapon: she could climb the ladder, start one at the hips and finish one at the ankles, and make a hitter chase all three. She is the softball case for the whole atlas thesis — that the craft, not the radar gun, is what beats people.',
  signature: claim(
    'A drop ball whose effectiveness was command, not just movement: she located it in and out and walked it down the ladder, then set it up off a rise the hitter was not expecting, so the two pitches tunneled and the eyes betrayed the bat. The rest of the arsenal — a sharp backdoor curve and a changeup — all left her hand on the same look. Analysts called her "the spin master" precisely because none of it ran on raw power.',
    'cat-d1softball-spinmaster',
    'reputable-analysis',
    {
      note: 'Paraphrased from D1Softball’s pitching analysis and SI’s 2021 profile; the rise-sets-up-the-drop tunnel and the "climb the ladder" command are her catcher Gwen Svekis’s description.',
    },
  ),
  mentalEdge: claim(
    'Command over raw power, carried by total belief. Where a power pitcher reaches back for more, Osterman reached for a spot — and she did it for two decades, coming out of retirement to pitch in the 2020 Olympics at 38 and dominating the inaugural Athletes Unlimited season. Her catcher put the edge plainly: there is not a single hitter who steps in that Osterman thinks can beat her.',
    'cat-si-2021',
    'reputable-analysis',
  ),
  quote: secondhand(
    "There's not a single person that steps into the box that she thinks will beat her.",
    'cat-si-2021',
    'Her catcher, Gwen Svekis, to Sports Illustrated (2021), on the belief behind Osterman’s command. A teammate’s characterization, kept as such rather than put in Osterman’s own mouth.',
  ),
  biography: [
    {
      label: 'Career ERA (Texas, 2002-06)',
      claim: claim('0.51', 'cat-wikipedia', 'reputable-analysis', {
        note: 'A University of Texas career record, over five seasons in the circle.',
      }),
    },
    {
      label: 'NCAA Division I strikeout ratio',
      claim: claim('14.34 per 7 (record)', 'cat-wikipedia', 'reputable-analysis', {
        note: 'The NCAA Division I career record for strikeouts per seven innings.',
      }),
    },
    {
      label: 'Career record (Texas)',
      claim: claim('136-25', 'cat-wikipedia', 'reputable-analysis', {
        note: 'With 2,265 strikeouts — a UT career record.',
      }),
    },
    {
      label: 'Shutouts / no-hitters (Texas)',
      claim: claim('85 shutouts, 20 no-hitters', 'cat-wikipedia', 'reputable-analysis'),
    },
    {
      label: 'USA Softball National Player of the Year',
      claim: claim('3× (2003, 2005, 2006)', 'cat-wikipedia', 'reputable-analysis', {
        note: 'The only individual ever to win the award three times.',
      }),
    },
    {
      label: 'Olympic medals',
      claim: claim('Gold 2004, Silver 2008 & 2020', 'cat-wikipedia', 'reputable-analysis', {
        note: 'A career Olympic record of 7-1; in 2004 she was the youngest member and only collegian on the gold-medal team.',
      }),
    },
    {
      label: 'How she won',
      claim: claim('Location and movement, not speed', 'cat-d1softball-spinmaster', 'reputable-analysis', {
        note: 'Her fastball sat well below the era’s hardest throwers; the out pitch was where she put it, not how hard she threw it.',
      }),
    },
  ],
  rights: 'original',
}

const lisaFernandez: Craftsman = {
  slug: 'lisa-fernandez',
  name: 'Lisa Fernandez',
  kind: 'craftsman',
  era: '1990-2004',
  hand: 'right',
  signaturePitch: 'Riseball',
  signaturePitchSlug: 'riseball',
  specimenNo: 'SC-02',
  tagline:
    'Three straight Olympic golds and a two-way dominance that may be the highest peak the sport has produced.',
  intro:
    'Lisa Fernandez is the closest thing softball has to a complete answer. She pitched and hit at a level no one has matched, leading the United States to gold at the first three Olympic softball tournaments and starring on both sides of the ball at UCLA. The riseball was the weapon, the changeup off it the punctuation, and the bat made her impossible to plan around.',
  signature: claim(
    'An overpowering riseball paired with a sharp changeup, thrown by a pitcher who was also one of the best hitters in the game — the two-way threat that set her apart. In Olympic play she once struck out 25 in a single game, an Olympic record, and hit .545 across the Games.',
    'sb-fernandez-olympics',
    'reputable-analysis',
    { note: 'The 25-strikeout single-game mark and the .545 Olympic batting average are individual Olympic records (Olympics.com / Wikipedia).' },
  ),
  mentalEdge: claim(
    'She pitched in three consecutive Olympic gold-medal games and finished every one — a save in 1996, an extra-inning shutout in 2000, and the clincher in 2004. A career built on closing the biggest game on the schedule, three Olympiads running.',
    'sb-fernandez-wikipedia',
    'reputable-analysis',
  ),
  biography: [
    { label: 'Olympic gold medals', claim: claim('3 (1996, 2000, 2004)', 'sb-fernandez-wikipedia', 'reputable-analysis', { note: 'Gold at the first three Olympic softball tournaments.' }) },
    { label: 'Olympic single-game strikeouts', claim: claim('25 (record)', 'sb-fernandez-olympics', 'reputable-analysis') },
    { label: 'Olympic batting average', claim: claim('.545 (record)', 'sb-fernandez-olympics', 'reputable-analysis', { note: 'A two-way star: the highest batting average in Olympic softball play.' }) },
    { label: 'UCLA', claim: claim('2× national champion, 4× first-team All-American', 'sb-fernandez-wikipedia', 'reputable-analysis', { note: 'Still holds UCLA career records for shutouts, WHIP, and winning percentage.' }) },
    { label: 'Olympic record', claim: claim('7-2', 'sb-fernandez-wikipedia', 'reputable-analysis', { note: 'Six runs allowed over 74.2 Olympic innings, with 93 strikeouts.' }) },
  ],
  rights: 'original',
}

const jennieFinch: Craftsman = {
  slug: 'jennie-finch',
  name: 'Jennie Finch',
  kind: 'craftsman',
  era: '1999-2010',
  hand: 'right',
  signaturePitch: 'Riseball',
  signaturePitchSlug: 'riseball',
  specimenNo: 'SC-03',
  tagline:
    'The face that took softball mainstream — a 60-game college win streak and a riseball that made the sport must-watch.',
  intro:
    'Jennie Finch did two things at once: she dominated, and she made everyone watch. At Arizona she won 60 games in a row, an NCAA record, and she carried that visibility to Olympic gold and into the broader culture in a way no softball player had before. The riseball was the pitch people remember, climbing out of a low release at hitters who could not lay off it.',
  signature: claim(
    'A riseball thrown out of a clean, repeatable windmill that, paired with her command, made her nearly unbeatable in college and a gold-medal arm internationally. At the 2004 Olympics she went 2-0, allowing a single hit and no runs over eight innings with 13 strikeouts.',
    'sb-finch-wikipedia',
    'reputable-analysis',
  ),
  mentalEdge: claim(
    'Relentless and unflappable in the biggest moments, she set the NCAA record with 60 consecutive wins and then carried the sport on her back as its most recognizable ambassador. The standard for what a dominant, durable, mainstream softball star could be.',
    'sb-finch-wikipedia',
    'reputable-analysis',
  ),
  biography: [
    { label: 'Consecutive wins (NCAA record)', claim: claim('60', 'sb-finch-wikipedia', 'reputable-analysis') },
    { label: 'Arizona career record', claim: claim('119-16', 'sb-finch-wikipedia', 'reputable-analysis', { note: 'Plus a .301 average and 50 home runs — a two-way contributor.' }) },
    { label: 'Olympic medals', claim: claim('Gold 2004, Silver 2008', 'sb-finch-wikipedia', 'reputable-analysis') },
    { label: '2004 Olympics', claim: claim('2-0, 13 K, 1 hit, 0 runs (8 IP)', 'sb-finch-wikipedia', 'reputable-analysis') },
    { label: 'WCWS title', claim: claim('2001 (Arizona)', 'sb-finch-wikipedia', 'reputable-analysis', { note: 'National Softball Hall of Fame inductee.' }) },
  ],
  rights: 'original',
}

const monicaAbbott: Craftsman = {
  slug: 'monica-abbott',
  name: 'Monica Abbott',
  kind: 'craftsman',
  era: '2004-2021',
  hand: 'left',
  signaturePitch: 'Fastball',
  signaturePitchSlug: 'fastball',
  specimenNo: 'SC-04',
  tagline:
    'The power counterpoint to Cat Osterman — the hardest documented arm in the sport, and its first million-dollar pro.',
  intro:
    'If Cat Osterman is the softball case for spin and command, Monica Abbott is the case for sheer speed. The two were the left-handed twin towers of Team USA, and they could not have been more different on the mound: Osterman picked hitters apart, Abbott blew the ball past them. Abbott holds the Guinness record for the fastest pitch ever thrown in the sport and rewrote the NCAA and pro record books on the way.',
  signature: claim(
    'Overpowering force from a tall left-handed delivery: she holds the Guinness World Record for the fastest softball pitch ever thrown, set in a 2012 pro game. At Tennessee she set NCAA Division I career records for wins, strikeouts, shutouts, and innings, and struck out 724 in a single senior season.',
    'sb-abbott-wikipedia',
    'reputable-analysis',
    { note: 'The Guinness fastest-pitch mark was set June 16, 2012, in an NPF game; the NCAA career records (189 wins, 2,440 K, 112 shutouts, 1,448 IP) are from her Tennessee career.' },
  ),
  mentalEdge: claim(
    'Workhorse durability turned into a career: she became the first million-dollar player in professional fastpitch, the most decorated pitcher in NPF history, and a two-time Olympic silver medalist across a span that bridged softball’s removal from and return to the Games.',
    'sb-abbott-mlb-million',
    'reputable-analysis',
  ),
  biography: [
    { label: 'Fastest pitch ever (Guinness)', claim: claim('World record holder', 'sb-abbott-wikipedia', 'reputable-analysis', { note: 'Set June 16, 2012, in an NPF game — the recognized Guinness world record for the fastest softball pitch ever thrown.' }) },
    { label: 'NCAA career strikeouts', claim: claim('2,440 (record)', 'sb-abbott-wikipedia', 'reputable-analysis', { note: 'With a single-season record of 724, plus 23 no-hitters and 6 perfect games as a senior.' }) },
    { label: 'NCAA career wins', claim: claim('189 (record)', 'sb-abbott-wikipedia', 'reputable-analysis', { note: 'Also NCAA records for shutouts (112) and innings pitched (1,448).' }) },
    { label: 'Professional milestone', claim: claim('First million-dollar NPF player', 'sb-abbott-mlb-million', 'reputable-analysis') },
    { label: 'Olympic medals', claim: claim('Silver 2008 & 2020', 'sb-abbott-wikipedia', 'reputable-analysis') },
  ],
  rights: 'original',
}

const niJareeCanady: Craftsman = {
  slug: 'nijaree-canady',
  name: 'NiJaree Canady',
  kind: 'craftsman',
  era: '2022-present',
  hand: 'right',
  signaturePitch: 'Riseball',
  signaturePitchSlug: 'riseball',
  specimenNo: 'SC-05',
  tagline:
    'The current face of the college game — a power riseball, a sub-1.00 ERA, and the first million-dollar college player.',
  intro:
    'NiJaree Canady is what the sport looks like right now. She left Stanford for Texas Tech, signed the richest NIL deal in college softball history, and then justified every dollar by carrying a program to its first Women’s College World Series. She does it with a riseball that sits where the very best of the past lived — and with a release point so far out front the ball is on the hitter before it should be.',
  signature: claim(
    'A ferocious power riseball paired with a late-breaking slider, delivered from a long release point closer to the plate than most — which is part of why hitters cannot square it. In 2025 she led the nation with a 0.97 ERA, the standard-setting pitcher of her era.',
    'sb-canady-ncaa-top10',
    'reputable-analysis',
    { note: 'The riseball, the slider, and the long, close release point are from NCAA.com’s scouting of the top college pitchers.' },
  ),
  mentalEdge: claim(
    'Workhorse dominance under the brightest lights: in the 2025 postseason she threw 686 consecutive pitches dating to the start of Super Regionals before Texas Tech was eliminated in the WCWS finals. Back-to-back NFCA National Pitcher of the Year, and the athlete a million-dollar program was built around.',
    'sb-canady-wikipedia',
    'reputable-analysis',
  ),
  quote: secondhand(
    "She's a folk hero in our sport.",
    'sb-canady-espn',
    'How a figure in the sport described Canady to ESPN, on her becoming college softball’s first million-dollar player. A characterization, kept as such.',
  ),
  biography: [
    { label: '2025 ERA (led nation)', claim: claim('0.97', 'sb-canady-wikipedia', 'reputable-analysis', { note: 'On a 34-7 record with 317 strikeouts (second nationally).' }) },
    { label: 'NIL deal', claim: claim('$1M, then $1.2M', 'sb-canady-wikipedia', 'reputable-analysis', { note: 'The richest in college softball history — college softball’s first million-dollar player.' }) },
    { label: 'NFCA National Pitcher of the Year', claim: claim('2024 & 2025', 'sb-canady-wikipedia', 'reputable-analysis', { note: 'Back-to-back; also 2025 Big 12 Pitcher of the Year and Big 12 Athlete of the Year.' }) },
    { label: 'Texas Tech postseason run', claim: claim('686 consecutive pitches', 'sb-canady-wikipedia', 'reputable-analysis', { note: 'From the start of Super Regionals to the WCWS finals, where Texas Tech — in its first-ever WCWS — fell to Texas.' }) },
    { label: '2025 signature pitch', claim: claim('A power riseball', 'sb-canady-ncaa-top10', 'reputable-analysis', { note: 'NCAA.com’s scouting ranked it among the best riseballs in the college game.' }) },
  ],
  rights: 'original',
}

const teaganKavan: Craftsman = {
  slug: 'teagan-kavan',
  name: 'Teagan Kavan',
  kind: 'craftsman',
  era: '2024-present',
  signaturePitch: 'Riseball',
  signaturePitchSlug: 'riseball',
  specimenNo: 'SC-06',
  tagline:
    'Texas’s big-game ace — back-to-back national titles and the first two-time Most Outstanding Player in Women’s College World Series history.',
  intro:
    'Some pitchers are defined by a season; Teagan Kavan is defined by Junes. The Texas ace threw the Longhorns to their first national championship in 2025 and right back to a second in 2026, and in both Junes she was the best pitcher on the field — the first player ever named Women’s College World Series Most Outstanding Player twice. The bigger the game, the smaller the strike zone got for everyone facing her.',
  signature: claim(
    'A five-pitch arsenal built on a commandable rise ball she throws to all four quadrants, tunneled off a drop that leaves her hand on the same plane — so the rise and the drop look identical until they split. A deceptive changeup mixes the speeds. "She can throw every pitch in every plane," which is why hitters cannot square her.',
    'sb-kavan-bvm-arsenal',
    'reputable-analysis',
    { note: 'The five-pitch arsenal and the rise/drop same-plane tunnel are from her own account (BVM Sports) and The Daily Texan’s profile.' },
  ),
  mentalEdge: claim(
    'An October arm in a June sport. In the 2025 Women’s College World Series she threw 31 2/3 consecutive scoreless innings — a WCWS record, breaking a mark that had stood since 1994 — and in 2026 she closed it out again to become the first two-time WCWS Most Outstanding Player. Back-to-back rings on the strength of pitching her best with everything on the line.',
    'sb-kavan-wbsc-2026',
    'reputable-analysis',
  ),
  biography: [
    { label: 'National championships', claim: claim('Back-to-back (2025, 2026)', 'sb-kavan-ncaa-2026', 'reputable-analysis', { note: 'Texas’s first-ever title in 2025, then a repeat over Texas Tech in 2026 — the same in-state final two years running.' }) },
    { label: 'WCWS Most Outstanding Player', claim: claim('2× (2025 & 2026) — first ever', 'sb-kavan-wbsc-2026', 'reputable-analysis', { note: 'The first two-time Most Outstanding Player in Women’s College World Series history.' }) },
    { label: '2025 WCWS scoreless streak', claim: claim('31.2 innings (record)', 'sb-kavan-wikipedia', 'reputable-analysis', { note: 'A WCWS record, breaking the previous mark of 27.2 set in 1994.' }) },
    { label: '2025 season', claim: claim('28-5, 2.16 ERA, 230 K', 'sb-kavan-wikipedia', 'reputable-analysis', { note: 'Over 207 innings, with 18 complete games and 5 shutouts.' }) },
    { label: '2026 WCWS', claim: claim('4-1, 1.47 ERA, 30 K (33.1 IP)', 'sb-kavan-ncaa-2026', 'reputable-analysis', { note: 'A complete game in the opener, then a relief close to clinch the repeat.' }) },
    { label: 'Freshman season (2024)', claim: claim('20 wins, Big 12 Freshman of the Year', 'sb-kavan-wikipedia', 'reputable-analysis', { note: 'The most wins by a Texas freshman since 2010.' }) },
  ],
  rights: 'original',
}

/*
  The hall, in reading order: Cat Osterman opens the wing, then the legends oldest
  to newest (Fernandez, Finch, Abbott), then the current wave (Canady, Kavan).
  Each arm earns a distinct lane — the thesis, the legends, the NIL-era star, the
  back-to-back champion. Adding an arm is one const and one array entry.
*/
export const SOFTBALL_CRAFTSMEN: Craftsman[] = [
  catOsterman,
  lisaFernandez,
  jennieFinch,
  monicaAbbott,
  niJareeCanady,
  teaganKavan,
]

const BY_SLUG: Record<string, Craftsman> = Object.fromEntries(
  SOFTBALL_CRAFTSMEN.map((c) => [c.slug, c]),
)

export function softballCraftsmanBySlug(slug: string): Craftsman | undefined {
  return BY_SLUG[slug]
}
