/*
  The tier marker for the chapter rooms. Same instrument-plate logic everywhere:
  mono index + label + a hairline. Scene-aware by token — ink on the cream
  field, bone inside a .scene-coal section — so the halls and the theaters share
  one marker. The index is a measurement label, never an eyebrow.

  The label is the section's real heading (default h2, under the page's single
  h1), so the heading tree a screen reader navigates is not empty. The mono
  index and hairline stay decorative siblings. Pass `as` to set the level where
  a marker nests under another heading, or `as="span"` where a true heading
  already leads the block (SourcesPage's eyebrow).
*/
export function StageTierMarker({
  index,
  label,
  id,
  as: Tag = 'h2',
}: {
  index: string
  label: string
  id?: string
  as?: 'h2' | 'h3' | 'span'
}) {
  return (
    <div id={id} className="mb-10 flex items-center gap-4 scroll-mt-24">
      <span className="font-mono text-sm font-medium tabular-nums text-ink" aria-hidden="true">
        {index}
      </span>
      <Tag className="mono-label whitespace-nowrap">{label}</Tag>
      <span className="hairline" aria-hidden="true" />
    </div>
  )
}
