import { useState } from 'react'
import { Kicker, SearchField } from 'pitch-atlas'

// The Pitch Index's search, with its own placeholder and accessible name
// (src/components/sections/PitchIndex.tsx): empty, then holding a query.
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

function Search({ initial }) {
  const [query, setQuery] = useState(initial)
  return (
    <SearchField
      aria-label="Search the Pitch Index"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onClear={() => setQuery('')}
      placeholder="Search a pitch, an alias, a family…"
    />
  )
}

export function Empty() {
  return (
    <section style={cell}>
      <Kicker>Input</Kicker>
      <h2 className={heading}>SearchField</h2>
      <div className="max-w-[520px]">
        <Search initial="" />
      </div>
    </section>
  )
}

export function Typed() {
  return (
    <section style={cell}>
      <div className="max-w-[520px]">
        <Search initial="slider" />
      </div>
    </section>
  )
}
