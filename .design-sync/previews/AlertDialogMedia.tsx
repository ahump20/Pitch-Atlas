import { AlertDialogMedia } from 'pitch-atlas'

export const Default = () => (
  <div style={{ maxWidth: 360, border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
    <AlertDialogMedia>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    </AlertDialogMedia>
  </div>
)
