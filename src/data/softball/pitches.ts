import type { SoftballPitch } from './types'
import { claim } from '../sources'

/*
  The fastpitch arsenal. The riseball is the flagship — it carries the honest
  "does it actually rise?" physics, the whole atlas thesis in one pitch. The drop
  is Cat Osterman's signature and the rise's honest mirror (topspin, where Magnus
  and gravity finally pull the same way). Each pitch now carries its own physics
  note, and together they draw one honest throughline: the rise is the lone
  illusion — perception plus reduced drop — while the drop, the curve, and the
  screw are real movement the spin genuinely delivers. The fastball's note is the
  43-foot reaction-time weapon; the change's is its measured low arm load. Every
  grip, spin, and movement line is a Claim; nothing is asserted past what a
  reachable source supports. Depth still to come: full grip geometry and a 12" seam.
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
  tagline: 'The ground-ball pitch — and the riseball’s honest mirror, where the physics finally cooperates.',
  intro:
    'The drop ball falls off the table at the plate and produces ground balls and swings over the top. It comes in two honest flavors that reach the same end a different way: the peel drop, where the fingers peel down the back of the ball to spin it forward, and the turnover (rollover) drop, where the wrist and forearm pronate over the top. The distinction people argue about is the recipe, not the result — both put topspin on the ball. In Cat Osterman’s hand, the movement mattered less than where she put it.',
  grip: claim(
    'Peel drop: the wrist stays firm and the fingers peel down the backside of the ball at release, snapping it forward. Turnover drop: the wrist and forearm pronate over the top. Both finish out front and low.',
    'sb-sportstrace-peeldrop',
    'reputable-analysis',
  ),
  spin: claim(
    'Topspin (roughly 12-to-6) on both — the peel makes it with the fingers, the turnover with wrist pronation; the spin direction is the same, only the way it is generated differs.',
    'sb-sportstrace-peeldrop',
    'reputable-analysis',
    { note: 'Some coaches still teach a “backspin peel drop”; the physics-grounded sources describe the effective drop as topspin, the same forward rotation as a baseball 12-6 curve.' },
  ),
  movement: claim('Drops sharply — faster than gravity alone — as it reaches the plate; hitters beat it into the ground or swing over it.', 'sb-studlife-magnus', 'reputable-analysis'),
  physicsNote: claim(
    'The drop is the riseball’s honest mirror. The rise puts backspin on the ball so its Magnus lift points up — and that lift has to fight gravity, which it loses, so the rise only drops less than expected. The drop puts topspin on the ball so its Magnus force points down, the same direction as gravity. The two pull together instead of against each other, and the ball falls faster and sharper than a no-spin pitch would. There is no “does it really drop?” debate the way there is for the rise: this is the break the physics actually delivers. Tunneled off the rise — same low release, opposite spin — it is why the pair is so hard to read.',
    'sb-studlife-magnus',
    'reputable-analysis',
    { note: 'The same Student Life physics breakdown that deflates the rise (“the Magnus effect doesn’t have a big enough impact to actually make the ball defy gravity”) confirms the drop’s topspin sends the ball down — Magnus and gravity working in the same direction.' },
  ),
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
  physicsNote: claim(
    'The fastpitch fastball’s real weapon is the 43-foot rubber, not the radar gun. The hitter’s reaction window is set by distance as much as speed, and the distance ratio runs about 1.4×: a high-60s to low-70s pitch from 43 feet gives a batter roughly the reaction time of a mid-90s major-league fastball thrown from 60 feet 6 inches. It is why elite arms play even faster than the gun reads — and why the change-up off this look lands so hard.',
    'sb-gorout-speed',
    'reputable-analysis',
    { note: 'A reaction-time equivalence from the distance ratio (≈ 60.5 / 43). It runs even shorter in practice because the windmill stride releases the ball closer than the 43-foot rubber.' },
  ),
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
  spin: claim('Sidespin — the axis tilted so the Magnus force pushes the ball laterally across the plate.', 'sb-snexplores-curve', 'reputable-analysis'),
  movement: claim('Breaks horizontally across the zone, late, away from or in to the hitter.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  physicsNote: claim(
    'Unlike the rise, the curve’s break is not in dispute. Sidespin sets the Magnus force sideways and the ball genuinely moves the way it spins — a right-hander spinning it toward third base pushes it that way across the plate. What is not real is the “gyro”: a standalone, Magnus-free pitch that breaks on its own is essentially a myth — extremely hard to produce and unsupported by tracking. The fastpitch curve is honest lateral movement off the windmill, not an optical trick.',
    'sb-snexplores-curve',
    'reputable-analysis',
  ),
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
  spin: claim('Reverse sidespin from the curve — the axis flipped to break arm-side.', 'sb-snexplores-curve', 'reputable-analysis'),
  movement: claim('Breaks in on a same-handed hitter, the opposite direction from the curve.', 'sb-wiki-fastpitch', 'reputable-analysis'),
  physicsNote: claim(
    'The screwball is the curve’s physics run in reverse: the same real sidespin Magnus break, the axis flipped so the ball moves arm-side — in toward a same-handed hitter — instead of glove-side. Like the curve, and unlike the rise, the movement is honest. It is the spin doing exactly what the spin should.',
    'sb-snexplores-curve',
    'reputable-analysis',
  ),
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
