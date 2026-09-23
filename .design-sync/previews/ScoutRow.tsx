import { Kicker, PITCHES, ScoutRow } from 'pitch-atlas'

// Scout-file rows built only from filed records: the four-seam's own file (an
// untiered family row, then its sourced claims at their tiers), then four
// records whose claims sit at the four tiers the row badges.
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

const bySlug = (slug) => PITCHES.find((p) => p.display.slug === slug)
const TIER = {
  'official-data': 'official',
  'reputable-analysis': 'reputable',
  'secondhand-attributed': 'secondhand',
  unverified: 'unverified',
}

export function ScoutFile() {
  const four = PITCHES[0].canonical
  return (
    <section style={cell}>
      <Kicker>Provenance</Kicker>
      <h2 className={heading}>ScoutRow</h2>
      <div className="rfx-scout max-w-[640px]">
        <ScoutRow label="Family">
          <span style={{ textTransform: 'capitalize' }}>{four.family}</span>
        </ScoutRow>
        <ScoutRow label="Grip" tier={TIER[four.grip.confidence]}>
          {four.grip.value}
        </ScoutRow>
        <ScoutRow label="Voice" tier={TIER[four.voice.confidence]}>
          {four.voice.value}
        </ScoutRow>
      </div>
    </section>
  )
}

export function Tiers() {
  const rows = [
    bySlug('circle-change'),
    bySlug('four-seam'),
    bySlug('eephus'),
  ]
  const claims = [
    [rows[0], rows[0].canonical.gripDetails[2]],
    [rows[1], rows[1].canonical.grip],
    [rows[1], rows[1].canonical.voice],
    [rows[2], rows[2].canonical.gripModel.provenance],
  ]
  return (
    <section style={cell}>
      <div className="rfx-scout max-w-[640px]">
        {claims.map(([entry, c], i) => (
          <ScoutRow key={i} label={entry.display.shortName} tier={TIER[c.confidence]}>
            {c.value}
          </ScoutRow>
        ))}
      </div>
    </section>
  )
}
