import { Badge } from 'pitch-atlas'

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
    <Badge>Official data</Badge>
    <Badge variant="secondary">Reputable analysis</Badge>
    <Badge variant="outline">Pitcher's words</Badge>
    <Badge variant="destructive">Unverified</Badge>
    <Badge variant="ghost">Secondhand</Badge>
  </div>
)
