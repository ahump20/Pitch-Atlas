import { useEffect, useRef } from 'react'
import type { TiltEngine } from '../../../hooks/useCardTilt'
import { useMotionPref } from './motionPref'

/*
  The hero's slow turn. A closed Lissajous drift in tilt (±3.5° / ±2.5°, periods of 11
  and 7⅓ seconds) with the key light drifting on its own slower clock, so the foil keeps
  walking without ever repeating exactly. The first time the card is on screen it gets
  one intro pass: the light sweeps left to right across the face while the tilt eases
  into the drift — the moment a collector tips a card toward the window.

  Everything yields to the hand: the loop idles while the pointer is on the card or a
  drag is live, and resumes a second and a half after it leaves. It also stops offscreen,
  in hidden tabs, under reduced motion, and when the visitor presses Pause. Thirty
  frames a second is plenty for a drift this slow; the spring smooths the rest.
*/

const TWO_PI = Math.PI * 2
const INTRO_MS = 1800
const IDLE_MS = 1500
const FRAME_MS = 1000 / 30

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)

/** The drift pose at time t (seconds). Pure, exported for tests. */
export function ambientPose(t: number): { rx: number; ry: number; mx: number; my: number } {
  const rx = 3.5 * Math.sin((TWO_PI * t) / 11)
  const ry = 2.5 * Math.sin((TWO_PI * t) / 7.333 + 1.1)
  return {
    rx,
    ry,
    mx: 50 + (rx / 14) * 42 + 12 * Math.cos((TWO_PI * t) / 17),
    my: 32 + (ry / 14) * 30 + 9 * Math.sin((TWO_PI * t) / 13),
  }
}

export function useAmbientMotion(
  engine: TiltEngine,
  { active, inView, reduced }: { active: boolean; inView: boolean; reduced: boolean },
) {
  const paused = useMotionPref() === 'paused'
  const introDone = useRef(false)

  useEffect(() => {
    if (!active || !inView || reduced || paused) {
      if (active) engine.reset()
      return
    }
    let raf = 0
    let last = 0
    const start = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (document.hidden || now - last < FRAME_MS) return
      last = now
      if (engine.isEngaged() || engine.idleMs() < IDLE_MS) return
      const t = (now - start) / 1000
      const pose = ambientPose(t)
      if (!introDone.current) {
        const k = (now - start) / INTRO_MS
        if (k >= 1) {
          introDone.current = true
        } else {
          const e = easeInOut(k)
          pose.rx *= e
          pose.ry = pose.ry * e + (1 - e) * -2
          pose.mx = -18 + 136 * e
          pose.my = 24 + 10 * e
        }
      }
      engine.drive(pose.rx, pose.ry, pose.mx, pose.my)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
    }
  }, [engine, active, inView, reduced, paused])
}
