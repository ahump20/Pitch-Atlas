import { useCallback, useRef } from 'react'

/*
  Pointer-tracked 3D tilt + foil sweep for a refractor card, ported from the
  prototype. Writes --rx/--ry (tilt) and --mx/--my (foil position) onto the card
  element on pointer move, rAF-throttled. No-ops under prefers-reduced-motion and
  resets cleanly on leave. The element it returns the ref for is the .rfx-card.
*/
export function useRefractorTilt<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)
  const raf = useRef(0)

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const b = el.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width
    const py = (e.clientY - b.top) / b.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const m = 9
      el.style.setProperty('--rx', `${(px - 0.5) * m * 2}deg`)
      el.style.setProperty('--ry', `${(0.5 - py) * m * 2}deg`)
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
    })
  }, [])

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '32%')
  }, [])

  return { ref, onPointerMove, onPointerLeave }
}
