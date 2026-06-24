import {
  Select,
  SelectTrigger,
  SelectValue,
} from 'pitch-atlas'

// The open menu portals to <body>; the trigger is the static, card-renderable
// surface. Compose the full open list (SelectContent + SelectItem) in product.
export const Trigger = () => (
  <div style={{ maxWidth: 260 }}>
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Choose a pitch family" />
      </SelectTrigger>
    </Select>
  </div>
)
