/*
  Tiers are marked by a hairline and a mono index (00 / 01 / 02 / 03), never an
  eyebrow. The index reads as a measurement label on an instrument plate.
*/
export function TierMarker({
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
