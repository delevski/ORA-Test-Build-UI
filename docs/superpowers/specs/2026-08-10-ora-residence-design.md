# ORA — Residence Above the Sea: Design Spec

**Date:** 2026-08-10
**Status:** Approved by user (conversation, 2026-08-10)
**Goal:** A cinematic, scroll-driven luxury real-estate landing page for the fictional
"ORA — Residence Above the Sea" (Tel Aviv), reproducing the interaction system and visual
quality of the reference site `https://avi-towers.vercel.app/` without copying its brand,
copy, logo, or imagery. The bar is "a $15M property website designed by a world-class
creative studio," not "technically works."

## Reference findings (from scrape of avi-towers.vercel.app)

The reference is a single long scroll page composed of:

1. Preloader ("UNLOCKING", `01/10` counter) gating a hero entrance.
2. Fullscreen hero: location eyebrow, giant serif headline ("Sixty floors above
   everything"), "Scroll to enter" indicator.
3. Four pinned narrative chapters (`01 — THE APPROACH`, `02 — THE ARRIVAL`,
   `03 — THE FLOW`, `04 — THE TERRACE`), each a sticky viewport with scrubbed
   image zoom/mask reveals and headline reveals.
4. Layered parallax using transparent plant PNGs as foreground elements.
5. Count-up statistics (bedrooms / bathrooms / square feet).
6. "Why" section — three numbered editorial entries with images.
7. Residence gallery (Grand Salon, Travertine Spa, Wine Lounge, Primary Suite,
   Terrace) with dominant-image swapping.
8. Building marquee — two horizontally moving image rows with captions.
9. "A Day At" timeline — one pinned viewport; time, headline, and image change
   with scroll (07:00 → 23:00).
10. Amenities — numbered editorial list with sub-labels.
11. Text ribbon marquee (`Private Elevator ◆ Infinity Pool ◆ …`).
12. Minimal price finale ("Offered At $12,500,000") and studio footer.
13. Chapter navigation, scroll progress, sound toggle, contact modal, WhatsApp
    button, accessibility widget.

All effects are achievable with GSAP + ScrollTrigger + Lenis (transforms, clip-path,
pinning). No WebGL required or used.

## Decisions made with user

| Decision | Choice |
|---|---|
| Styling | Tailwind v4 for layout + global CSS layer for tokens/cinematic utilities |
| Imagery | Curated royalty-free photos downloaded to `/public/images`, central manifest |
| Animation architecture | Section-autonomous ScrollTriggers over a shared motion engine |
| Scope deviation | No sound toggle, WhatsApp button, accessibility widget, or contact-form modal. CTA is anchor scroll + `mailto:` |

## Architecture

### Stack

- Next.js 15 (App Router), React, TypeScript
- GSAP + ScrollTrigger (registered once in `lib/gsap.ts`)
- Lenis smooth scrolling, driven by GSAP's ticker
- Tailwind CSS v4 + `app/globals.css` design tokens
- `next/font` for fonts, `next/image` for photos
- No Three.js / WebGL

### Motion engine

`components/providers/SmoothScrollProvider.tsx` (client):

- Instantiates Lenis; `lenis.on('scroll', ScrollTrigger.update)`;
  `gsap.ticker.add((t) => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`.
- Skips Lenis entirely under `prefers-reduced-motion`.
- Exposes the Lenis instance via context for anchor navigation
  (`lenis.scrollTo`).

Each section component owns its ScrollTriggers inside `useGSAP` (from
`@gsap/react`) with automatic context cleanup. No React state updates in the
scroll path — GSAP mutates refs directly. `gsap.matchMedia()` splits desktop
(fine pointer, ≥768px), mobile, and reduced-motion variants.

### Design language

- Palette: ink `#0d0d0f`, warm off-white `#f4f1ea`, accent champagne/brass
  `#c8a879`. Alternating dark/light scenes. No gradients, no glassmorphism,
  no rounded SaaS cards.
- Type: Fraunces (editorial serif) for display headlines at
  `clamp(64px, 9vw, 160px)`; Inter for 10–13px uppercase tracked meta/UI text.
- Layout: asymmetric editorial grids, heavy negative space, selective overlap.

### Page composition (`app/page.tsx`)

Preloader → Navigation + CustomCursor (fixed) → Hero → CinematicScene ×4 →
Stats → WhySection → ResidenceGallery → BuildingMarquee → DayTimeline →
Amenities → RibbonMarquee → FinalCta → Footer.

### Components

```
components/
  providers/SmoothScrollProvider.tsx
  preloader/Preloader.tsx
  navigation/Navigation.tsx
  hero/Hero.tsx
  cinematic-scene/CinematicScene.tsx
  stats/Stats.tsx
  why-section/WhySection.tsx
  residence-gallery/ResidenceGallery.tsx
  building-marquee/BuildingMarquee.tsx
  day-timeline/DayTimeline.tsx
  amenities/Amenities.tsx
  ribbon-marquee/RibbonMarquee.tsx
  final-cta/FinalCta.tsx
  custom-cursor/CustomCursor.tsx
  footer/Footer.tsx
lib/
  gsap.ts        // plugin registration, shared eases/durations
  images.ts      // semantic key → /public/images path manifest
hooks/
  useIsFinePointer.ts
```

**Preloader** — wordmark + counting number; exits via `clip-path: inset()`
wipe; dispatches completion so Hero's entrance timeline starts after it.
Body scroll locked during load.

**Navigation** — fixed bar: `ORA` wordmark, links RESIDENCE / LOCATION /
DETAILS (Lenis anchor scroll), `PRIVATE VIEWING →` CTA. Sections carry
`data-theme="dark" | "light"`; ScrollTriggers flip a class on the nav so text
color adapts to the background. 1px scroll-progress bar under the nav
(`scaleX` scrub). Mobile: wordmark + CTA only.

**Hero** — fullscreen image. Entrance timeline (post-preloader): image scale
1.08→1 with dark overlay fade; eyebrow `TEL AVIV · PRIVATE RESIDENCE` fades
up; headline "Above the sea. / Beyond the city." reveals line-by-line via
overflow-mask `yPercent` (no plain fade-ins); scroll indicator last. Scrubbed
exit: image zooms to ~1.15 and darkens, headline drifts up and fades.

**CinematicScene** — reusable chapter. Props: `chapter`, `eyebrow`, `title`,
`image`, `foreground?`, `variant`, `theme`. Wrapper ~250vh (mobile ~160vh)
with pinned 100vh viewport. Scrub timeline phases per the brief (image enter →
slow zoom → heading reveal → foreground parallax → heading exit). Five
variants so no two adjacent chapters animate identically:

- `zoom-reveal` — image scale 1.25→1 inside overflow-hidden frame
- `vertical-mask` — `clip-path: inset(100% 0 0 0)` → `inset(0)`
- `parallax-depth` — bg/mid/fg layers at −30/−60/−120 relative speeds
- `crossfade` — two images, second overtakes via opacity + scale
- `slide-reveal` — image translates in from side under a sliding panel

Chapter assignment: 01 THE APPROACH = `parallax-depth` (city image + tower
midground + foreground silhouette PNG), 02 THE ARRIVAL = `vertical-mask`,
03 THE INTERIOR = `crossfade`, 04 THE TERRACE = `parallax-depth` variant with
foreground plant PNG (satisfies "two scenes with obvious layered parallax").

**Stats** — 4 BEDROOMS / 5 BATHROOMS / 7,400 SQUARE FEET / 60 FLOORS ABOVE THE
CITY. Numbers count up on viewport entry (gsap tween with `snap`, ~1.6s,
thousands separator). Huge serif numerals, small tracked labels, generous
whitespace.

**WhySection** — "WHY ORA — Three reasons to never look down." Three
asymmetric editorial entries (01 Above Everything / 02 Crafted in Stone /
03 Entirely Private): oversized index numeral, serif title, short copy, image.
Alternating offsets/widths. Desktop: image translates subtly toward cursor
(`gsap.quickTo`, ±10px). Scroll-in: image mask reveal + text rise.

**ResidenceGallery** — 5 rooms: Grand Salon, Primary Suite, Stone Spa, Wine
Lounge, Infinity Terrace. Desktop: sticky split — room list left; hovering (or
scroll progress, when not hovering) swaps the dominant right image via
clip-path + scale crossfade. Below it, a pinned horizontal strip: vertical
scroll scrubs `xPercent` travel through wide images (the required
horizontal-scroll-in-vertical-scroll moment). Mobile: swipeable/scrollable
horizontal snap strip, no pinning.

**BuildingMarquee** — PRIVATE LOBBY / SPA / GRAND SALON / TERRACE / ROOFTOP /
CITY VIEW as two rows of oversized captioned images moving in opposite
directions; base drift plus scroll-velocity modulation. Duplicated content for
seamless wrap.

**DayTimeline** — "A DAY ABOVE THE CITY". One pinned 100vh viewport over
~500vh scroll. Six moments: 07:00 Morning Swim, 09:00 Coffee Above the Sea,
13:00 Long Lunch, 18:30 Golden Hour, 21:00 Wine Room, 23:30 City Lights.
Scroll progress maps to scene index; each transition crossfades + scales the
image and mask-swaps the time/headline. Thin progress rail with time markers.

**Amenities** — numbered editorial list (Private elevator, 18m infinity pool,
Chef's kitchen, 600 bottle wine wall, Stone spa, Smart home, 24/7 concierge,
Private parking) with small sub-labels. Hover: row indents slightly, accent
underline draws, index fills. No borders/cards. Rows stagger-reveal on entry.

**RibbonMarquee** — uppercase text ribbon (PRIVATE LOBBY / SPA / GRAND SALON /
TERRACE / ROOFTOP / CITY VIEW separated by ◆), continuous loop, slight speed
response to scroll.

**FinalCta** — "A PRIVATE RESIDENCE / ABOVE TEL AVIV", "Offered at",
$14,800,000 counting up on entry, `REQUEST PRIVATE VIEWING →` magnetic button
(desktop) opening `mailto:`. Background image zooms ~1→1.08 scrubbed across
the section. Enormous whitespace.

**CustomCursor** — small dot + trailing ring, `gsap.quickTo` on mousemove.
Expands modestly over links/images; shows "VIEW" over gallery items. Mounted
only when `(pointer: fine)` and no reduced-motion; native cursor kept visible
alongside (dot is an accent, not a replacement — restrained per brief).

**Footer** — minimal: wordmark, fictional contact line, copyright. No studio
credits copied from reference.

### Micro-interactions

Magnetic CTA buttons (desktop), link underline draw-reveals, image hover
scale (~1.04), overflow-mask text reveals, preloader page reveal, Lenis
smooth anchor navigation, count-up numbers, nav color transitions.

## Image system

`/public/images/` holds ~15 curated royalty-free (Unsplash) photos with a
consistent warm/dusk luxury-architecture palette, semantic filenames
(`hero.jpg`, `approach.jpg`, `terrace.jpg`, …), plus 2–3 transparent PNG
foreground elements (plant/architectural silhouettes) for parallax layers.
`lib/images.ts` is the single manifest mapping semantic keys → paths + alt
text, so final photography swaps in one file. Hero uses `priority`; all
below-fold images lazy-load. `IMAGE_REQUIREMENTS.md` documents every required
final image with dimensions, aspect ratio, visual direction, and whether
foreground separation would improve parallax.

## Performance

- Only `transform`, `opacity`, `clip-path` animated; never width/height/top/left.
- No React state in scroll handlers; GSAP writes to refs.
- `will-change: transform` only on actively pinned/scrubbed layers.
- Hero preloaded; everything else lazy.
- `gsap.matchMedia()`: mobile gets shorter pins (~160vh), reduced parallax
  distances, no cursor/magnetic/tilt; `prefers-reduced-motion` gets static
  layout with simple non-scrubbed reveals and no Lenis.
- Target: 60fps scroll on a modern laptop; zero horizontal overflow on mobile.

## Error handling

- Client-only concerns (Lenis, cursor, matchMedia) guarded so SSR/prerender
  never touches `window`.
- Preloader has a hard timeout (~3.5s) so a slow image can never trap the user.
- All ScrollTriggers created inside `useGSAP` contexts → clean unmount/HMR.

## Deliverables & verification

1. Fully functional site, desktop + dedicated mobile behavior
2. `REFERENCE_ANALYSIS.md`, `IMAGE_REQUIREMENTS.md`, `README.md`
3. `npm install` && `npm run build` → zero errors (type-check included)
4. Dev server run locally; headless smoke check that the page renders and the
   console is clean

## Out of scope

Sound toggle, WhatsApp integration, accessibility widget clone, contact-form
backend, CMS, i18n/RTL, Three.js/WebGL, analytics.
