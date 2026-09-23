import { BrandMark, Kicker } from 'pitch-atlas'

// The leather diamond with the seam-map ball and the ATLAS wordmark, at the three
// sizes the site sets, then the mark alone.
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
      <Kicker>Brand</Kicker>
      <h2 className={heading}>The marks</h2>
      <div className="flex flex-wrap items-end gap-10">
        <Spec name='size="lg" · hero'>
          <BrandMark size="lg" />
        </Spec>
        <Spec name='size="md" · default'>
          <BrandMark size="md" />
        </Spec>
        <Spec name='size="sm" · masthead'>
          <BrandMark size="sm" />
        </Spec>
      </div>
    </section>
  )
}

export function MarkAlone() {
  return (
    <section style={cell}>
      <div className="flex flex-wrap items-end gap-10">
        <Spec name="wordmark={false}">
          <BrandMark size="md" wordmark={false} />
        </Spec>
        <Spec name='size="lg" · wordmark={false}'>
          <BrandMark size="lg" wordmark={false} />
        </Spec>
      </div>
    </section>
  )
}
