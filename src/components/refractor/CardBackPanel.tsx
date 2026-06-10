import type { ReactNode } from 'react'

/*
  The cream card-back surface — the flip side of the specimen card, at page scale.
  Real vintage card backs put the data on cream stock inside a printed frame; this
  panel is that register: Scorecard Cream paper, the double border (gold frame,
  cream gap, charcoal hairline), inset corner marks, and a 2% paper-tooth pass.

  The sitewide cream→void remap rewrites --color-paper/--color-ink for the dark
  field, so this panel re-declares its own scoped ink tokens in .rfx-cardback
  (see index.css) — content inside uses the --cb-* custom properties, never the
  remapped Heritage utilities.
*/
function Corner({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos: Record<typeof at, string> = {
    tl: 'left-2.5 top-2.5 border-l-2 border-t-2',
    tr: 'right-2.5 top-2.5 border-r-2 border-t-2',
    bl: 'left-2.5 bottom-2.5 border-l-2 border-b-2',
    br: 'right-2.5 bottom-2.5 border-r-2 border-b-2',
  }
  return <span aria-hidden="true" className={`cb-corner pointer-events-none ${pos[at]}`} />
}

export function CardBackPanel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rfx-cardback ${className}`}>
      <div className="rfx-cardback-inner">
        <Corner at="tl" />
        <Corner at="tr" />
        <Corner at="bl" />
        <Corner at="br" />
        <div className="relative z-[1]">{children}</div>
      </div>
    </div>
  )
}
