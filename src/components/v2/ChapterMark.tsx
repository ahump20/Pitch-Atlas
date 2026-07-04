/*
  v2 · The chapter mark. One filed index line at the head of every section, so
  the landing reads as a curated, ordered archive instead of ten loose slabs:
  a chapter tick, the plate number, a hairline, the chapter name. Mono micro-caps
  in the dossier language the archive already speaks. The tick wears its own
  chapter's scene tint — the same accent the section publishes to the far
  stratum — so the mark and the room agree on whose chapter this is (this
  supersedes the earlier one-cyan-everywhere choice; cyan stays the default
  where no tint is passed). Decorative and additive —
  every section reads complete without it.
*/
export function ChapterMark({
  n,
  name,
  accent,
  className = '',
}: {
  n: string
  name: string
  /** the section's scene tint; the tick falls back to refractor cyan without it */
  accent?: string
  className?: string
}) {
  return (
    <p className={`flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] ${className}`}>
      <span className="text-cyan" style={accent ? { color: accent } : undefined} aria-hidden="true">
        ■
      </span>
      <span className="tabular-nums text-bone-2/70">{n}</span>
      <span className="cm-rule h-px w-5 bg-bone/25 xl:w-8" aria-hidden="true" />
      <span className="text-bone-2">{name}</span>
    </p>
  )
}
