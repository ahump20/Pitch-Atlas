import { Hairline, Kicker, PITCHES } from 'pitch-atlas'

// The hairline in both registers, then between two tiers of a filed specimen.
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

export function Registers() {
  return (
    <section style={cell}>
      <Kicker>Labels</Kicker>
      <h2 className={heading}>Hairline</h2>
      <div className="flex max-w-[480px] flex-col gap-6">
        <div className="flex flex-col gap-4 py-2">
          <Hairline stage />
          <code style={caption}>stage · on the void</code>
        </div>
        <div className="field-cream flex flex-col gap-4 rounded-lg bg-paper px-6 py-5">
          <Hairline />
          <code style={caption}>default · cream field</code>
        </div>
      </div>
    </section>
  )
}

export function Divider() {
  const four = PITCHES[0]
  return (
    <section style={cell}>
      <div className="flex max-w-[480px] flex-col gap-3">
        <span className="mono-label text-ink-3">Grip</span>
        <p className="text-[14px] leading-relaxed text-bone-2">{four.canonical.gripDetails[0].value}</p>
        <Hairline stage />
        <span className="mono-label text-ink-3">Shape</span>
        <p className="text-[14px] leading-relaxed text-bone-2">{four.display.foundationCaption}</p>
      </div>
    </section>
  )
}
