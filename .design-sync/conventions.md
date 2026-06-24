# Pitch Atlas Design System — conventions

Pitch Atlas is a grip-first baseball-pitch atlas. The visual language is editorial
and restrained: a warm bone/paper canvas, near-black stage ink, and a single
seam-red accent (the baseball stitch). Display type is athletic; body is a humanist
sans; labels and data use a mono.

## Setup and wrapping

These are real compiled React components from `window.PitchAtlas.*`. Styling comes
from the global stylesheet, not a runtime theme provider — import `styles.css` once
at the app root and components are styled. There is **no** ThemeProvider to wrap.

Two exceptions need a wrapper or a parent, exactly as in stock shadcn/Radix:

- **Tooltip** must be inside `TooltipProvider`.
- **Select**, **Dialog**, **AlertDialog** render their open surface through a portal
  to `<body>`. Compose the parts inside their Root (`Select` + `SelectTrigger` +
  `SelectContent` + `SelectItem`; `Dialog` + `DialogTrigger` + `DialogContent` + …).
  The preview cards show the trigger/closed surface because the portal escapes a
  static card; the open composition is the real usage.

## The styling idiom

Tailwind v4 utility classes mapped onto semantic CSS variables. **Style components
via their props, not by re-implementing classes.** Use utility classes only for your
own layout glue, and reference the tokens — never hard-coded hex.

Variant vocabulary (use these exact values):

- `Button` — `variant`: `default` `secondary` `outline` `ghost` `destructive` `link`;
  `size`: `xs` `sm` `default` `lg` `icon` `icon-xs` `icon-sm` `icon-lg`
- `Badge` — `variant`: `default` `secondary` `destructive` `outline` `ghost` `link`
- `Toggle` — `pressed`; `ToggleGroup` — `type="single" | "multiple"`
- form controls (`Input`, `Textarea`) carry `aria-invalid` for the error state

Semantic tokens for your own glue (all defined in the stylesheet):
`bg-background` `text-foreground` `text-muted-foreground` `bg-card` `border-border`
`bg-primary` `text-primary-foreground` `bg-secondary` `bg-muted` `text-destructive`
`ring-ring`, radii `--radius-sm` / `--radius` / `--radius-md`.

Brand tokens when you need the raw palette: `var(--color-seam)` (stitch red, the one
accent), `var(--color-bone)` / `var(--color-paper)` (canvas), `var(--color-stage)`
(near-black ink), `var(--color-seam-bright)` / `var(--color-seam-deep)`.

Fonts (shipped, latin 400): **Anton** (athletic display), **Hanken Grotesk** (body),
**Martian Mono** (labels, data, eyebrows), **Newsreader** (occasional serif).

## Where the truth lives

- `styles.css` — the import closure (`fonts/fonts.css` + `_ds_bundle.css`). Read it
  before styling; it defines every token above.
- `components/<group>/<Name>/<Name>.prompt.md` and `<Name>.d.ts` — per-component usage
  and the prop contract.

## One idiomatic example

```tsx
import { Field, FieldLabel, FieldDescription, Input, Button, Badge } from 'pitch-atlas'

export function FileGrip() {
  return (
    <div className="bg-card border-border max-w-sm rounded-lg border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-sm font-medium">File a grip</h3>
        <Badge variant="outline">Unverified</Badge>
      </div>
      <Field>
        <FieldLabel htmlFor="src">Source</FieldLabel>
        <Input id="src" placeholder="Where did you learn it?" />
        <FieldDescription>Every claim carries a source.</FieldDescription>
      </Field>
      <Button className="mt-4">File the pitch</Button>
    </div>
  )
}
```
