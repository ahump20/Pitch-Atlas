import { describe, expect, it } from 'vitest'
import { solveGripPose, solveHand, projectSpine, projectHand, type GripPoseContact } from './gripPose'
import { seamPoint, v } from './seam'
import { PITCHES } from '../data/pitches'

/*
  The solver is the single source of finger geometry for the 3D hand, the 2D
  schematic, and the authoring acceptance tests. These tests pin its contract:
  on-seam means on the seam, offsets move along the surface by the stated arc,
  azimuth turns the spine relative to the seam tangent, engagement decides how
  much leather the finger hugs, and a left hand is a true mirror.
*/

const base: GripPoseContact = {
  finger: 'index',
  seamT: 0.305,
  lift: 0,
  seamOffset: 0,
  azimuth: 90,
  engagement: 'pad',
  curl: 0.2,
}

const angleBetween = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) =>
  Math.acos(Math.min(1, Math.max(-1, v.dot(v.normalize(a), v.normalize(b)))))

describe('gripPose solver', () => {
  it('puts a zero-offset contact exactly on the seam', () => {
    const spine = solveGripPose(base)
    const seam = seamPoint(base.seamT * Math.PI * 2, 1)
    expect(angleBetween(spine.contact, seam)).toBeLessThan(1e-6)
  })

  it('moves the contact along the surface by the stated offset arc', () => {
    const offset = 0.1
    const spine = solveGripPose({ ...base, seamOffset: offset })
    const seam = seamPoint(base.seamT * Math.PI * 2, 1)
    expect(angleBetween(spine.contact, seam)).toBeCloseTo(offset, 3)
    // and stays on the unit sphere
    expect(v.length(spine.contact)).toBeCloseTo(1, 6)
  })

  it('lays an azimuth-90 spine across the seam and an azimuth-0 spine along it', () => {
    const across = solveGripPose({ ...base, azimuth: 90 })
    const along = solveGripPose({ ...base, azimuth: 0 })
    // the seam tangent, approximated through two nearby seam points
    const e = 1e-3
    const t1 = seamPoint(base.seamT * Math.PI * 2 - e, 1)
    const t2 = seamPoint(base.seamT * Math.PI * 2 + e, 1)
    const tangent = v.normalize(v.sub(t2, t1))
    expect(Math.abs(v.dot(across.spineDir, tangent))).toBeLessThan(0.1)
    expect(Math.abs(v.dot(along.spineDir, tangent))).toBeGreaterThan(0.9)
  })

  it('keeps every spine point on or above the leather', () => {
    for (const engagement of ['tip', 'pad', 'inside', 'nail', 'knuckle'] as const) {
      const spine = solveGripPose({ ...base, engagement })
      for (const p of spine.points) {
        expect(v.length(p)).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('holds a nail or knuckle engagement proud of the ball, flesh off the leather', () => {
    const pad = solveGripPose({ ...base, engagement: 'pad' })
    const nail = solveGripPose({ ...base, engagement: 'nail' })
    const knuckle = solveGripPose({ ...base, engagement: 'knuckle' })
    const minHeight = (s: typeof pad) => Math.min(...s.points.map((p) => v.length(p)))
    expect(minHeight(nail)).toBeGreaterThan(minHeight(pad))
    expect(minHeight(knuckle)).toBeGreaterThan(minHeight(pad))
  })

  it('orders surface hug by engagement depth: inside > pad > tip', () => {
    const inside = solveGripPose({ ...base, engagement: 'inside' })
    const pad = solveGripPose({ ...base, engagement: 'pad' })
    const tip = solveGripPose({ ...base, engagement: 'tip' })
    expect(inside.contactArc).toBeGreaterThan(pad.contactArc)
    expect(pad.contactArc).toBeGreaterThan(tip.contactArc)
  })

  it('mirrors a left hand across x', () => {
    const right = solveGripPose(base, { handedness: 'right' })
    const left = solveGripPose(base, { handedness: 'left' })
    expect(left.contact.x).toBeCloseTo(-right.contact.x, 9)
    expect(left.contact.y).toBeCloseTo(right.contact.y, 9)
    expect(left.contact.z).toBeCloseTo(right.contact.z, 9)
    left.points.forEach((p, i) => {
      expect(p.x).toBeCloseTo(-right.points[i].x, 9)
    })
  })

  it('projects the spine into schematic space with front/back flags', () => {
    const spine = solveGripPose(base)
    const projected = projectSpine(spine, 120, 120, 86)
    expect(projected.points).toHaveLength(spine.points.length)
    expect(projected.strokeWidth).toBeGreaterThan(0)
    for (const p of projected.points) {
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
      expect(typeof p.front).toBe('boolean')
    }
  })
})

/*
  The hand. The per-contact solver above is the leather side of the grip and
  these tests must never let it move; what solveHand owns is everything behind
  the contact, which used to be five independent tubes walking off into space.
  Every filed pitch is run through it, because the failure the old solve had —
  a splitter's fingers ending nearly three ball radii apart — only showed up on
  the pitches with the widest spread.
*/
describe('solveHand', () => {
  const filed = PITCHES.filter((p) => p.canonical.gripModel.status === 'filed')

  it('has filed grips to solve', () => {
    expect(filed.length).toBeGreaterThan(5)
  })

  it('leaves every authored contact exactly where the per-contact solver put it', () => {
    for (const entry of filed) {
      const contacts = entry.canonical.gripModel.contacts
      const hand = solveHand(contacts)
      hand.fingers.forEach((f, i) => {
        const alone = solveGripPose(contacts[i])
        // component-wise: acos amplifies float noise to ~1e-8 on identical vectors
        expect(v.length(v.sub(f.contact, alone.contact))).toBeLessThan(1e-12)
        expect(v.length(v.sub(f.contactNormal, alone.contactNormal))).toBeLessThan(1e-12)
        expect(v.length(v.sub(f.spineDir, alone.spineDir))).toBeLessThan(1e-12)
        expect(f.contactArc).toBeCloseTo(alone.contactArc, 12)
      })
    }
  })

  it('roots every lead finger on its own knuckle, and the thumb on the hand', () => {
    for (const entry of filed) {
      const contacts = entry.canonical.gripModel.contacts
      const hand = solveHand(contacts)
      hand.fingers.forEach((f, i) => {
        const root = f.points[f.points.length - 1]
        const knuckle = hand.knuckles.find((k) => k.finger === contacts[i].finger)
        const target = knuckle ? knuckle.position : hand.thumbRoot
        expect(target).toBeDefined()
        expect(v.length(v.sub(root, target!))).toBeLessThan(1e-9)
      })
    }
  })

  it('converges the fingers instead of letting them walk off the ball', () => {
    for (const entry of filed) {
      const contacts = entry.canonical.gripModel.contacts
      const lead = contacts.filter((c) => c.finger !== 'thumb')
      if (lead.length < 2) continue
      const hand = solveHand(contacts)
      const roots = hand.fingers
        .map((f, i) => ({ finger: contacts[i].finger, root: f.points[f.points.length - 1] }))
        .filter((r) => r.finger !== 'thumb')
      for (let i = 0; i < roots.length; i++) {
        for (let j = i + 1; j < roots.length; j++) {
          const gap = v.length(v.sub(roots[i].root, roots[j].root))
          // knuckles are a hand's width apart at most — never a ball's width
          expect(gap).toBeLessThan(2)
          expect(gap).toBeGreaterThan(0.1)
        }
      }
    }
  })

  it('keeps every rendered part of the hand out of the leather', () => {
    for (const entry of filed) {
      const contacts = entry.canonical.gripModel.contacts
      for (const handedness of ['right', 'left'] as const) {
        const hand = solveHand(contacts, { handedness })
        const all = [
          ...hand.fingers.flatMap((f) => f.points),
          ...hand.knuckles.map((k) => k.position),
          ...hand.palm.outline,
        ]
        for (const p of all) expect(v.length(p)).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('holds the palm off the ball so the palm-gap cue stays true', () => {
    for (const entry of filed) {
      const hand = solveHand(entry.canonical.gripModel.contacts)
      // the palm's inner face is the closest the hand ever comes to the cover:
      // each section, dropped by its own half-thickness toward the leather
      for (const s of hand.palm.sections) {
        const inner = v.add(
          v.add(hand.palm.origin, v.scale(hand.palm.wrist, s.y)),
          v.scale(hand.palm.out, s.cup - s.halfThickness),
        )
        expect(v.length(inner)).toBeGreaterThan(1)
      }
    }
  })

  it('spaces the knuckles index to pinky along the palm, in that order', () => {
    for (const entry of filed) {
      const hand = solveHand(entry.canonical.gripModel.contacts)
      expect(hand.knuckles.map((k) => k.finger)).toEqual(['index', 'middle', 'ring', 'pinky'])
      const along = hand.knuckles.map((k) => v.dot(k.position, hand.palm.across))
      for (let i = 1; i < along.length; i++) expect(along[i]).toBeGreaterThan(along[i - 1])
    }
  })

  it('spans a whole hand even when only two fingers are on the ball', () => {
    const fourSeam = filed.find((p) => p.display.slug === 'four-seam')!
    const hand = solveHand(fourSeam.canonical.gripModel.contacts)
    // a four-seam is held with index and middle; ring and pinky are closed, and
    // the palm covers them rather than drawing them as loose curled digits
    expect(hand.knuckles.filter((k) => k.engaged).map((k) => k.finger)).toEqual(['index', 'middle'])
    const span = Math.max(...hand.palm.sections.map((s) => s.halfWidth))
    const reach = Math.max(...hand.knuckles.map((k) => Math.abs(v.dot(k.position, hand.palm.across))))
    expect(span).toBeGreaterThan(reach)
    // and the drawn fingers are still only the authored contacts
    expect(hand.fingers).toHaveLength(fourSeam.canonical.gripModel.contacts.length)
  })

  it('mirrors the whole hand for a left-handed pitcher, not just the fingers', () => {
    const contacts = filed[0].canonical.gripModel.contacts
    const right = solveHand(contacts, { handedness: 'right' })
    const left = solveHand(contacts, { handedness: 'left' })
    left.knuckles.forEach((k, i) => {
      expect(k.position.x).toBeCloseTo(-right.knuckles[i].position.x, 9)
      expect(k.position.y).toBeCloseTo(right.knuckles[i].position.y, 9)
    })
    expect(left.palm.origin.x).toBeCloseTo(-right.palm.origin.x, 9)
    left.fingers.forEach((f, i) => {
      f.points.forEach((p, j) => expect(p.x).toBeCloseTo(-right.fingers[i].points[j].x, 9))
    })
  })

  it('only offers a thumb root when a thumb is authored', () => {
    const withThumb = filed[0].canonical.gripModel.contacts
    expect(solveHand(withThumb).thumbRoot).toBeDefined()
    const noThumb = withThumb.filter((c) => c.finger !== 'thumb')
    expect(solveHand(noThumb).thumbRoot).toBeUndefined()
  })

  it('projects the whole hand — fingers and palm — for the schematic', () => {
    const entry = filed[0]
    const contacts = entry.canonical.gripModel.contacts
    const hand = solveHand(contacts)
    const projected = projectHand(hand, contacts.map((c) => c.label), 120, 120, 86)
    expect(projected.fingers.map((f) => f.label)).toEqual(contacts.map((c) => c.label))
    expect(projected.palm.outline).toHaveLength(hand.palm.outline.length)
    expect(typeof projected.palm.front).toBe('boolean')
    for (const p of projected.palm.outline) {
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
    }
  })
})
