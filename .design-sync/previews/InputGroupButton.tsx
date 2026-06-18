import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from 'pitch-atlas'

export const TrailingButton = () => (
  <div style={{ maxWidth: 340 }}>
    <InputGroup>
      <InputGroupInput placeholder="Add a source URL" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Attach</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
)
