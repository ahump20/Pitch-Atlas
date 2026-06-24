import { InputGroup, InputGroupTextarea } from 'pitch-atlas'

export const Default = () => (
  <div style={{ maxWidth: 360 }}>
    <InputGroup>
      <InputGroupTextarea placeholder="Describe the grip and cite where you learned it." rows={3} />
    </InputGroup>
  </div>
)
