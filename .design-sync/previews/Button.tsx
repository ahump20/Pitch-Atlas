import { Button } from 'pitch-atlas'

// Previews render on the void; a real .rfx-panel surface gives the dark-native
// components the charcoal stage + bone hairline they were drawn for.
const stage = {
  padding: '22px 24px',
  display: 'flex',
  gap: '14px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

// The variant name printed under its specimen, the way the in-product gallery
// (src/pages/DesignSystemShowcase.tsx) labels every button it shows.
const tag = {
  fontFamily: 'Martian Mono, monospace',
  fontSize: '9px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--color-bone-3)',
}

function Spec({ name, children }) {
  return (
    <span style={{ display: 'inline-grid', gap: '7px', justifyItems: 'start' }}>
      {children}
      <span style={tag}>variant=&quot;{name}&quot;</span>
    </span>
  )
}

// The four void-register variants. `ink` is deliberately absent here — it is the
// cream treatment and belongs on paper, not on the charcoal panel.
export function Registers() {
  return (
    <div className="rfx-panel" style={stage}>
      <Spec name="chrome">
        <Button variant="chrome">Study the grip</Button>
      </Spec>
      <Spec name="foil">
        <Button variant="foil">File the pitch</Button>
      </Spec>
      <Spec name="ghost">
        <Button variant="ghost">Not now</Button>
      </Spec>
      <Spec name="link">
        <Button variant="link">View provenance</Button>
      </Spec>
    </div>
  )
}

// The cream register. Showing `ink` on the void washes it out — it is drawn for
// paper: cited inserts, card backs, print. The showcase puts it on a cream swatch
// and so does this cell, because a card that shows a variant in the wrong register
// teaches the wrong thing.
export function InkOnCream() {
  return (
    <div
      className="field-cream"
      style={{
        ...stage,
        background: 'var(--surface-cream, var(--color-paper))',
        borderRadius: '12px',
      }}
    >
      <Spec name="ink">
        <Button variant="ink" arrow>
          Cite a source
        </Button>
      </Spec>
    </div>
  )
}

export function WithArrow() {
  return (
    <div className="rfx-panel" style={stage}>
      <Spec name="chrome · arrow">
        <Button variant="chrome" arrow>
          Open the four-seam
        </Button>
      </Spec>
      <Spec name="foil · arrow">
        <Button variant="foil" arrow>
          Next specimen
        </Button>
      </Spec>
    </div>
  )
}
