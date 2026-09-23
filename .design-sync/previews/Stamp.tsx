import { Kicker, Stamp } from 'pitch-atlas'

// The three stamps the in-product gallery sets, verbatim: each takes its color
// from the text color it inherits, so a style color re-tones it.
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

function Spec({ name, children }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div style={{ minHeight: 48, display: 'flex', alignItems: 'center' }}>{children}</div>
      <code style={caption}>{name}</code>
    </div>
  )
}

export function Registers() {
  return (
    <section style={cell}>
      <Kicker>Labels</Kicker>
      <h2 className={heading}>Stamp</h2>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
        <Spec name="color: var(--color-bone)">
          <Stamp style={{ color: 'var(--color-bone)' }}>Internal reference</Stamp>
        </Spec>
        <Spec name="inherits currentColor">
          <Stamp>Specimen 00</Stamp>
        </Spec>
        <Spec name="color: var(--color-cyan)">
          <Stamp style={{ color: 'var(--color-cyan)' }}>Source trail intact</Stamp>
        </Spec>
      </div>
    </section>
  )
}
