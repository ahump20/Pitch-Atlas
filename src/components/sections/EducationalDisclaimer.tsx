import { EDUCATIONAL_DISCLAIMER } from '../../data/knowledge'

/*
  The educational-use disclaimer for the health and youth wings. It replaces the
  old "no medical/injury/youth-training prescription" policy: the atlas now teaches
  this material as sourced reference, openly, but says plainly that reference is not
  care. Seam-red rule so it reads as the one caution on an otherwise calm page.
*/
export function EducationalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <aside
      role="note"
      className={`rounded-sm border-l-2 border-l-seam border border-seam/25 bg-paper px-6 py-5 ${className}`}
    >
      <p className="mono-label mb-2 text-seam">Educational reference, not medical care</p>
      <p className="max-w-[72ch] text-sm leading-relaxed text-ink-2">{EDUCATIONAL_DISCLAIMER}</p>
    </aside>
  )
}
