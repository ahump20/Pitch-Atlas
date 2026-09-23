import { Button, Kicker } from 'pitch-atlas'

// The Action row of the in-product gallery (src/pages/DesignSystemShowcase.tsx),
// with the gallery's own labels.
// Card grammar (docs/superpowers/specs/2026-07-24-ds-component-truth-and-motion-design.md):
// one eyebrow and heading per card, ported from the in-product gallery's section
// (src/pages/DesignSystemShowcase.tsx), on the first cell only; later cells carry
// the specimen and its caption in the site's mono label.
const cell = { background: 'var(--surface-page)', color: 'var(--color-bone)', padding: '28px' }
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'
// Captions are code and keep the prop's own case: the site's .mono-label would
// upper-case `variant="chrome"` into a prop that does not exist.
const caption = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.6875rem',
  letterSpacing: '0.02em',
  lineHeight: 1.5,
  color: 'var(--color-ink-3)',
}

function Spec({ name, children }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div style={{ minHeight: 48, display: 'flex', alignItems: 'center' }}>{children}</div>
      <code style={caption}>{name}</code>
    </div>
  )
}

// The four void-register variants. `chrome` is the primary action: a matte face
// cut inside a 1px foil rim. Each sits in a same-height slot so the captions
// line up whatever the button's height.
export function Registers() {
  return (
    <section style={cell}>
      <Kicker>Action</Kicker>
      <h2 className={heading}>Button</h2>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-6">
        <Spec name='variant="chrome"'>
          <Button variant="chrome" arrow>
            Open the Pitch Index
          </Button>
        </Spec>
        <Spec name='variant="ghost"'>
          <Button variant="ghost" arrow>
            Read the mission
          </Button>
        </Spec>
        <Spec name='variant="foil"'>
          <Button variant="foil">Open the atlas</Button>
        </Spec>
        <Spec name='variant="link"'>
          <Button variant="link" arrow>
            Watch it flatten
          </Button>
        </Spec>
      </div>
    </section>
  )
}

// `ink` is the cream-register action, so it sits on the cream field the way the
// gallery places it; on the void it washes out.
export function InkOnCream() {
  return (
    <section style={cell}>
      <div className="field-cream inline-flex flex-col items-start gap-3 rounded-lg bg-paper px-6 py-5">
        <Button variant="ink" arrow>
          On cream
        </Button>
        <code style={caption}>variant=&quot;ink&quot; · cream register</code>
      </div>
    </section>
  )
}
