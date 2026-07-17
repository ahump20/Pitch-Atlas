import type { Craftsman } from '../types'
import { claim, secondhand, src } from '../sources'

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
    'Cat Osterman never overpowered anyone, and that is the point. Her fastball was modest while power arms brought real heat, and she was, by reputation and by record, the most untouchable pitcher of her era anyway. She won the way Greg Maddux won — by knowing exactly where the ball was going and making four different pitches leave her hand looking the same. The drop ball was the out pitch, but the command of it was the weapon: she could climb the ladder, start one at the hips and finish one at the ankles, and make a hitter chase all three. She is the softball case for the whole atlas thesis — that the craft, not the radar gun, is what beats people.',
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
  record: [
    claim(
      'Five seasons in the Texas circle left the program record book mostly hers: a career run-prevention mark no Longhorn has touched, a strikeout-per-inning rate that still stands as the Division I career record, and eighty-five shutouts — twenty of them no-hitters.',
      'cat-wikipedia',
      'reputable-analysis',
    ),
    claim(
      'USA Softball named her the national player of the year three times, which nobody else has done once more than twice. The Olympic file runs from gold in Athens, where she was the youngest arm on the roster, to silver in Tokyo at thirty-eight, after coming out of retirement to get it.',
      'cat-wikipedia',
      'reputable-analysis',
    ),
    claim(
      'None of it ran on speed. The analysts called her the spin master because the out pitch was where she put it, not how hard it arrived.',
      'cat-d1softball-spinmaster',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('cat-wikipedia')],
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
  record: [
    claim(
      'Gold at the first three Olympic softball tournaments, and she finished every one of those gold-medal games herself — the save in 1996, the extra-inning shutout in 2000, the clincher in 2004.',
      'sb-fernandez-wikipedia',
      'reputable-analysis',
    ),
    claim(
      'The Olympic single-game strikeout record is hers, twenty-five in one game, and so is the Olympic batting record — she hit better than half the time while she pitched her team to gold. Nobody has owned both sides of a tournament like that.',
      'sb-fernandez-olympics',
      'reputable-analysis',
    ),
    claim(
      'At UCLA: two national championships, four first-team All-American seasons, and career marks for shutouts and winning that still lead the Bruin book.',
      'sb-fernandez-wikipedia',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('sb-fernandez-wikipedia')],
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
    'Relentless and unflappable in the biggest moments, she set the NCAA record with 60 consecutive wins and then carried the sport on her back as its most recognizable ambassador. The standard for what a dominant, visible softball star could be.',
    'sb-finch-wikipedia',
    'reputable-analysis',
  ),
  record: [
    claim(
      'Sixty consecutive wins at Arizona, still the NCAA record, with the 2001 national championship in the middle of the streak — and fifty home runs of her own on the other side of the ball.',
      'sb-finch-wikipedia',
      'reputable-analysis',
    ),
    claim(
      'At the 2004 Olympics she won both her starts, allowed one hit and no runs across them, and came home with gold. Silver followed in 2008, and the National Softball Hall of Fame after that.',
      'sb-finch-wikipedia',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('sb-finch-wikipedia')],
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
    'The power counterpoint to Cat Osterman — a left-handed force and the sport’s first million-dollar pro.',
  intro:
    'If Cat Osterman is the softball case for spin and command, Monica Abbott is the case for power from the left side. The two were the left-handed twin towers of Team USA, and they could not have been more different on the mound: Osterman picked hitters apart, Abbott overpowered them. Abbott rewrote the NCAA and pro record books on the way.',
  signature: claim(
    'Overpowering force from a tall left-handed delivery. At Tennessee she set NCAA Division I career records for wins, strikeouts, shutouts, and innings, and struck out 724 in a single senior season.',
    'sb-abbott-wikipedia',
    'reputable-analysis',
    { note: 'The NCAA career records (189 wins, 2,440 K, 112 shutouts, 1,448 IP) are from her Tennessee career.' },
  ),
  mentalEdge: claim(
    'Sustained excellence defined the career: she became the first million-dollar player in professional fastpitch, the most decorated pitcher in NPF history, and a two-time Olympic silver medalist across a span that bridged softball’s removal from and return to the Games.',
    'sb-abbott-mlb-million',
    'reputable-analysis',
  ),
  record: [
    claim(
      'The Division I career record book is mostly hers — wins, strikeouts, shutouts, and innings, all set at Tennessee — with a senior season that ran past seven hundred strikeouts on its own. Two Olympic silvers, 2008 and 2020, bracket a career that bridged the sport’s removal from and return to the Games.',
      'sb-abbott-wikipedia',
      'reputable-analysis',
    ),
    claim(
      'The first million-dollar contract in professional fastpitch was hers, and she remains the most decorated pitcher the pro league produced.',
      'sb-abbott-mlb-million',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('sb-abbott-wikipedia')],
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
    'She owned the brightest stage in 2025, carrying Texas Tech to its first Women’s College World Series finals and winning a second straight NFCA National Pitcher of the Year award. The program’s million-dollar commitment had its centerpiece.',
    'sb-canady-wikipedia',
    'reputable-analysis',
  ),
  quote: secondhand(
    "She's a folk hero in our sport.",
    'sb-canady-espn',
    'How a figure in the sport described Canady to ESPN, on her becoming college softball’s first million-dollar player. A characterization, kept as such.',
  ),
  record: [
    claim(
      'In 2025 she led the nation in run prevention while carrying Texas Tech, in its first trip, to the Women’s College World Series finals. She was named national pitcher of the year for the second season in a row, 2024 and 2025.',
      'sb-canady-wikipedia',
      'reputable-analysis',
    ),
    claim(
      'The deal that brought her to Lubbock made her college softball’s first million-dollar player — the richest commitment the sport had seen — and the riseball made the money look conservative.',
      'sb-canady-wikipedia',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('sb-canady-wikipedia')],
  rights: 'original',
}

const teaganKavan: Craftsman = {
  slug: 'teagan-kavan',
  name: 'Teagan Kavan',
  kind: 'craftsman',
  hand: 'right',
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
  record: [
    claim(
      'Back-to-back national championships — Texas’s first ever in 2025, then the repeat in 2026, both finals against Texas Tech, the same in-state showdown two Junes running. In the 2026 series she threw a complete game in the opener and came back in relief to close the clincher.',
      'sb-kavan-ncaa-2026',
      'reputable-analysis',
    ),
    claim(
      'She is the first player ever named Women’s College World Series Most Outstanding Player twice.',
      'sb-kavan-wbsc-2026',
      'reputable-analysis',
    ),
    claim(
      'The 2025 title run included a scoreless streak across Oklahoma City long enough to break a Series record that had stood since 1994 — and it started in a freshman year that had already produced more wins than any Texas freshman since 2010.',
      'sb-kavan-wikipedia',
      'reputable-analysis',
    ),
  ],
  recordLinks: [src('sb-kavan-wikipedia')],
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
