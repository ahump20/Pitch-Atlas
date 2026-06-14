import { describe, it, expect } from 'vitest'
import type React from 'react'
import { stepSpring, clamp, lightFromTilt, createTiltEngine } from './useCardTilt'
import { backingSize, hexToTriple, DPR_CAP } from '../components/refractor/foil/foilProgram'

/*
  The foil card's physics and packing math, tested as pure functions — no GL
  mocking, no fake canvas. GL correctness is covered by SpecimenBoundary at
  runtime plus the live verification protocol.
*/

describe('stepSpring', () => {
  it('converges onto the target and stays there', () => {
    let v = 0
    let x = 0
    for (let i = 0; i < 120; i++) [x, v] = stepSpring(x, v, 10, 1 / 60)
    expect(Math.abs(x - 10)).toBeLessThan(0.01)
    expect(Math.abs(v)).toBeLessThan(0.01)
  })

  it('returns home after release', () => {
    let v = 0
    let x = 14 // released at full drag tilt
    for (let i = 0; i < 120; i++) [x, v] = stepSpring(x, v, 0, 1 / 60)
    expect(Math.abs(x)).toBeLessThan(0.01)
  })

  it('underdamps slightly: one soft overshoot, never a wild ring', () => {
    let v = 0
    let x = 0
    let overshoot = 0
    for (let i = 0; i < 240; i++) {
      ;[x, v] = stepSpring(x, v, 10, 1 / 60)
      overshoot = Math.max(overshoot, x - 10)
    }
    expect(overshoot).toBeGreaterThan(0) // it does breathe past the target
    expect(overshoot).toBeLessThan(1.2) // but it reads as mass, not wobble
  })

  it('settles within about a quarter second', () => {
    let v = 0
    let x = 0
    let frames = 0
    for (let i = 0; i < 300; i++) {
      ;[x, v] = stepSpring(x, v, 10, 1 / 60)
      frames++
      if (Math.abs(x - 10) < 0.05 && Math.abs(v) < 0.05) break
    }
    expect(frames / 60).toBeLessThan(0.5)
  })
})

describe('createTiltEngine: touch-drag click suppression', () => {
  const touch = (x: number) =>
    ({ clientX: x, clientY: 0, pointerType: 'touch' }) as unknown as React.PointerEvent<HTMLElement>
  const clickEvent = () => {
    let prevented = false
    return {
      evt: { preventDefault: () => { prevented = true }, stopPropagation: () => {} } as unknown as React.MouseEvent<HTMLElement>,
      get prevented() { return prevented },
    }
  }

  it('suppresses the click that follows a real drag, and lets a plain tap through', () => {
    const engine = createTiltEngine()
    engine.ref.current = document.createElement('div')
    const { handlers } = engine

    // a real drag: down, move past the 8px threshold, up
    handlers.onPointerDown(touch(100))
    handlers.onPointerMove(touch(140)) // dx = 40 -> moved
    handlers.onPointerUp(touch(140))
    const dragClick = clickEvent()
    handlers.onClickCapture(dragClick.evt)
    expect(dragClick.prevented).toBe(true)

    // a plain tap (no movement) on the same card must navigate normally
    handlers.onPointerDown(touch(100))
    handlers.onPointerUp(touch(100))
    const tapClick = clickEvent()
    handlers.onClickCapture(tapClick.evt)
    expect(tapClick.prevented).toBe(false)

    engine.dispose()
  })
})

describe('clamp', () => {
  it('caps both directions at the tilt limits', () => {
    expect(clamp(30, 10)).toBe(10)
    expect(clamp(-30, 10)).toBe(-10)
    expect(clamp(4, 10)).toBe(4)
  })
})

describe('lightFromTilt', () => {
  it('holds the rest pose at zero tilt (the legacy CSS contract)', () => {
    expect(lightFromTilt(0, 0)).toEqual({ mx: 50, my: 32 })
  })
  it('moves the band with the tilt, monotonically', () => {
    const left = lightFromTilt(-14, 0)
    const right = lightFromTilt(14, 0)
    expect(left.mx).toBeLessThan(50)
    expect(right.mx).toBeGreaterThan(50)
  })
})

describe('backingSize', () => {
  it('caps the device pixel ratio so a 3x phone never pays 3x fragments', () => {
    const [w] = backingSize(400, 560, 3)
    expect(w).toBe(Math.round(400 * DPR_CAP))
  })
  it('never collapses below one pixel', () => {
    expect(backingSize(0, 0, 1)).toEqual([1, 1])
  })
})

describe('hexToTriple', () => {
  it('parses the accent triad hexes', () => {
    expect(hexToTriple('#FF0000')).toEqual([1, 0, 0])
    const [r, g, b] = hexToTriple('#37D6FF')
    expect(r).toBeCloseTo(0x37 / 255)
    expect(g).toBeCloseTo(0xd6 / 255)
    expect(b).toBeCloseTo(1)
  })
  it('falls back to neutral on garbage instead of throwing', () => {
    expect(hexToTriple('not-a-color')).toEqual([0.5, 0.5, 0.5])
  })
})
