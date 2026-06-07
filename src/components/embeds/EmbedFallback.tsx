/*
  The single graceful-degradation surface for both video embeds. When a source
  is missing or fails to load, this stands in: a credited link out, never a blank
  box. Styled on the dark stage so it reads as a deliberate film slate.
*/
export function EmbedFallback({
  title,
  credit,
  href,
  ctaLabel,
  aspect = '16 / 9',
}: {
  title: string
  credit: string
  href: string
  ctaLabel: string
  aspect?: string
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border border-bone/15 bg-press p-6 text-center"
      style={{ aspectRatio: aspect }}
    >
      <span className="mono-label text-bone-2">{credit}</span>
      <p className="font-athletic uppercase max-w-[28ch] text-lg leading-snug text-bone">{title}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-2 rounded-sm border border-cyan/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-cyan transition-colors hover:border-cyan hover:bg-cyan/10"
      >
        {ctaLabel}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  )
}
