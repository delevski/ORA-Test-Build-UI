# ORA — Residence Above the Sea

A cinematic, single-page marketing site for **ORA**, a fictional private residence tower in
Tel Aviv. There is no real property, developer, or listing behind this project — it exists as
an **interaction-system study of a reference site**: the goal was to reverse-engineer the
*techniques* (pinned scroll chapters, scrubbed parallax, marquees, count-ups, a custom cursor)
rather than to copy any brand, copy, or imagery. See `REFERENCE_ANALYSIS.md` for the technique
breakdown this project was built from.

## Stack

- **Next.js 16** (App Router, Turbopack build) + **React 19** + **TypeScript**
- **Tailwind CSS 4** for layout/type utilities and design tokens (`app/globals.css`)
- **GSAP 3** (`ScrollTrigger`, `useGSAP` from `@gsap/react`) for all motion
- **Lenis** for smooth-scroll, synced to GSAP's ticker
- `next/image` for optimized, lazy-loaded imagery

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  layout.tsx        # fonts, metadata, wraps the tree in SmoothScrollProvider
  page.tsx           # assembles every section in scroll order
  globals.css        # design tokens, .mask-line reveal primitive, base styles
components/
  preloader/         # counter overlay that gates the hero, dispatches "ora:reveal"
  navigation/         # fixed nav: theme-flip on scroll, scroll-progress bar, magnetic CTA
  hero/               # fullscreen entrance + scrubbed exit
  cinematic-scene/     # reusable pinned "chapter" section, 5 visual variants + SVG foregrounds
  stats/              # count-up statistics
  why-section/         # 3-entry editorial block with mouse-reactive imagery
  residence-gallery/   # ResidenceGallery (hover/scroll-driven room switcher) + HorizontalStrip
  building-marquee/     # dual-row image marquee with scroll-velocity speed boost
  ribbon-marquee/       # looping text ribbon
  day-timeline/          # pinned "day above the city" scene sequence
  amenities/             # staggered amenities list
  final-cta/              # closing CTA with price count-up
  footer/
  custom-cursor/          # fine-pointer-only custom cursor with hover states
  providers/               # SmoothScrollProvider (Lenis + GSAP ticker)
  ui/                       # Magnetic (shared magnetic-hover wrapper)
lib/
  gsap.ts             # registers GSAP plugins once, exports the `MM` matchMedia query tiers
  images.ts           # IMAGES manifest — the single source of truth for every image + alt text
hooks/
  useIsFinePointer.ts  # (pointer: fine) check, used to gate mouse-only effects
public/images/         # the 16 source images referenced by lib/images.ts
```

## Replacing imagery

Every image in the site is referenced through the `IMAGES` manifest in `lib/images.ts` — no
component ever hardcodes a path. To swap a photo:

1. Drop the replacement file into `/public/images/`, **keeping the same filename** (see
   `IMAGE_REQUIREMENTS.md` for the recommended dimensions/aspect ratio per slot).
2. If the new photo needs a different description, update only the `alt` text for that key in
   `lib/images.ts`. Never rename an `ImageKey` — every component imports these keys by name.
3. `IMAGE_REQUIREMENTS.md` documents the intended mood, aspect ratio, and per-image notes (e.g.
   which slots have a transparent foreground layer for parallax) so a future shoot or stock pass
   can replace the set without touching any component code.

## Motion engine notes

- **Lenis + ScrollTrigger sync** (`components/providers/SmoothScrollProvider.tsx`): Lenis owns
  the actual scroll physics; every Lenis `scroll` tick calls `ScrollTrigger.update()`, and GSAP's
  ticker drives Lenis's `raf` loop (with `lagSmoothing(0)`) so the two stay perfectly in step.
  Lenis is **not instantiated at all** when `prefers-reduced-motion: reduce` matches — the page
  falls back to native browser scrolling.
- **`matchMedia` tiers** (`lib/gsap.ts` → `MM`): every scroll- or timeline-driven component wraps
  its motion in `gsap.matchMedia().add({ desktop, mobile, reduced }, …)` with three named
  conditions:
  - `desktop` — `min-width: 768px` and no reduced-motion preference (full scrub/parallax)
  - `mobile` — `max-width: 767px` and no reduced-motion preference (shortened/lighter motion)
  - `reduced` — `prefers-reduced-motion: reduce` (skip the animation branch; content is set to
    its final, fully visible state directly — never left in a mid-animation hidden state)
- **CSS-sticky pinning convention**: every pinned "chapter" is a tall wrapper `<section>`
  (`h-[Nvh]`, shortened on mobile via `max-md:h-[…]`) containing a `position: sticky; top: 0;
  h-screen` inner viewport. A scrubbed `ScrollTrigger` (`start: "top top"`, `end: "bottom
  bottom"`, `scrub: true`) animates `transform`/`opacity`/`clip-path` on children across that
  scroll range — no properties that trigger layout are ever animated, and `will-change:
  transform` is applied only to the elements actually being moved.

## Notes on scope

Engineering-adjacent numbers in this project (square footage, floor count, price) are fictional
placeholder copy for a fictional listing — not real figures requiring verification.
