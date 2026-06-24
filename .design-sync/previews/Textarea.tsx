import { Textarea } from 'pitch-atlas'

export const States = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
    <Textarea placeholder="How is this grip held? Cite where you learned it." rows={3} />
    <Textarea defaultValue="Index and middle across the horseshoe, thumb tucked underneath." rows={3} />
  </div>
)
