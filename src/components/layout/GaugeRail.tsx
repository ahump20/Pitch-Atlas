import type { Claim } from '../../data/types'
import { SourcedValue } from '../provenance/SourcedValue'

export interface Gauge {
  key: string
  label: string
  claim: Claim<string>
  accent?: boolean
}

/*
  The narrow left rail: stacked instrument readings in Commit Mono, each one
  source-tagged. Divided by hairlines, not boxed into cards.
*/
export function GaugeRail({ gauges, caption }: { gauges: Gauge[]; caption?: string }) {
  return (
    <div className="flex flex-col">
      {gauges.map((g, i) => (
        <div key={g.key} className={i > 0 ? 'border-t border-[rgba(255,255,255,0.12)] py-5' : 'pb-5'}>
          <div className="mono-label mb-2.5 text-bone-2">{g.label}</div>
          <SourcedValue claim={g.claim} accent={g.accent} valueClassName="text-xl md:text-2xl" />
        </div>
      ))}
      {caption ? (
        <p className="mt-5 max-w-[34ch] border-t border-[rgba(255,255,255,0.12)] pt-5 text-[0.8125rem] leading-snug text-bone-2">
          {caption}
        </p>
      ) : null}
    </div>
  )
}
