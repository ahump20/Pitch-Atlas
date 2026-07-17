import { EDUCATIONAL_DISCLAIMER } from '../../data/knowledge'

/*
  The absolute scope marker for claim-free boundary wings. Seam-red rule so it
  reads as the one caution on an otherwise calm page.
*/
export function EducationalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <aside
      role="note"
      className={`rfx-panel rounded-sm border border-seam/30 px-6 py-5 ${className}`}
    >
      <p className="mono-label mb-2 text-seam">Scope boundary</p>
      <p className="max-w-[72ch] text-sm leading-relaxed text-ink-2">{EDUCATIONAL_DISCLAIMER}</p>
    </aside>
  )
}
