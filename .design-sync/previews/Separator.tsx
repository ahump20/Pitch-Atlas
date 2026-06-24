import { Separator } from 'pitch-atlas'

export const Horizontal = () => (
  <div style={{ maxWidth: 320 }}>
    <p style={{ fontSize: 13 }}>The grip</p>
    <Separator style={{ margin: '10px 0' }} />
    <p style={{ fontSize: 13 }}>The shape</p>
  </div>
)

export const Vertical = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28, fontSize: 13 }}>
    <span>Filed</span>
    <Separator orientation="vertical" />
    <span>Sourced</span>
    <Separator orientation="vertical" />
    <span>Labeled</span>
  </div>
)
