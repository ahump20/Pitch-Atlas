import { DiamondMark, Kicker } from 'pitch-atlas'

// The diamond at its three sizes, then the standard face beside the ember 1/1.
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

export function Sizes() {
  return (
    <section style={cell}>
      <Kicker>Brand</Kicker>
      <h2 className={heading}>DiamondMark</h2>
      <div className="flex flex-wrap items-end gap-10">
        <Spec name="size={32}">
          <DiamondMark size={32} />
        </Spec>
        <Spec name="size={48} · default">
          <DiamondMark size={48} />
        </Spec>
        <Spec name="size={64}">
          <DiamondMark size={64} />
        </Spec>
      </div>
    </section>
  )
}

export function OneOfOne() {
  return (
    <section style={cell}>
      <div className="flex flex-wrap items-end gap-10">
        <Spec name="standard">
          <DiamondMark size={56} />
        </Spec>
        <Spec name="gold · the ember 1/1">
          <DiamondMark size={56} gold />
        </Spec>
      </div>
    </section>
  )
}
