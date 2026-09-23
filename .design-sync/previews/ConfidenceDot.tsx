import { ConfidenceDot, Kicker } from 'pitch-atlas'

// The seven confidence tiers, each dot paired with its words, then the bare dot
// for dense rows where the tier's words already sit nearby.
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

export function Ladder() {
  return (
    <section style={cell}>
      <Kicker>Provenance</Kicker>
      <h2 className={heading}>Every claim wears its label</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <ConfidenceDot confidence="official-data" />
        <ConfidenceDot confidence="pitcher-own-words" />
        <ConfidenceDot confidence="coach-observed" />
        <ConfidenceDot confidence="reputable-analysis" />
        <ConfidenceDot confidence="secondhand-attributed" />
        <ConfidenceDot confidence="community-firsthand" />
        <ConfidenceDot confidence="unverified" />
      </div>
    </section>
  )
}

export function Bare() {
  return (
    <section style={cell}>
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ConfidenceDot confidence="official-data" withLabel={false} />
          <ConfidenceDot confidence="reputable-analysis" withLabel={false} />
          <ConfidenceDot confidence="secondhand-attributed" withLabel={false} />
          <ConfidenceDot confidence="unverified" withLabel={false} />
        </div>
        <code style={caption}>withLabel={'{false}'}</code>
      </div>
    </section>
  )
}
