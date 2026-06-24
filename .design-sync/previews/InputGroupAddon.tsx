import { InputGroup, InputGroupAddon, InputGroupInput } from 'pitch-atlas'

export const LeadingIcon = () => (
  <div style={{ maxWidth: 340 }}>
    <InputGroup>
      <InputGroupAddon>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </InputGroupAddon>
      <InputGroupInput placeholder="Filter pitches" />
    </InputGroup>
  </div>
)
