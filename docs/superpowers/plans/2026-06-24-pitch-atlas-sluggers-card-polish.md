# Pitch Atlas Sluggers Card Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit the live Pitch Atlas web surface, inspect the local Sluggers inspiration folder image-by-image, upgrade the card system from flat file cards into tactile collectible pitch specimens, fix support/privacy copy and mobile overflow, then ship through the canonical `ahump20/Pitch-Atlas` Cloudflare Pages path.

**Architecture:** Keep the existing Vite, React, Tailwind v4, React Router, and shadcn control-layer setup. Treat `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/` as local visual reference only, then translate the useful shared traits into deterministic CSS and existing React components. No route slug, data model, Supabase schema, source tier, or pitch claim changes unless a verified bug blocks the UI work.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind v4, React Router 7, Vitest, Playwright, Cloudflare Pages, GitHub Actions workflow `deploy-cloudflare-pages.yml`.

---

## Ground Rules

- [verified] Canonical repo: `https://github.com/ahump20/Pitch-Atlas.git`.
- [verified] Current repo path: `/Users/AustinHumphrey/Pitch-Atlas`.
- [verified] Production deploy path: GitHub Actions workflow `.github/workflows/deploy-cloudflare-pages.yml`, triggered manually after merge or on the approved deploy ref.
- [verified] Current local branch is not `main`, but it tracks `origin/main`; do not run a plain `git push`.
- [reasoned] Best visual move is continuity polish, not a total rebuild. The refractor/specimen language already exists.
- [open] Final grade is not real until live production renders are opened after deploy.

## Local Sluggers Reference Gate

- [ ] Inspect every image in `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/` before further CSS or component edits.
- [ ] Confirm the folder remains untracked and no image is copied into `src/`, `public/`, or any committed artifact.
- [ ] Translate only shared visual traits into deterministic UI:
  - foil-spectrum outer edge
  - thick black collectible-card rim
  - inset rounded portrait window
  - arched or varsity top lockup energy
  - bold bottom nameplate
  - `READ` plate rhythm instead of fake stats
  - houndstooth or noise texture
  - high-contrast labels
  - tactile hover and tilt
- [ ] Implementation is not complete until these traits are visible in desktop and mobile screenshots.

## Files

- Read visual references only:
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7280.PNG`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7281.PNG`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7282.PNG`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7283.PNG`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7284.PNG`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7285.PNG`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7288.HEIC`
  - `/Users/AustinHumphrey/Pitch-Atlas/Sluggers Hit Card Inspiration examples/IMG_7289.HEIC`
- Modify: `src/index.css`
  - Owns refractor card finish, directory card finish, overflow containment, and visual polish.
- Modify: `src/pages/SupportPage.tsx`
  - Shorten support copy, remove visible em-dashes, keep no invented contact info.
- Modify: `src/pages/PrivacyPage.tsx`
  - Shorten privacy copy, remove visible em-dashes, keep policy date and factual promises.
- Modify: `src/routes.test.tsx`
  - Lock copy changes and no visible em-dashes on support/privacy routes.
- Modify: `scripts/preview-browser-smoke.mjs`
  - Add production-like mobile overflow and plain-copy checks for support/privacy.
- Read only unless a CSS-only fix is not enough:
  - `src/components/refractor/RefractorCard.tsx`
  - `src/components/sections/PitchIndex.tsx`
  - `src/components/layout/SectionHero.tsx`

## Do Not Touch

- Do not add or track `Sluggers Hit Card Inspiration examples/`.
- Do not add fake pitch values, fake freshness, fake stats, fake contacts, fake logos, copied Sluggers marks, copied cannabis copy, copied characters, player likenesses, or team marks.
- Do not change Supabase schema, migrations, RLS, or bucket policy for this pass.
- Do not rename routes or nav labels.

---

### Task 1: Verify Baseline and Protect the Branch

**Files:**
- Read: `package.json`
- Read: `.github/workflows/deploy-cloudflare-pages.yml`
- Read: `src/lib/sitemap.ts`

- [ ] **Step 1: Confirm repo and branch**

Run:

```bash
cd /Users/AustinHumphrey/Pitch-Atlas
git status --short --branch
git remote -v
```

Expected:

```text
origin  https://github.com/ahump20/Pitch-Atlas.git
```

If the branch is `main` or `master`, stop and create a working branch:

```bash
git switch -c codex/sluggers-card-polish-20260624
```

- [ ] **Step 2: Confirm no tracked changes exist before edits**

Run:

```bash
git diff --stat
git diff --name-only
```

Expected: no tracked file output. Untracked local folders may exist. Do not add them.

- [ ] **Step 3: Confirm package gates**

Run:

```bash
node --version
npm --version
npm run typecheck
npm run lint
npm run test
```

Expected: all pass before visual edits. If baseline fails, stop and report the exact failing command.

---

### Task 2: Audit All Live Route Families

**Files:**
- Read: `public/sitemap.xml`
- Read: `src/lib/sitemap.ts`
- Output only: local screenshots under `.qa-shots/sluggers-card-polish-before/`

- [ ] **Step 1: Pull the live sitemap**

Run:

```bash
python3 - <<'PY'
from urllib.request import urlopen
from xml.etree import ElementTree as ET

xml = urlopen("https://pitch-atlas.com/sitemap.xml", timeout=20).read()
root = ET.fromstring(xml)
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [loc.text for loc in root.findall(".//sm:loc", ns)]
print(len(urls))
for url in urls:
    print(url)
PY
```

Expected: a full list of public route URLs. Use this as the route coverage source.

- [ ] **Step 2: Open and interact with route groups**

Use the in-app Browser for public, logged-out QA. Visit representative routes from every family:

```text
/
/repertoire/
/pitch/four-seam/
/repertoire/gyro-slider/
/craftsmen/
/craftsmen/mariano-rivera/
/lost-pitches/
/lost-pitches/satchel-paige-hesitation-pitch/
/learn/
/learn/pitch-design/
/grips/
/compare/
/movement-map/
/sandbox/
/softball/
/softball/fastpitch/
/softball/pitch/riseball/
/sources/
/about/
/privacy/
/support/
```

Interactions to perform:

```text
Repertoire: search, family filters, binder/list toggle, reset.
Compare: select two pitches if controls are present.
Movement map: move filters or selectors if controls are present.
Sandbox: move/adjust controls if present.
Mobile nav: open and close menu.
Cards: hover/focus links and confirm focus is visible.
Source links: confirm the source registry route remains reachable.
```

- [ ] **Step 3: Grade the current UI**

Use this grading rubric:

```text
Visual identity: 20
Card craft: 20
Typography: 15
Wayfinding: 15
Mobile behavior: 15
Cognitive load: 10
Trust/provenance clarity: 5
```

Expected starting grade for this pass: around `B`, unless new evidence proves otherwise.

- [ ] **Step 4: Capture before screenshots**

Save before screenshots to:

```text
.qa-shots/sluggers-card-polish-before/home-desktop.png
.qa-shots/sluggers-card-polish-before/repertoire-desktop.png
.qa-shots/sluggers-card-polish-before/pitch-detail-desktop.png
.qa-shots/sluggers-card-polish-before/support-mobile.png
.qa-shots/sluggers-card-polish-before/privacy-mobile.png
```

Do not commit these screenshots unless Austin explicitly asks for proof artifacts in git.

---

### Task 3: Generate Reference Images Before Coding

**Files:**
- Output only: `outputs/imagegen/generative-polish/pitch-atlas-sluggers-card-polish-20260624/`

- [ ] **Step 1: Generate desktop pitch-detail card reference**

Use ImageGen with this prompt:

```text
Create one horizontal website section reference for Pitch Atlas, a sourced baseball pitch reference site.
Show a single premium collectible pitch specimen card in a desktop pitch-detail section.
Use these visual cues only: holographic foil rim, black double border, arched image window, bold nameplate, cream read plate, tactile paper grain, halftone texture, baseball archive mood.
No text except short generic placeholders like PITCH ATLAS, READ, FILE, SHAPE READ.
No logos from Sluggers. No cannabis language. No player likenesses. No team marks. No numbers. No charts. No fake stats. No UI claims.
Palette: warm black, bone paper, seam red, muted cyan foil hits.
Output should be implementation-friendly, readable, and not a full site mockup.
```

Save as:

```text
outputs/imagegen/generative-polish/pitch-atlas-sluggers-card-polish-20260624/desktop-pitch-detail-reference.png
```

- [ ] **Step 2: Generate desktop repertoire grid reference**

Use ImageGen with this prompt:

```text
Create one horizontal website section reference for Pitch Atlas repertoire cards.
Show a grid of collectible file cards, not dashboard cards.
Use foil top edges, black rims, cream read plates, strong hover-card depth, small source tags, and card texture.
No real player names. No fake pitch values. No copied Sluggers marks. No cannabis copy. No generated long text.
The design must look codeable in CSS and React.
```

Save as:

```text
outputs/imagegen/generative-polish/pitch-atlas-sluggers-card-polish-20260624/desktop-repertoire-grid-reference.png
```

- [ ] **Step 3: Generate mobile pitch-detail reference**

Use ImageGen with this prompt:

```text
Create one premium mobile web screen reference inside a clean phone frame.
This is Pitch Atlas on a pitch-detail page.
The specimen card should feel tactile and collectible but the screen must stay readable.
Show safe-area spacing, a top title region, one primary specimen card, and a plain source/read panel.
No fake stats. No copied logos. No player likenesses. No cannabis language. No tiny unreadable text.
```

Save as:

```text
outputs/imagegen/generative-polish/pitch-atlas-sluggers-card-polish-20260624/mobile-pitch-detail-reference.png
```

- [ ] **Step 4: Generate mobile support/privacy reference**

Use ImageGen with this prompt:

```text
Create one premium mobile web screen reference for a Pitch Atlas support or privacy page.
Use plain language, clear rows, strong spacing, baseball card material cues only at the edges.
The screen must not overflow horizontally.
No fake contact details. No fake legal claims. No copied marks. No tiny text.
```

Save as:

```text
outputs/imagegen/generative-polish/pitch-atlas-sluggers-card-polish-20260624/mobile-support-privacy-reference.png
```

- [ ] **Step 5: Extract design decisions**

Write a short extraction note in the implementation session only, not in the repo, with these fields:

```text
Keep:
- foil edge behavior
- black double rim
- arched image window
- nameplate prominence
- cream read plate with tab
- richer row/card texture

Reject:
- generated text
- fake stats
- copied marks
- over-busy badges
- illegible mobile microcopy
```

---

### Task 4: Add Tests for Copy and Mobile Overflow

**Files:**
- Modify: `src/routes.test.tsx`
- Modify: `scripts/preview-browser-smoke.mjs`

- [ ] **Step 1: Add route test for dash-free support/privacy copy**

In `src/routes.test.tsx`, inside `describe('Privacy and support', () => { ... })`, add:

```tsx
  it.each(['/privacy', '/support'])('keeps %s copy plain and dash-free', async (path) => {
    const { container } = renderRoute(path)
    await screen.findByRole('heading', { level: 1 }, COLD_LOAD)

    const text = container.textContent ?? ''
    expect(text).not.toMatch(/[\u2014\u2013]/)
    expect(text).not.toMatch(/@pitch-atlas\.com/)
  })
```

- [ ] **Step 2: Update the privacy date test expectation**

Replace this expectation:

```tsx
expect(screen.getByText(/Privacy policy · \d{4}-\d{2}-\d{2}/)).toBeInTheDocument()
```

with:

```tsx
expect(screen.getByText(/Privacy policy \/ \d{4}-\d{2}-\d{2}/)).toBeInTheDocument()
```

- [ ] **Step 3: Add preview smoke checks for support/privacy**

In `scripts/preview-browser-smoke.mjs`, add:

```js
async function checkSupportAndPrivacy(page, viewport) {
  await page.setViewportSize(viewport)

  for (const path of ['/support/', '/privacy/']) {
    const messages = await collectConsole(page, async () => {
      await page.goto(route(path), { waitUntil: 'domcontentloaded' })
      await page.locator('h1').waitFor({ state: 'attached' })
    })

    const body = await pageText(page)
    record(messages.length === 0, `${path} console warnings/errors: ${messages.join(' | ')}`)
    record(!/[\u2014\u2013]/.test(body), `${path} contains a visible long dash`)
    record(!body.includes('@pitch-atlas.com'), `${path} contains fabricated contact email`)
    await assertVisible(page, 'h1', `${path} heading`)
    await assertNoHorizontalOverflow(page, `${path} ${viewport.width}x${viewport.height}`)
  }
}
```

Call it from the main flow with:

```js
await checkSupportAndPrivacy(page, { width: 390, height: 844 })
await checkSupportAndPrivacy(page, { width: 1280, height: 900 })
```

- [ ] **Step 4: Run tests and confirm failure before code edits**

Run:

```bash
npm run test -- src/routes.test.tsx
```

Expected: FAIL before copy edits because current support/privacy copy contains visible long dashes or old privacy separator.

---

### Task 5: Implement Card System Polish

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Strengthen the outer foil card**

In `.rfx-card`, keep existing tilt and animation. Add a stronger black rim and preserve the foil:

```css
    filter: saturate(1.04) contrast(1.02);
    box-shadow:
      0 30px 56px -26px rgba(0,0,0,.66),
      0 0 0 2px rgba(5,4,3,.92),
      0 0 0 5px color-mix(in srgb, var(--c3,#37D6FF) 18%, rgba(246,241,230,.28)),
      inset 0 1px 0 rgba(255,255,255,.46),
      inset 0 -2px 5px var(--bevel-lo),
      0 0 46px -18px color-mix(in srgb, var(--c3,#37D6FF) 30%, transparent);
```

- [ ] **Step 2: Deepen the card face**

In `.rfx-field`, add an inner rim:

```css
    box-shadow:
      inset 0 0 0 2px rgba(5,4,3,.9),
      inset 0 0 0 5px color-mix(in srgb, var(--c3,#37D6FF) 14%, rgba(246,241,230,.34)),
      inset 0 16px 34px rgba(255,255,255,.04),
      inset 0 -24px 36px rgba(0,0,0,.38);
```

- [ ] **Step 3: Raise the texture without hurting readability**

In `.rfx-field::before`, change:

```css
opacity: .2;
```

to:

```css
opacity: .28;
```

Do not raise it past `.32`; the read plate and window must stay legible.

- [ ] **Step 4: Make the arched window feel printed into the card**

In `.rfx-window`, add a bone stroke and black outline:

```css
    border: 2px solid color-mix(in srgb, #F6F1E6 64%, var(--c3,#37D6FF));
    outline: 2px solid rgba(5,4,3,.86);
    outline-offset: -5px;
```

- [ ] **Step 5: Rename the plate concept from stats to read**

Change the comment above `.rfx-content` from `the STATS plate` to `the READ plate`.

In `.rfx-content`, change:

```css
margin-top: 9px;
padding: 11px 12px 12px;
```

to:

```css
margin-top: 15px;
padding: 17px 12px 12px;
```

Then add:

```css
  .rfx-content::before {
    content: "READ";
    position: absolute;
    left: 10px;
    top: -14px;
    padding: 4px 12px 3px;
    border-radius: 7px 7px 0 0;
    background: #080604;
    border: 1px solid rgba(0,0,0,.72);
    border-bottom: 0;
    box-shadow: inset 0 1px 0 rgba(246,241,230,.16);
    font-family: var(--font-athletic);
    font-size: 13px;
    line-height: 1;
    letter-spacing: .08em;
    color: #F6F1E6;
  }

  .rfx-content::after {
    content: "";
    position: absolute;
    left: 67px;
    right: 10px;
    top: -7px;
    height: 1px;
    background: linear-gradient(90deg, color-mix(in srgb, var(--c3,#37D6FF) 55%, transparent), transparent);
  }
```

- [ ] **Step 6: Keep mobile card text stable**

Inside the existing `@media (max-width: 480px)` block, change:

```css
.rfx-content { padding: 9px 11px 10px; gap: 7px; }
```

to:

```css
.rfx-content { margin-top: 13px; padding: 15px 11px 10px; gap: 7px; }
.rfx-content::before { top: -13px; font-size: 12px; }
```

- [ ] **Step 7: Upgrade directory cards**

Replace the `.rfx-entry` rule with:

```css
  .rfx-entry {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: flex;
    gap: 13px;
    align-items: flex-start;
    padding: 15px 16px;
    border-radius: 14px;
    background:
      radial-gradient(70% 90% at 8% 0%, color-mix(in srgb, var(--gc, #37D6FF) 18%, transparent), transparent 62%),
      linear-gradient(135deg, color-mix(in srgb, var(--gc, #37D6FF) 10%, #22180F), #100C07 72%);
    border: 1px solid rgba(246,241,230,.10);
    box-shadow:
      inset 0 1px 0 rgba(246,241,230,.10),
      inset 0 -18px 32px rgba(0,0,0,.18),
      0 16px 30px -24px rgba(0,0,0,.85);
    transition: transform .2s, border-color .2s, background .2s, box-shadow .2s;
  }

  .rfx-entry::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: .18;
    background:
      repeating-linear-gradient(45deg, rgba(246,241,230,.36) 0 1px, transparent 1px 9px),
      repeating-linear-gradient(-45deg, color-mix(in srgb, var(--gc, #37D6FF) 38%, transparent) 0 1px, transparent 1px 18px),
      radial-gradient(260px circle at 18% 0%, rgba(255,255,255,.24), transparent 62%);
    mix-blend-mode: screen;
  }

  .rfx-entry::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow:
      inset 0 0 0 1px rgba(0,0,0,.58),
      inset 0 0 0 3px color-mix(in srgb, var(--gc, #37D6FF) 12%, transparent);
  }

  .rfx-entry > * {
    position: relative;
    z-index: 1;
  }
```

Update hover:

```css
  .rfx-entry:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--gc, #37D6FF) 55%, transparent);
    box-shadow:
      inset 0 1px 0 rgba(246,241,230,.14),
      inset 0 -18px 32px rgba(0,0,0,.18),
      0 22px 38px -24px rgba(0,0,0,.92);
  }
```

- [ ] **Step 8: Add safe overflow containment**

Near the base layout rules in `src/index.css`, add:

```css
html,
body,
#root {
  overflow-x: clip;
}
```

If this breaks an intentional internal horizontal scroller, scope the fix to:

```css
body,
#root {
  overflow-x: clip;
}
```

and keep internal `overflow-x-auto` controls untouched.

- [ ] **Step 9: Run card smoke tests**

Run:

```bash
npm run typecheck
npm run test -- src/routes.test.tsx src/components/sections/PitchIndex.test.tsx
```

Expected: pass after copy changes in the next task. If only CSS changed and tests still fail from old copy, continue to Task 6.

---

### Task 6: Rewrite Support and Privacy Copy

**Files:**
- Modify: `src/pages/SupportPage.tsx`
- Modify: `src/pages/PrivacyPage.tsx`

- [ ] **Step 1: Update support meta descriptions**

In `src/pages/SupportPage.tsx`, replace both long-dash descriptions with:

```tsx
description:
  'How to report a problem, delete your account, or question a claim in Pitch Atlas, the sourced field manual for pitch craft.',
```

and:

```tsx
description:
  'How to report a problem, delete your account, or question a claim in Pitch Atlas, the sourced field manual for pitch craft.',
```

- [ ] **Step 2: Update support hero body**

Replace the support hero `<p>` with:

```tsx
<p>
  Pitch Atlas is a sourced field manual for how pitchers grip and shape a baseball. It is a
  reference site and an iOS app, with an optional community layer for field notes and discussion.
  This page covers the three things people ask for most.
</p>
```

- [ ] **Step 3: Update support claim row**

Replace the `Question a claim in the manual` text with:

```tsx
text: 'Every figure on a specimen page is labeled with where it came from. Start at the source registry. If a claim looks wrong, the source link is one click away, and the label tells you how much weight it should carry.',
```

- [ ] **Step 4: Update support contact copy**

Replace the contact paragraph text with:

```tsx
Report issues through the in-product Report flow on any note or post. Every report is reviewed.
For how the manual handles your data, read the{' '}
```

Keep the existing privacy and sources links.

- [ ] **Step 5: Update privacy eyebrow separator**

In `src/pages/PrivacyPage.tsx`, replace:

```tsx
eyebrow={`Privacy policy · ${POLICY_DATE}`}
```

with:

```tsx
eyebrow={`Privacy policy / ${POLICY_DATE}`}
```

- [ ] **Step 6: Update anonymous-account paragraph**

Replace:

```tsx
file a report, an anonymous account is created for you [long dash] a random ID with no email
```

with:

```tsx
file a report, an anonymous account is created for you: a random ID with no email
```

- [ ] **Step 7: Update account deletion paragraph**

Replace:

```tsx
To delete your account entirely, use the Pitch Atlas iOS app: Account → delete
account.
```

with:

```tsx
To delete your account entirely, use the Pitch Atlas iOS app. Open Account, then choose delete
account.
```

- [ ] **Step 8: Update privacy contact paragraph**

Replace:

```tsx
Report a problem with any note or post through its in-product Report action [long dash] that is
the fastest route to a human review.
```

with:

```tsx
Report a problem with any note or post through its in-product Report action. That is
the fastest route to a human review.
```

- [ ] **Step 9: Search for remaining visible long dashes in edited pages**

Run:

```bash
rg -n "[\u2014\u2013]" src/pages/SupportPage.tsx src/pages/PrivacyPage.tsx
```

Expected: no output.

- [ ] **Step 10: Run support/privacy tests**

Run:

```bash
npm run test -- src/routes.test.tsx
```

Expected: pass.

---

### Task 7: Local Build and Browser Verification

**Files:**
- Read: `dist/`
- Output only: `.qa-shots/sluggers-card-polish-after/`

- [ ] **Step 1: Run full local gates**

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: all pass.

- [ ] **Step 2: Start local preview**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Keep the preview process running.

- [ ] **Step 3: Run preview browser smoke**

In a second shell, run:

```bash
npm run test:preview:browser -- http://127.0.0.1:4173
```

Expected: pass. The new support/privacy overflow checks must pass at both mobile and desktop widths.

- [ ] **Step 4: Manually inspect key pages**

Open local preview in the Browser:

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/repertoire/
http://127.0.0.1:4173/pitch/four-seam/
http://127.0.0.1:4173/softball/pitch/riseball/
http://127.0.0.1:4173/support/
http://127.0.0.1:4173/privacy/
http://127.0.0.1:4173/sources/
```

Check:

```text
Cards look richer but not noisy.
The READ tab is visible and not clipped.
Directory cards feel like collectible file cards.
No route has horizontal body overflow at 390px.
Focus rings are visible.
Copy is readable.
No fake stats or fake freshness appeared.
```

- [ ] **Step 5: Save after screenshots**

Save local or live after screenshots to:

```text
.qa-shots/sluggers-card-polish-after/home-desktop.png
.qa-shots/sluggers-card-polish-after/repertoire-desktop.png
.qa-shots/sluggers-card-polish-after/pitch-detail-desktop.png
.qa-shots/sluggers-card-polish-after/support-mobile.png
.qa-shots/sluggers-card-polish-after/privacy-mobile.png
```

Do not commit screenshots unless Austin asks.

---

### Task 8: Commit, PR, Deploy, and Live Proof

**Files:**
- Commit only:
  - `src/index.css`
  - `src/pages/SupportPage.tsx`
  - `src/pages/PrivacyPage.tsx`
  - `src/routes.test.tsx`
  - `scripts/preview-browser-smoke.mjs`

- [ ] **Step 1: Review tracked diff**

Run:

```bash
git diff -- src/index.css src/pages/SupportPage.tsx src/pages/PrivacyPage.tsx src/routes.test.tsx scripts/preview-browser-smoke.mjs
git status --short
```

Expected: only the five intended tracked files are modified. Untracked `.qa-shots`, `.codex`, inspiration images, and iOS folders stay untracked.

- [ ] **Step 2: Stage focused files**

Run:

```bash
git add src/index.css src/pages/SupportPage.tsx src/pages/PrivacyPage.tsx src/routes.test.tsx scripts/preview-browser-smoke.mjs
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat(design-system): sharpen Pitch Atlas specimen cards"
```

- [ ] **Step 4: Push explicit branch**

If on `codex/sluggers-card-polish-20260624`, avoid plain `git push` because the upstream may not match the review branch. Push explicitly:

```bash
git push -u origin HEAD:codex/sluggers-card-polish-20260624
```

- [ ] **Step 5: Open PR**

Write the body file, then open the PR:

```bash
cat > /tmp/pitch-atlas-sluggers-card-polish-pr.md <<'PR_BODY'
## Summary
Pitch Atlas specimen and directory cards now read more like tactile collectible files. Support and privacy copy are plainer, and mobile overflow checks now cover those legal/help routes.

## What changed
- Added stronger foil, black rim, image-window, READ-tab, and texture treatment to the specimen card system.
- Made Pitch Index directory cards feel more like card-file artifacts instead of flat rows.
- Rewrote support/privacy copy to remove long dashes and reduce sentence load.
- Added tests for plain support/privacy copy and preview checks for mobile overflow.

## Why
The live site already had a strong archive identity, but the card surfaces were not carrying enough of the Sluggers-style collectible energy. This keeps the sourced Pitch Atlas doctrine intact while making the cards feel more physical.

## Risk and rollback
- Blast radius: visual/card CSS, support page, privacy page, preview smoke test.
- Rollback boundary: one commit.
- Known unknowns: final grade depends on live production render proof after the Cloudflare workflow finishes.

## Test plan
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run test:preview:browser -- http://127.0.0.1:4173
- Open the live home, repertoire, pitch detail, support, privacy, and riseball routes after deploy.

## Screenshots / evidence
- Add before/after card screenshots from local or live QA if the review needs visual proof.
PR_BODY

gh pr create \
  --repo ahump20/Pitch-Atlas \
  --base main \
  --head codex/sluggers-card-polish-20260624 \
  --title "feat(design-system): sharpen Pitch Atlas specimen cards" \
  --body-file /tmp/pitch-atlas-sluggers-card-polish-pr.md
```

- [ ] **Step 6: Merge after checks pass**

Run:

```bash
gh pr checks --repo ahump20/Pitch-Atlas --watch
gh pr merge --repo ahump20/Pitch-Atlas --squash --delete-branch
```

Expected: merged to `main` only after checks pass.

- [ ] **Step 7: Trigger Cloudflare Pages production deploy**

Run:

```bash
gh workflow run deploy-cloudflare-pages.yml --repo ahump20/Pitch-Atlas --ref main
```

Then watch:

```bash
gh run list --repo ahump20/Pitch-Atlas --workflow deploy-cloudflare-pages.yml --limit 1
gh run watch --repo ahump20/Pitch-Atlas <RUN_ID>
```

Expected: preview deploy, smoke tests, browser smoke tests, then production deploy all pass.

- [ ] **Step 8: Verify live production**

Open these live URLs in the Browser after deploy:

```text
https://pitch-atlas.com/
https://pitch-atlas.com/repertoire/
https://pitch-atlas.com/pitch/four-seam/
https://pitch-atlas.com/softball/pitch/riseball/
https://pitch-atlas.com/support/
https://pitch-atlas.com/privacy/
https://pitch-atlas.com/sources/
```

Run the public smoke script if desired:

```bash
npm run test:preview:browser -- https://pitch-atlas.com
```

Expected:

```text
Live cards show richer foil/rim/READ treatment.
Support and privacy render without horizontal overflow at mobile width.
Support and privacy copy has no visible long dashes.
No fake numbers, fake freshness, fake contacts, or copied inspiration assets appear.
```

---

## Final Report Format

Report back in this order:

```text
Final grade: <grade>

Known:
- [verified] <what changed and where>
- [verified] <live URL proof>

Unknown:
- [open] <anything not checked>

What visitors now see:
- <plain visitor-facing change>

Verification:
- <commands run>
- <deploy workflow run>
- <live pages opened>
```

Do not claim production is done until the live URLs render the changed UI.
