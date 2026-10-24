# Holographic specimen: the inspector critique, built (PR #245, round 4)

Spec: `docs/superpowers/specs/2026-10-22-holographic-specimen-design.md` (binding).
Previous round, as executed: `docs/superpowers/plans/2026-10-23-holo-specimen-finish.md`.
Branch `holo-specimen`, worktree `.claude/worktrees/holo-specimen`, round starts at `94f88e2`.

## Why this pass

Austin, 2026-10-23: "finish all the other shit we hadn't got done", then "continue
working". Round 3 ended with a 33-fix screenshot critique of the card viewer delivered
unbuilt (scratchpad `shots-final4/spec.json`: desktop 1440x900 D1-D12, upright phone
390x844 P1-P11, phone on its side 667x375 L1-L10), one known defect (the front export
prints an "Open specimen →" strip the viewer's card does not have), and three deferred
minors. This round builds them. Codes below (D4, P9, ...) are the critique's numbers.

## Global constraints

- Work only in this worktree; never push to main, never deploy production. Branch preview
  only: `npx --yes wrangler@4 pages deploy dist --project-name=pitch-atlas --branch=holo-specimen`.
- Node 24: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24`.
- Gates: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then
  `PLAYWRIGHT_CHANNEL=chrome npm run test:preview:browser -- http://127.0.0.1:4173` against a
  fresh `vite preview`. The two Supabase smoke checks fail until the paused project is
  restored (Austin's invoice); every other check must pass.
- Sizes every viewer change must hold: 1440x900, 390x844, 667x375, 568x320, 844x390, in
  Chromium and Playwright WebKit (CI is Chromium only).
- CSS-only fixes are proved the way round 3 proved them: a probe script in the scratchpad
  that measures the rendered page, run RED before the change and GREEN after.
- No numbers as filler (vault `pitch-atlas/no-numbers.md`). "Seam-informed schematic",
  never "seam-accurate". No medical, injury or workload claims.
- Another session (pitch-atlas-7a) owns PRs #246-#248 and the Supabase re-check; this
  round touches only this branch.
- Commits `type(scope): description`, with the session trailers.

## Calls made up front (each a ledger ruling)

- D8 not built: the weave is already clipped to the card's corner (the canvas's
  `clip-path` and the shader's own rounded mask); the step is the square weave meeting a
  9px arc. Task 9's softer weave on small cards is the part worth doing.
- L1's reorder (Export above Compare / Finish on a short screen) not built: the rail
  keeps the brief's order and gets shorter instead (Tasks 5 and 6), which lifts Export.
- L3 not built: Study grip stays the one primary on its own row.
- D11 is site-wide: every card drops the plate's "PA—00" serial; "File 00" heads the card.
- P11: the overline names the family only when the full name does not already say it.
- P3: Study grip takes the switch's gold (#d6b26e on #1d1710, about 8.9:1), so the
  cream stays the plate's.

## Task 1: The export prints what the card shows

The viewer's card has no strip (no link on it), so the front export drops the strip and
the plate runs to the field's foot, as on screen. The back's "Open the full file →" is a
link label on a still image; the caption plate already carries the address, so the
painted back drops the line. D11: the plate's serial goes from every card and the export.

- RED: `export.test.ts`: `frontText` carries no strip and no serial. `composeCard.test.ts`:
  the front draws no "OPEN SPECIMEN" or "PA—" text and its plate reaches the inner
  foot; the back draws no "OPEN THE FULL FILE". A `RefractorCard` test: the plate prints
  "Grip tell" and no "PA—".
- GREEN: `cardLayout(..., strip: false)` for the front; drop `strip`, `serial` and the
  back's `file` from the text models and painters; `RefractorCard` drops the serial span.
- Expected: the named tests fail first on the old text, then pass; the export suite passes.

## Task 2: One family label, and the overline that does not repeat the name

Deferred minor: the family ternary lives in `InspectorRail`, `SpecimenBack` and
`composeCard`'s `backText`; `PitchChapter` keeps a fourth copy as a map. One helper in
`src/data` (`familyLabel(family)`, `familyOverline(entry)`) serves all four. P11: the
overline is the family unless the full name already contains it ("Four-seam fastball"
gets none; "Slider" gets "Breaking").

- RED: a unit test for both helpers across every filed pitch; the inspector header test
  says four-seam shows no "Fastball" overline and the slider shows "Breaking".
- GREEN: the helper module; the four call sites use it.

## Task 3: The export panel says what it will make, in the rail's own controls

E4 (deferred minor): `probeWebmSupport` reports how the loop will be made
(`{ ok: true, path: 'encoder', codec }` or `{ ok: true, path: 'recorder', mimeType }`), the
panel hands that verdict to `exportSpecimenWebm`, and the export uses its codec instead
of asking again (a failed encoder download still falls back to the recorder). D4: the two
export buttons are two equal columns ("Export PNG", "Export WebM"); the note under them
says what the loop will be: "The WebM is a seven-second loop. It can take a minute or
more to make." on the encoder path, "The WebM is recorded live, so it may stutter or run
short. It can take a minute or more." on the recorder path. D2/D3: the backdrop choice is
a two-part switch in the Front / Sources style ("Dark" / "Transparent" in a group named
Backdrop), so no cream chip competes with Study grip and no pill sits among square
controls. D5: the notes are set in the prose face with `text-wrap: pretty`.

- RED: `exportWebm` tests: a probe verdict of encoder/vp8 encodes VP8 without a second
  codec check; the probe names its path. `ExportPanel` tests: the note per path, the
  Backdrop group with pressed state, and "Export WebM" with no length in its name.
- GREEN: the verdict type in `types.ts`, the probe, the export, the panel and its CSS.

## Task 4: The export reads a clip's framing however the page writes it

E3 (deferred minor): `focusYOf` reads only `%` and keywords; `calc(a% ± bpx)` and plain
lengths fall back to the default crop. Resolve the vertical term against the element's
box and the media's cover-scaled height: fraction = a/100 + b / (boxH − coverH).

- RED: `resolveStageMedia` on a video with `object-position: 50% calc(30% + 20px)` and with
  `50% 120px` reports the resolved focus (and 0.5 when the crop has no vertical slack).
- GREEN: the parser.

## Task 5: The header stays put, and on a phone it takes the top strip

P2, P8, L4: the header (overline and name) leaves the scrolling rail and becomes its own
cell of the viewer's grid: beside the stage over the rail on a wide screen and on a
phone on its side, and across the top on an upright phone, where it takes the strip the
close button sat in alone; the stage's padding becomes even, so the card is centred in
its room. The header keeps 56px clear of the close disc. P7: the close disc gets a faint
gold ring. P10: the dialog's border brightens.

- RED: the header test finds the h2 outside the scrolling rail. Probe (`r4/probe-room.mjs`):
  at 390x844 the name's top sits within the close disc's row, and the card's gaps above
  and below differ by at most 4px; at 667x375 the header ends at least 12px before the disc.
- GREEN: markup (the header renders as a sibling of the rail) and grid areas per layout.

## Task 6: The rail reads as one instrument

L9: Pause and Reset control the view, not the card: they become quiet icon buttons
beside the Front / Sources switch in one view row ("Pause motion" / "Resume motion",
"Reset view"; Pause hides under reduced motion, as the key line already does). D10: one
control height, 40px for a mouse and 44px for touch. P9/L10: the switch's unselected
half gets a faint surface and the selected half a brighter one with the gold key. P3:
Study grip's gold. D7: the arrows are one key chip and the key help an even two-by-two
grid. D1: the key help follows the content instead of waiting at the foot. D6: the file
link names what the file adds, "Master files and sources →", and opens at the master files.

- RED: rail tests for the view row's buttons and names, the single arrow chip, the link's
  name and target; probe: every rail control on one height per pointer type.
- GREEN: `InspectorRail`, `inspector.css`.

## Task 7: A small card stays legible in the viewer

All inside the viewer only (the page cards and every export keep the true card):
P4: on an upright phone the grip tell reads at 14px and may take two lines. P5/L6: below
340px of card the source chip tucks into the window's corner and tightens. L5/L8: below
240px the "Grip tell" label and the "Filed specimen" overline step aside.

- RED/GREEN by probe (`r4/probe-card.mjs`): cue size at 390x844, chip box against the
  ball's region at 390x844 and 667x375, and the hidden labels at 667x375.

## Task 8: The room fits the card

D9: on a wide screen the dialog narrows to the card plus an even margin and the rail, so
the card no longer floats in a 834px stage. D12: the floor shadow tightens and darkens,
over a faint floor light it can read against. L2: on a phone on its side the card clears
the dialog's edges by at least 12px. P1/L1: the "more below" fade is shorter and never
fully transparent, so a control under it still reads.

- RED/GREEN by probe: stage margin around the card at 1440x900, the card's clearance at
  667x375 and 568x320, the fade length.

## Task 9: The weave softens on a small card

P6/L7: below 360px of card the houndstooth's contrast eases toward about half, so the
grip stays the brightest thing; at export sizes it is untouched.

- RED: `shaders.test.ts` asserts the houndstooth term carries a width-dependent gain.
- GREEN: the shader line; a before/after render at 324px and 224px.

## Review focus (for the final reviewer)

Focus order and screen-reader names after the header and the view row move; the
dialog's scroll and fade at each size; the probe verdict when the encoder fails to
download; framing for `calc()` and length positions with no vertical slack; every card
on the home page after the serial goes; the export against the screen card at the same
pose.
