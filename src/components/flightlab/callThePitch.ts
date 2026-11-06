import { useCallback, useSyncExternalStore } from 'react'
import { EXAMPLE_LOBS } from '../../data/softball'
import type { PitchKind } from '../../lib/slowpitch'
import type { LobKey } from './model'

/*
  Call the pitch: the lab deals a pitch you can't see the name of, throws it,
  and you call it two ways, the way a hitter has to: what spin it is, read off
  the seams, and whether to swing or take. Swing is right only on "Your pitch";
  every other ball, strike or illegal arc is a take.

  Pure rules plus one small store. The deal takes its dice as an argument, so a
  test can stack the deck.
*/

/** The pitches a deal can be: the arsenal, not the plain lob. */
export const CALLABLE: readonly Exclude<PitchKind, 'lob'>[] = ['knuckler', 'backspin', 'topspin', 'sidespin']

export type SwingCall = 'swing' | 'take'

export interface Deal {
  /** Increments every deal, so each one throws. */
  n: number
  pitch: Exclude<PitchKind, 'lob'>
  lob: LobKey
  /** Where a knuckler's seams start, radians. */
  seam: number
}

export interface Calls {
  spin?: PitchKind
  /** True when the spin was called with the ball still in the air. */
  early?: boolean
  swing?: SwingCall
}

export interface Score {
  points: number
  streak: number
  best: number
  dealt: number
}

export const NEW_SCORE: Score = { points: 0, streak: 0, best: 0, dealt: 0 }

const FULL_TURN = Math.PI * 2
/** Points for a right spin call, read on the way in or after it lands. */
const SPIN_POINTS = { early: 2, late: 1 } as const
/** No streak runs this long; anything stored past it is junk. */
const STREAK_CAP = 10000

/** Deal the next pitch: any of the arsenal, onto any of the six spots. */
export function deal(n: number, roll: () => number = Math.random): Deal {
  const pitch = CALLABLE[Math.min(CALLABLE.length - 1, Math.floor(roll() * CALLABLE.length))]
  const lob = EXAMPLE_LOBS[Math.min(EXAMPLE_LOBS.length - 1, Math.floor(roll() * EXAMPLE_LOBS.length))].key
  return { n, pitch, lob, seam: roll() * FULL_TURN }
}

export interface Judged {
  spinRight: boolean
  swingRight: boolean
  /** Swing is right on "Your pitch" only. */
  shouldSwing: boolean
  points: number
}

/** Mark both calls against the truth. A spin read in the air counts double. */
export function judgeCalls(d: Deal, calls: Required<Pick<Calls, 'spin' | 'swing'>> & Pick<Calls, 'early'>, yourPitch: boolean): Judged {
  const spinRight = calls.spin === d.pitch
  const swingRight = (calls.swing === 'swing') === yourPitch
  const spinPoints = calls.early ? SPIN_POINTS.early : SPIN_POINTS.late
  const points = (spinRight ? spinPoints : 0) + (swingRight ? 1 : 0)
  return { spinRight, swingRight, shouldSwing: yourPitch, points }
}

/** Fold one judged pitch into the running score: the streak needs both calls right. */
export function addToScore(s: Score, j: Judged): Score {
  const streak = j.spinRight && j.swingRight ? s.streak + 1 : 0
  return { points: s.points + j.points, streak, best: Math.max(s.best, streak), dealt: s.dealt + 1 }
}

/* ── the best streak, kept in this browser ─────────────────────────────── */

const STORAGE_KEY = 'pa-flight-lab:call:v1'

export function parseBest(raw: string | null): number {
  const n = Number(raw)
  return Number.isInteger(n) && n >= 0 && n < STREAK_CAP ? n : 0
}

let bestCache: number | null = null
const listeners = new Set<() => void>()

function readBest(): number {
  if (bestCache !== null) return bestCache
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    raw = null
  }
  bestCache = parseBest(raw)
  return bestCache
}

function writeBest(n: number) {
  bestCache = n
  try {
    window.localStorage.setItem(STORAGE_KEY, String(n))
  } catch {
    // A convenience only; the game keeps the streak in memory.
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** The visitor's best streak, and a setter that only ever raises it. */
export function useBestStreak(): [number, (streak: number) => void] {
  const best = useSyncExternalStore(subscribe, readBest, () => 0)
  const raise = useCallback((streak: number) => {
    if (streak > readBest()) writeBest(streak)
  }, [])
  return [best, raise]
}

/** Test seam: forget the in-memory best so the next read goes back to storage. */
export function resetBestCache() {
  bestCache = null
}
