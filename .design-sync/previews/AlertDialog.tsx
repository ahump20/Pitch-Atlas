import {
  AlertDialog,
  AlertDialogTrigger,
  Button,
} from 'pitch-atlas'

// The confirm panel portals to <body> when open; the trigger is the static,
// card-renderable surface. Compose Content/Header/Footer/Action in product.
export const Trigger = () => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive">Remove this grip</Button>
    </AlertDialogTrigger>
  </AlertDialog>
)
