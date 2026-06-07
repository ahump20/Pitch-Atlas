import type { Craftsman } from '../types'
import { claim, secondhand } from '../sources'

/*
  The Softball Craftsmen — the arms that defined fastpitch from inside the circle.
  Same discipline as the baseball hall: the intro and tagline are our own framing,
  but every number and quote is a Claim carrying its real source and an honest
  confidence tier. Cat Osterman opens the wing the way Maddux anchors the baseball
  hall — proof that command, spin, and deception beat velocity, told from the
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
    'The fastpitch answer to the thinking pitcher: a low-60s left arm who owned the circle on spin, command, and deception — not speed.',
  intro:
    'Cat Osterman never overpowered anyone, and that is the point. Her fastball lived in the low-to-mid 60s while the hardest throwers in the world pushed past 70, and she was, by reputation and by record, the most untouchable pitcher of her era anyway. She won the way Greg Maddux won — by knowing exactly where the ball was going and making four different pitches leave her hand looking the same. The drop ball was the out pitch, but the command of it was the weapon: she could climb the ladder, start one at the hips and finish one at the ankles, and make a hitter chase all three. She is the softball case for the whole atlas thesis — that the craft, not the radar gun, is what beats people.',
  signature: claim(
    'A drop ball whose effectiveness was command, not just movement: she located it in and out and walked it down the ladder, then set it up off a rise the hitter was not expecting, so the two pitches tunneled and the eyes betrayed the bat. The rest of the arsenal — a sharp backdoor curve and a changeup — all left her hand on the same look. Analysts called her "the spin master" precisely because none of it ran on velocity.',
    'cat-d1softball-spinmaster',
    'reputable-analysis',
    {
      note: 'Paraphrased from D1Softball’s pitching analysis and SI’s 2021 profile; the rise-sets-up-the-drop tunnel and the "climb the ladder" command are her catcher Gwen Svekis’s description.',
    },
  ),
  mentalEdge: claim(
    'Command over velocity, carried by total belief. Where a power pitcher reaches back for more, Osterman reached for a spot — and she did it for two decades, coming out of retirement to pitch in the 2020 Olympics at 38 and dominating the inaugural Athletes Unlimited season. Her catcher put the edge plainly: there is not a single hitter who steps in that Osterman thinks can beat her.',
    'cat-si-2021',
    'reputable-analysis',
  ),
  quote: secondhand(
    "There's not a single person that steps into the box that she thinks will beat her.",
    'cat-si-2021',
    'Her catcher, Gwen Svekis, to Sports Illustrated (2021), on the belief behind Osterman’s command. A teammate’s characterization, kept as such rather than put in Osterman’s own mouth.',
  ),
  numbers: [
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
      label: 'Fastball velocity',
      claim: claim('low-to-mid 60s mph', 'cat-d1softball-spinmaster', 'reputable-analysis', {
        approximate: true,
        note: 'Well below the era’s hardest throwers. She used location and movement, not speed, as the out pitch.',
      }),
    },
  ],
  rights: 'original',
}

/*
  The hall, in reading order. Cat Osterman opens the wing; the velocity
  counterpoint (Abbott) and the others are named in the plan and filed later.
  Adding an arm is one const and one array entry.
*/
export const SOFTBALL_CRAFTSMEN: Craftsman[] = [catOsterman]

const BY_SLUG: Record<string, Craftsman> = Object.fromEntries(
  SOFTBALL_CRAFTSMEN.map((c) => [c.slug, c]),
)

export function softballCraftsmanBySlug(slug: string): Craftsman | undefined {
  return BY_SLUG[slug]
}
