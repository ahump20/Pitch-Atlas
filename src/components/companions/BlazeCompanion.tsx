import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import '../../styles/blaze.css'
import { BaseballChaseRail } from './BaseballChaseRail'
import { BlazeDog } from './BlazeDog'
import { BlazeRouteProp } from './BlazeRouteProp'
import {
  BLAZE_EVENT_NAME,
  type BlazeReaction,
  type BlazeMood,
  moodForPath,
  personaForPath,
  reactionForMood,
  reduceMoodForMotion,
} from './blazeMotion'
import { useBlazeMotion } from './useBlazeMotion'
import { useBlazePreference } from './useBlazePreference'

function isNappable(mood: BlazeMood): boolean {
  return mood === 'idle' || mood === 'sniffing'
}

export function BlazeCompanion() {
  const location = useLocation()
  const routePath = location.pathname
  const ref = useRef<HTMLDivElement>(null)
  const eventTimerRef = useRef<number | null>(null)
  const reactionTimerRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()
  const { enabled } = useBlazePreference()
  const baseMood = useMemo(() => moodForPath(routePath), [routePath])
  const persona = useMemo(() => personaForPath(routePath), [routePath])
  const [eventMood, setEventMood] = useState<{ path: string; mood: BlazeMood } | null>(null)
  const [reactionState, setReactionState] = useState<{ path: string; reaction: BlazeReaction }>({ path: routePath, reaction: 'none' })
  const [sleepyState, setSleepyState] = useState<{ path: string; sleepy: boolean }>({ path: routePath, sleepy: false })

  const queueReaction = useCallback((next: Exclude<BlazeReaction, 'none'>, ttlMs = 1250) => {
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current)
    }
    setReactionState({ path: routePath, reaction: next })
    reactionTimerRef.current = window.setTimeout(() => {
      setReactionState((current) => (current.path === routePath ? { path: routePath, reaction: 'none' } : current))
      reactionTimerRef.current = null
    }, ttlMs)
  }, [routePath])

  useEffect(() => {
    if (eventTimerRef.current !== null) {
      window.clearTimeout(eventTimerRef.current)
      eventTimerRef.current = null
    }
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current)
      reactionTimerRef.current = null
    }
  }, [routePath])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onBlazeEvent = (event: WindowEventMap[typeof BLAZE_EVENT_NAME]) => {
      if (eventTimerRef.current !== null) {
        window.clearTimeout(eventTimerRef.current)
      }
      setEventMood({ path: routePath, mood: event.detail.mood })
      const eventReaction = event.detail.reaction ?? reactionForMood(event.detail.mood)
      if (eventReaction !== 'none') queueReaction(eventReaction, event.detail.ttlMs ?? 1700)
      eventTimerRef.current = window.setTimeout(() => {
        setEventMood((current) => (current?.path === routePath ? null : current))
        eventTimerRef.current = null
      }, event.detail.ttlMs ?? 1700)
    }
    window.addEventListener(BLAZE_EVENT_NAME, onBlazeEvent)
    return () => {
      if (eventTimerRef.current !== null) {
        window.clearTimeout(eventTimerRef.current)
        eventTimerRef.current = null
      }
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current)
        reactionTimerRef.current = null
      }
      window.removeEventListener(BLAZE_EVENT_NAME, onBlazeEvent)
    }
  }, [queueReaction, routePath])

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled || reducedMotion || !isNappable(baseMood)) return

    let timer = window.setTimeout(() => setSleepyState({ path: routePath, sleepy: true }), 8500)
    const reset = () => {
      setSleepyState({ path: routePath, sleepy: false })
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setSleepyState({ path: routePath, sleepy: true }), 8500)
    }

    window.addEventListener('scroll', reset, { passive: true })
    window.addEventListener('pointerdown', reset)
    window.addEventListener('keydown', reset)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', reset)
      window.removeEventListener('pointerdown', reset)
      window.removeEventListener('keydown', reset)
    }
  }, [baseMood, enabled, reducedMotion, routePath])

  const routeEventMood = eventMood?.path === routePath ? eventMood.mood : null
  const sleepy = sleepyState.path === routePath ? sleepyState.sleepy : false
  const reaction = reactionState.path === routePath ? reactionState.reaction : 'none'
  const rawMood = routeEventMood ?? (sleepy ? 'napping' : baseMood)
  const mood = enabled ? reduceMoodForMotion(rawMood, reducedMotion) : 'hidden'
  useBlazeMotion(ref, { enabled, reducedMotion, mood })

  if (!enabled || mood === 'hidden') return null

  const patBlaze = () => {
    if (typeof window === 'undefined') return
    queueReaction('bark', 950)

    try {
      const audioWindow = window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }
      const AudioContextCtor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext
      if (!AudioContextCtor) return
      const ctx = new AudioContextCtor()
      const now = ctx.currentTime
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
      gain.connect(ctx.destination)

      for (const [index, start] of [0, 0.11].entries()) {
        const osc = ctx.createOscillator()
        osc.type = index === 0 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(index === 0 ? 240 : 190, now + start)
        osc.frequency.exponentialRampToValueAtTime(index === 0 ? 135 : 120, now + start + 0.11)
        osc.connect(gain)
        osc.start(now + start)
        osc.stop(now + start + 0.12)
      }

      window.setTimeout(() => void ctx.close(), 360)
    } catch {
      // Bark is a bonus interaction; visual feedback still works without audio.
    }
  }

  return (
    <aside
      ref={ref}
      className="blaze-companion"
      data-testid="blaze-companion"
      data-mood={mood}
      data-persona={persona}
      data-reaction={reaction}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      <BlazeRouteProp persona={persona} />
      <BaseballChaseRail mood={mood} reducedMotion={reducedMotion} />
      <button
        type="button"
        className="blaze-dog-stage blaze-dog-button"
        data-reaction={reaction}
        onClick={patBlaze}
        aria-label="Give Blaze a quick pat"
      >
        <BlazeDog mood={mood} reducedMotion={reducedMotion} />
        <span className="blaze-bark" aria-hidden="true">arf!</span>
      </button>
    </aside>
  )
}
