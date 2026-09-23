import { Card, Kicker, PITCHES, SourceBadge } from 'pitch-atlas'

// The Surface section of the in-product gallery, its copy verbatim, then a filed
// specimen held on the press surface: every word of that one from its record.
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

const TIER = {
  'official-data': 'official',
  'reputable-analysis': 'reputable',
  'secondhand-attributed': 'secondhand',
  unverified: 'unverified',
  'pitcher-own-words': 'pitcher-own-words',
  'coach-observed': 'coach-observed',
  'community-firsthand': 'community-firsthand',
}

export function Registers() {
  return (
    <section style={cell}>
      <Kicker>Surface</Kicker>
      <h2 className={heading}>Card</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <p className="font-display text-[19px] text-bone">A lifted panel</p>
          <p className="mt-2 text-[14px] leading-relaxed text-bone-2">
            The press surface on the void, marked by a single bone hairline. Leather, never a flat box.
          </p>
        </Card>
        <Card foil className="p-5">
          <p className="font-display text-[19px] text-bone">A foil-edged panel</p>
          <p className="mt-2 text-[14px] leading-relaxed text-bone-2">
            The rainbow refractor frame: the only metallic, the jewelry of the set.
          </p>
        </Card>
      </div>
    </section>
  )
}

export function FiledSpecimen() {
  const four = PITCHES[0].canonical
  return (
    <section style={cell}>
      <Card className="max-w-[520px] p-5">
        <Kicker>Filed specimen</Kicker>
        <p className="mt-3 font-display text-[19px] text-bone">{four.name}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-bone-2">{four.grip.value}</p>
        <div className="mt-3">
          <SourceBadge tier={TIER[four.grip.confidence]} label={four.grip.source.label} />
        </div>
      </Card>
    </section>
  )
}
