/*
  The tier marker for the dark theater rooms. Same instrument-plate logic as the
  light TierMarker (mono index + label + a hairline), tuned to bone ink so it
  reads on the stage. The index is a measurement label, never an eyebrow.
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
      <span className="font-mono text-sm font-medium tabular-nums text-bone">{index}</span>
      <span className="mono-label-stage whitespace-nowrap">{label}</span>
      <span className="hairline-stage" aria-hidden="true" />
    </div>
  )
}
