/*
  v2 · The chapter mark. One filed index line at the head of every section, so
  the landing reads as a curated, ordered archive instead of ten loose slabs:
  a chapter tick, the plate number, a hairline, the chapter name. Mono micro-caps
  in the dossier language the archive already speaks, with the
  refractor cyan as the one recurring accent down the page, matching the cards.
  Decorative and additive —
  every section reads complete without it.
*/
export function ChapterMark({
  n,
  name,
  className = '',
}: {
  n: string
  name: string
  className?: string
}) {
  return (
    <p className={`flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] ${className}`}>
      <span className="text-cyan" aria-hidden="true">
        ■
      </span>
      <span className="tabular-nums text-bone-2/70">{n}</span>
      <span className="h-px w-5 bg-bone/25" aria-hidden="true" />
      <span className="text-bone-2">{name}</span>
    </p>
  )
}
