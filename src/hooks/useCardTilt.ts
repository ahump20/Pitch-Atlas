import { useEffect, useMemo } from 'react'
import type React from 'react'

/*
  The card answers the hand with mass. Successor to useRefractorTilt: same CSS
  contract (writes --rx/--ry tilt and --mx/--my light position on the card
  element; rest pose 0deg/0deg/50%/32%) so every existing .rfx-* rule keeps
  working, but the values now move through a slightly underdamped spring — the
  card lands most of its travel inside a quarter second with one soft
  overshoot, which is what reads as a physical object instead of a transition.

  Beyond the CSS vars, the engine publishes a frame-rate tilt store the WebGL
  foil layer subscribes to without React re-renders. The spring loop runs only
  while the pointer is engaged or the spring is unsettled; at rest there is no
  rAF, no GPU, no work at all.

  Touch: horizontal drag drives the tilt (the reference video's gesture — the
  card rocking side to side while the light runs across the foil). The card
  keeps `touch-action: pan-y`, so vertical swipes scroll the page normally and
  a vertical scroll cancels the drag cleanly. A real drag suppresses the
  click-through so letting go of a tilted card never accidentally navigates.

  Reduced motion: every handler no-ops and the card holds its rest pose.

  The engine itself is a plain closure (no hook state, no re-renders) so the
  rAF loop can reference itself without fighting React's rules; the hook is a
  thin lifetime wrapper around it.
*/

export interface TiltState {
  /** tilt around Y/X in degrees (the CSS --rx/--ry pair) */
  rx: number
  ry: number
  /** light position in percent (the CSS --mx/--my pair) */
  mx: number
  my: number
}

export interface TiltStore {
  get(): TiltState
  subscribe(fn: () => void): () => void
}

const REST: TiltState = { rx: 0, ry: 0, mx: 50, my: 32 }
const HOVER_MAX = 10
const DRAG_MAX = 14
/* spring tuning: ω = 20 rad/s, ζ = 0.7 — most of the travel lands inside a
   quarter second with one soft overshoot (~1% of the step) */
const OMEGA = 20
const ZETA = 0.7

/** One damped-spring integration step. Pure, exported for tests. */
export function stepSpring(value: number, velocity: number, target: number, dt: number): [number, number] {
  const a = OMEGA * OMEGA * (target - value) - 2 * ZETA * OMEGA * velocity
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
  dispose(): void
}

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function createTiltEngine(): TiltEngine {
  const ref: { current: HTMLElement | null } = { current: null }
  const state: TiltState = { ...REST }
  const vel = { rx: 0, ry: 0 }
  let target: TiltState = { ...REST }
  let engaged = false
  let dragging: { x: number; y: number; moved: boolean } | null = null
  // set at pointer-up when the gesture was a real drag; consumed by the click
  // that the browser fires next. Kept separate from `dragging` because tick()
  // and dragMove() branch on `dragging`, so it cannot linger past settleHome().
  let suppressClick = false
  let raf = 0
  let lastT = 0
  const listeners = new Set<() => void>()

  const store: TiltStore = {
    get: () => state,
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
  }

  function apply() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', `${state.rx.toFixed(3)}deg`)
    el.style.setProperty('--ry', `${state.ry.toFixed(3)}deg`)
    el.style.setProperty('--mx', `${state.mx.toFixed(2)}%`)
    el.style.setProperty('--my', `${state.my.toFixed(2)}%`)
    listeners.forEach((fn) => fn())
  }

  function settled(): boolean {
    return (
      Math.abs(state.rx - target.rx) < 0.01 &&
      Math.abs(state.ry - target.ry) < 0.01 &&
      Math.abs(vel.rx) < 0.01 &&
      Math.abs(vel.ry) < 0.01
    )
  }

  function tick(now: number) {
    const dt = Math.min(0.032, (now - lastT) / 1000 || 0.016)
    lastT = now
    ;[state.rx, vel.rx] = stepSpring(state.rx, vel.rx, target.rx, dt)
    ;[state.ry, vel.ry] = stepSpring(state.ry, vel.ry, target.ry, dt)
    // the light tracks the spring, not the pointer, so it carries the same mass
    const light = engaged && !dragging ? target : lightFromTilt(state.rx, state.ry)
    state.mx += (light.mx - state.mx) * Math.min(1, dt * 18)
    state.my += (light.my - state.my) * Math.min(1, dt * 18)
    apply()
    if (engaged || !settled()) {
      raf = requestAnimationFrame(tick)
    } else {
      Object.assign(state, target)
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
    target = { ...REST }
    wake()
  }

  /* desktop hover: the target follows the pointer over the card */
  function hoverMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current
    if (!el || reducedMotion()) return
    const b = el.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width
    const py = (e.clientY - b.top) / b.height
    engaged = true
    target = {
      rx: clamp((px - 0.5) * HOVER_MAX * 2, HOVER_MAX),
      ry: clamp((0.5 - py) * HOVER_MAX * 2, HOVER_MAX),
      mx: px * 100,
      my: py * 100,
    }
    wake()
  }

  /* touch: a horizontal drag rocks the card (vertical stays the page's scroll) */
  function dragMove(e: React.PointerEvent<HTMLElement>) {
    const el = ref.current
    if (!dragging || !el) return
    const dx = e.clientX - dragging.x
    if (Math.abs(dx) > 8) dragging.moved = true
    const w = el.getBoundingClientRect().width || 1
    const rx = clamp((dx / w) * DRAG_MAX * 2.4, DRAG_MAX)
    const ry = clamp(rx * -0.22, DRAG_MAX)
    target = { rx, ry, ...lightFromTilt(rx, ry) }
    wake()
  }

  const handlers: TiltEngine['handlers'] = {
    onPointerMove: (e) => {
      if (dragging) dragMove(e)
      else if (e.pointerType === 'mouse') hoverMove(e)
    },
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' || reducedMotion()) return
      dragging = { x: e.clientX, y: e.clientY, moved: false }
      engaged = true
    },
    onPointerUp: () => {
      // capture the verdict before settleHome() nulls `dragging`, or the click
      // that follows always reads null and the drag navigates through
      if (dragging?.moved) suppressClick = true
      settleHome()
    },
    onPointerCancel: settleHome,
    onPointerLeave: settleHome,
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
    dispose: () => {
      cancelAnimationFrame(raf)
      raf = 0
      listeners.clear()
    },
  }
}

export function useCardTilt<T extends HTMLElement = HTMLElement>() {
  const engine = useMemo(() => createTiltEngine(), [])
  useEffect(() => () => engine.dispose(), [engine])
  return {
    ref: engine.ref as { current: T | null },
    handlers: engine.handlers,
    store: engine.store,
  }
}
