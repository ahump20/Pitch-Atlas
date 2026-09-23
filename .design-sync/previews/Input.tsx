import { Input, Kicker } from 'pitch-atlas'

// The labelled text field, empty with its placeholder (the in-product gallery's),
// then filled: the field-notes "Evidence label" holding the example its own
// placeholder offers (src/components/sections/FieldNotes.tsx).
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

export function Labelled() {
  return (
    <section style={cell}>
      <Kicker>Input</Kicker>
      <h2 className={heading}>Input</h2>
      <div className="max-w-[520px]">
        <Input label="Contributor handle" placeholder="@you" />
      </div>
    </section>
  )
}

export function Filled() {
  return (
    <section style={cell}>
      <div className="max-w-[520px]">
        <Input label="Evidence label" defaultValue="Bullpen clip" />
      </div>
    </section>
  )
}
