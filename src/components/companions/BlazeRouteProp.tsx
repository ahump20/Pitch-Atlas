import type { BlazeRoutePersona } from './blazeMotion'

interface BlazeRoutePropProps {
  persona: BlazeRoutePersona
}

export function BlazeRouteProp({ persona }: BlazeRoutePropProps) {
  if (persona === 'quiet') return null

  return (
    <div className="blaze-route-prop" data-persona={persona} aria-hidden="true">
      <svg viewBox="0 0 80 52" focusable="false">
        {persona === 'home-plate' && (
          <>
            <path className="blaze-prop-paper" d="M22 8h36v22L40 44 22 30z" />
            <path className="blaze-prop-ink" d="M31 16h18M30 24h20M34 32h12" />
          </>
        )}
        {persona === 'pitch-mound' && (
          <>
            <path className="blaze-prop-dirt" d="M10 36c14-18 46-18 60 0" />
            <path className="blaze-prop-ink" d="M24 35c8 3 24 3 32 0M34 24h12" />
          </>
        )}
        {persona === 'scorecard' && (
          <>
            <path className="blaze-prop-paper" d="M18 8h42l4 7v29H16V10z" />
            <path className="blaze-prop-ink" d="M25 18h28M25 27h30M25 36h22M36 13v28M48 13v28" />
          </>
        )}
        {persona === 'rosin-bag' && (
          <>
            <path className="blaze-prop-paper" d="M25 18c2-8 26-8 30 0l5 25H20z" />
            <path className="blaze-prop-ink" d="M28 23c8 4 20 4 27 0M31 33h18" />
          </>
        )}
        {persona === 'chalk-talk' && (
          <>
            <path className="blaze-prop-paper" d="M14 10h52v32H14z" />
            <path className="blaze-prop-ink" d="M23 33c9-18 25-18 34 0M26 20h10M44 20h10" />
          </>
        )}
      </svg>
    </div>
  )
}
