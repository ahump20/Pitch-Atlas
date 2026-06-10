/*
  The tier marker for the chapter rooms. Same instrument-plate logic everywhere:
  mono index + label + a hairline. Scene-aware by token — ink on the cream
  field, bone inside a .scene-coal section — so the halls and the theaters share
  one marker. The index is a measurement label, never an eyebrow.
*/
export function StageTierMarker({
  index,
  label,
  id,
}: {
  index: string
  label: string
  id?: string
}) {
  return (
    <div id={id} className="mb-10 flex items-center gap-4 scroll-mt-24">
      <span className="font-mono text-sm font-medium tabular-nums text-ink">{index}</span>
      <span className="mono-label whitespace-nowrap">{label}</span>
      <span className="hairline" aria-hidden="true" />
    </div>
  )
}
