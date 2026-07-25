import { Stamp } from 'pitch-atlas'

// The rarity-index ink stamp rides `currentColor` for both ink and box, so one
// component stamps in any register — bone, the cyan accent, the seam red.
export function Registers() {
  return (
    <div className="rfx-panel" style={{ padding: '22px 24px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Stamp style={{ color: 'var(--color-bone)' }}>Archived</Stamp>
      <Stamp style={{ color: 'var(--color-cyan)' }}>Filed</Stamp>
      <Stamp style={{ color: 'var(--color-seam)' }}>Lost pitch</Stamp>
    </div>
  )
}

// Set as a status marker beside the specimen it files.
export function OnSpecimen() {
  return (
    <div className="rfx-panel" style={{ padding: '22px 24px', display: 'flex', gap: '14px', alignItems: 'center', color: 'var(--color-bone)' }}>
      <div style={{ fontFamily: 'Newsreader, serif', fontSize: '20px', color: 'var(--color-bone)' }}>Splitter</div>
      <Stamp style={{ color: 'var(--color-cyan)' }}>Filed specimen</Stamp>
    </div>
  )
}
