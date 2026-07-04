import { useEffect } from 'react'

/*
  The scene-tint driver. Watches every [data-scene-tint] section on the page
  and publishes the accent of the one crossing the viewport's middle band to
  --scene-tint on <html>, where the far stratum (.field-depth) breathes it in
  at single-digit opacity — the room following the chapter. IntersectionObserver
  only; nothing runs on scroll frames. Without IO support the property is never
  written and the stratum rests on its registered initial value.
*/
export function useSceneTint(): void {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const root = document.documentElement
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-tint]'))
    if (sections.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const tint = (entry.target as HTMLElement).dataset.sceneTint
          if (tint) root.style.setProperty('--scene-tint', tint)
        }
      },
      // the band around the viewport's center decides which chapter owns the room
      { rootMargin: '-42% 0px -42% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => {
      io.disconnect()
      root.style.removeProperty('--scene-tint')
    }
  }, [])
}
