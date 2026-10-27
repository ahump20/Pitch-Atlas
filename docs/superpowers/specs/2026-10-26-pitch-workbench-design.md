# Pitch bench: design record

The inspector is the bench. Pick a pitch anywhere (a Pitch Index row, a binder
pocket, a card, the compare tray) and it opens over the page you are on; Close or Back
puts you back on the same row of the same filtered list. Plan:
`docs/superpowers/plans/2026-10-26-pitch-workbench.md`.

## What a visitor gets

- **Four views of one specimen.** Card is the holo card with its finish and exports.
  Grip is the ball with the reference hand on it (Top, Side, Thumb; right or left
  hand; drag to turn), then the hold and one row per finger. Release is hold,
  pressure and leave, the mechanics and the pitcher's words. Flight is the shape
  words and an illustrative path.
- **A second pitch beside it.** "Compare with" sets a pair: two balls on one camera
  (turn either, Unlink, Reset; a view preset turns both), rows matched by finger, a
  gold dot where the two hands' engagement or pressure differ. Picking a finger
  lights it on both hands and fades the other rows. A phone gets one ball and an A/B
  switch that keeps the angle. `/compare` renders the same body as a shareable page.
- **Without 3D or under reduced motion**, each ball is the seam-informed schematic,
  which still takes the view and the hand; the link and Reset step aside.

## Decisions

1. **Address.** `?inspect=<slug>&with=<slug>&aspect=card|grip|release|flight&orientation=top|side|thumb&hand=right|left`.
   Opening pushes one history entry marked `{ bench: true }`; every change after it
   replaces that entry; Close goes back over a marked entry and replaces otherwise, so
   no path leaves a duplicate behind. A pair has no Card view.
2. **Provenance.** Sourced lines keep their own badge. Everything the reference hand
   model wrote (where a finger meets the seam, hold, pressure, leave) shares that
   hand's one badge, from `gripModel.provenance`, so no model line reads as sourced.
3. **One cover.** Every pitch shares one seam, never turned to its spin axis, so the
   "seam" difference between two grips is where each finger meets it. No 3D seam
   highlighting this pass.
4. **Flight is illustrative.** The endpoint is the sourced direction bucket
   (`verticalShape`, `horizontalDir`), mirrored for the hand. Each path is the
   spinless line from the mound plus a break that grows with the way travelled (as
   the square for full Magnus, toward the cube for a near-pure gyro), so paths leave
   the release together and bend late, toward the side their own words name. The
   authored spin vector's sideways sign contradicts `horizontalDir` on most of the
   set, so it never chooses a side. No numbers; "Illustrative"; "Drawn from the mound.
   A grip does not guarantee this shape." No link to the Flight Lab, a slow-pitch
   batter's room.
5. **Flight Room.** Stays on its branch, unmerged and undeleted (Austin, 2026-10-26);
   recorded in `2026-10-24-flight-lab-design.md`.
6. **Type.** Headings follow what ships; `docs/design-language.md` §2 now says so.

## Evidence-level corrections in the same pass

- Cole (MLB.com, Statcast): supported. He attacks the top of the zone with a true
  rising fastball and record swing-and-miss totals. Stays Official data.
- Greene (Baseball Savant): supported. Savant's arm angle rose from 2023 to 2024, run
  fell and induced rise grew. Stays Official data; "pure ride" became "ride".
- Strider: Savant's page shows the ride only. theScore's Statcast read gives the low
  release and the flat approach, and Savant puts his arm angle high, so "low, flat
  slot" became "low release", cited to theScore as Reputable analysis.
