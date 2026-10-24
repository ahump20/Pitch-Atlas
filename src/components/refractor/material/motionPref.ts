import { useSyncExternalStore } from 'react'

/*
  The visitor's own answer to ambient card motion, kept on the device. One small
  store, no React state: the ambient driver reads it directly and the Pause control
  subscribes. Never touches a pitch record.
*/
export type MotionPref = 'live' | 'paused'

export const MOTION_PREF_KEY = 'pa:card-motion'

const listeners = new Set<() => void>()
let cached: MotionPref | null = null

function read(): MotionPref {
  if (cached) return cached
  try {
    cached = window.localStorage.getItem(MOTION_PREF_KEY) === 'paused' ? 'paused' : 'live'
  } catch {
    cached = 'live'
  }
  return cached
}

export function getMotionPref(): MotionPref {
  if (typeof window === 'undefined') return 'live'
  return read()
}

export function setMotionPref(next: MotionPref): void {
  cached = next
  try {
    window.localStorage.setItem(MOTION_PREF_KEY, next)
  } catch {
    /* private mode: the session still honours the choice */
  }
  listeners.forEach((fn) => fn())
}

export function subscribeMotionPref(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function useMotionPref(): MotionPref {
  return useSyncExternalStore(subscribeMotionPref, getMotionPref, () => 'live')
}
