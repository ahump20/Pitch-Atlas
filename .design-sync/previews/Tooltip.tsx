import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  Button,
} from 'pitch-atlas'

// The tooltip surface portals to <body> on open; the trigger is the static,
// card-renderable affordance. Wrap product usage in TooltipProvider.
export const Trigger = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover for the source</Button>
      </TooltipTrigger>
    </Tooltip>
  </TooltipProvider>
)
