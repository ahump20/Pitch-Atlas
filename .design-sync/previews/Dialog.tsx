import {
  Dialog,
  DialogTrigger,
  Button,
} from 'pitch-atlas'

// The dialog panel portals to <body> when open; the trigger is the static,
// card-renderable surface. Compose DialogContent/Header/Footer in product.
export const Trigger = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button>Open the source detail</Button>
    </DialogTrigger>
  </Dialog>
)
