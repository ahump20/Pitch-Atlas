# Plan: Characterization tests for the upload EXIF/GPS scrub

> **Executor instructions**: Follow this plan step by step. Run every verification
> command and confirm the expected result before moving on. If anything in "STOP
> conditions" occurs, stop and report — do not improvise. This plan only ADDS a
> test file; it changes no product code.
>
> **Drift check (run first)**: `git diff --stat 2dac802..HEAD -- src/lib/discussion.ts`
> If `src/lib/discussion.ts` changed since this plan was written, compare the
> "Current state" excerpt against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (adds a test; touches no product code)
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `2dac802`, 2026-06-25

## Why this matters

`scrubImageMetadata()` in `src/lib/discussion.ts` is the security boundary that
strips camera/GPS EXIF from uploaded photos before any bytes leave the device. It
shipped in #133 with **zero tests**. The function is one refactor (or one browser
canvas-behavior change) away from silently uploading the original, metadata-laden
file — a privacy regression that nothing would catch. A characterization test that
asserts "the bytes handed to storage are the re-encoded blob, not the original
`File`" locks that boundary in place.

## Current state

- `src/lib/discussion.ts` — community upload path. The relevant code, today:
  - `scrubImageMetadata(file, mime)` (≈ lines 188–212): creates an object URL,
    decodes via `new Image()`, draws to a `<canvas>`, calls `canvas.toBlob(...)`,
    returns `{ blob, width, height }` or `null` on any failure (undecodable image,
    no 2D context, empty/`null` blob). Revokes the object URL in `finally`.
  - `uploadMedia(postId, topicKey, file)` (≈ lines 221–270): guards `file.size`
    against the cap first; then, for `image/jpeg|png|webp`, calls
    `scrubImageMetadata`. On success `payload = scrubbed.blob` and `dims` come from
    the scrub; on `null` it falls back to `readImageDims(file)` and `payload`
    stays the original `file`. GIF and video skip the scrub entirely. It re-checks
    `payload.size` against the cap, then `supabase.storage.from(BUCKET).upload(path,
    payload, ...)` and inserts a `discussion_media` row with `byte_size: payload.size`.
- **Test convention to follow** — model the new file on
  `src/lib/discussion-upload.test.ts` (252 lines). It already:
  - hoists mocks with `vi.hoisted(() => ({ ensureSession, from, storageFrom,
    upload, insert, rpc, ... }))`,
  - `vi.mock('./community', ...)` and `vi.mock('./supabase', ...)` so
    `supabase.storage.from(BUCKET).upload` resolves to `mocks.upload`,
  - has `function fileFrom(bytes, name, type): File`,
  - sets a valid `media_terms` / session state in `beforeEach`.
  The new file reuses that exact harness and additionally stubs the browser
  decode/canvas APIs that jsdom does not implement.

## Commands you will need

| Purpose   | Command                                              | Expected on success |
|-----------|------------------------------------------------------|---------------------|
| Typecheck | `npm run typecheck`                                  | exit 0, no errors   |
| New tests | `npm run test -- src/lib/discussion-exif-scrub.test.ts` | all pass         |
| Full test | `npm run test`                                       | all pass            |
| Lint      | `npm run lint`                                        | 0 errors            |

## Scope

**In scope** (only file you create):
- `src/lib/discussion-exif-scrub.test.ts` (create)

**Out of scope** (do NOT touch):
- `src/lib/discussion.ts` — this plan characterizes existing behavior; it does not
  change it. If a test reveals a real bug, STOP and report rather than editing.
- `src/lib/discussion-upload.test.ts` — leave the existing video-path test intact;
  add a new sibling file rather than expanding it.

## Steps

### Step 1: Create the test file with the shared upload harness

Copy the mock scaffold from `src/lib/discussion-upload.test.ts` (the `vi.hoisted`
block, the two `vi.mock` calls, `fileFrom`, and the `beforeEach` that wires
`ensureSession` → a uid, `upload` → `{ data, error: null }`, `insert` → `{ error:
null }`, and whatever media-terms/limits the existing test sets so `uploadMedia`
reaches the storage call). Import `uploadMedia` from `./discussion`.

**Verify**: `npm run typecheck` → exit 0.

### Step 2: Stub the browser decode + canvas APIs jsdom lacks

In the new file, before the tests, install stubs so `scrubImageMetadata` runs to
completion under jsdom. Drive them through `globalThis`/prototype:

- `URL.createObjectURL` / `URL.revokeObjectURL` → `vi.fn()` returning a fake
  `blob:` string (assert `revokeObjectURL` is called — the cleanup contract).
- `globalThis.Image` → a class whose `set src(_)` schedules `this.onload()` on a
  microtask, with `naturalWidth`/`naturalHeight` set to non-zero (e.g. 100×80).
  Provide a per-test switch to fire `onerror()` instead (the undecodable case).
- `HTMLCanvasElement.prototype.getContext` → returns a stub object with a
  `drawImage: vi.fn()` (success) or `null` (no-context case).
- `HTMLCanvasElement.prototype.toBlob` → calls its callback with a sentinel
  `Blob` whose identity/size differs from the input `File` (success), or with
  `null` (encode-failure case).

Use a module-level `let` to flip each behavior per test, reset in `beforeEach`.

**Verify**: `npm run typecheck` → exit 0.

### Step 3: Test the happy path — scrubbed blob is what gets uploaded

Build a JPEG `File` via `fileFrom([...], 'p.jpg', 'image/jpeg')` whose bytes begin
with a valid JPEG magic (`0xFF 0xD8 0xFF`) so `sniffMediaType` accepts it (check
how `discussion-upload.test.ts` makes its accepted files and match that). Make
`toBlob` return a sentinel blob of a KNOWN different size. Call
`await uploadMedia('post-1', 'topic', file)`.

Assert:
- `mocks.upload` was called once, and its 2nd argument is the **sentinel blob**,
  NOT the original `File` (identity or size check — this is the core security
  assertion).
- the inserted row's `byte_size` equals the sentinel blob's size.
- `URL.revokeObjectURL` was called (no object-URL leak).

**Verify**: `npm run test -- src/lib/discussion-exif-scrub.test.ts` → this test passes.

### Step 4: Test the fallback — undecodable image uploads the original, still succeeds

Same JPEG file, but flip the `Image` stub to fire `onerror()` (or
`naturalWidth = 0`). Call `uploadMedia`.

Assert:
- `mocks.upload`'s 2nd argument is the **original `File`** (scrub returned null →
  fallback path), and the upload still happened (graceful degradation, not a throw).
- `URL.revokeObjectURL` was still called.

**Verify**: `npm run test -- src/lib/discussion-exif-scrub.test.ts` → both tests pass.

### Step 5: Test encode-failure and GIF passthrough

- `toBlob` → `null`: assert fallback to original `File` (same as Step 4 path,
  different trigger).
- A `image/gif` file: assert `getContext`/`toBlob` are **never called** (GIF skips
  the scrub) and the original file is uploaded.

**Verify**: `npm run test -- src/lib/discussion-exif-scrub.test.ts` → all pass.

## Test plan

New file `src/lib/discussion-exif-scrub.test.ts`, cases:
1. JPEG happy path → uploaded payload is the re-encoded blob, not the File (+ row
   `byte_size` matches blob, + object URL revoked).
2. Undecodable image (`onerror`) → falls back to original File, upload succeeds.
3. `toBlob` returns null → falls back to original File.
4. GIF → scrub skipped entirely (canvas APIs untouched), original uploaded.
Structural pattern: `src/lib/discussion-upload.test.ts`.

## Done criteria

ALL must hold:
- [ ] `npm run test -- src/lib/discussion-exif-scrub.test.ts` passes with ≥4 new tests
- [ ] `npm run test` exits 0 (full suite still green)
- [ ] `npm run typecheck` exits 0
- [ ] `npm run lint` reports 0 errors
- [ ] `git status` shows only `src/lib/discussion-exif-scrub.test.ts` added — no product file modified

## STOP conditions

Stop and report (do not improvise) if:
- The "Current state" excerpt of `discussion.ts` no longer matches the live code
  (drift since `2dac802`).
- A test you write fails because the *product* behavior is wrong (e.g. the original
  File is uploaded on the happy path) — that's a real bug; report it, do not "fix"
  the test to pass.
- jsdom cannot be made to run `canvas.toBlob` even when stubbed after two attempts —
  report the environment limitation; do not switch the whole suite to a different
  test environment.

## Maintenance notes

- If image re-encode ever moves off the main-thread canvas (e.g. an
  `OffscreenCanvas` worker or a wasm stripper), these stubs must be revisited — the
  security assertion (uploaded bytes ≠ original File) is the part that must survive.
- A reviewer should scrutinize that Step 3 asserts on the *bytes handed to storage*,
  not merely that `scrubImageMetadata` was called — calling it but uploading the
  original would be the exact regression this guards against.
