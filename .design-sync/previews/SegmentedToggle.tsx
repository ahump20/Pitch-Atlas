import { useState } from 'react'
import { Kicker, SegmentedToggle } from 'pitch-atlas'

// The mono segmented control, controlled: the segment whose value matches carries
// aria-pressed, which the class keys on for its accent fill. First the in-product
// gallery's switch (bare strings), then the Pitch Index's sort labels
// (src/components/sections/PitchIndex.tsx) as { value, label } pairs.
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'
// Captions are code and keep the prop's own case: the site's .mono-label would
// upper-case `variant="chrome"` into a prop that does not exist.
const caption = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  letterSpacing: '0.02em',
  lineHeight: 1.5,
  color: 'var(--color-ink-3)',
}

export function Views() {
  const [view, setView] = useState('family')
  return (
    <section style={cell}>
      <Kicker>Input</Kicker>
      <h2 className={heading}>SegmentedToggle</h2>
      <div className="flex flex-col items-start gap-3">
        <SegmentedToggle options={['family', 'era', 'shape']} value={view} onChange={setView} />
        <code style={caption}>options: string[]</code>
      </div>
    </section>
  )
}

export function IndexSort() {
  const [sort, setSort] = useState('default')
  return (
    <section style={cell}>
      <div className="flex flex-col items-start gap-3">
        <SegmentedToggle
          options={[
            { value: 'default', label: 'Family' },
            { value: 'az', label: 'A-Z' },
            { value: 'grade', label: 'Documentation' },
            { value: 'filed', label: 'Filed first' },
          ]}
          value={sort}
          onChange={setSort}
        />
        <code style={caption}>options: {'{ value, label }'}[]</code>
      </div>
    </section>
  )
}
