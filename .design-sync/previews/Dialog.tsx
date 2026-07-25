import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from 'pitch-atlas'

// The "File a grip" gate. The trigger is what shows in the card; the dialog
// itself opens on click and carries the own-the-rights upload terms.
const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  alignItems: 'center',
}
const trigger = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '12px',
  letterSpacing: '0.06em',
  color: 'var(--color-bone)',
  background: 'transparent',
  border: '1px solid color-mix(in srgb, var(--color-bone) 24%, transparent)',
  borderRadius: '8px',
  padding: '9px 16px',
  cursor: 'pointer',
}
const note = {
  color: 'var(--color-bone-2)',
  lineHeight: 1.55,
  maxWidth: '42ch',
}

// The closed trigger; the dialog behind it holds the rights terms.
export function FileAGrip() {
  return (
    <div className="rfx-panel" style={stage}>
      <Dialog>
        <DialogTrigger style={trigger}>File a grip</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File a grip</DialogTitle>
            <DialogDescription style={note}>
              Upload a photo only if you own the rights to it. Hands and grips
              only — no team marks, no broadcast frames, and nothing that implies
              a player or league endorsement.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
