import { Alert, AlertTitle, AlertDescription } from 'pitch-atlas'

export const Default = () => (
  <Alert>
    <AlertTitle>Seam-informed schematic</AlertTitle>
    <AlertDescription>
      The diagram is built from the figure-eight seam function, not a measured cover.
    </AlertDescription>
  </Alert>
)

export const Destructive = () => (
  <Alert variant="destructive">
    <AlertTitle>No measured figures</AlertTitle>
    <AlertDescription>
      This pitch has no sourced spin rate or velocity. The reading is qualitative, not guessed.
    </AlertDescription>
  </Alert>
)
