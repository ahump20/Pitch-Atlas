# Flight Lab: a slow-pitch batter's own strike zone

Date: 2026-10-24. Status: approved for build (plan approved in session, 2026-10-24).

## Intent

Austin built the Flight Lab in a claude.ai chat on 2026-10-23. It runs as a standalone
app (`pitch-atlas-flight-lab.humphrey-austin20.workers.dev`, artifact
`PfP6c4mkffeVvfAnCV8ZCT`). This document brings it onto pitch-atlas.com as part of
the softball wing.

In his words, the first version's job is "helping batters better understand the
slowpitch softball strikezone". It also helps a batter "visualize where their
relative sweet spot hot zones likely are more or less and what pitches they should
look for". His note on bats: "EVERY bat is 34 inches in length that actually
matters a lot i.e. for ppl like me who swung a 32 inch in baseball."

The thing it teaches: your eyes judge a lob where it crosses the plate, but your
barrel meets it out front, where a falling lob is still higher. A batter leaves
knowing their zone at their height under their league's rulebook, and which landing
spots are their pitch.

## Decisions (Austin's)

- **Batters only.** The umpire drill is cut and baseball stays parked (chat,
  2026-10-23).
- **The default batter is a real measured swing.** It is Austin's, measured from his
  own videos and calibrated off home plate. **It is not named on the site.** It is
  labelled "one batter's measured swing", confidence `community-firsthand`
  (2026-10-24).
- **It gets its own page** at `/softball/flight-lab`, linked from the slow-pitch page
  and the Softball hub (2026-10-24).
- **Rulebooks:** USSSA, USA Softball and USA Senior, chosen per page.
- **Views:** Zone (side close-up from the lefty box, the default), Catcher, Arc and
  Reach.

## Goals

- Rebuild the lab inside this codebase. Its stack is React 19, TypeScript, R3F and
  three 0.185, and the design system's tokens and components. The original source is
  unreachable: it stayed in the chat's sandbox. The only reference is the published
  build, and no minified code ships.
- Keep the behaviour the original reached after its design review:
  - The headline is the batter's verdict (Your pitch / Jams you / Too low / Too high
    / Illegal), with the pitch name as a kicker.
  - The "Look for N–M in past the front of the plate" window is written as a sentence
    with its reason.
  - Height, toes to plate, box, bat and compare-bat controls.
  - Throw and Slow.
  - A sources list with a confidence tier on every figure.
- One set of model functions feeds the 3D scene, the 2D no-WebGL schematic and the
  text. They can never disagree.

## Non-goals

- The umpire drill and the baseball mode.
- Spin-rate, velocity or break figures shown to the visitor. Spin stays an internal
  model input.
- Any account, upload or saved-profile feature. Settings live only in the visitor's
  browser.
- Retiring the standalone worker. Its fate is Austin's call.

## Anti-goals (failure even if it works)

- **A modelled number that looks measured.** The swing model (hands at contact,
  barrel angle, hot band) and the example lobs carry their tier and a note, visibly
  different from the sourced rulebook lines.
- **Naming or picturing the batter.** No body measurements are attributed to a
  person.
- **A blank page without WebGL.** The schematic is the page.
- **Medical, injury or youth-training claims.**

## Data rules

- Each rulebook line is a `Claim`:
  - USSSA: `official-data`.
  - USA Softball's 6–10 ft arc: `official-data` (2026 rule book, Rule 6C §3H, read
    2026-10-24). The original app had 6–12 ft from a secondary source; 12 ft is the
    Senior exception only, so the port corrects it.
  - USA Senior's mat strike: `official-data` if the rule text is retrieved.
- Bat length (34 in max, USSSA rule 2): `official-data`.
- "Slow-pitch bats are made at 34 in": `secondhand-attributed`.
- Sweet spot about 6 in from the end: `reputable-analysis`, noting the 1.5–2 in
  spread between bats.
- Lift and drag (Kensrud thesis fits, borrowed from baseball):
  `reputable-analysis`, `approximate`.
- Example lobs: `unverified`, with the note "example arc, set by hand".
- Measured batter: `community-firsthand`. The barrel angle at contact is
  `unverified`, from one swing.

## Left to the builder

The scene's lighting and materials within the design system; the camera framings;
the exact copy, which gets a pitch-junky pass; the test oracle, taken from running
the original build's model functions in Node.

## Open (Austin's, not blocking)

- His real height: 5 ft 2 in measured, against 5 ft 6 in typed earlier.
- The bat's make and model, which would move the sweet spot.
- A 240 fps side-on clip for the full barrel path.
- What happens to the standalone worker.
- Whether this retires the Flight Room branch.
