/*
  Minimal masthead. One line, under 80px. The principle rides in the bar so a
  visitor reads the model before they read a single claim.
*/
export function Masthead() {
  return (
    <header className="sticky top-0 z-30 border-b border-machined/60 bg-stage/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span aria-hidden="true" className="inline-block h-2 w-2 rotate-45 bg-seam" />
          <span className="font-mono text-sm font-semibold tracking-[0.22em] text-ink">
            PITCH ATLAS
          </span>
        </a>
        <span className="mono-label hidden sm:inline">Sourced, not corrected</span>
      </div>
    </header>
  )
}
