import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { quotePool, type AtlasQuote } from '../data/quotes'
import { useReducedMotion } from './useReducedMotion'

// Built once at module load. Deterministic order (no Date, no random here) so the
// prerender is stable.
const POOL: AtlasQuote[] = quotePool()

// A small stable hash of the path, so each page gets its own line, prerendered
// correctly with no hydration flash.
function hashPath(path: string): number {
  let h = 0
  for (let i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * A quote from the pool, rotating subtly. The line is DERIVED during render from
 * the route (a stable per-page pick that prerenders cleanly), plus a tick that
 * advances on a slow timer so it also rotates over time. setState happens only in
 * the timer callback, never synchronously in the effect, and the timer is gated
 * off under reduced motion, leaving a stable per-page quote.
 */
export function useRotatingQuote(): AtlasQuote {
  const { pathname } = useLocation()
  const reduced = useReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduced || POOL.length <= 1) return
    const id = window.setInterval(() => setTick((t) => t + 1), 13000)
    return () => window.clearInterval(id)
  }, [reduced])

  return POOL[(hashPath(pathname) + tick) % POOL.length]
}
