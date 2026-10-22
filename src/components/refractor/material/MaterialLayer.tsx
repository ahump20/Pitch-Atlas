import { useEffect, useRef, useState } from 'react'
import type { TiltStore } from '../../../hooks/useCardTilt'
import { createCardMaterialProgram, type CardMaterialProgram, type MaterialIdentity } from './cardMaterialProgram'
import { acquireMaterialContext, releaseMaterialContext } from './contextPool'
import type { CardMaterial } from './materialPresets'
import { measureLayout } from './measureLayout'

/*
  The live card material: one canvas the size of the whole card, sitting between the
  stock and the print (z-index 2, under the header, the cue plate and the strip; over
  the field and the media so a thin glaze can cross the window). Render-on-demand: the
  layer subscribes to the tilt store and draws one frame per update, so a resting card
  costs nothing; ambient drift is throttled to 30 fps. One extra frame fires on
  resize, on font load, on visibility return and on context restore. The first good
  frame marks the card `is-foil-live`, which fades the canvas in and retires the CSS
  stand-in so there is never double glare. Any GL failure leaves the CSS card standing.

  Layout comes from the DOM: the header, media window and strip rects are measured
  along the offsetParent chain (layout boxes, unaffected by the tilt transform) and
  handed to the shader in CSS pixels, so coverage masks land on the print exactly.

  Context loss gets one second chance, as before: wait ~150ms for a neighbour to free
  a slot, swap in a fresh canvas once, and if that dies too the CSS card stands.
*/

const AMBIENT_MIN_INTERVAL = 1000 / 30

export default function MaterialLayer({
  store,
  material,
  identity,
}: {
  store: TiltStore
  material: CardMaterial
  identity: MaterialIdentity
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const [epoch, setEpoch] = useState(0)
  // the latest props, read inside the long-lived effect without re-creating the context
  const live = useRef({ material, identity })

  // a preset change re-renders in place; no new context. Declared before the
  // context effect so the first frame already reads the current props.
  useEffect(() => {
    live.current = { material, identity }
    const card = ref.current?.parentElement
    if (card?.classList.contains('is-foil-live')) store.nudge()
  }, [material, identity, store])

  useEffect(() => {
    const canvas = ref.current
    const card = canvas?.parentElement
    if (!canvas || !card) return
    if (!acquireMaterialContext()) return

    let prog: CardMaterialProgram
    try {
      prog = createCardMaterialProgram(canvas)
    } catch {
      releaseMaterialContext()
      return // no GL — the CSS card is already painted underneath
    }

    let layout = measureLayout(card)
    let raf = 0
    let timer = 0
    let lastDraw = 0

    const draw = () => {
      raf = 0
      const s = store.get()
      prog.render({
        layout,
        identity: live.current.identity,
        material: live.current.material,
        tilt: { rx: s.rx, ry: s.ry },
        light: { x: s.mx / 100, y: s.my / 100, height: s.lightHeight, strength: s.lightStrength },
      })
      lastDraw = performance.now()
      card.classList.add('is-foil-live')
    }
    const schedule = () => {
      if (raf || timer) return
      const wait = store.get().source === 'ambient' ? AMBIENT_MIN_INTERVAL - (performance.now() - lastDraw) : 0
      if (wait > 4) {
        timer = window.setTimeout(() => {
          timer = 0
          if (!raf) raf = requestAnimationFrame(draw)
        }, wait)
        return
      }
      raf = requestAnimationFrame(draw)
    }
    const remeasure = () => {
      layout = measureLayout(card)
      prog.resize(card.offsetWidth, card.offsetHeight, window.devicePixelRatio || 1)
      schedule()
    }

    const ro = new ResizeObserver(remeasure)
    ro.observe(card)
    const stage = card.querySelector('.rfx-stage')
    if (stage) ro.observe(stage)
    // the header is set in Anton; its height settles when the face arrives
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(remeasure, () => {})
    }

    const onVisible = () => {
      if (!document.hidden) schedule()
    }
    document.addEventListener('visibilitychange', onVisible)

    let retryTimer = 0
    const onLost = (e: Event) => {
      e.preventDefault()
      card.classList.remove('is-foil-live')
      if (epoch > 0 || retryTimer) return // one retry, ever
      retryTimer = window.setTimeout(() => setEpoch(1), 150)
    }
    canvas.addEventListener('webglcontextlost', onLost)

    const unsubscribe = store.subscribe(schedule)
    remeasure() // the one rest-pose frame

    return () => {
      unsubscribe()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisible)
      canvas.removeEventListener('webglcontextlost', onLost)
      window.clearTimeout(retryTimer)
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      card.classList.remove('is-foil-live')
      prog.dispose()
      releaseMaterialContext()
    }
  }, [store, epoch])


  return <canvas key={epoch} ref={ref} className="rfx-foil-canvas" aria-hidden="true" />
}
