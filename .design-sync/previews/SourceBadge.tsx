import { Kicker, PITCHES, SourceBadge } from 'pitch-atlas'

// The provenance badge: the tier ladder as the in-product gallery sets it, then
// one filed official-data claim, its badge worded by the tier and then by the
// claim's own source label.
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

const bySlug = (slug) => PITCHES.find((p) => p.display.slug === slug)

export function Tiers() {
  return (
    <section style={cell}>
      <Kicker>Provenance</Kicker>
      <h2 className={heading}>SourceBadge</h2>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <SourceBadge tier="official" />
        <SourceBadge tier="reputable" />
        <SourceBadge tier="secondhand" />
        <SourceBadge tier="unverified" />
        <SourceBadge tier="reputable" approximate />
        <SourceBadge tier="secondhand" label="Relayed · Kagan" />
      </div>
    </section>
  )
}

export function NamedSource() {
  const claim = bySlug('circle-change').canonical.gripDetails[2]
  return (
    <section style={cell}>
      <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
        <div className="flex flex-col items-start gap-3">
          <SourceBadge tier="official" />
          <code style={caption}>tier wording</code>
        </div>
        <div className="flex flex-col items-start gap-3">
          <SourceBadge tier="official" label={claim.source.label} />
          <code style={caption}>label from the claim&apos;s source</code>
        </div>
      </div>
    </section>
  )
}
