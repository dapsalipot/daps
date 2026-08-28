# Landing page: systems section

Date: 2026-08-28
Status: design, pending approval

## Problem

The landing page repeats other pages. The coverflow carousel covers the same
nine projects that `/projects` already presents better, and the
`now`/`stack`/`experience`/`achievements` stack duplicates most of `/about`.

More importantly, the best work is invisible. Screenshots show CRUD interfaces,
which is the least interesting true thing about the engineering. The database
per tenant architecture, the payment reconciliation pipeline, the RFID device
fleet and the constraint solver are not screenshot-able, so nothing on the site
currently communicates them.

## Goal

Make the invisible backend work legible. Motion exists to explain, not to
decorate. Every effect earns its place by carrying information.

## The design

### Content

Four systems, equal weight, one shared diagram vocabulary. Three to four beats
each, roughly one viewport per system.

**Shared primitives**, reused by all four:

| Primitive | Meaning |
| --- | --- |
| Node | A service or device |
| Edge pulse | Data in motion |
| Slot state | Filled, open, or blocked |

**Tapso** - one card, two systems. Deliberately broad for NDA safety: no device
counts, no pipeline stages, no vendor names, no schema.

1. One RFID card - one student identity
2. Tap at a reader - gate or canteen
3. Two outcomes - attendance or payment

**Class scheduler** - constraint solver. Earns a fourth beat because it is the
strongest technical material in the portfolio. Source is
`~/Herd/schoolaide-scheduler`, `app/Helpers/SchedulerHelperV2.php`.

1. Open grid - empty cells
2. Fewest first - minimum remaining values, computed live against the ledger
   rather than frozen at trial start (`scheduleMrv`)
3. Ruin and fix - evict roughly 15 percent of placements so the repair sweep
   explores a different neighbourhood (`ruinKick`); skips multi-cell lab blocks
   because evicting one cell of a shared `timeslot_id` corrupts its siblings
4. Solved - days becomes minutes

Beat three is the memorable one. Watching a solver deliberately throw away good
work to escape a local optimum is counterintuitive, and it is the moment an
engineer pays attention.

**Terra** - booking and headcount.

1. Trip fills up - slots and waitlist
2. Someone drops - waitlist promotes automatically
3. QR at meetup - real headcount

**Ralli** - queue, matchup, rating.

1. Bench queue - longest wait first
2. Generate matchup - balanced from the active bench
3. Score and rate - ELO update, broadcast live

Terra and Ralli are labelled "in build" so the section never implies they run in
production.

### Mechanism

Approach: IntersectionObserver beats plus CSS scroll-driven flourishes. No new
dependencies.

- Each section is a tall container with an inner `sticky top-0 h-dvh` stage.
- Sentinels sit at each beat offset. One `IntersectionObserver` per section with
  `rootMargin: '-49.5% 0px -49.5% 0px'` sets the active beat. The 1 percent band
  matters: a zero-height root never fires, which is the bug that broke the
  carousel and the nav sentinel.
- Beat pacing reuses the existing `STEP_VH = 42` constant so scroll feel matches
  the rest of the site.
- Within a beat, node state changes are CSS transitions on class swaps. The
  pulse is a `stroke-dashoffset` keyframe. No library, no per-frame JS.

No `window.addEventListener('scroll')` anywhere.

### Components

In `resources/js/components/portfolio/`:

- `system-diagram.tsx` - pure and presentational. Takes a scene spec plus
  `activeBeat`, renders SVG. No scroll knowledge, no state. All four systems are
  this one component with different data.
- `system-section.tsx` - one system. Owns the tall container, the sentinels, the
  beat index, and the copy beside the diagram.
- `systems.tsx` - maps the four specs to sections.

Primitives stay private inside `system-diagram.tsx` so they can change shape
without touching four call sites.

### Data

`resources/js/lib/system-diagrams.ts`, typed, alongside the existing
`lib/nav-items.ts`.

This deviates from the `config/portfolio.php` convention. A beat is inseparable
from its geometry - node coordinates, edge paths, which nodes dim when - and
splitting coordinates into TypeScript while copy lives in PHP means editing one
beat in two files. Recorded as a deliberate deviation, not an oversight.

### Reduced motion

Under `prefers-reduced-motion`, sections collapse to natural height and render
all beats stacked as static diagrams. This is a different layout, not a disabled
one: a 600vh pinned section with animation switched off is six blank screens.
The static version is genuinely better for skimming, so it is built properly
rather than treated as a fallback.

### Accessibility

- Each diagram is `role="img"` with `<title>` and `<desc>`.
- Beat copy lives in real DOM text, not only inside SVG, so the narrative reads
  without seeing the animation.
- Dormant nodes use `--fg-dim` (4.78:1 or better in both themes after the
  contrast pass). Never `--fg-fade`, which only clears the large-text bar.
- Diagrams reference tokens only, never literal colors, so a later theme change
  flows through without a rebuild.

## Page restructure

`home.tsx` becomes:

    hero -> systems -> compact "all work" link -> now -> CTA

- The coverflow carousel is removed from home. `work-carousel.tsx` stays in the
  repo; `/projects` can reuse it later.
- `stack`, `experience` and `achievements` move to `/about`, which already
  carries most of that content.

## Weight budget

`public/projects` sits at 4.4 MB after the dumagat compression, down from
8.2 MB. This design adds no assets, so that number stands.

## Verification

No JavaScript test runner exists in this project, so this design does not
promise unit tests.

- `tsc` and `eslint` clean
- `npm run build` succeeds (use Herd's bundled Node; the Homebrew install is
  broken by an orphaned `libsimdjson` dylib)
- A Pest smoke test that `/` still renders after the restructure
- Manual checks: beat advance, reduced-motion layout, both themes

## Open items

1. **Solver NDA status.** The scheduler lives in `~/Herd/schoolaide-scheduler`,
   which is Schoolaide code. Schoolaide was dropped from this section for NDA
   reasons but the algorithm was kept. The beats describe published academic
   techniques - minimum remaining values, ruin and recreate - rather than
   business rules or schema, which is defensible, but the call is the author's
   and is recorded here rather than assumed.
2. `public/projects/akai-tsuki/dumagat/` is now 880 KB of compressed but
   unreferenced duplicates of `dumagat-remontado/`. Kept deliberately.

## Rejected

- **GSAP ScrollTrigger.** Buys scrubbing and pinning that beat-based diagram
  explanation does not need, at real bundle cost against an argument for
  restraint.
- **Generated video for the system diagrams.** Cannot depict a real architecture
  accurately; an engineer reads it as decorative, which costs the credibility
  the section exists to build.
- **Full-page lava lamp background.** Prototyped and rejected. Blob visibility
  and text contrast are the same axis, so a visible field necessarily eats
  contrast. Physics, not tuning.
- **Scroll-scrubbed video bands.** Smooth scrubbing needs an all-keyframe
  re-encode, trading roughly 400 KB of normal compression for 3 to 6 MB. That
  weight buys decoration between sections that no reader is there for, and it
  only works on desktop - mobile gets a poster frame, so most visitors never see
  the effect being paid for.
- **Generated video anywhere on the site.** Every slot examined either fought
  text contrast, could not respond to scroll without the re-encode cost, or
  scaled with project count. Nothing it offered could not be done more cheaply
  in code or left out.
