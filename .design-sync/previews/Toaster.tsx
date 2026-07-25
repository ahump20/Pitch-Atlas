import { Toaster } from 'pitch-atlas'

// A live <Toaster /> renders an empty container until toast() fires, so this
// cell shows the static shape a success toast takes — matched to the real
// popover tokens the Toaster uses — alongside the real (harmless) container.
const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  alignItems: 'center',
}
const toast = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
}
const check = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '18px',
  height: '18px',
  borderRadius: '999px',
  border: '1.5px solid #4ade80',
  color: '#4ade80',
  fontSize: '11px',
  lineHeight: 1,
}

// What a success toast looks like when a grip is saved.
export function GripSaved() {
  return (
    <div className="rfx-panel" style={stage}>
      <div style={toast}>
        <span style={check} aria-hidden="true">&#10003;</span>
        <span>Grip saved to your bench.</span>
      </div>
      <Toaster />
    </div>
  )
}
