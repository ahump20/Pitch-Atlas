import { DialogFooter, Button } from 'pitch-atlas'

export const Actions = () => (
  <div style={{ maxWidth: 360, border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
    <DialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button>Save source</Button>
    </DialogFooter>
  </div>
)
