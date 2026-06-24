import { Input } from 'pitch-atlas'

export const States = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
    <Input placeholder="Search the pitch index" />
    <Input defaultValue="Four-seam fastball" />
    <Input placeholder="Disabled" disabled />
    <Input placeholder="Invalid" aria-invalid="true" />
  </div>
)
