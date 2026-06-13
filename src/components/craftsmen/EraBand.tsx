import type { CSSProperties } from 'react'
import { axisPos, type EraSpan } from '../../lib/era'

/*
  The era band: a still axis (1925–2030) with this arm's active years lit in its
  signature-pitch accent. The bar's LENGTH is the career's length — Ryan's
  twenty-seven years dwarf a two-season rookie — so the hall earns a real,
  sourced visual weight no two cards share. An open-ended career ("present") runs
  to the edge and fades into an open cap; nothing claims an end year it does not
  have. Decorative axis, aria-hidden — the precise span lives in the era text
  beside it.
*/
export function EraBand({ span, accent }: { span: EraSpan; accent: string }) {
  const left = axisPos(span.start) * 100
  const open = span.end === null
  const right = span.end === null ? 100 : axisPos(span.end) * 100
  const width = Math.max(2.5, right - left)
  return (
    <div className="mt-2.5" aria-hidden="true">
      <div className="relative h-[5px] w-full overflow-hidden rounded-full bg-white/[0.07]">
        {/* faint quarter marks: a sense of scale, not a labelled scale */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent 0, transparent calc(25% - 1px), rgba(255,255,255,0.10) calc(25% - 1px), rgba(255,255,255,0.10) 25%)',
          }}
        />
        <div
          className="absolute top-0 h-full rounded-full"
          style={
            {
              left: `${left}%`,
              width: `${width}%`,
              background: open
                ? `linear-gradient(90deg, ${accent} 60%, color-mix(in srgb, ${accent} 12%, transparent))`
                : accent,
              boxShadow: `0 0 6px color-mix(in srgb, ${accent} 45%, transparent)`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  )
}
