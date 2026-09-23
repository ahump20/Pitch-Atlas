import { Kicker, PITCHES } from 'pitch-atlas'

// The eyebrow as the site sets it: SectionHero's `.rfx-skick` above its Anton
// title (the lab page's own pair, dense size), then the same eyebrow re-toned on
// the cream field over a filed specimen's record.
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

export function OverATitle() {
  return (
    <section style={cell}>
      <Kicker>Labels</Kicker>
      <h2 className={heading}>Kicker</h2>
      <Kicker>The lab</Kicker>
      <h2 className="rfx-stitle mt-5 max-w-[24ch] text-[clamp(2rem,4.5vw,3.2rem)] leading-[0.98] [text-wrap:balance] md:leading-[0.92]">
        Turn spin into shape.
      </h2>
    </section>
  )
}

export function OnCream() {
  const four = PITCHES[0]
  return (
    <section style={cell}>
      <div className="field-cream rounded-lg bg-paper px-6 py-5">
        <Kicker>Filed specimen</Kicker>
        <p className="mt-3 font-display text-[22px] text-ink">{four.canonical.name}</p>
        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-ink-3">{four.display.heroSub}</p>
      </div>
    </section>
  )
}
