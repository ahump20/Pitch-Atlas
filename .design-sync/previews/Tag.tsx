import { useState } from 'react'
import { Kicker, Tag } from 'pitch-atlas'

// The chip as filters (the family keys, one pressed), then the Grip Lab's own
// "show the hand" toggle from src/components/grip/GripViewer.tsx, verbatim: its
// status dot is a sized element, a direct flex child, spaced by the call site's
// `inline-flex items-center gap-2`.
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

export function Filters() {
  const [family, setFamily] = useState('fastball')
  return (
    <section style={cell}>
      <Kicker>Labels</Kicker>
      <h2 className={heading}>Tag</h2>
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap gap-2">
          {['fastball', 'breaking', 'offspeed', 'specialty'].map((f) => (
            <Tag as="button" key={f} active={family === f} onClick={() => setFamily(f)}>
              {f}
            </Tag>
          ))}
        </div>
        <code style={caption}>as=&quot;button&quot; · active → aria-pressed</code>
      </div>
    </section>
  )
}

export function ShowTheHand() {
  const [showHand, setShowHand] = useState(true)
  return (
    <section style={cell}>
      <div className="flex flex-col items-start gap-3">
        <Tag
          as="button"
          type="button"
          active={!showHand}
          onClick={() => setShowHand((s) => !s)}
          className="inline-flex items-center gap-2"
          glyph={<span aria-hidden="true" className={`h-2 w-2 rounded-full ${showHand ? 'bg-cyan' : 'bg-bone/35'}`} />}
        >
          {showHand ? 'Lift the hand' : 'Show the hand'}
        </Tag>
        <code style={caption}>glyph · a sized dot</code>
      </div>
    </section>
  )
}
