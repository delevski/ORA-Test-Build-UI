# Reference Analysis

**Source:** `https://avi-towers.vercel.app/`
**Method:** Content scrape of the live site.
**Date:** 2026-08-10

This document records the interaction system observed on the reference site so it can be
*reproduced* — architecture and technique only. No brand names, copy, logos, or imagery from
the reference are used anywhere in this project's app code.

## Identified effects and reproduction technique

1. **Preloader gating the hero** — a counter/label overlay blocks interaction until assets are
   ready, then animates out to reveal the hero.
   *Reproduction:* fixed-position overlay component, GSAP timeline tied to a loading/counter
   state, `clip-path`/opacity exit transition, unmounted after completion.

2. **Fullscreen hero with line-mask headline** — the headline text reveals line-by-line as if
   sliding up out of a mask.
   *Reproduction:* `.mask-line` overflow-hidden wrapper around an inline-block `<span>` per
   line, animated on a `y`/`clipPath` transform via GSAP on load.

3. **Four pinned narrative chapters with scrubbed zoom/mask reveals** — each chapter occupies a
   tall scroll region while its viewport stays fixed, with the background image zooming and
   text revealing in sync with scroll position.
   *Reproduction:* CSS `position: sticky` viewport nested inside a tall (multi-viewport-height)
   wrapper `<section>`; a scrubbed GSAP `ScrollTrigger` timeline (`scrub: true`) drives image
   `scale`/`clip-path` and text transforms across the wrapper's scroll range.

4. **Layered plant-PNG foreground parallax** — transparent-background foliage images sit in
   front of the main image and drift at a different rate, adding depth.
   *Reproduction:* absolutely positioned PNG layers with independent `y`/`scale` transforms
   driven by a scrubbed `ScrollTrigger` at a different rate than the background layer.

5. **Count-up statistics** — numeric stats animate from 0 to their target value once scrolled
   into view.
   *Reproduction:* GSAP tween of a numeric object property with `ScrollTrigger.trigger` (one-
   shot, not scrubbed), rendering the interpolated value into the DOM on `onUpdate`.

6. **Three-entry editorial "why" section** — three numbered text/image entries revealed in
   sequence.
   *Reproduction:* per-entry `ScrollTrigger` triggering opacity/`y` transform reveals as each
   entry enters the viewport; no pinning required.

7. **Dominant-image residence gallery** — a large image swaps as the viewer selects/scrolls
   through a list of room names.
   *Reproduction:* single sticky dominant-image element; active index driven by scroll position
   or click state, cross-fade via opacity transition between image layers.

8. **Dual-row building marquee** — two rows of images scroll horizontally in opposite
   directions, independent of vertical scroll (or scroll-linked).
   *Reproduction:* two flex rows of duplicated image sets, each animated with an infinite GSAP
   `xPercent` tween (opposite directions), optionally nudged by scroll velocity.

9. **Pinned day-timeline** — a single pinned viewport where the displayed time, headline, and
   image change in discrete steps as the user scrolls (07:00 → 23:00).
   *Reproduction:* one sticky viewport inside a tall wrapper; a scrubbed `ScrollTrigger` timeline
   with labeled steps swaps text/image content at fixed scroll-progress checkpoints.

10. **Text ribbon marquee** — a single line of looping text/diamond-separated phrases scrolls
    horizontally.
    *Reproduction:* duplicated text track inside an overflow-hidden container, infinite linear
    GSAP `xPercent` tween.

11. **Minimal price finale** — a single large price statement as the page's closing beat, no
    imagery.
    *Reproduction:* plain centered typographic section using the same mask-line reveal as the
    hero, triggered once on scroll-into-view.

12. **Theme-adaptive fixed nav with progress bar** — a fixed header whose color scheme flips
    (light/dark) depending on the section behind it, plus a thin progress bar tracking overall
    scroll position.
    *Reproduction:* `ScrollTrigger`-driven class toggling on the nav element keyed to section
    boundaries (`onEnter`/`onLeaveBack`), plus a separate `ScrollTrigger` with
    `onUpdate: self => progress` mapped to a bar's `scaleX`.

13. **Custom cursor** — the default cursor is replaced with a custom element that follows
    pointer movement and changes state over interactive targets.
    *Reproduction:* a fixed-position DOM element whose `x`/`y` are updated via
    `gsap.quickTo` on `pointermove`, with state classes toggled on `pointerenter`/`pointerleave`
    of interactive targets; disabled on touch/coarse-pointer devices.

## Cross-cutting motion architecture

- **Scroll engine:** Lenis smooth scrolling, synced to GSAP's `ticker` (Lenis drives scroll
  position, GSAP's ticker drives Lenis's `raf`, and `ScrollTrigger.update` is called on Lenis's
  `scroll` event) so smooth scroll and scrubbed `ScrollTrigger` timelines stay in lockstep.
- **Pinning:** all "pinned viewport" effects use CSS `position: sticky` inside an
  intentionally tall wrapper rather than GSAP's `pin: true`, avoiding layout-recalculation
  pinning side effects and keeping pin behavior CSS-native.
- **Reveals:** all reveal/transition effects are restricted to `transform`, `opacity`, and
  `clip-path`/`inset` — properties that stay on the compositor thread — for animation
  performance; no animated `width`/`height`/`top`/`left`.
- **Responsive/accessibility degradation:** `gsap.matchMedia()` is used to swap or disable
  scrubbed/pinned timelines on narrow viewports and coarse pointers, and to skip motion
  entirely under `prefers-reduced-motion: reduce`.
