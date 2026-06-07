import type { SoftballPitch } from './types'
import { claim } from '../sources'

/*
  The fastpitch arsenal, filed light for the soft launch. The riseball is the
  flagship — it carries the honest "does it actually rise?" physics, which is the
  whole atlas thesis in one pitch. The drop is Cat Osterman's signature. The rest
  are sourced one-liners now and deepen later. Every grip, spin, and movement line
  is a Claim; nothing is asserted past what a reachable source supports.
*/

const riseball: SoftballPitch = {
  slug: 'riseball',
  name: 'Riseball',
  family: 'rise',
  specimenNo: 'S-01',
  status: 'advanced',
  flagship: true,
  tagline: 'The pitch that looks like it climbs — and the honest answer to whether it does.',
  intro:
    'The riseball is fastpitch’s signature illusion and its hardest pitch to command. The pitcher puts violent backspin on a ball thrown from below the waist, and to a hitter it appears to jump up through the zone. It is the pitch a generation grew up believing defied gravity. The truth is more interesting than the legend, and it is exactly the kind of thing this atlas exists to file honestly.',
  grip: claim(
    'A four-seam grip set so the fingers can pull up the back of the ball at release, driving pure backspin; the wrist snaps under and up out of the low release slot.',
    'sb-riseball-wiki',
    'reputable-analysis',
    { note: 'Grips vary by coach; the constant is backspin imparted from underneath at a low release point.' },
  ),
  spin: claim(
    'Backspin — the spin axis set so Magnus lift points up, the opposite of a baseball curve’s topspin.',
    'sb-riseball-wiki',
    'reputable-analysis',
  ),
  movement: claim(
    'Appears to rise, or at least to stay up and flatten, as it reaches the plate — hitters swing under it.',
    'sb-wiki-fastpitch',
    'reputable-analysis',
  ),
  physicsNote: claim(
    'Does it truly rise? Backspin makes upward Magnus lift, but for the ball to climb above its release line that force has to beat the ball’s own weight. An Armstrong Atlantic State applied-physics study found a light training ball (about a third of regulation mass) appeared to follow an upward path, while a regulation softball at the same 70 mph still followed a decreasing — falling — trajectory. So a regulation riseball almost certainly does not travel a net-upward path. What it does is drop far less than the eye predicts, and off the low underhand release it arrives higher than the brain expects — reduced drop plus perception, not anti-gravity. It is the real-physics cousin of baseball’s "rising fastball," which this atlas files as an illusion.',
    'sb-armstrong-riseball',
    'reputable-analysis',
    { note: 'The Armstrong study compared a JUGS Lite-Flite (~59.5 g) against a regulation ball (~181.7 g); the lighter ball is far easier to lift. Sources agree the mechanism (backspin Magnus) is real; they disagree on whether a regulation ball nets an actual rise.' },
  ),
  role: 'A chase pitch up and out of the zone, tunneled against the drop — the two move in opposite directions off a similar look.',
  velocity: 'high 50s to high 60s mph (level-dependent)',
  notableThrowers: 'Cat Osterman set up her drop with it; Monica Abbott pairs it with elite velocity.',
}

const drop: SoftballPitch = {
  slug: 'drop',
  name: 'Drop ball',
  family: 'drop',
  specimenNo: 'S-02',
  status: 'standard',
  tagline: 'The ground-ball pitch — and Cat Osterman’s out pitch when she located it.',
  intro:
    'The drop ball falls off the table at the plate and produces ground balls and swings over the top. It comes in two honest flavors: the peel drop, thrown with backspin so it carries before it dives, and the turnover (rollover) drop, thrown with topspin that drives it straight down. In Cat Osterman’s hand, the movement mattered less than where she put it.',
  grip: claim(
    'A peel drop is thrown off the fingers with backspin and a downward pull; a turnover drop adds wrist rotation over the top for topspin. Both finish out front and low.',
    'sb-wiki-fastpitch',
    'reputable-analysis',
  ),
  spin: claim(
    'Backspin (peel) or topspin (turnover) — the two recipes that both end in a late dive.',
    'sb-wiki-fastpitch',
    'reputable-analysis',
  ),
  movement: claim('Drops sharply as it reaches the plate; hitters beat it into the ground or swing over it.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  role: 'A primary strike-and-ground-ball pitch, lethal when commanded down and tunneled off the rise.',
  velocity: 'near fastball speed (peel) to a touch slower (turnover)',
  notableThrowers: 'Cat Osterman — the spin and command made it her signature.',
}

const fastball: SoftballPitch = {
  slug: 'fastball',
  name: 'Fastball',
  family: 'fastball',
  specimenNo: 'S-03',
  status: 'standard',
  tagline: 'The foundation pitch — and the look every other pitch borrows.',
  intro:
    'Everything in the windmill game is built on the fastball: it is the first pitch taught, the timing reference the hitter sets against, and the disguise the change and the breaking balls all wear. Thrown four-seam for a true ride or two-seam for a little arm-side run.',
  grip: claim(
    'A four-seam grip across the wide seams for a true, fast ball; a two-seam grip along the narrow seams for a little arm-side movement.',
    'sb-wiki-fastpitch',
    'reputable-analysis',
  ),
  spin: claim('Backspin from the underhand release, axis tilted by grip toward four- or two-seam.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  movement: claim('Mostly straight and fast (four-seam) or with slight arm-side run (two-seam).', 'sb-wiki-fastpitch', 'reputable-analysis'),
  role: 'The base of the arsenal and the timing the whole sequence plays off.',
  velocity: 'mid 50s to mid 70s mph (level-dependent; elite arms touch the low 70s)',
  notableThrowers: 'Monica Abbott — among the hardest documented fastpitch fastballs.',
}

const changeup: SoftballPitch = {
  slug: 'changeup',
  name: 'Change-up',
  family: 'offspeed',
  specimenNo: 'S-04',
  status: 'standard',
  tagline: 'The slow pitch off a fast look — and, measurably, the gentlest on the arm.',
  intro:
    'The change-up subtracts speed while the arm keeps fastball tempo, so the hitter commits early and the ball arrives late. Fastpitch has a whole shelf of ways to make it — the flip, the turnover or backhand, the circle, the knuckle change — each killing speed a different way off the same windmill.',
  grip: claim(
    'Several recipes: a flip change off the back of the hand, a turnover/backhand change, a circle (OK) grip, or a knuckle change — all keeping the arm circle while taking speed off.',
    'sb-wiki-fastpitch',
    'reputable-analysis',
  ),
  spin: claim('Low spin and reduced speed; the deception is sameness of arm action, not movement.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  movement: claim('Arrives well under fastball speed; the gap, not the break, is the pitch.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  physicsNote: claim(
    'The change-up is also the kindest pitch to the arm: biomechanics work measured significantly less peak elbow anterior force and shoulder distraction force on the change-up than on the fastball.',
    'sb-friesen-2025-biomech',
    'reputable-analysis',
  ),
  role: 'The timing-wrecker — and a lower-load pitch worth leaning on.',
  velocity: 'roughly 8-15 mph under the fastball',
}

const curve: SoftballPitch = {
  slug: 'curve',
  name: 'Curveball',
  family: 'breaking',
  specimenNo: 'S-05',
  status: 'standard',
  tagline: 'The horizontal breaker — sweeping across the zone, not dropping through it.',
  intro:
    'The fastpitch curve breaks side to side across the plate rather than diving like a baseball 12-6. Thrown with sidespin out of the windmill, it sweeps away from or in to a hitter depending on the spin, and it pairs with the screwball as the two halves of the horizontal game.',
  grip: claim('A grip set for sidespin, the wrist turning across the ball at release to start it spinning toward the break.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  spin: claim('Sidespin (often with a gyro component), the axis set to sweep the ball laterally.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  movement: claim('Breaks horizontally across the zone, late, away from or in to the hitter.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  role: 'A strike-stealer and a chase pitch off the corner; the mirror of the screwball.',
  velocity: 'near fastball speed',
}

const screwball: SoftballPitch = {
  slug: 'screwball',
  name: 'Screwball',
  family: 'breaking',
  specimenNo: 'S-06',
  status: 'standard',
  tagline: 'The curve’s mirror — breaking the other way, in on the same-handed hitter.',
  intro:
    'The screwball is the curve run in reverse: it breaks arm-side, in toward a same-handed hitter, off spin turned the opposite direction. Together the curve and the screw let a windmill pitcher move the ball both ways across the plate off one delivery.',
  grip: claim('A grip and wrist turn that spin the ball the opposite way from the curve, driving an arm-side break.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  spin: claim('Reverse sidespin from the curve — the axis flipped to break arm-side.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  movement: claim('Breaks in on a same-handed hitter, the opposite direction from the curve.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  role: 'Jams same-handed hitters and completes the two-way horizontal attack.',
  velocity: 'near fastball speed',
}

/*
  The arsenal, in reading order: the flagship rise, the signature drop, the
  foundation fastball, the low-load change, then the two horizontal breakers.
  Adding a pitch is one const and one array entry.
*/
export const SOFTBALL_PITCHES: SoftballPitch[] = [
  riseball,
  drop,
  fastball,
  changeup,
  curve,
  screwball,
]

const BY_SLUG: Record<string, SoftballPitch> = Object.fromEntries(
  SOFTBALL_PITCHES.map((p) => [p.slug, p]),
)

export function softballPitchBySlug(slug: string): SoftballPitch | undefined {
  return BY_SLUG[slug]
}
