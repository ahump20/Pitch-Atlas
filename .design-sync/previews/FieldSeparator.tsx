import { Field, FieldLabel, FieldSeparator, Input } from 'pitch-atlas'

export const BetweenFields = () => (
  <div style={{ maxWidth: 340, display: 'grid', gap: 12 }}>
    <Field>
      <FieldLabel htmlFor="a">Grip</FieldLabel>
      <Input id="a" placeholder="How it's held" />
    </Field>
    <FieldSeparator />
    <Field>
      <FieldLabel htmlFor="b">Source</FieldLabel>
      <Input id="b" placeholder="Where you learned it" />
    </Field>
  </div>
)
