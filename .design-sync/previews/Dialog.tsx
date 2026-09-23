import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Kicker,
} from 'pitch-atlas'

// The discussion forum's report dialog (src/components/sections/DiscussionForum.tsx),
// open over its trigger. Its content portals to <body> over the dimmed page.
const cell = {
  background: 'var(--surface-page)',
  color: 'var(--color-bone)',
  padding: '28px',
  minHeight: '100vh',
  boxSizing: 'border-box',
}
const heading = 'mt-3 mb-6 font-display text-[clamp(22px,3vw,30px)] leading-tight text-bone'

export function ReportThis() {
  return (
    <section style={cell}>
      <Kicker>Primitives</Kicker>
      <h2 className={heading}>Dialog</h2>
      <Dialog defaultOpen>
        <DialogTrigger asChild>
          <Button variant="ghost">Report</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report this?</DialogTitle>
            <DialogDescription>
              Tell us briefly what is wrong. A few reports hide it for review.
            </DialogDescription>
          </DialogHeader>
          <Input label="Reason" placeholder="What is wrong?" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="chrome">Submit report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
