# Landing page: systems section and scroll-scrubbed bands

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

## Part 1: systems section

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

## Part 2: scroll-scrubbed bands

### Mechanism

Scroll position maps to `video.currentTime`. This is the only way generated
video can respond to scroll.

Normal MP4 seeks badly because the decoder walks to the nearest keyframe.
Smooth scrubbing requires re-encoding all-keyframe (`ffmpeg -g 1`), which
removes inter-frame compression and is what drives the file size.

### Asset

One clip, reused across three bands with different scrub ranges and different
vertical crops so it does not read as a repeat.

- Source: roughly 3 seconds, 1600x900, monochrome ink in water on near black,
  single light source, no color shift
- Encode: `ffmpeg -g 1`
- Budget: under 4 MB. If exceeded, drop to 1280x720 before dropping frames.

Three constraints keep fluid from reading as stock footage:

1. Desaturate. Generated fluid defaults to purple-blue or rainbow. A single hue
   reads as a deliberate graphic.
2. Crop hard. Full-screen fluid is a screensaver; a thin full-bleed strip is a
   design device. The band shape does most of the work.
3. Slow the mapping. The clip spans a long scroll distance so it never feels
   like a playing video.

### Placement

Full-bleed bands, 280px desktop and 200px mobile, positioned hero to systems,
systems to now, and now to CTA.

**No body text ever sits on a band.** Contrast does not care whether pixels come
from a shader or a video, and this rule is what removes the problem rather than
managing it.

### Activation

An `IntersectionObserver` activates a band as it nears the viewport. Inside the
existing rAF loop, `scrollY` is sampled once per frame and mapped through the
band's progress across roughly 120vh to `currentTime`. Sampling in the render
loop is not a scroll listener and does no per-event work.

### Fallbacks

The poster frame is load-bearing, not an afterthought. Most visitors see it.

- Mobile: poster frame only. The video never downloads.
- `prefers-reduced-motion`: poster frame.
- No JS or decode failure: poster frame.

## Part 3: page restructure

`home.tsx` becomes:

    hero -> band -> systems -> band -> compact "all work" link -> band -> now -> CTA

- The coverflow carousel is removed from home. `work-carousel.tsx` stays in the
  repo; `/projects` can reuse it later.
- `stack`, `experience` and `achievements` move to `/about`, which already
  carries most of that content.

## Weight budget

| Item | Size |
| --- | --- |
| `public/projects` after dumagat compression | 4.4 MB |
| Band clip | under 4 MB |
| Total | roughly 8.4 MB |

Still below the 8.2 MB the site carried before the compression pass.

## Verification

No JavaScript test runner exists in this project, so this design does not
promise unit tests.

- `tsc` and `eslint` clean
- `npm run build` succeeds (use Herd's bundled Node; the Homebrew install is
  broken by an orphaned `libsimdjson` dylib)
- A Pest smoke test that `/` still renders after the restructure
- Manual checks: beat advance, reduced-motion layout, both themes, band scrub on
  desktop, poster frame on mobile

## Open items

1. **Solver NDA status.** The scheduler lives in `~/Herd/schoolaide-scheduler`,
   which is Schoolaide code. Schoolaide was dropped from this section for NDA
   reasons but the algorithm was kept. The beats describe published academic
   techniques - minimum remaining values, ruin and recreate - rather than
   business rules or schema, which is defensible, but the call is the author's
   and is recorded here rather than assumed.
2. **Band clip source.** A media-generation server is available in the session
   and could produce the clip directly. It consumes credits, so it is not run
   without explicit instruction.
3. `public/projects/akai-tsuki/dumagat/` is now 880 KB of compressed but
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
- **Per-band unique clips.** Three times the weight; reuse with different crops
  gets most of the effect.
- **Case-study video heroes.** Nine assets, 30 MB or more. Cost scales with
  project count.
