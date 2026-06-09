import type { BlazeMood } from './blazeMotion'

interface BaseballChaseRailProps {
  mood: BlazeMood
  reducedMotion: boolean
}

export function BaseballChaseRail({ mood, reducedMotion }: BaseballChaseRailProps) {
  if (mood === 'hidden' || mood === 'still' || mood === 'napping' || mood === 'concerned') return null

  const active = !reducedMotion && (mood === 'chasing' || mood === 'caught' || mood === 'sniffing')

  return (
    <div className="blaze-rail" data-active={active ? 'true' : 'false'} data-mode={mood}>
      <div className="blaze-track" aria-hidden="true" />
      <div className="blaze-pawprints" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="blaze-ball" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <circle cx="16" cy="16" r="13.5" />
          <path d="M8.8 7.8c4.1 3.5 4.4 12.9.3 16.7M23.2 7.8c-4.1 3.5-4.4 12.9-.3 16.7" />
          <path d="M10.5 10.4l2.1 1.1M9.7 14.1l2.4.4M9.9 17.8l2.3-.4M11.1 21.4l1.9-1.2M21.5 10.4l-2.1 1.1M22.3 14.1l-2.4.4M22.1 17.8l-2.3-.4M20.9 21.4l-1.9-1.2" />
        </svg>
      </div>
    </div>
  )
}
