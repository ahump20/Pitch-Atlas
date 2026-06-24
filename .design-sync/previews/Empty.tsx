import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Button,
} from 'pitch-atlas'

export const NoResults = () => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </EmptyMedia>
      <EmptyTitle>No pitches match</EmptyTitle>
      <EmptyDescription>
        Try a different family, or browse the lost-pitches wing.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline">Clear filters</Button>
    </EmptyContent>
  </Empty>
)
