# My Bullpen: the iOS plan

Owner: Austin Humphrey. Started: 2026-06-06.
Status: plan, not yet in build. The web app was ~48 hours old when this was written.

This is the plan for putting Pitch Atlas in a pitcher's pocket. It's written for a
founder, not an engineer, so the jargon gets translated as it shows up.

## The one-line call

Yes to an app. No to building a separate Apple-only app right now. Phase it: make
the website installable to the phone this week (nearly free), build the real App
Store app once the core habit proves out, and reuse the code you already have when
you do. An Apple-only rebuild at 48 hours old would split a one-person effort
across two codebases before you know which features actually pull pitchers back.

## Why an app at all

Pitchers aren't at a desk. They're in a bullpen, a dugout, a cage, a backfield.
The whole value loop is shaped like a phone: see a grip, try it, film it or shoot
the grip, log what happened, talk it through with a teammate. A browser tab does
some of that. A real app on the home screen, with the camera one tap away and a
login that remembers your arsenal, does all of it. That's the case for "My
Bullpen," and it's sound.

## The three phases

### Phase 0: Make the website installable (now, nearly free)

The plainest version first. A modern website can be turned into something a phone
treats like an app: it gets a home-screen icon, opens full screen with no browser
bar, works offline for the pages already visited, and can send notifications. The
technical name is a "PWA" (Progressive Web App). It is not a second app. It is the
same website you already have, with a small configuration file and an icon set
added. Your `field-manual-elevation-plan.md` already lists the icon assets for it
("Navy square ball icon -> iOS / apple-touch / PWA / favicon"), so most of the art
is done.

What Phase 0 gets you:

- A Pitch Atlas icon on the home screen. It feels like an app to the pitcher.
- The login-and-lock-in feel: sign in once, stay signed in, your stuff is there.
- Offline reading of grips you've already opened.
- Near-zero cost and zero second codebase, because it is the website.

What Phase 0 can't do:

- It isn't in the App Store, so there's no "search the App Store and download"
  moment.
- Camera and notification support on iPhone is real but more limited than a true
  native app.

Phase 0 is the cheapest way to test whether pitchers actually keep it on their
phone. Ship it, watch the behavior, then decide on Phase 1 with evidence instead
of a guess.

### Phase 1: The App Store app, reusing your code (once the loop proves)

When the habit shows up (people coming back to the bullpen, logging notes, sharing
grips), build the real app. Do it with a toolset called Expo / React Native. In
plain terms: it lets you write the phone app mostly reusing the code the website is
already built from (React and TypeScript), so you maintain close to one thing
instead of two, and it ships to the Apple App Store (and Android later, for free,
from the same code).

What this reuses from what you already own:

- The data model in `src/data` (the provenance system: every claim sourced and
  labeled). That's the brain of the product, and it travels to the app unchanged.
- The pitch content, the seven specimens, the craftsmen and lost-pitches wings.
- The Supabase backend (accounts, the discussion layer, uploads, the safety floor).
  Anonymous sign-in already exists; Phase 1 adds real accounts for the lock-in.

What Phase 1 unlocks that the web can't do as well:

- **The camera grip-upload loop.** One tap to shoot your own grip or film a
  bullpen, straight into a field note. This is the heart of "My Bullpen" and it's
  native-camera-shaped.
- **Push notifications.** "Your slider tweak got reproduced by two arms." That's a
  real reason to come back, and it has to be real, never a fabricated nudge.
- **The collaborative bullpen.** A live session where teammates brainstorm a pitch
  together and each leaves with a field note. The session pattern is already
  designed in the plugin (`collaborative-bullpen.md`); the app is where it lives.
- **Offline-first.** Works in a cell-dead backfield, syncs when it's back.

The one real trade: the signature 3D ball needs a mobile port. React Native draws
3D through a layer called expo-gl with react-three-fiber, the same family the web
uses. It's well-trodden. And the zero-WebGL floor that already protects the website
protects the app the same way: if a phone can't render the 3D ball, it falls back
to the 2D schematic built from the same seam function, so nobody hits a blank
screen.

### Phase 2: Native Swift, only if polish demands it (later, maybe never)

Swift is Apple's own language. An app written in it feels the most "Apple" and
performs best, and Apple's newest look (Liquid Glass) and 3D tools (RealityKit) are
native to it. The cost is real: it's a separate codebase from your website, a whole
second thing to keep alive. Only reach for it if the Expo app proves the product
and then hits a ceiling on feel or performance that's worth a second team's worth
of upkeep. Most likely you never need it. It's listed so the door stays open, not
because it's the plan.

## What "My Bullpen" actually is (the feature spine)

The same Core that governs the website governs the app (see `docs/NORTHSTAR.md`).
On top of it, the app's reason to exist:

- **Your arsenal, saved.** Log in, and the pitches you throw, the tweaks you've
  tried, and the notes you've logged are yours and persistent. This is the lock-in,
  and it's honest lock-in: it's built on the pitcher's own real data, never on
  seeded activity or fake counts.
- **Grip references in hand.** Pull up any grip, see a clean-sourced photo or the
  3D ball, hold the same grip on a real ball. Photos come only from the clean
  channels in `docs/NORTHSTAR.md` and `visual-grip-library.md`: your own
  photography, pitchers' own-grip uploads, verified Creative Commons or
  public-domain, or licensed. Never a scraped agency photo of a pro.
- **Brainstorm with other arms.** The collaborative bullpen: frame a goal, profile
  the arms, try one-variable changes, log what happened, each leave with a note.
- **The camera loop.** Shoot your grip, film a bullpen, attach it to a field note
  behind the own-the-rights gate (no faces, no minors in frame for a shared photo).

## The rules that travel to the app

Nothing about the phone loosens the Core:

- **Sourced, not corrected.** Every number keeps its source and confidence label on
  a small screen too.
- **Real, never faked.** No fake adoption counts, no fake "reproduced" badges, no
  invented push nudges. An empty bullpen says "no notes yet."
- **The safety floor.** Grip and technique only. No medical, injury, workload, or
  youth-prescription claims. A minor's account is parent-managed and private by
  default.
- **Four states everywhere.** Every screen handles loading, error, empty, and
  populated. A grip with no photo yet shows the 3D ball or a described grip, not a
  broken image.

## Two things to know before the App Store

These aren't blockers; they're realities to plan for:

- **Apple requires moderation for any app with user uploads.** Reporting, blocking,
  and a way to act on reports. The community safety floor already has report-driven
  auto-hide and the own-the-rights gate (`docs/community-media-moderation.md`),
  which covers most of what Apple looks for. Filling the honest gaps it lists (no
  automated scanning yet, no bot protection yet) is part of getting through review.
- **The age rating.** An app with user-generated content and a youth audience needs
  an honest age rating and the COPPA posture already in the plan (parent-managed
  minor accounts, private by default). Decide this before submission, not after a
  rejection.

## Open questions (decide before Phase 1, not now)

- Accounts: email, Apple sign-in, both. Apple sign-in is the lowest-friction on
  iPhone and Apple often requires it when other social logins exist.
- Free vs paid: is My Bullpen free with a paid tier later, and if so, what's behind
  the wall. (Out of scope for the plan; flag it so it's a decision, not a default.)
- Android timing: Expo gives it nearly for free, but each store is its own review
  and support load. Probably fast-follow, not simultaneous.

## What this plan does not commit to

A launch date, a price, a backend rebuild, or native Swift. Phase 0 is the only
thing cheap and safe enough to start now. Phase 1 waits for evidence from Phase 0.
That sequencing is the whole point: get the app feel into pitchers' hands this
week, learn what they actually return for, and spend the real build on the proven
loop.
