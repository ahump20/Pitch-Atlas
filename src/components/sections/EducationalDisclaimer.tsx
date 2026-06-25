import { EDUCATIONAL_DISCLAIMER } from '../../data/knowledge'

/*
  The educational-use disclaimer for safety-limit wings. It keeps source-backed
  literature in the archive without turning it into diagnosis, workload advice,
  rehab guidance, or age-specific pitching instructions. Seam-red rule so it
  reads as the one caution on an otherwise calm page.
*/
export function EducationalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <aside
      role="note"
      className={`rfx-panel rounded-sm border-l-2 border-l-seam px-6 py-5 ${className}`}
    >
      <p className="mono-label mb-2 text-seam">Educational reference, not medical care</p>
      <p className="max-w-[72ch] text-sm leading-relaxed text-ink-2">{EDUCATIONAL_DISCLAIMER}</p>
    </aside>
  )
}
