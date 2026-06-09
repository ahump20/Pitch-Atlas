import { useEffect } from 'react'
import type { RefObject } from 'react'
import type { BlazeMood } from './blazeMotion'
import { clampScrollProgress } from './blazeMotion'

interface UseBlazeMotionOptions {
  enabled: boolean
  reducedMotion: boolean
  mood: BlazeMood
}

function readScrollProgress(): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 0
  const root = document.documentElement
  const max = Math.max(1, root.scrollHeight - window.innerHeight)
  return clampScrollProgress((window.scrollY || root.scrollTop || 0) / max)
}

function writeStaticVars(el: HTMLElement) {
  el.style.setProperty('--blaze-progress', '0')
  el.style.setProperty('--blaze-x', '0px')
  el.style.setProperty('--blaze-y', '0px')
  el.style.setProperty('--blaze-speed', '0')
  el.style.setProperty('--blaze-tilt', '0deg')
  el.style.setProperty('--blaze-ball-spin', '0deg')
  el.style.setProperty('--blaze-paw-opacity', '0')
  el.style.setProperty('--blaze-opacity', '0.72')
  el.style.setProperty('--blaze-hop', '0px')
  el.style.setProperty('--blaze-squash', '1')
  el.style.setProperty('--blaze-ear-lag', '0deg')
}

export function useBlazeMotion(
  ref: RefObject<HTMLElement | null>,
  { enabled, reducedMotion, mood }: UseBlazeMotionOptions,
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (!enabled || reducedMotion || mood === 'hidden' || mood === 'still') {
      writeStaticVars(el)
      return
    }

    let raf = 0
    let targetX = 0
    let currentX = 0
    let velocity = 0
    let targetProgress = readScrollProgress()

    const writeFrame = (progress: number, x: number, speed: number, tilt: number) => {
      const hop = Math.sin(progress * Math.PI * 10) * Math.min(4, speed * 6)
      const squash = Math.max(0.94, 1 - speed * 0.045)

      const companionOpacity = progress > 0.92 ? 0 : 0.88

      el.style.setProperty('--blaze-progress', progress.toFixed(4))
      el.style.setProperty('--blaze-x', `${x}px`)
      el.style.setProperty('--blaze-y', `${Math.round(speed * -3)}px`)
      el.style.setProperty('--blaze-speed', speed.toFixed(3))
      el.style.setProperty('--blaze-tilt', `${tilt.toFixed(2)}deg`)
      el.style.setProperty('--blaze-ball-spin', `${Math.round(progress * 720)}deg`)
      el.style.setProperty('--blaze-paw-opacity', Math.min(0.42, speed * 0.8).toFixed(3))
      el.style.setProperty('--blaze-opacity', companionOpacity.toString())
      el.style.setProperty('--blaze-hop', `${hop.toFixed(2)}px`)
      el.style.setProperty('--blaze-squash', squash.toFixed(3))
      el.style.setProperty('--blaze-ear-lag', `${Math.max(-7, Math.min(7, -tilt * 1.4)).toFixed(2)}deg`)
    }

    const readTarget = () => {
      targetProgress = readScrollProgress()
      const railWidth = Math.max(0, el.clientWidth - 112)
      targetX = Math.round(targetProgress * railWidth)
    }

    const tick = () => {
      if (document.visibilityState === 'hidden') {
        raf = 0
        return
      }

      const distance = targetX - currentX
      velocity = velocity * 0.62 + distance * 0.18
      currentX += velocity

      if (Math.abs(distance) < 0.08 && Math.abs(velocity) < 0.08) {
        currentX = targetX
        velocity = 0
      }

      const speed = Math.min(1, Math.abs(velocity) / 22)
      const tilt = Math.max(-6, Math.min(6, velocity / 6))
      writeFrame(targetProgress, Math.round(currentX), speed, tilt)

      if (currentX !== targetX || velocity !== 0) {
        raf = window.requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const schedule = () => {
      if (document.visibilityState === 'hidden') return
      readTarget()
      if (!raf) raf = window.requestAnimationFrame(tick)
    }

    readTarget()
    currentX = targetX
    writeFrame(targetProgress, currentX, 0, 0)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    document.addEventListener('visibilitychange', schedule)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [enabled, mood, reducedMotion, ref])
}
