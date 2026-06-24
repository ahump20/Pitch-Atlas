import { SelectGroup } from 'pitch-atlas'

// SelectGroup is the grouping wrapper used inside an open SelectContent. Shown
// here standalone with plain rows; in product it wraps SelectLabel + SelectItem.
export const Grouped = () => (
  <div style={{ maxWidth: 240, border: '1px solid var(--border)', borderRadius: 8, padding: 6 }}>
    <SelectGroup>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted-foreground)', padding: '4px 8px' }}>
        Fastballs
      </div>
      <div style={{ fontSize: 13, padding: '6px 8px' }}>Four-seam</div>
      <div style={{ fontSize: 13, padding: '6px 8px' }}>Two-seam</div>
    </SelectGroup>
  </div>
)
