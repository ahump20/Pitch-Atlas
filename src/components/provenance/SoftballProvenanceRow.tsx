import type { Claim } from '../../data/types'
import { CONFIDENCE_META } from '../../data/types'
import { asOfDate } from '../../lib/format'

/*
  The softball provenance row: claim type · source tier · last checked · open
  question, every field wired from real data. The tier wording comes from
  CONFIDENCE_META (the one canonical model); "last checked" is the claim
  source's real retrievedAt or the words "not recorded" — never an invented
  date; the open question is the dispute the sources genuinely record, or
  "none on file".
*/
export function SoftballProvenanceRow({
  claimType,
  claim,
  openQuestion,
  className = '',
}: {
  /** Which claim the row describes, e.g. "Movement". */
  claimType: string
  claim: Claim<string>
  openQuestion?: string
  className?: string
}) {
  const lastChecked = claim.source ? asOfDate(claim.source.retrievedAt) : 'not recorded'
  return (
    <p className={`font-mono text-[10px] uppercase tracking-[0.08em] leading-relaxed text-ink-3 ${className}`}>
      <span className="text-bone-2">{claimType}</span>
      <span aria-hidden="true"> · </span>
      <span className="text-bone-2">{CONFIDENCE_META[claim.confidence].label}</span>
      <span aria-hidden="true"> · </span>
      <span>Last checked {lastChecked}</span>
      <span aria-hidden="true"> · </span>
      <span>Open question: {openQuestion ?? 'none on file'}</span>
    </p>
  )
}
