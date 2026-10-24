import { useEffect, useRef, useState } from 'react'

/**
 * The element's content-box size in CSS pixels, so a drawing can lay itself out
 * in real pixels (and keep its text at a real 12px). Until the element is
 * measured (the prerender, jsdom, the first paint) it reports `fallback`.
 */
export function useElementSize<T extends HTMLElement>(fallback: { width: number; height: number }) {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState(fallback)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (!box || box.width < 1 || box.height < 1) return
      setSize((prev) =>
        Math.abs(prev.width - box.width) < 0.5 && Math.abs(prev.height - box.height) < 0.5
          ? prev
          : { width: box.width, height: box.height },
      )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
