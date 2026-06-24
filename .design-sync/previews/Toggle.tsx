import { Toggle } from 'pitch-atlas'

export const States = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <Toggle>Grip</Toggle>
    <Toggle pressed>Physics</Toggle>
    <Toggle disabled>Disabled</Toggle>
  </div>
)
