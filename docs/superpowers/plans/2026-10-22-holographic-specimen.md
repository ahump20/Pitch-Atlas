# Holographic specimen cards: the plan as executed

Companion to `docs/superpowers/specs/2026-10-22-holographic-specimen-design.md`.
Branch `holo-specimen` from `origin/main` @ `3f518f6`; the dirty `flight-room` working
tree was left exactly as found.

## Phase 1: the hero reads as foil
- Baseline from the live site at 1440×900, 390×844 and 568×320 (rest, hover, touch
  drag) plus a 5-second hover performance trace.
- `src/components/refractor/material/`: `foilRamp.ts` (+ parity test), `materialPresets.ts`
  (+ test), `shaders.ts`, `cardMaterialProgram.ts`, `measureLayout.ts`, `contextPool.ts`,
  `MaterialLayer.tsx` (+ test), `useAmbientMotion.ts`, `motionPref.ts`.
- `RefractorCard` moves the canvas to card level; `index.css` puts the canvas at z-index 2,
  drops the print's stacking context while live, retires the CSS bezel and stand-ins;
  `world.css` loses the 28 percent rule; `useCardTilt` gains modes, `drive()`, `nudge()`,
  light settings and inertia; the hero gets `mode="hero"` and the Pause control.

## Phase 2: one set
- `SpecimenBack.tsx` extracted from the wall, with its own engine and material.
- Wall and discovery cards pass `foil`; the back mounts its material only while flipped.

## Phase 3: the inspector
- `src/components/inspector/`: `inspectorContext.ts`, `useInspector.ts`,
  `SpecimenInspectorHost.tsx` (mounted on the home page), `SpecimenInspector.tsx`,
  `InspectorRail.tsx`, `FinishPanel.tsx`, `ExportPanel.tsx`, `InspectButton.tsx`,
  `finishPrefs.ts` (+ tests), `src/styles/inspector.css`.

## Phase 4: export
- `src/components/inspector/export/`: `types.ts`, `eligibility.ts`, `cardLayout.ts`,
  `composeCard.ts`, `poseCard.ts`, `exportPng.ts`, `exportWebm.ts` (+ tests).
- Vite: the inspector and the compositor travel as the `specimen-inspector` chunk,
  excluded from the PWA precache.

## Phase 5: verify and deliver
- Full gate set, production build, preview smoke, browser verification at desktop,
  phone and short viewports, reduced motion, no WebGL, keyboard; PNG and WebM exported
  and opened; performance after against the baseline; Cloudflare Pages branch preview;
  PR to `main`. Production untouched.

## Deviations from the approved plan, and why
- The hero's Ember Chrome preset samples the brand ramp with the ember flag warming the
  stock and glints, instead of the pure lacquer ramp: the goal statement asks for visible
  burnt-chrome-to-powder-ice at rest on the hero, and the lacquer ramp has no ice.
- The light store lives inside the tilt engine (height, strength, offset) rather than
  in a separate module: one store, one subscription, no second source of truth.
- The context cap is eight, not six: the hero, the filed set, the discovery card, one
  turned-over back and the inspector's two faces can be live at once; in-view gating
  releases whatever has scrolled away.
- The export subagent could not run (API authentication failed); the module was written
  in-session against the same contract.
