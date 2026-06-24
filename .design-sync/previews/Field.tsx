import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
} from 'pitch-atlas'

export const Default = () => (
  <div style={{ maxWidth: 340 }}>
    <Field>
      <FieldLabel htmlFor="src">Where did you learn this grip?</FieldLabel>
      <Input id="src" placeholder="A coach, a video, your own bullpen" />
      <FieldDescription>Every claim carries a source. No source means unverified.</FieldDescription>
    </Field>
  </div>
)

export const WithError = () => (
  <div style={{ maxWidth: 340 }}>
    <Field data-invalid="true">
      <FieldLabel htmlFor="src2">Source</FieldLabel>
      <Input id="src2" aria-invalid="true" defaultValue="" />
      <FieldError>A source is required before this can be filed.</FieldError>
    </Field>
  </div>
)
