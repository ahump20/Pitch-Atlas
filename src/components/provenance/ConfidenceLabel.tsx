import type { ClaimConfidence } from '../../data/types'
import { CONFIDENCE_META } from '../../data/types'

/*
  Confidence encoded without a second color. The Instrument Plate has one accent,
  so the seven levels are told apart by a monospace glyph and weight, not by hue.
  Seam-red is reserved for the one level that must alarm: unverified.
*/
const GLYPH: Record<ClaimConfidence, string> = {
  'official-data': '▪', //  filled square
  'pitcher-own-words': '◆', //  filled diamond
  'coach-observed': '◈', //  diamond in square
  'reputable-analysis': '▫', //  open square
  'secondhand-attributed': '◌', //  dotted circle
  'community-firsthand': '○', //  open circle
  unverified: '⊘', //  circled slash
}

function colorClass(confidence: ClaimConfidence): string {
  if (confidence === 'unverified') return 'text-seam'
  if (confidence === 'official-data') return 'text-ink'
  return '' //  inherits mono-label dim
}

export function ConfidenceLabel({
  confidence,
  className = '',
}: {
  confidence: ClaimConfidence
  className?: string
}) {
  const meta = CONFIDENCE_META[confidence]
  return (
    <span
      className={`mono-label inline-flex items-center gap-1.5 ${colorClass(confidence)} ${className}`}
      title={meta.meaning}
    >
      <span aria-hidden="true">{GLYPH[confidence]}</span>
      <span>{meta.label}</span>
    </span>
  )
}
