import { useEffect, useMemo } from 'react'
import type React from 'react'

/*
  The card answers the hand with mass. Same CSS contract as before (writes --rx/--ry
  tilt and --mx/--my light position on the card element; rest pose 0deg/0deg/50%/32%)
  so every .rfx-* rule keeps working, but the values move through a slightly
  underdamped spring — the card lands most of its travel inside a quarter second with
  one soft overshoot, which is what reads as a physical object instead of a transition.

  Beyond the CSS vars, the engine publishes a frame-rate tilt store the material layer
  subscribes to without React re-renders. The spring loop runs only while the pointer
  is engaged, the ambient driver is pushing, or the spring is unsettled; at rest there
  is no rAF, no GPU, no work at all.

  Three modes. `rest` and `hero` (the cards on the page): mouse hover tilts to ±12°,
  a horizontal touch drag rocks the card to ±14° (vertical swipes stay the page's
  scroll, `touch-action: pan-y`), and a real drag suppresses the click-through so
  letting go of a tilted card never navigates. `inspector`: any pointer grabs the card
  on both axes to ±28°, the spring is softer so a flick glides home with inertia.

  `drive()` is how the ambient driver turns the hero: it sets the target the way a
  pointer would, yields the moment a real pointer engages, and the spring keeps the
  hand-off continuous. Reduced motion: every handler no-ops and the card holds rest.

  The engine itself is a plain closure (no hook state, no re-renders) so the rAF loop
  can reference itself without fighting React's rules; the hook is a thin lifetime
  wrapper around it.
*/

export type TiltSource = 'rest' | 'pointer' | 'ambient'
export type TiltMode = 'rest' | 'hero' | 'inspector'

export interface TiltState {
  /** tilt around Y/X in degrees (the CSS --rx/--ry pair) */
  rx: number
  ry: number
  /** light position in percent (the CSS --mx/--my pair) */
  mx: number
  my: number
  /** key light height above the card, in card widths */
  lightHeight: number
  /** key light strength, 0..2 */
  lightStrength: number
  /** who last moved the card */
  source: TiltSource
}

export interface TiltStore {
  get(): TiltState
  subscribe(fn: () => void): () => void
  /** ask the subscribers for one more frame (a material change, nothing moved) */
  nudge(): void
}

const REST = { rx: 0, ry: 0, mx: 50, my: 32 }
const HOVER_MAX = 12
const DRAG_MAX = 14
const INSPECTOR_HOVER_MAX = 16
const INSPECTOR_DRAG_MAX = 28
/* spring tuning: ω = 20 rad/s, ζ = 0.7 — most of the travel lands inside a
   quarter second with one soft overshoot (~1% of the step) */
const OMEGA = 20
const ZETA = 0.7
/* the inspector's heavier card: a flick glides home instead of snapping */
const INSPECTOR_OMEGA = 11
const INSPECTOR_ZETA = 0.62

/** One damped-spring integration step. Pure, exported for tests. */
export function stepSpring(
  value: number,
  velocity: number,
  target: number,
  dt: number,
  omega = OMEGA,
  zeta = ZETA,
): [number, number] {
  const a = omega * omega * (target - value) - 2 * zeta * omega * velocity
  const v = velocity + a * dt
  return [value + v * dt, v]
}

export function clamp(v: number, max: number): number {
  return Math.min(max, Math.max(-max, v))
}

/** The light position is a function of the tilt: tip the card, the band moves. */
export function lightFromTilt(rx: number, ry: number): { mx: number; my: number } {
  return { mx: 50 + (rx / DRAG_MAX) * 42, my: 32 + (ry / DRAG_MAX) * 30 }
}

type PointerHandler = (e: React.PointerEvent<HTMLElement>) => void

export interface TiltEngine {
  ref: { current: HTMLElement | null }
  store: TiltStore
  handlers: {
    onPointerMove: PointerHandler
    onPointerDown: PointerHandler
    onPointerUp: PointerHandler
    onPointerCancel: PointerHandler
    onPointerLeave: PointerHandler
    onClickCapture: (e: React.MouseEvent<HTMLElement>) => void
  }
  /** the ambient driver's hand: ignored while a real pointer is engaged */
  drive(rx: number, ry: number, mx: number, my: number): boolean
  isEngaged(): boolean
  /** milliseconds since the last real pointer interaction */
  idleMs(): number
  setLight(light: { height?: number; strength?: number }): void
  setMode(mode: TiltMode): void
  /** spring home */
  reset(): void
  dispose(): void
}

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function createTiltEngine(initialMode: TiltMode = 'rest'): TiltEngine {
  const ref: { current: HTMLElement | null } = { current: null }
  const state: TiltState = { ...REST, lightHeight: 1.1, lightStrength: 1, source: 'rest' }
  const vel = { rx: 0, ry: 0 }
  let mode: TiltMode = initialMode
  let target: { rx: number; ry: number; mx: number; my: number; source: TiltSource } = { ...REST, source: 'rest' }
  let engaged = false
  let dragging: { x: number; y: number; moved: boolean; pointerId: number } | null = null
  // set at pointer-up when the gesture was a real drag; consumed by the click
  // that the browser fires next. Kept separate from `dragging` because tick()
  // and dragMove() branch on `dragging`, so it cannot linger past settleHome().
  let suppressClick = false
  let lastInteraction = -Infinity
  let raf = 0
  let lastT = 0
  const listeners = new Set<() => void>()

  const store: TiltStore = {
    get: () => state,
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    nudge: () => listeners.forEach((fn) => fn()),
  }

  const limits = () =>
    mode === 'inspector'
      ? { hover: INSPECTOR_HOVER_MAX, drag: INSPECTOR_DRAG_MAX, omega: INSPECTOR_OMEGA, zeta: INSPECTOR_ZETA }
      : { hover: HOVER_MAX, drag: DRAG_MAX, omega: OMEGA, zeta: ZETA }

  function apply() {
    const el = ref.current
    if (el) {
      el.style.setProperty('--rx', `${state.rx.toFixed(3)}deg`)
      el.style.setProperty('--ry', `${state.ry.toFixed(3)}deg`)
      el.style.setProperty('--mx', `${state.mx.toFixed(2)}%`)
      el.style.setProperty('--my', `${state.my.toFixed(2)}%`)
    }
    listeners.forEach((fn) => fn())
  }

  function settled(): boolean {
    return (
      Math.abs(state.rx - target.rx) < 0.01 &&
      Math.abs(state.ry - target.ry) < 0.01 &&
      Math.abs(vel.rx) < 0.01 &&
      Math.abs(vel.ry) < 0.01 &&
      Math.abs(state.mx - target.mx) < 0.05 &&
      Math.abs(state.my - target.my) < 0.05
    )
  }

  function tick(now: number) {
    const dt = Math.min(0.032, (now - lastT) / 1000 || 0.016)
    lastT = now
    const { omega, zeta } = limits()
    ;[state.rx, vel.rx] = stepSpring(state.rx, vel.rx, target.rx, dt, omega, zeta)
    ;[state.ry, vel.ry] = stepSpring(state.ry, vel.ry, target.ry, dt, omega, zeta)
    // the light tracks the spring, not the pointer, so it carries the same mass;
    // a hovering pointer and the ambient driver place it directly
    const light = (engaged && !dragging) || target.source === 'ambient' ? target : lightFromTilt(state.rx, state.ry)
    state.mx += (light.mx - state.mx) * Math.min(1, dt * 18)
    state.my += (light.my - state.my) * Math.min(1, dt * 18)
    state.source = target.source
    apply()
    if (engaged || !settled()) {
      raf = requestAnimationFrame(tick)
    } else {
      state.rx = target.rx
      state.ry = target.ry
      state.mx = target.mx
      state.my = target.my
      apply()
      ref.current?.classList.remove('is-live-tilt')
      raf = 0
    }
  }

  function wake() {
    if (raf) return
    lastT = performance.now()
    ref.current?.classList.add('is-live-tilt')
    raf = requestAnimationFrame(tick)
  }

  function settleHome() {
    engaged = false
    dragging = null
    target = { ...REST, source: 'rest' }
    lastInteraction = performance.now()
    wake()
  }

  /* desktop hover: the target follows the pointer over the card */
  function hoverMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current
    if (!el || reducedMotion()) return
    const b = el.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width
    const py = (e.clientY - b.top) / b.height
    const max = limits().hover
    engaged = true
    lastInteraction = performance.now()
    target = {
      rx: clamp((px - 0.5) * max * 2, max),
      ry: clamp((0.5 - py) * max * 2, max),
      mx: px * 100,
      my: py * 100,
      source: 'pointer',
    }
    wake()
  }

  /* touch: a horizontal drag rocks the card (vertical stays the page's scroll);
     in the inspector any pointer grabs it on both axes */
  function dragMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current
    if (!dragging || !el) return
    const dx = e.clientX - dragging.x
    const dy = e.clientY - dragging.y
    if (Math.abs(dx) > 8 || (mode === 'inspector' && Math.abs(dy) > 8)) dragging.moved = true
    const b = el.getBoundingClientRect()
    const w = b.width || 1
    const h = b.height || 1
    const max = limits().drag
    const rx = clamp((dx / w) * max * 2.4, max)
    const ry = mode === 'inspector' ? clamp((-dy / h) * max * 2.4, max) : clamp(rx * -0.22, max)
    lastInteraction = performance.now()
    target = { rx, ry, ...lightFromTilt(rx, ry), source: 'pointer' }
    wake()
  }

  const handlers: TiltEngine['handlers'] = {
    onPointerMove: (e) => {
      if (dragging) dragMove(e)
      else if (e.pointerType === 'mouse') hoverMove(e)
    },
    onPointerDown: (e) => {
      if (reducedMotion()) return
      if (e.pointerType === 'mouse' && mode !== 'inspector') return
      dragging = { x: e.clientX, y: e.clientY, moved: false, pointerId: e.pointerId }
      engaged = true
      lastInteraction = performance.now()
      if (mode === 'inspector') {
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {
          /* pointer capture is a nicety */
        }
      }
    },
    onPointerUp: () => {
      // capture the verdict before settleHome() nulls `dragging`, or the click
      // that follows always reads null and the drag navigates through
      if (dragging?.moved) suppressClick = true
      settleHome()
    },
    onPointerCancel: settleHome,
    onPointerLeave: () => {
      // in the inspector a captured drag continues past the card's edge
      if (dragging && mode === 'inspector') return
      settleHome()
    },
    /* a real drag must not navigate when the finger lifts. The flag is set only
       at pointer-up, so a stray pointerleave/cancel never suppresses a later
       legitimate click. */
    onClickCapture: (e) => {
      if (suppressClick) {
        e.preventDefault()
        e.stopPropagation()
      }
      suppressClick = false
    },
  }

  return {
    ref,
    store,
    handlers,
    drive(rx, ry, mx, my) {
      if (engaged || dragging || reducedMotion()) return false
      target = { rx, ry, mx, my, source: 'ambient' }
      wake()
      return true
    },
    isEngaged: () => engaged || dragging !== null,
    idleMs: () => performance.now() - lastInteraction,
    setLight({ height, strength }) {
      if (height !== undefined) state.lightHeight = height
      if (strength !== undefined) state.lightStrength = strength
      apply()
    },
    setMode(next) {
      mode = next
    },
    reset: () => {
      if (engaged || dragging) return
      target = { ...REST, source: 'rest' }
      wake()
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      raf = 0
      listeners.clear()
    },
  }
}

export function useCardTilt<T extends HTMLElement = HTMLElement>(mode: TiltMode = 'rest') {
  const engine = useMemo(() => createTiltEngine(mode), [mode])
  useEffect(() => () => engine.dispose(), [engine])
  return {
    ref: engine.ref as { current: T | null },
    handlers: engine.handlers,
    store: engine.store,
    engine,
  }
}
