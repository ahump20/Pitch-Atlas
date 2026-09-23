import { useEffect } from 'react'
import { Kicker, toast, Toaster } from 'pitch-atlas'

// The toast the discussion forum raises after a report, held open so the card
// shows it (the product's own dismisses on its default timer).
const cell = {
  background: 'var(--surface-page)',
  color: 'var(--color-bone)',
  padding: '28px',
  minHeight: '100vh',
  boxSizing: 'border-box',
}
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

export function ReportSent() {
  useEffect(() => {
    toast.success('Report sent', { id: 'report-sent', duration: Infinity })
  }, [])
  return (
    <section style={cell}>
      <Kicker>Primitives</Kicker>
      <h2 className={heading}>Toaster</h2>
      <Toaster />
    </section>
  )
}
