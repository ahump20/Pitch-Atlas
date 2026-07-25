import { Input } from 'pitch-atlas'

const panel = { padding: '22px 24px', display: 'grid', gap: '10px', maxWidth: '420px' }

// The archival text field on the dark control tokens. Its `label` prop renders a
// mono field-label wired to the input.
export function Field() {
  return (
    <div className="rfx-panel" style={panel}>
      <Input label="Source URL" placeholder="Where did you learn this grip?" />
    </div>
  )
}

// The error state: `aria-invalid` carries the semantics; the seam-red edge and
// note make it visible. Every claim has to name a source we can check.
export function Invalid() {
  return (
    <div className="rfx-panel" style={panel}>
      <Input
        label="Source URL"
        defaultValue="heard it somewhere"
        aria-invalid="true"
        style={{ borderColor: 'var(--color-seam)' }}
      />
      <div style={{ fontFamily: 'Martian Mono, monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-seam)' }}>
        Add a source we can check
      </div>
    </div>
  )
}
