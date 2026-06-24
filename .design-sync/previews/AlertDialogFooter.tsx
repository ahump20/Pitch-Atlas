import { AlertDialogFooter, Button } from 'pitch-atlas'

export const Actions = () => (
  <div style={{ maxWidth: 360, border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
    <AlertDialogFooter>
      <Button variant="ghost">Keep it</Button>
      <Button variant="destructive">Remove grip</Button>
    </AlertDialogFooter>
  </div>
)
