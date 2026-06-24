import { Label, Input } from 'pitch-atlas'

export const WithInput = () => (
  <div style={{ display: 'grid', gap: 6, maxWidth: 320 }}>
    <Label htmlFor="grip-source">Grip source</Label>
    <Input id="grip-source" placeholder="Where did you learn it?" />
  </div>
)
