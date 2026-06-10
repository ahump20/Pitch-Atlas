import type { Source } from '../../data/types'
import { SourceBadge } from './SourceBadge'

/*
  The outbound ledger row. This site tells the record in prose; the digits live
  with the record-keepers. One quiet row, set off by a hairline, pointing anyone
  who wants the full statistical ledger to the place that keeps it.
*/
export function RecordLinks({ sources, className = '' }: { sources: Source[]; className?: string }) {
  if (sources.length === 0) return null
  return (
    <div className={`border-t border-[rgba(255,255,255,0.12)] pt-5 ${className}`}>
      <p className="mb-2.5 text-sm leading-relaxed text-ink-2">
        The numbers live with the record-keepers.
      </p>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        {sources.map((s) => (
          <SourceBadge key={s.id} source={s} />
        ))}
      </div>
    </div>
  )
}
