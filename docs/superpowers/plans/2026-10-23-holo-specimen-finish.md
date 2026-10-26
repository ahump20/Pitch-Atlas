# Holographic specimen: finishing pass (PR #245, round 3)

Spec: `docs/superpowers/specs/2026-10-22-holographic-specimen-design.md` (binding).
Previous plan, as executed: `docs/superpowers/plans/2026-10-22-holographic-specimen.md`.
Branch `holo-specimen`, worktree `.claude/worktrees/holo-specimen`, round starts at `542bfde`.

## Why this pass

Austin, 2026-10-23: "finish all the other shit we hadn't got done yesterday or the day
before." What was left open on this draft, all checked against the code this session:

- CodeRabbit's second review (10b0cfb, 05:28Z) has three still-valid findings and one
  doc label: modifier keys swallowed by the inspector, a failed encoder download that
  skips the recorder fallback, a support check that trusts `VideoEncoder` without asking
  for a WebM codec, and WebM timings that do not name the frame size they were measured at.
- The exported back omits the movement wheel (the "spin dial") the page back carries.
- Safari was never tried for the WebM.
- The 38-item screenshot critique from last round (three annotated shots; scratchpad
  `annotate.py` of session 83dcd178). De-duplicated below into Tasks 6 to 11.

## Global constraints

- Work only in this worktree; never push to main, never deploy production. Branch preview
  only: `npx --yes wrangler@4 pages deploy dist --project-name=pitch-atlas --branch=holo-specimen`.
- Node 24: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 24`.
- Gates: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then
  `PLAYWRIGHT_CHANNEL=chrome npm run test:preview:browser -- http://127.0.0.1:4173` against a
  fresh `vite preview` (restart it after every build). The two Supabase smoke checks fail
  until the paused project is restored; every other check must pass.
- Sizes every inspector change must hold: 1440x900, 390x844, 667x375, 568x320, 844x390.
- No numbers as filler (vault `pitch-atlas/no-numbers.md`): the wheel stays direction only.
  "Seam-informed schematic", never "seam-accurate". No medical, injury or workload claims.
- Commits `type(scope): description`, with the session trailers.

## Task 1: The inspector leaves modified keys to the browser

`SpecimenInspector.onKeyDown` returns before its switch when `ctrlKey`, `metaKey` or
`altKey` is set, so Cmd/Ctrl+R reloads and Cmd/Ctrl+F finds instead of resetting or
flipping the card.

- RED: in `SpecimenInspector.test.tsx`, Cmd+R and Ctrl+F on the stage leave the face on
  Front and are not default-prevented; plain R and F still act.
- GREEN: the one-line guard.

## Task 2: A failed encoder download falls back to the recorder

`exportSpecimenWebm` catches `loadEncoder()`'s error, keeps it, and goes on to the
recorder; the error surfaces only when no recorder exists either.

- RED: in `exportWebm.test.ts`, with the encoder module failing to load and a WebM
  `MediaRecorder` present, the export resolves through the recorder; with neither, it
  rejects with the download message.
- GREEN: hold the error, pick the recorder, throw the held error only at the end.

## Task 3: The support check asks for a WebM codec, not just an encoder

`probeWebmSupport()` (async): when `VideoEncoder` exists, ask
`VideoEncoder.isConfigSupported` for VP9 then VP8 at the export's real frame size, 30 fps
and the export bitrate; otherwise, or when both are refused, fall back to the recorder's
WebM types. `ExportPanel` starts from the synchronous answer and replaces it with the probe's.
The frame size comes from one helper shared with the export, never a second copy.

- RED: encoder present but both codecs refused and no recorder → `{ ok: false }` with
  the reason in words; a supported VP9 → ok; no encoder, recorder present → ok.
- GREEN: the probe and the panel wiring.

## Task 4: The WebM limitation names its frame size

In the spec's limitations, the 40 s / 76 s timings say they were measured on the
1440x2010 posed frame made from the 1200 px card face. Task 12's Safari result lands here
too.

## Task 5: The exported back carries the movement wheel

One pure geometry module, `movementWheel.ts`, computes the wheel (rings, ticks, spin-axis
line, the break arrow or the knuckleball scatter, the gyro dot, the caption) from
`PitchMotion`. `ScoutMovementWheel` renders it as SVG; the export painter draws the same
geometry onto the canvas back between the header rule and the rows, sized as the page
sizes it (`clamp(80px, 36%, 134px)` at the 360 px reference), with its two-line caption.

- RED: geometry tests (four-seam rides arm-side; knuckleball scatters; a gyro pitch
  carries the dot; no motion record gives the empty wheel); a composer test that the back
  paints the wheel (its rings and the dashed axis reach the context) and that the rows
  start below it.
- GREEN: the module, the SVG component reading it, the painter.

## Task 6: One primary control and an even grid (critique 1.1, 1.10, 1.12, 2.5, 2.6, 2.9, 3.3, 3.8, 3.9)

- Study grip becomes the rail's one primary: a full-width solid row, not the chrome pill
  that competes with the card's foil.
- Compare, Finish, Pause/Resume and Reset sit in two equal columns with one right edge;
  on a short landscape screen, three columns.
- Front / Sources spans the rail in two equal halves, the same height as the buttons
  (44 px on coarse pointers), with a hover state on the unselected half.
- Finish carries a chevron that turns when its panel is open.

## Task 7: The rail's words (critique 1.7, 1.11, 1.13, 1.14, 2.3, 3.4)

- The header stops repeating the card: an overline with the family and the face's source
  tier (its dot and label), then the name; on phones and short screens, one tighter block.
- The keyboard help becomes key chips pinned to the rail's foot, and is not shown on a
  touch-only device.
- The caption reads as a small "Caption" label over the attribution.
- "Open the full file →" is one link under one underline.

## Task 8: Export says what it costs (critique 1.2)

The WebM row says it takes about a minute (longer with a transparent backdrop); a finished
PNG or WebM names its file size.

## Task 9: The room's frame (critique 1.6, 2.1, 2.4, 2.8, 3.5, 3.6, 3.7, 3.10, 3.11, 3.12)

- Close: a 40 px dark disc on desktop aligned with the overline; on an upright phone the
  stage gets its own top padding so the disc never sits on the card's rim; on its side the
  disc aligns with the overline.
- A soft fade at the bottom of whatever scrolls (the rail, or the dialog on a phone) says
  more follows.
- The card keeps 12 to 16 px above the rail on phones; on its side the stage padding is
  trimmed and balanced so the card grows to its height cap and sits optically centred.
- The dialog margin honours the safe-area insets (`viewport-fit=cover` is set).
- The column divider stops 12 px short of the dialog's edges.

## Task 10: The room's light (critique 1.4, 1.5, 1.8, 1.9, 2.7, 2.10, 2.12, 3.1)

- The backdrop dims and blurs deeper behind this dialog (an overlay class on the primitive).
- A soft elliptical floor shadow seats the card.
- In the dark room the cream cue plate drops a step in luminance (inspector only; the
  print and the export keep the true plate).
- The rim houndstooth scales with the card's width so it reads as weave at every size.
- The source chip keeps clear of the window's bezel.
- Below about 240 px of card width the plate drops its secondary line and holds its type
  floor, so the grip tell stays readable on a phone on its side.

## Task 11: The grip in the window (critique 1.3, 2.2, 3.2)

- Each grip clip carries a focus point (`focus: { x, y }`, fractions of the frame) chosen
  from its own frames: the fingertips on the seams. The window and the export both crop to
  it. Every clip without one keeps today's framing.
- In the inspector, Pause holds the grip clip on its frame as well as the card's turn.

## Task 12: Safari

Ask this Mac's Safari, unattended, for `VideoEncoder` VP9/VP8 at the export size and for
`MediaRecorder` WebM types, through a local page that reports back. Record the answer in
the spec and make sure the panel says so before the click (Task 3) where Safari cannot.

## Task 13: Gates, preview, PR

All gates; the browser smoke; the five sizes in a real browser; redeploy the branch
preview; the PR body's "Review follow-up" table gets this round; the screenshot critique
for the report.

## Deferred, with rulings

- Critique 2.11, a bottom sheet for Finish on phones: deferred. It changes how tuning
  works on a phone and deserves its own pass; cost if wrong: tuning on a phone stays
  scroll-heavy.
