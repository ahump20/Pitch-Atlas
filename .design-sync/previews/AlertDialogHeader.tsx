import { AlertDialogHeader } from 'pitch-atlas'

export const Default = () => (
  <div style={{ maxWidth: 360, border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
    <AlertDialogHeader>
      <div style={{ fontWeight: 600 }}>Remove this grip?</div>
      <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
        This deletes the filed grip and its source. It cannot be undone.
      </div>
    </AlertDialogHeader>
  </div>
)
