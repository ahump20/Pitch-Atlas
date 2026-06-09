import type { CSSProperties } from 'react'
import caughtStrip from '../../assets/blaze/blaze-caught.webp'
import chaseStrip from '../../assets/blaze/blaze-chase.webp'
import concernedStrip from '../../assets/blaze/blaze-concerned.webp'
import idleStrip from '../../assets/blaze/blaze-idle.webp'
import napStrip from '../../assets/blaze/blaze-nap.webp'
import sniffStrip from '../../assets/blaze/blaze-sniff.webp'
import stillStrip from '../../assets/blaze/blaze-still.webp'
import type { BlazeMood } from './blazeMotion'

interface BlazeDogProps {
  mood: Exclude<BlazeMood, 'hidden'>
  reducedMotion: boolean
}

interface BlazeSprite {
  src: string
  frames: number
  label: string
  loop: boolean
  durationMs: number
}

const BLAZE_SPRITES: Record<Exclude<BlazeMood, 'hidden'>, BlazeSprite> = {
  idle: {
    src: idleStrip,
    frames: 6,
    label: 'idle',
    loop: true,
    durationMs: 7600,
  },
  chasing: {
    src: chaseStrip,
    frames: 8,
    label: 'trot/chase',
    loop: true,
    durationMs: 980,
  },
  caught: {
    src: caughtStrip,
    frames: 4,
    label: 'catch',
    loop: false,
    durationMs: 860,
  },
  sniffing: {
    src: sniffStrip,
    frames: 4,
    label: 'sniff',
    loop: false,
    durationMs: 2200,
  },
  napping: {
    src: napStrip,
    frames: 6,
    label: 'nap',
    loop: true,
    durationMs: 5600,
  },
  concerned: {
    src: concernedStrip,
    frames: 4,
    label: 'concerned',
    loop: false,
    durationMs: 1100,
  },
  still: {
    src: stillStrip,
    frames: 1,
    label: 'still',
    loop: false,
    durationMs: 0,
  },
}

export function BlazeDog({ mood, reducedMotion }: BlazeDogProps) {
  const sprite = BLAZE_SPRITES[reducedMotion ? 'still' : mood]
  const frameCount = sprite.frames
  const style = {
    '--blaze-bg-size': `${frameCount * 100}% 100%`,
    '--blaze-start-x': '0%',
    '--blaze-end-x': '100%',
    '--blaze-frame-y': '0%',
    '--blaze-frame-count': frameCount,
    '--blaze-steps': Math.max(1, frameCount - 1),
    '--blaze-duration': `${sprite.durationMs}ms`,
    '--blaze-iterations': sprite.loop ? 'infinite' : '1',
    backgroundImage: `url(${sprite.src})`,
  } as CSSProperties

  return (
    <div
      className="blaze-dog-wrap"
      data-state={mood}
      data-source="derived-strip"
      data-frame-count={frameCount}
      data-loop={sprite.loop ? 'true' : 'false'}
    >
      <div className="blaze-dog-sprite" style={style} aria-hidden="true" />
      <div className="blaze-uniform" aria-hidden="true">
        <svg className="blaze-helmet" viewBox="0 0 50 36" focusable="false">
          <path className="blaze-helmet-shell" d="M7 23C8 10 19 2 34 4c9 1 14 7 13 15l-6 4c-2-8-9-13-18-11-7 1-12 5-14 12z" />
          <path className="blaze-helmet-bill" d="M4 24c9-3 20-2 29 2-7 4-20 5-31 2z" />
          <path className="blaze-helmet-stripe" d="M27 5c5 5 6 12 4 20" />
          <path className="blaze-helmet-seam" d="M15 13c8-3 18-2 25 4M12 20c9-2 18-1 25 3" />
        </svg>
        <span className="blaze-collar-tag" />
      </div>
    </div>
  )
}
