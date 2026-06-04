import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an element is on screen, so the 3D scene can pause its render
 * loop when scrolled away. Defaults to in-view so content shows before the
 * observer attaches.
 */
export function useInView<T extends HTMLElement>(rootMargin = '160px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) setInView(entry.isIntersecting)
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
