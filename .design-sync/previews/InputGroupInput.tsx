import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from 'pitch-atlas'

export const Default = () => (
  <div style={{ maxWidth: 340 }}>
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>mph</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="Velocity is never guessed" />
    </InputGroup>
  </div>
)
