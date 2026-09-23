/*
  A pinch of rosin where a primary action is pressed: the soft white cloud a
  pitcher's hand leaves coming off the bag. A throwaway fixed canvas at the
  press point, about 0.8s, then it removes itself. It lives on <body>, so the
  dust keeps settling while a link hands off to the next page. Pointer presses
  only; nothing under reduced motion.
*/
const SIZE = 180

export function rosinPuff(x: number, y: number) {
  if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = canvas.height = SIZE * dpr
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: 'fixed', left: `${x - SIZE / 2}px`, top: `${y - SIZE / 2}px`,
    width: `${SIZE}px`, height: `${SIZE}px`, pointerEvents: 'none', zIndex: '90',
  })
  document.body.appendChild(canvas)
  ctx.scale(dpr, dpr)

  const c = SIZE / 2
  // fine grains thrown outward and up, then dragged by the air and pulled down
  const grains = Array.from({ length: 30 }, () => {
    const a = Math.random() * Math.PI * 2
    const v = 28 + Math.random() * 90
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.6 - 38, r: 0.45 + Math.random() * 1.15, life: 0.5 + Math.random() * 0.35 }
  })
  const start = performance.now()

  const draw = (now: number) => {
    const t = (now - start) / 1000
    ctx.clearRect(0, 0, SIZE, SIZE)
    const k = Math.min(t / 0.8, 1)
    const rise = 10 * k
    const cloud = ctx.createRadialGradient(c, c - rise, 0, c, c - rise, 10 + 40 * k)
    cloud.addColorStop(0, `rgba(244, 238, 226, ${0.2 * (1 - k)})`)
    cloud.addColorStop(1, 'rgba(244, 238, 226, 0)')
    ctx.fillStyle = cloud
    ctx.fillRect(0, 0, SIZE, SIZE)
    const travel = (1 - Math.exp(-3.2 * t)) / 3.2
    for (const g of grains) {
      const u = t / g.life
      if (u >= 1) continue
      ctx.fillStyle = `rgba(246, 241, 230, ${0.8 * (1 - u) * (1 - u)})`
      ctx.beginPath()
      ctx.arc(c + g.vx * travel, c + g.vy * travel + 46 * t * t, g.r, 0, Math.PI * 2)
      ctx.fill()
    }
    if (k < 1) requestAnimationFrame(draw)
    else canvas.remove()
  }
  requestAnimationFrame(draw)
}
