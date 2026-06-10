import { useEffect, useRef } from 'react'
import type { TiltStore } from '../../../hooks/useCardTilt'
import type { RefractorAccent } from '../RefractorCard'
import { createFoilProgram, hexToTriple, type FoilProgram } from './foilProgram'

/*
  The live foil field — a canvas behind the card's DOM content running the
  houndstooth shader. Render-on-demand only: the layer subscribes to the tilt
  store and draws one frame per tilt update, so a resting card costs zero GPU
  and zero CPU. One extra frame fires on resize, visibility return, and context
  restore. On its first successful frame the layer marks the card `is-foil-live`,
  which fades the canvas in and mutes the CSS gradient stand-in so there is
  never double glare. Any GL failure just leaves the CSS card standing.
*/
export default function FoilLayer({
  store,
  accent,
  gold,
}: {
  store: TiltStore
  accent: RefractorAccent
  gold: boolean
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    let prog: FoilProgram
    try {
      prog = createFoilProgram(canvas)
    } catch {
      return // no GL — the CSS card is already painted underneath
    }

    const card = canvas.closest('.rfx-card')
    const c2 = hexToTriple(accent.c2)
    const c3 = hexToTriple(accent.c3)

    let raf = 0
    let scheduled = false
    const draw = () => {
      scheduled = false
      raf = 0
      prog.render({ tilt: store.get(), c2, c3, gold })
      card?.classList.add('is-foil-live')
    }
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      raf = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver((entries) => {
      const e = entries[0]
      if (!e) return
      prog.resize(e.contentRect.width, e.contentRect.height, window.devicePixelRatio || 1)
      schedule()
    })
    ro.observe(canvas)

    const onVisible = () => {
      if (!document.hidden) schedule()
    }
    document.addEventListener('visibilitychange', onVisible)

    const onLost = (e: Event) => e.preventDefault()
    canvas.addEventListener('webglcontextlost', onLost)

    const unsubscribe = store.subscribe(schedule)
    prog.resize(canvas.clientWidth, canvas.clientHeight, window.devicePixelRatio || 1)
    schedule() // the one rest-pose frame

    return () => {
      unsubscribe()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
      canvas.removeEventListener('webglcontextlost', onLost)
      cancelAnimationFrame(raf)
      card?.classList.remove('is-foil-live')
      prog.dispose()
    }
  }, [store, accent, gold])

  return <canvas ref={ref} className="rfx-foil-canvas" aria-hidden="true" />
}
