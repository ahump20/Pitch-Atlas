import { ToggleGroup, ToggleGroupItem } from 'pitch-atlas'

export const SingleSelect = () => (
  <ToggleGroup type="single" defaultValue="grip">
    <ToggleGroupItem value="grip">Grip</ToggleGroupItem>
    <ToggleGroupItem value="shape">Shape</ToggleGroupItem>
    <ToggleGroupItem value="source">Source</ToggleGroupItem>
  </ToggleGroup>
)

export const MultiSelect = () => (
  <ToggleGroup type="multiple" defaultValue={['fastball', 'breaking']}>
    <ToggleGroupItem value="fastball">Fastball</ToggleGroupItem>
    <ToggleGroupItem value="breaking">Breaking</ToggleGroupItem>
    <ToggleGroupItem value="offspeed">Offspeed</ToggleGroupItem>
  </ToggleGroup>
)
