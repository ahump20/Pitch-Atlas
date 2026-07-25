import { useState } from 'react'
import { SearchField } from 'pitch-atlas'

const panel = { padding: '22px 24px', display: 'grid', gap: '10px', maxWidth: '420px' }
const microLabel = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: 'var(--color-bone-3)',
}

// The Pitch Index front door, empty — the leading search glyph and placeholder.
export function Empty() {
  return (
    <div className="rfx-panel" style={panel}>
      <div style={microLabel}>Pitch Index</div>
      <SearchField placeholder="Search every pitch…" />
    </div>
  )
}

// A live query. Controlled by state; Escape clears it through onClear.
export function Typed() {
  const [query, setQuery] = useState('slider')
  return (
    <div className="rfx-panel" style={panel}>
      <div style={microLabel}>Pitch Index</div>
      <SearchField
        placeholder="Search every pitch…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
      />
    </div>
  )
}
