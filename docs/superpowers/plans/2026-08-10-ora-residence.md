# ORA — Residence Above the Sea: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic, scroll-driven luxury landing page for the fictional "ORA — Residence Above the Sea" reproducing the interaction system of avi-towers.vercel.app with original branding.

**Architecture:** Next.js 15 App Router single page. Shared motion engine (Lenis driven by GSAP's ticker, ScrollTrigger registered once); each section is a client component owning its own ScrollTriggers inside `useGSAP` contexts. Pinning is done with CSS `position: sticky` inside tall wrappers (not ScrollTrigger `pin`) to stay friction-free with Lenis. A reusable `<CinematicScene>` with 5 animation variants renders the 4 story chapters.

**Tech Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 + global CSS tokens · GSAP + ScrollTrigger + @gsap/react · Lenis · next/font (Fraunces, Inter) · next/image

**Spec:** `docs/superpowers/specs/2026-08-10-ora-residence-design.md`

## Global Constraints

- Brand is **ORA** only. Never render "AVI", "Avi Towers", or "Avisx" anywhere in the app.
- Palette: ink `#0d0d0f`, bone `#f4f1ea`, brass `#c8a879`. No gradients-everywhere, no glassmorphism, no rounded SaaS cards, no colorful UI.
- Type: Fraunces for display headlines (`clamp(64px, 9vw, 160px)` top size), Inter for 10–13px uppercase tracked meta text.
- Copy (verbatim): hero eyebrow `TEL AVIV · PRIVATE RESIDENCE`; hero headline `Above the sea.` / `Beyond the city.`; chapters `01 — THE APPROACH` "The city disappears beneath you", `02 — THE ARRIVAL` "Your elevator opens directly into the sky", `03 — THE INTERIOR` "Stone, glass and endless horizon", `04 — THE TERRACE` "The Mediterranean at your feet"; stats `4 BEDROOMS / 5 BATHROOMS / 7,400 SQUARE FEET / 60 FLOORS ABOVE THE CITY`; price `$14,800,000`.
- Scroll animation may only animate `transform`, `opacity`, `clip-path`. Never animate width/height/top/left. No React state updates in the scroll path.
- Every ScrollTrigger lives inside a `useGSAP(..., { scope })` context.
- All animated sections must degrade under `(prefers-reduced-motion: reduce)` (content visible, no scrub/pin) and simplify on mobile (`gsap.matchMedia`).
- Testing approach for this visual project: each task verifies with `npm run build` (type-checks) plus a dev-server render check; unit-style assertion only where pure logic exists. This substitutes for TDD test files by design.
- Commit after every task. Dev server checks: run `npm run dev` in background, `curl -s localhost:3000 | grep` for expected markup, watch terminal for runtime errors, then kill it.

---

### Task 1: Scaffold project, design tokens, fonts, REFERENCE_ANALYSIS.md

**Files:**
- Create: Next.js app in repo root (`app/`, `package.json`, …)
- Modify: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- Create: `REFERENCE_ANALYSIS.md`

**Interfaces:**
- Produces: CSS utility classes `.font-display`, `.display-xl`, `.display-lg`, `.meta`, `.mask-line`; CSS vars `--color-ink`, `--color-bone`, `--color-brass`; font CSS vars `--font-fraunces`, `--font-inter`. All later tasks use these.

- [ ] **Step 1: Scaffold**

```bash
cd "/Users/corphd/Desktop/Or codes projects/Tower-UI-Test"
npx --yes create-next-app@latest . --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
npm install gsap @gsap/react lenis
```

(create-next-app tolerates the existing `docs/` + `.git`; if it refuses, scaffold into `ora-tmp/`, `rsync -a ora-tmp/ ./ --exclude .git` and remove `ora-tmp`.)

- [ ] **Step 2: Replace `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0d0d0f;
  --color-bone: #f4f1ea;
  --color-brass: #c8a879;
}

html { background: var(--color-ink); }

body {
  background: var(--color-ink);
  color: var(--color-bone);
  font-family: var(--font-inter), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: clip;
}

.font-display { font-family: var(--font-fraunces), serif; }

.display-xl {
  font-family: var(--font-fraunces), serif;
  font-size: clamp(64px, 9vw, 160px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  font-weight: 300;
}

.display-lg {
  font-family: var(--font-fraunces), serif;
  font-size: clamp(40px, 6vw, 104px);
  line-height: 1.02;
  letter-spacing: -0.015em;
  font-weight: 300;
}

.display-md {
  font-family: var(--font-fraunces), serif;
  font-size: clamp(28px, 3.4vw, 56px);
  line-height: 1.08;
  font-weight: 300;
}

.meta {
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

/* text mask reveal building block */
.mask-line { display: block; overflow: hidden; }
.mask-line > span { display: inline-block; will-change: transform; }

/* Lenis recommended styles */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }

::selection { background: var(--color-brass); color: var(--color-ink); }
```

- [ ] **Step 3: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400"],
  style: ["normal", "italic"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ORA — Residence Above the Sea",
  description:
    "A private residence above Tel Aviv. Above the sea. Beyond the city.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Replace `app/page.tsx` with a token smoke page**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center px-8">
      <p className="meta text-brass">TEL AVIV · PRIVATE RESIDENCE</p>
      <h1 className="display-xl">Above the sea.</h1>
    </main>
  );
}
```

- [ ] **Step 5: Write `REFERENCE_ANALYSIS.md`** — condense the reference findings from the spec ("Reference findings" section) into: identified effects (preloader, pinned chapters, layered plant-PNG parallax, count-up stats, dominant-image gallery, dual-row marquee, pinned day timeline, ribbon, price finale, theme-adaptive nav, custom cursor) and one line each on the reproduction technique (CSS sticky wrappers + scrubbed GSAP timelines, clip-path reveals, Lenis+ticker sync, matchMedia degradation). Cite that analysis was done via content scrape on 2026-08-10.

- [ ] **Step 6: Verify** — `npm run build` → zero errors. `npm run dev` in background; `curl -s localhost:3000 | grep "Above the sea"` succeeds; kill dev server.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: scaffold Next.js app with ORA design tokens and reference analysis"`

---

### Task 2: Image pipeline — downloads, manifest, IMAGE_REQUIREMENTS.md

**Files:**
- Create: `public/images/*.jpg` (~16 photos)
- Create: `lib/images.ts`
- Create: `IMAGE_REQUIREMENTS.md`

**Interfaces:**
- Produces: `IMAGES: Record<ImageKey, OraImage>` where `type OraImage = { src: string; alt: string }` and `ImageKey = "hero" | "approach" | "approachMid" | "arrival" | "interiorA" | "interiorB" | "terrace" | "salon" | "suite" | "spa" | "wine" | "kitchen" | "pool" | "cityNight" | "lobby" | "golden"`. Every later task imports `IMAGES` from `@/lib/images`.

- [ ] **Step 1: Download candidate images** (Unsplash CDN; warm/dusk luxury-architecture palette). Run as one loop:

```bash
mkdir -p public/images && cd public/images
base="https://images.unsplash.com"
q="?q=80&w=2400&auto=format&fit=crop"
curl -fL "$base/photo-1512453979798-5ea266f8880c$q" -o hero.jpg
curl -fL "$base/photo-1477959858617-67f85cf4f1df$q" -o approach.jpg
curl -fL "$base/photo-1486406146926-c627a92ad1ab$q" -o approach-mid.jpg
curl -fL "$base/photo-1600607687939-ce8a6c25118c$q" -o arrival.jpg
curl -fL "$base/photo-1600210492486-724fe5c67fb0$q" -o interior-a.jpg
curl -fL "$base/photo-1493809842364-78817add7ffb$q" -o interior-b.jpg
curl -fL "$base/photo-1540541338287-41700207dee6$q" -o terrace.jpg
curl -fL "$base/photo-1522708323590-d24dbb6b0267$q" -o salon.jpg
curl -fL "$base/photo-1578683010236-d716f9a3f461$q" -o suite.jpg
curl -fL "$base/photo-1544161515-4ab6ce6db874$q" -o spa.jpg
curl -fL "$base/photo-1510812431401-41d2bd2722f3$q" -o wine.jpg
curl -fL "$base/photo-1556912167-f556f1f39fdf$q" -o kitchen.jpg
curl -fL "$base/photo-1445019980597-93fa8acb246c$q" -o pool.jpg
curl -fL "$base/photo-1519501025264-65ba15a82390$q" -o city-night.jpg
curl -fL "$base/photo-1560448204-e02f11c3d0e2$q" -o lobby.jpg
curl -fL "$base/photo-1507525428034-b723cf961d3e$q" -o golden.jpg
```

- [ ] **Step 2: Verify every file** — `for f in *.jpg; do echo "$f $(stat -f%z "$f")"; sips -g pixelWidth "$f" | tail -1; done`. Each must be > 80 KB and ≥ 1600px wide. **Any failure or visually off-brief image:** find a replacement matching the visual direction in `IMAGE_REQUIREMENTS.md` using the firecrawl-search skill (query e.g. `site:unsplash.com luxury penthouse interior dusk`), download, re-verify. Then eyeball all 16 (`open .`) for palette consistency (warm dusk tones); swap outliers the same way.

- [ ] **Step 3: Create `lib/images.ts`**

```ts
export type OraImage = { src: string; alt: string };

export type ImageKey =
  | "hero" | "approach" | "approachMid" | "arrival"
  | "interiorA" | "interiorB" | "terrace" | "salon"
  | "suite" | "spa" | "wine" | "kitchen"
  | "pool" | "cityNight" | "lobby" | "golden";

export const IMAGES: Record<ImageKey, OraImage> = {
  hero: { src: "/images/hero.jpg", alt: "Tower rising above the sea at dusk" },
  approach: { src: "/images/approach.jpg", alt: "The city from above at night" },
  approachMid: { src: "/images/approach-mid.jpg", alt: "Tower facade detail" },
  arrival: { src: "/images/arrival.jpg", alt: "Private elevator arrival hall" },
  interiorA: { src: "/images/interior-a.jpg", alt: "Living space in stone and glass" },
  interiorB: { src: "/images/interior-b.jpg", alt: "Interior with endless horizon" },
  terrace: { src: "/images/terrace.jpg", alt: "Terrace over the Mediterranean" },
  salon: { src: "/images/salon.jpg", alt: "The grand salon" },
  suite: { src: "/images/suite.jpg", alt: "The primary suite" },
  spa: { src: "/images/spa.jpg", alt: "The stone spa" },
  wine: { src: "/images/wine.jpg", alt: "The wine lounge" },
  kitchen: { src: "/images/kitchen.jpg", alt: "The chef's kitchen" },
  pool: { src: "/images/pool.jpg", alt: "The infinity pool" },
  cityNight: { src: "/images/city-night.jpg", alt: "City lights at night" },
  lobby: { src: "/images/lobby.jpg", alt: "The private lobby" },
  golden: { src: "/images/golden.jpg", alt: "Golden hour over the sea" },
};
```

- [ ] **Step 4: Write `IMAGE_REQUIREMENTS.md`** — table of the 11 final images from the brief (hero, tower exterior, elevator arrival, living room, kitchen, bedroom, spa, wine room, terrace, pool, city aerial) with columns: file to replace in `/public/images`, recommended dimensions (2400×3000 portrait for gallery/suite/spa; 3200×1800 landscape for hero/terrace/city aerial; 2400×2400 for marquee squares), aspect ratio, visual direction (dusk palette, warm stone, champagne accents, no people), and whether a separated transparent foreground element would improve parallax (yes for: hero, terrace, elevator arrival; no for flat aerials). Note that all swaps happen only in `/public/images` + `lib/images.ts`.

- [ ] **Step 5: Manifest integrity check** — `node -e 'const fs=require("fs");const s=fs.readFileSync("lib/images.ts","utf8");const m=[...s.matchAll(/src: "([^"]+)"/g)].map(x=>x[1]);m.forEach(p=>{if(!fs.existsSync("public"+p)){console.error("MISSING "+p);process.exit(1)}});console.log("manifest OK",m.length)'` → `manifest OK 16`.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: add curated image set, manifest, and image requirements doc"`

---

### Task 3: Motion engine — gsap module, Lenis provider, pointer hook

**Files:**
- Create: `lib/gsap.ts`, `components/providers/SmoothScrollProvider.tsx`, `hooks/useIsFinePointer.ts`
- Modify: `app/layout.tsx` (wrap children in provider)

**Interfaces:**
- Produces: `import { gsap, ScrollTrigger } from "@/lib/gsap"` (plugins pre-registered); `useLenis(): Lenis | null` from the provider module; `useIsFinePointer(): boolean`. All animated components import gsap ONLY from `@/lib/gsap`.

- [ ] **Step 1: Create `lib/gsap.ts`**

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger };

export const MM = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;
```

- [ ] **Step 2: Create `components/providers/SmoothScrollProvider.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ lerp: 0.09 });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
```

- [ ] **Step 3: Create `hooks/useIsFinePointer.ts`**

```ts
"use client";
import { useEffect, useState } from "react";

export function useIsFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);
  return fine;
}
```

- [ ] **Step 4: Wrap layout** — in `app/layout.tsx` import the provider and change body to `<body><SmoothScrollProvider>{children}</SmoothScrollProvider></body>`.

- [ ] **Step 5: Verify** — `npm run build` zero errors; dev server renders, no hydration warnings in terminal; scrolling the smoke page feels inertial (manual).

- [ ] **Step 6: Commit** — `git commit -am "feat: motion engine — gsap module, Lenis provider, pointer hook"`

---

### Task 4: Hero

**Files:**
- Create: `components/hero/Hero.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES.hero`, `@/lib/gsap`.
- Produces: listens for `window` CustomEvent `"ora:reveal"` to start its entrance timeline (Preloader in Task 5 dispatches it); plays anyway after a 4s fallback. Section carries `data-theme="dark"` and `id="top"`.

- [ ] **Step 1: Create `components/hero/Hero.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
import { IMAGES } from "@/lib/images";

const LINES = ["Above the sea.", "Beyond the city."];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      // --- entrance (plays once, after preloader) ---
      const entrance = gsap
        .timeline({ paused: true, defaults: { ease: "power3.out" } })
        .fromTo(q(".js-img"), { scale: 1.08 }, { scale: 1, duration: 2.2, ease: "power2.out" })
        .fromTo(q(".js-veil"), { opacity: 0.85 }, { opacity: 0.35, duration: 1.8 }, 0)
        .fromTo(q(".js-eyebrow"), { yPercent: 120 }, { yPercent: 0, duration: 0.9 }, 0.5)
        .fromTo(
          q(".js-line"),
          { yPercent: 115 },
          { yPercent: 0, duration: 1.1, stagger: 0.14, ease: "power4.out" },
          0.7
        )
        .fromTo(q(".js-scrollcue"), { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.6);

      const play = () => entrance.play();
      window.addEventListener("ora:reveal", play, { once: true });
      const fallback = window.setTimeout(play, 4000);

      // --- scrubbed exit ---
      const mm = gsap.matchMedia();
      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) {
          entrance.progress(1);
          return;
        }
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          })
          .fromTo(q(".js-img"), { scale: 1 }, { scale: c.mobile ? 1.06 : 1.15, ease: "none" }, 0)
          .to(q(".js-veil"), { opacity: 0.75, ease: "none" }, 0)
          .to(q(".js-copy"), { yPercent: -25, opacity: 0, ease: "none" }, 0);
      });

      return () => {
        window.removeEventListener("ora:reveal", play);
        window.clearTimeout(fallback);
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" data-theme="dark" className="relative h-[130vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="js-img absolute inset-0 will-change-transform">
          <Image src={IMAGES.hero.src} alt={IMAGES.hero.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
        <div className="js-veil absolute inset-0 bg-ink" />
        <div className="js-copy relative z-10 flex h-full flex-col items-start justify-end px-6 pb-24 md:px-16 md:pb-28">
          <span className="mask-line meta text-brass">
            <span className="js-eyebrow">TEL AVIV · PRIVATE RESIDENCE</span>
          </span>
          <h1 className="display-xl mt-6 text-bone">
            {LINES.map((line) => (
              <span key={line} className="mask-line">
                <span className="js-line">{line}</span>
              </span>
            ))}
          </h1>
        </div>
        <div className="js-scrollcue absolute bottom-8 left-1/2 z-10 -translate-x-1/2 opacity-0">
          <span className="meta text-bone/60">Scroll to enter</span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import Hero from "@/components/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <div className="h-screen" />
    </main>
  );
}
```

(The trailing spacer div is temporary scroll room; later tasks replace it as sections land.)

- [ ] **Step 3: Verify** — build passes; dev: hero image scales in, headline reveals line-by-line after ≤4s, scrolling zooms/darkens image and drifts headline.

- [ ] **Step 4: Commit** — `git commit -am "feat: cinematic hero with entrance and scrubbed exit"`

---

### Task 5: Preloader

**Files:**
- Create: `components/preloader/Preloader.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `@/lib/gsap`.
- Produces: dispatches `window.dispatchEvent(new CustomEvent("ora:reveal"))` when its exit wipe starts; locks scroll while visible via `document.documentElement.classList` `overflow-hidden`.

- [ ] **Step 1: Create `components/preloader/Preloader.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const html = document.documentElement;
      html.classList.add("overflow-hidden");

      const counter = { v: 0 };
      const num = q(".js-num")[0] as HTMLElement;

      gsap
        .timeline({
          onComplete: () => gsap.set(root.current, { display: "none" }),
        })
        .fromTo(q(".js-word"), { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "power4.out" })
        .to(
          counter,
          {
            v: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0.2
        )
        .to(q(".js-row"), { yPercent: -115, duration: 0.6, ease: "power3.in" }, "+=0.15")
        .add(() => {
          html.classList.remove("overflow-hidden");
          window.dispatchEvent(new CustomEvent("ora:reveal"));
        })
        .to(root.current, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.0,
          ease: "power4.inOut",
        });

      return () => html.classList.remove("overflow-hidden");
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex items-end justify-between bg-ink px-6 pb-10 md:px-16"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <span className="mask-line">
        <span className="js-row js-word font-display text-4xl text-bone md:text-6xl">ORA</span>
      </span>
      <span className="mask-line">
        <span className="js-row js-num meta text-brass">000</span>
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Add `<Preloader />` as the first child of `<main>` in `app/page.tsx`.**

- [ ] **Step 3: Verify** — dev: wordmark + 000→100 counter, upward wipe, then hero entrance begins (no 4s wait). Reload a few times; scroll is locked during load.

- [ ] **Step 4: Commit** — `git commit -am "feat: preloader with counter and clip-path exit gating hero"`

---

### Task 6: Navigation, scroll progress, theme adaptation

**Files:**
- Create: `components/navigation/Navigation.tsx`, `components/ui/Magnetic.tsx`
- Modify: `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `useLenis` from provider; sections' `data-theme="dark"|"light"` attributes.
- Produces: `<Magnetic strength={number}>{child}</Magnetic>` wrapper (desktop-only translate follow, used again in Task 13); nav link targets `#residence`, `#location`, `#details`, `#viewing` (later tasks give sections these ids); `.link-underline` CSS class for hover underline draw.

- [ ] **Step 1: Create `components/ui/Magnetic.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useIsFinePointer } from "@/hooks/useIsFinePointer";

export default function Magnetic({
  children,
  strength = 0.25,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();

  useGSAP(
    () => {
      if (!fine || !root.current) return;
      const el = root.current;
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mousemove", move);
        el.removeEventListener("mouseleave", leave);
      };
    },
    { dependencies: [fine], scope: root }
  );

  return (
    <div ref={root} className="inline-block will-change-transform">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Add to `app/globals.css`**

```css
.link-underline { position: relative; }
.link-underline::after {
  content: "";
  position: absolute;
  left: 0; bottom: -3px;
  width: 100%; height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.link-underline:hover::after { transform: scaleX(1); transform-origin: left; }

nav[data-theme="light"] { color: var(--color-ink); }
nav[data-theme="dark"] { color: var(--color-bone); }
```

- [ ] **Step 3: Create `components/navigation/Navigation.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import Magnetic from "@/components/ui/Magnetic";

const LINKS = [
  { label: "RESIDENCE", href: "#residence" },
  { label: "LOCATION", href: "#location" },
  { label: "DETAILS", href: "#details" },
];

export default function Navigation() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const nav = root.current!;
      // theme flipping: watch every themed section
      document.querySelectorAll<HTMLElement>("[data-theme]").forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top 48px",
          end: "bottom 48px",
          onToggle: (self) => {
            if (self.isActive) nav.dataset.theme = sec.dataset.theme;
          },
        });
      });
      // progress bar
      gsap.fromTo(
        ".js-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        }
      );
    },
    { scope: root }
  );

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    if (lenis) lenis.scrollTo(target as HTMLElement, { duration: 1.6 });
    else (target as HTMLElement).scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      ref={root}
      data-theme="dark"
      className="fixed inset-x-0 top-0 z-[80] transition-colors duration-500"
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-16">
        <a href="#top" onClick={(e) => go(e, "#top")} className="font-display text-xl tracking-wide">
          ORA
        </a>
        <div className="hidden gap-10 md:flex">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={(e) => go(e, l.href)} className="link-underline meta">
              {l.label}
            </a>
          ))}
        </div>
        <Magnetic>
          <a href="#viewing" onClick={(e) => go(e, "#viewing")} className="meta border-b border-current pb-1">
            PRIVATE VIEWING →
          </a>
        </Magnetic>
      </div>
      <div className="js-progress h-px w-full origin-left bg-brass/80" />
    </nav>
  );
}
```

- [ ] **Step 4: Add `<Navigation />` to `app/page.tsx`** after `<Preloader />`. Add a temporary light probe section before the spacer: `<section data-theme="light" className="bg-bone h-screen" />` to verify color flipping (removed when real light sections land).

- [ ] **Step 5: Verify** — build passes; dev: nav text is bone over hero, flips to ink over the light probe; progress bar tracks scroll; wordmark click returns to top smoothly.

- [ ] **Step 6: Commit** — `git commit -am "feat: theme-adaptive navigation with scroll progress and magnetic CTA"`

---

### Task 7: CinematicScene (5 variants) + 4 story chapters

**Files:**
- Create: `components/cinematic-scene/CinematicScene.tsx`, `components/cinematic-scene/foregrounds.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES`, `@/lib/gsap`, `MM`.
- Produces:

```ts
type SceneVariant = "zoom-reveal" | "vertical-mask" | "parallax-depth" | "crossfade" | "slide-reveal";
interface CinematicSceneProps {
  chapter: string;          // "01"
  eyebrow: string;          // "THE APPROACH"
  title: string;
  image: OraImage;
  imageB?: OraImage;        // crossfade only
  midground?: OraImage;     // parallax-depth only
  foreground?: React.ReactNode; // parallax-depth only
  variant: SceneVariant;
  theme?: "dark" | "light";
  id?: string;
}
```

Also `PlantSilhouette` and `RailingSilhouette` SVG components from `foregrounds.tsx`.

- [ ] **Step 1: Create `components/cinematic-scene/foregrounds.tsx`** — two full-bleed transparent SVG silhouettes used as parallax foreground layers:

```tsx
export function PlantSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 600" className={className} aria-hidden preserveAspectRatio="xMidYMax slice">
      <g fill="#050506" opacity="0.92">
        <path d="M120 600 C 90 430, 30 380, 10 300 C 90 340, 130 420, 150 480 C 150 380, 120 300, 140 210 C 190 300, 185 420, 180 500 C 210 420, 260 380, 330 360 C 270 430, 230 500, 215 600 Z" />
        <path d="M700 600 C 720 470, 780 420, 795 330 C 730 380, 690 450, 675 520 C 665 430, 690 340, 660 260 C 620 350, 640 470, 655 545 C 620 480, 560 445, 500 430 C 560 495, 610 545, 630 600 Z" />
      </g>
    </svg>
  );
}

export function RailingSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1600 400" className={className} aria-hidden preserveAspectRatio="xMidYMax slice">
      <g fill="#050506" opacity="0.9">
        <rect x="0" y="330" width="1600" height="70" />
        <rect x="0" y="300" width="1600" height="10" />
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={i * 80 + 12} y="310" width="6" height="24" />
        ))}
      </g>
    </svg>
  );
}
```

- [ ] **Step 2: Create `components/cinematic-scene/CinematicScene.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
import type { OraImage } from "@/lib/images";

export type SceneVariant =
  | "zoom-reveal" | "vertical-mask" | "parallax-depth" | "crossfade" | "slide-reveal";

export interface CinematicSceneProps {
  chapter: string;
  eyebrow: string;
  title: string;
  image: OraImage;
  imageB?: OraImage;
  midground?: OraImage;
  foreground?: React.ReactNode;
  variant: SceneVariant;
  theme?: "dark" | "light";
  id?: string;
}

export default function CinematicScene(props: CinematicSceneProps) {
  const { chapter, eyebrow, title, image, imageB, midground, foreground, variant, theme = "dark", id } = props;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) return; // static layout, everything visible via CSS defaults

        const k = c.mobile ? 0.45 : 1; // parallax distance factor
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
        });

        // shared heading choreography: reveal 0.30–0.55, exit 0.75–0.95 of a 0–1 timeline
        const heading = () => {
          tl.fromTo(q(".js-word"), { yPercent: 115 }, { yPercent: 0, stagger: 0.02, duration: 0.18, ease: "power3.out" }, 0.3)
            .fromTo(q(".js-eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.1 }, 0.28)
            .to(q(".js-copy"), { yPercent: -40 * k, opacity: 0, duration: 0.2, ease: "power2.in" }, 0.78);
        };

        switch (variant) {
          case "zoom-reveal":
            tl.fromTo(q(".js-imgA"), { scale: 1.25 }, { scale: 1, duration: 0.5, ease: "none" }, 0)
              .to(q(".js-imgA"), { scale: 1.07, duration: 0.5, ease: "none" }, 0.5)
              .fromTo(q(".js-veil"), { opacity: 0.7 }, { opacity: 0.25, duration: 0.4, ease: "none" }, 0);
            heading();
            break;

          case "vertical-mask":
            tl.fromTo(q(".js-frame"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, ease: "none" }, 0)
              .fromTo(q(".js-imgA"), { scale: 1.2 }, { scale: 1, duration: 0.55, ease: "none" }, 0)
              .to(q(".js-imgA"), { scale: 1.05, duration: 0.45, ease: "none" }, 0.55);
            heading();
            break;

          case "parallax-depth":
            tl.fromTo(q(".js-imgA"), { yPercent: 6 * k, scale: 1.05 }, { yPercent: -6 * k, scale: 1.14, duration: 1, ease: "none" }, 0);
            if (midground) tl.fromTo(q(".js-mid"), { yPercent: 14 * k }, { yPercent: -14 * k, duration: 1, ease: "none" }, 0);
            if (foreground) tl.fromTo(q(".js-fg"), { yPercent: 22 * k }, { yPercent: -30 * k, duration: 1, ease: "none" }, 0);
            tl.fromTo(q(".js-copy"), { yPercent: 10 * k }, { yPercent: -14 * k, duration: 1, ease: "none" }, 0);
            heading();
            break;

          case "crossfade":
            tl.fromTo(q(".js-imgA"), { scale: 1 }, { scale: 1.12, duration: 0.7, ease: "none" }, 0)
              .fromTo(q(".js-imgB"), { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 0.35, ease: "none" }, 0.5);
            heading();
            break;

          case "slide-reveal":
            tl.fromTo(q(".js-frame"), { xPercent: 24 * k, clipPath: "inset(0% 0% 0% 100%)" }, { xPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "none" }, 0)
              .fromTo(q(".js-imgA"), { xPercent: -14 * k, scale: 1.15 }, { xPercent: 0, scale: 1, duration: 0.55, ease: "none" }, 0);
            heading();
            break;
        }
      });
    },
    { scope: root, dependencies: [variant] }
  );

  const dark = theme === "dark";
  const words = title.split(" ");

  return (
    <section
      ref={root}
      id={id}
      data-theme={theme}
      className={`relative h-[250vh] max-md:h-[170vh] ${dark ? "bg-ink" : "bg-bone"}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="js-frame absolute inset-0 will-change-transform" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
          <div className="js-imgA absolute inset-0 will-change-transform">
            <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
          </div>
          {imageB && (
            <div className="js-imgB absolute inset-0 opacity-0 will-change-transform">
              <Image src={imageB.src} alt={imageB.alt} fill sizes="100vw" className="object-cover" />
            </div>
          )}
          <div className="js-veil absolute inset-0 bg-ink/40" />
        </div>

        {midground && (
          <div className="js-mid pointer-events-none absolute inset-x-[8%] bottom-[-10%] top-[30%] will-change-transform max-md:hidden">
            <Image src={midground.src} alt="" fill sizes="80vw" className="object-cover object-top opacity-80" />
          </div>
        )}

        {foreground && (
          <div className="js-fg pointer-events-none absolute inset-x-0 bottom-[-12%] h-[55%] will-change-transform">
            {foreground}
          </div>
        )}

        <div className="js-copy absolute inset-0 z-10 flex flex-col justify-end px-6 pb-24 md:px-16 md:pb-32">
          <p className={`js-eyebrow meta ${dark ? "text-brass" : "text-ink/60"}`}>
            {chapter} — {eyebrow}
          </p>
          <h2 className={`display-lg mt-5 max-w-[14ch] ${dark ? "text-bone" : "text-ink"}`}>
            {words.map((w, i) => (
              <span key={i} className="mask-line mr-[0.28em] inline-block align-top">
                <span className="js-word">{w}</span>
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Compose the four chapters in `app/page.tsx`** (replace light probe + spacer):

```tsx
import Preloader from "@/components/preloader/Preloader";
import Navigation from "@/components/navigation/Navigation";
import Hero from "@/components/hero/Hero";
import CinematicScene from "@/components/cinematic-scene/CinematicScene";
import { PlantSilhouette, RailingSilhouette } from "@/components/cinematic-scene/foregrounds";
import { IMAGES } from "@/lib/images";

export default function Home() {
  return (
    <main>
      <Preloader />
      <Navigation />
      <Hero />
      <CinematicScene
        chapter="01" eyebrow="THE APPROACH" title="The city disappears beneath you"
        image={IMAGES.approach} midground={IMAGES.approachMid}
        foreground={<PlantSilhouette className="absolute bottom-0 h-full w-full" />}
        variant="parallax-depth"
      />
      <CinematicScene
        chapter="02" eyebrow="THE ARRIVAL" title="Your elevator opens directly into the sky"
        image={IMAGES.arrival} variant="vertical-mask"
      />
      <CinematicScene
        chapter="03" eyebrow="THE INTERIOR" title="Stone, glass and endless horizon"
        image={IMAGES.interiorA} imageB={IMAGES.interiorB} variant="crossfade" id="residence"
      />
      <CinematicScene
        chapter="04" eyebrow="THE TERRACE" title="The Mediterranean at your feet"
        image={IMAGES.terrace}
        foreground={<RailingSilhouette className="absolute bottom-0 h-full w-full" />}
        variant="parallax-depth"
      />
      <div className="h-screen" />
    </main>
  );
}
```

- [ ] **Step 4: Verify** — build passes. Dev: four pinned chapters, each with distinct transitions; chapters 01 and 04 show visible multi-speed layering; word-mask heading reveals; no jumping at pin boundaries; mobile width (devtools) uses shorter sections and reduced parallax.

- [ ] **Step 5: Commit** — `git commit -am "feat: reusable CinematicScene with five variants and four story chapters"`

---

### Task 8: Stats

**Files:**
- Create: `components/stats/Stats.tsx`
- Modify: `app/page.tsx` (insert after chapter 04, keep trailing spacer)

**Interfaces:**
- Consumes: `@/lib/gsap`.
- Produces: section `data-theme="light"`, `id="details"`.

- [ ] **Step 1: Create `components/stats/Stats.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const STATS = [
  { value: 4, label: "Bedrooms" },
  { value: 5, label: "Bathrooms" },
  { value: 7400, label: "Square Feet" },
  { value: 60, label: "Floors Above the City" },
];

const fmt = new Intl.NumberFormat("en-US");

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const nums = gsap.utils.toArray<HTMLElement>(".js-stat", root.current);
      nums.forEach((el) => {
        const target = Number(el.dataset.value);
        const state = { v: 0 };
        gsap.to(state, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = fmt.format(Math.round(state.v));
          },
        });
      });
      gsap.from(".js-row", {
        yPercent: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="details" data-theme="light" className="bg-bone py-40 text-ink md:py-56">
      <div className="grid grid-cols-2 gap-x-8 gap-y-24 px-6 md:grid-cols-4 md:px-16">
        {STATS.map((s) => (
          <div key={s.label} className="js-row">
            <div className="js-stat font-display text-[clamp(56px,7vw,120px)] font-light leading-none" data-value={s.value}>
              0
            </div>
            <div className="meta mt-4 text-ink/50">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert `<Stats />` after chapter 04 in `app/page.tsx`.**
- [ ] **Step 3: Verify** — build passes; numbers count up once on entry (7,400 renders with comma); nav flips to ink over this light section.
- [ ] **Step 4: Commit** — `git commit -am "feat: count-up statistics section"`

---

### Task 9: Why ORA

**Files:**
- Create: `components/why-section/WhySection.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES`, `useIsFinePointer`.
- Produces: section `data-theme="light"`.

- [ ] **Step 1: Create `components/why-section/WhySection.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { IMAGES, type OraImage } from "@/lib/images";
import { useIsFinePointer } from "@/hooks/useIsFinePointer";

const REASONS: { n: string; title: string; copy: string; image: OraImage; align: string }[] = [
  {
    n: "01", title: "Above Everything",
    copy: "Sixty floors over the shoreline — the highest private address on the coast, where the city becomes a field of light beneath you.",
    image: IMAGES.cityNight, align: "md:ml-0 md:w-[52%]",
  },
  {
    n: "02", title: "Crafted in Stone",
    copy: "Limestone, travertine and smoked oak — natural materials composed by hand, selected to age with the sea air.",
    image: IMAGES.interiorB, align: "md:ml-auto md:w-[46%]",
  },
  {
    n: "03", title: "Entirely Private",
    copy: "A biometric elevator, one residence per floor, and a concierge who never asks twice.",
    image: IMAGES.lobby, align: "md:ml-[18%] md:w-[48%]",
  },
];

export default function WhySection() {
  const root = useRef<HTMLElement>(null);
  const fine = useIsFinePointer();

  useGSAP(
    () => {
      // scroll-in reveals
      gsap.utils.toArray<HTMLElement>(".js-entry", root.current).forEach((entry) => {
        gsap.fromTo(
          entry.querySelector(".js-photo"),
          { clipPath: "inset(12% 8% 12% 8%)", scale: 1.12 },
          {
            clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.4, ease: "power3.out",
            scrollTrigger: { trigger: entry, start: "top 70%", once: true },
          }
        );
        gsap.from(entry.querySelectorAll(".js-text"), {
          y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: entry, start: "top 65%", once: true },
        });
      });

      // desktop mouse-follow tilt
      if (fine) {
        gsap.utils.toArray<HTMLElement>(".js-photo", root.current).forEach((photo) => {
          const xTo = gsap.quickTo(photo.querySelector("img"), "x", { duration: 0.6, ease: "power3.out" });
          const yTo = gsap.quickTo(photo.querySelector("img"), "y", { duration: 0.6, ease: "power3.out" });
          const move = (e: MouseEvent) => {
            const r = photo.getBoundingClientRect();
            xTo(((e.clientX - r.left) / r.width - 0.5) * 20);
            yTo(((e.clientY - r.top) / r.height - 0.5) * 20);
          };
          const leave = () => { xTo(0); yTo(0); };
          photo.addEventListener("mousemove", move);
          photo.addEventListener("mouseleave", leave);
        });
      }
    },
    { scope: root, dependencies: [fine] }
  );

  return (
    <section ref={root} data-theme="light" className="bg-bone pb-40 pt-10 text-ink md:pb-56">
      <div className="px-6 md:px-16">
        <p className="meta text-ink/50">WHY ORA</p>
        <h2 className="display-lg mt-6 max-w-[16ch]">
          Three reasons to <em className="font-display italic">never look down</em>
        </h2>
      </div>
      <div className="mt-28 flex flex-col gap-32 px-6 md:gap-48 md:px-16">
        {REASONS.map((r) => (
          <article key={r.n} className={`js-entry w-full ${r.align}`}>
            <div className="js-photo relative aspect-[4/3] overflow-hidden" data-cursor="grow">
              <Image src={r.image.src} alt={r.image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="scale-[1.06] object-cover will-change-transform" />
            </div>
            <div className="mt-8 flex items-baseline gap-6">
              <span className="js-text font-display text-5xl font-light text-brass">{r.n}</span>
              <div>
                <h3 className="js-text display-md">{r.title}</h3>
                <p className="js-text mt-4 max-w-md text-sm leading-relaxed text-ink/60">{r.copy}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert `<WhySection />` after `<Stats />`.**
- [ ] **Step 3: Verify** — build passes; asymmetric offsets visible; images mask-reveal in and follow the mouse subtly on desktop; nothing tilts on mobile emulation.
- [ ] **Step 4: Commit** — `git commit -am "feat: Why ORA editorial section with mouse-reactive imagery"`

---

### Task 10: Residence gallery (dominant-image swap)

**Files:**
- Create: `components/residence-gallery/ResidenceGallery.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES`, `@/lib/gsap`, `MM`.
- Produces: section `data-theme="dark"`; gallery items carry `data-cursor="view"` (consumed by CustomCursor in Task 14).

- [ ] **Step 1: Create `components/residence-gallery/ResidenceGallery.tsx`** — imperative active-image swap (no React state in scroll path):

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, MM } from "@/lib/gsap";
import { IMAGES, type OraImage } from "@/lib/images";

const ROOMS: { name: string; image: OraImage }[] = [
  { name: "Grand Salon", image: IMAGES.salon },
  { name: "Primary Suite", image: IMAGES.suite },
  { name: "Stone Spa", image: IMAGES.spa },
  { name: "Wine Lounge", image: IMAGES.wine },
  { name: "Infinity Terrace", image: IMAGES.terrace },
];

export default function ResidenceGallery() {
  const root = useRef<HTMLElement>(null);
  const active = useRef(0);
  const hovering = useRef(false);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const imgs = q(".js-room") as HTMLElement[];
      const labels = q(".js-label") as HTMLElement[];
      gsap.set(imgs[0], { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
      labels[0].classList.add("opacity-100");

      const setActive = (i: number) => {
        if (i === active.current) return;
        const prev = active.current;
        active.current = i;
        gsap.set(imgs[i], { zIndex: 2 });
        gsap.set(imgs[prev], { zIndex: 1 });
        gsap.fromTo(
          imgs[i],
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.9, ease: "power4.out", overwrite: true }
        );
        labels.forEach((l, li) => l.classList.toggle("opacity-100", li === i));
      };

      const mm = gsap.matchMedia();
      mm.add(MM.desktop, () => {
        // scroll drives active room when not hovering
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (hovering.current) return;
            setActive(Math.min(ROOMS.length - 1, Math.floor(self.progress * ROOMS.length)));
          },
        });
      });

      // expose for hover handlers
      (root.current as HTMLElement & { _setActive?: (i: number) => void })._setActive = setActive;
    },
    { scope: root }
  );

  const hover = (i: number) => {
    hovering.current = true;
    (root.current as (HTMLElement & { _setActive?: (i: number) => void }) | null)?._setActive?.(i);
  };

  return (
    <section ref={root} data-theme="dark" className="relative bg-ink text-bone md:h-[280vh]">
      <div className="flex flex-col gap-10 px-6 py-24 md:sticky md:top-0 md:h-screen md:flex-row md:items-center md:gap-0 md:px-16 md:py-0">
        <div className="md:w-[38%]" onMouseLeave={() => (hovering.current = false)}>
          <p className="meta text-brass">THE RESIDENCE</p>
          <ul className="mt-10 flex flex-col gap-5">
            {ROOMS.map((r, i) => (
              <li key={r.name}>
                <button
                  onMouseEnter={() => hover(i)}
                  className="js-label group text-left font-display text-3xl font-light opacity-40 transition-opacity duration-500 hover:!opacity-100 md:text-5xl"
                  data-cursor="view"
                >
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[3/4] w-full overflow-hidden md:h-[72vh] md:w-[46%] md:ml-auto" data-cursor="view">
          {ROOMS.map((r, i) => (
            <div key={r.name} className="js-room absolute inset-0 will-change-transform" style={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)" }}>
              <Image src={r.image.src} alt={r.image.alt} fill sizes="(max-width: 768px) 100vw, 46vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert `<ResidenceGallery />` after `<WhySection />`.**
- [ ] **Step 3: Verify** — desktop: pinned viewport; scrolling advances rooms with vertical clip wipes; hovering a room name takes over; mobile: simple stacked layout, no pinning. Build passes.
- [ ] **Step 4: Commit** — `git commit -am "feat: residence gallery with scroll- and hover-driven dominant image"`

---

### Task 11: Horizontal strip (vertical scroll → horizontal travel)

**Files:**
- Create: `components/residence-gallery/HorizontalStrip.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES`, `@/lib/gsap`, `MM`.
- Produces: section `data-theme="dark"`, `id="location"` (doubles as the "from street to sky" location beat).

- [ ] **Step 1: Create `components/residence-gallery/HorizontalStrip.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
import { IMAGES, type OraImage } from "@/lib/images";

const FRAMES: { label: string; image: OraImage }[] = [
  { label: "The Approach", image: IMAGES.cityNight },
  { label: "The Lobby", image: IMAGES.lobby },
  { label: "The Ascent", image: IMAGES.arrival },
  { label: "The Kitchen", image: IMAGES.kitchen },
  { label: "The Pool", image: IMAGES.pool },
  { label: "Golden Hour", image: IMAGES.golden },
];

export default function HorizontalStrip() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MM.desktop, () => {
        const track = root.current!.querySelector<HTMLElement>(".js-track")!;
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="location" data-theme="dark" className="relative bg-ink text-bone md:h-[300vh]">
      <div className="md:sticky md:top-0 md:h-screen md:overflow-hidden">
        <div className="js-track flex flex-col gap-6 px-6 py-16 will-change-transform md:h-screen md:w-max md:flex-row md:items-center md:gap-10 md:px-16 md:py-0">
          <div className="shrink-0 md:mr-10 md:w-[30vw]">
            <p className="meta text-brass">FROM THE STREET TO THE SKY</p>
            <h2 className="display-md mt-6">One movement, sixty floors.</h2>
          </div>
          {FRAMES.map((f) => (
            <figure key={f.label} className="relative shrink-0 overflow-hidden md:h-[64vh] md:w-[44vw]" data-cursor="view">
              <div className="relative aspect-[16/10] md:h-full md:w-full">
                <Image src={f.image.src} alt={f.image.alt} fill sizes="(max-width: 768px) 100vw, 44vw" className="object-cover" />
              </div>
              <figcaption className="meta mt-3 text-bone/50">{f.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert `<HorizontalStrip />` after `<ResidenceGallery />`.**
- [ ] **Step 3: Verify** — desktop: wheel scrolling travels the strip horizontally, ends exactly at the last frame (resize window → still exact, thanks to `invalidateOnRefresh`); mobile: plain vertical stack, no horizontal overflow (`document.body.scrollWidth === window.innerWidth`).
- [ ] **Step 4: Commit** — `git commit -am "feat: pinned horizontal strip driven by vertical scroll"`

---

### Task 12: Building marquee + ribbon marquee

**Files:**
- Create: `components/building-marquee/BuildingMarquee.tsx`, `components/ribbon-marquee/RibbonMarquee.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES`, `@/lib/gsap`.
- Produces: both sections `data-theme="dark"`.

- [ ] **Step 1: Create `components/building-marquee/BuildingMarquee.tsx`** — two counter-moving rows, velocity-modulated:

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { IMAGES, type OraImage } from "@/lib/images";

const ROW_A: { label: string; image: OraImage }[] = [
  { label: "Private Lobby", image: IMAGES.lobby },
  { label: "Spa", image: IMAGES.spa },
  { label: "Grand Salon", image: IMAGES.salon },
];
const ROW_B: { label: string; image: OraImage }[] = [
  { label: "Terrace", image: IMAGES.terrace },
  { label: "Rooftop", image: IMAGES.pool },
  { label: "City View", image: IMAGES.cityNight },
];

function Row({ items, reverse }: { items: typeof ROW_A; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className={`js-row-${reverse ? "b" : "a"} flex w-max gap-6 will-change-transform`}>
      {doubled.map((it, i) => (
        <figure key={i} className="relative h-[32vh] w-[42vw] shrink-0 overflow-hidden md:h-[38vh] md:w-[26vw]">
          <Image src={it.image.src} alt={it.image.alt} fill sizes="26vw" className="object-cover" />
          <figcaption className="meta absolute bottom-3 left-3 text-bone/80">{it.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function BuildingMarquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const a = gsap.to(q(".js-row-a"), { xPercent: -50, ease: "none", duration: 48, repeat: -1 });
      const b = gsap.fromTo(q(".js-row-b"), { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 48, repeat: -1 });
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const boost = 1 + Math.min(3, Math.abs(self.getVelocity()) / 800);
          gsap.to([a, b], { timeScale: boost, duration: 0.4, overwrite: true });
        },
      });
      return () => st.kill();
    },
    { scope: root }
  );

  return (
    <section ref={root} data-theme="dark" className="overflow-hidden bg-ink py-24 md:py-32">
      <p className="meta mb-12 px-6 text-brass md:px-16">THE BUILDING</p>
      <div className="flex flex-col gap-6">
        <Row items={ROW_A} />
        <Row items={ROW_B} reverse />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/ribbon-marquee/RibbonMarquee.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const ITEMS = ["Private Lobby", "Spa", "Grand Salon", "Terrace", "Rooftop", "City View"];

export default function RibbonMarquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.to(".js-ribbon", { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
    },
    { scope: root }
  );

  const content = [...ITEMS, ...ITEMS];
  return (
    <section ref={root} data-theme="dark" className="overflow-hidden border-y border-bone/10 bg-ink py-8">
      <div className="js-ribbon flex w-max items-center gap-8 will-change-transform">
        {content.map((it, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className="font-display text-2xl font-light text-bone/80 md:text-4xl">{it}</span>
            <span className="text-brass">◆</span>
          </span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Insert `<BuildingMarquee />` then `<RibbonMarquee />` after `<HorizontalStrip />`.**
- [ ] **Step 4: Verify** — rows drift in opposite directions continuously, accelerate with scroll velocity, loop seamlessly (no visible jump at wrap); ribbon loops; page still has no horizontal scrollbar.
- [ ] **Step 5: Commit** — `git commit -am "feat: building and ribbon marquees with velocity response"`

---

### Task 13: Day timeline

**Files:**
- Create: `components/day-timeline/DayTimeline.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `IMAGES`, `@/lib/gsap`, `MM`.
- Produces: section `data-theme="dark"`.

- [ ] **Step 1: Create `components/day-timeline/DayTimeline.tsx`** — one sticky viewport, six film-like scene changes:

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
import { IMAGES, type OraImage } from "@/lib/images";

const MOMENTS: { time: string; title: string; image: OraImage }[] = [
  { time: "07:00", title: "Morning Swim", image: IMAGES.pool },
  { time: "09:00", title: "Coffee Above the Sea", image: IMAGES.kitchen },
  { time: "13:00", title: "Long Lunch", image: IMAGES.salon },
  { time: "18:30", title: "Golden Hour", image: IMAGES.golden },
  { time: "21:00", title: "Wine Room", image: IMAGES.wine },
  { time: "23:30", title: "City Lights", image: IMAGES.cityNight },
];

export default function DayTimeline() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const scenes = q(".js-scene") as HTMLElement[];
      const texts = q(".js-scenetext") as HTMLElement[];
      gsap.set(scenes[0], { opacity: 1, scale: 1 });
      gsap.set(texts[0], { opacity: 1, y: 0 });

      const mm = gsap.matchMedia();
      mm.add([MM.desktop, MM.mobile], () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
        });
        for (let i = 1; i < MOMENTS.length; i++) {
          const at = i; // 1 unit per transition, holds between
          tl.fromTo(scenes[i], { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.55, ease: "none" }, at)
            .to(scenes[i - 1], { scale: 1.06, duration: 0.55, ease: "none" }, at)
            .fromTo(texts[i], { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "none" }, at + 0.1)
            .to(texts[i - 1], { y: -44, opacity: 0, duration: 0.35, ease: "none" }, at);
          tl.to(q(".js-rail"), { scaleX: (i + 1) / MOMENTS.length, duration: 0.55, ease: "none" }, at);
        }
        tl.set({}, {}, MOMENTS.length); // tail hold
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} data-theme="dark" className="relative h-[500vh] bg-ink text-bone max-md:h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {MOMENTS.map((m, i) => (
          <div key={m.time} className="js-scene absolute inset-0 opacity-0 will-change-transform">
            <Image src={m.image.src} alt={m.image.alt} fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-ink/45" />
          </div>
        ))}
        <div className="absolute inset-0 z-10 flex flex-col justify-between px-6 py-24 md:px-16">
          <p className="meta text-brass">A DAY ABOVE THE CITY</p>
          <div className="relative h-40">
            {MOMENTS.map((m, i) => (
              <div key={m.time} className="js-scenetext absolute bottom-0 left-0 opacity-0">
                <span className="meta text-bone/60">{m.time}</span>
                <h3 className="display-lg mt-3">{m.title}</h3>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-10 left-6 right-6 z-10 h-px bg-bone/15 md:left-16 md:right-16">
          <div className="js-rail h-px origin-left bg-brass" style={{ transform: `scaleX(${1 / MOMENTS.length})` }} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Insert `<DayTimeline />` after `<RibbonMarquee />`.**
- [ ] **Step 3: Verify** — scrolling moves through six scenes: image crossfade + settle-zoom, time/headline swap with vertical travel, rail progresses in sixths; holds exist between transitions (film pacing); mobile height shorter.
- [ ] **Step 4: Commit** — `git commit -am "feat: pinned day-above-the-city timeline"`

---

### Task 14: Amenities + custom cursor

**Files:**
- Create: `components/amenities/Amenities.tsx`, `components/custom-cursor/CustomCursor.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `useIsFinePointer`; existing `data-cursor="view" | "grow"` attributes from Tasks 9–11.
- Produces: Amenities section `data-theme="light"`. CustomCursor mounts globally; it grows over `a`, `button`, and `[data-cursor]`, and shows the label `VIEW` over `[data-cursor="view"]`.

- [ ] **Step 1: Create `components/amenities/Amenities.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

const AMENITIES = [
  { name: "Private elevator", note: "direct · biometric" },
  { name: "18m infinity pool", note: "heated · skyline edge" },
  { name: "Chef's kitchen", note: "stone island · full suite" },
  { name: "600 bottle wine wall", note: "temperature controlled" },
  { name: "Stone spa", note: "carved monolith · sea view" },
  { name: "Smart home", note: "light · climate · shade" },
  { name: "24/7 concierge", note: "valet · porter" },
  { name: "Private parking", note: "two suites · ev · storage" },
];

export default function Amenities() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".js-amenity", {
        y: 48,
        opacity: 0,
        stagger: 0.06,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} data-theme="light" className="bg-bone py-40 text-ink md:py-56">
      <div className="px-6 md:px-16">
        <p className="meta text-ink/50">APPOINTMENTS</p>
        <h2 className="display-lg mt-6">Composed for one owner</h2>
        <ul className="mt-24 max-w-3xl">
          {AMENITIES.map((a, i) => (
            <li key={a.name} className="js-amenity group border-t border-ink/10 last:border-b">
              <div className="flex items-baseline justify-between py-6 transition-transform duration-500 group-hover:translate-x-3">
                <div className="flex items-baseline gap-6">
                  <span className="meta w-8 text-ink/30 transition-colors duration-500 group-hover:text-brass">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-2xl font-light md:text-3xl">{a.name}</span>
                </div>
                <span className="meta hidden text-ink/40 md:block">{a.note}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/custom-cursor/CustomCursor.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useIsFinePointer } from "@/hooks/useIsFinePointer";

export default function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();

  useGSAP(
    () => {
      if (!fine || !root.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const dot = root.current;
      const label = dot.querySelector<HTMLElement>(".js-cursorlabel")!;
      const xTo = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
      const yTo = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });

      const move = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const over = (e: MouseEvent) => {
        const t = (e.target as HTMLElement).closest("a, button, [data-cursor]");
        const view = (e.target as HTMLElement).closest('[data-cursor="view"]');
        gsap.to(dot.querySelector(".js-ring"), {
          scale: view ? 3.2 : t ? 1.8 : 1,
          duration: 0.35,
          ease: "power3.out",
        });
        label.style.opacity = view ? "1" : "0";
      };
      window.addEventListener("mousemove", move, { passive: true });
      window.addEventListener("mouseover", over, { passive: true });
      gsap.set(dot, { opacity: 1 });
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseover", over);
      };
    },
    { dependencies: [fine], scope: root }
  );

  if (!fine) return null;

  return (
    <div
      ref={root}
      className="pointer-events-none fixed left-0 top-0 z-[95] -translate-x-1/2 -translate-y-1/2 opacity-0"
      aria-hidden
    >
      <div className="js-ring flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/60 bg-ink/10 will-change-transform">
        <span className="js-cursorlabel text-[8px] tracking-[0.2em] text-bone opacity-0">VIEW</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Insert `<Amenities />` after `<DayTimeline />` and `<CustomCursor />` at the end of `<main>`.**
- [ ] **Step 4: Verify** — amenity rows stagger in, hover indents row and brass-fills index; cursor ring follows with slight lag, grows over links, shows VIEW over gallery images; no cursor in devtools touch emulation.
- [ ] **Step 5: Commit** — `git commit -am "feat: amenities list and custom cursor"`

---

### Task 15: Final CTA + footer, full page assembly

**Files:**
- Create: `components/final-cta/FinalCta.tsx`, `components/footer/Footer.tsx`
- Modify: `app/page.tsx` (final order, remove any remaining spacer)

**Interfaces:**
- Consumes: `IMAGES`, `Magnetic`, `@/lib/gsap`.
- Produces: section `id="viewing"`, `data-theme="dark"` (the nav CTA target).

- [ ] **Step 1: Create `components/final-cta/FinalCta.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { IMAGES } from "@/lib/images";
import Magnetic from "@/components/ui/Magnetic";

const PRICE = 14800000;
const fmt = new Intl.NumberFormat("en-US");

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);

      // slow background zoom across the section
      gsap.fromTo(
        q(".js-bg"),
        { scale: 1 },
        {
          scale: 1.08,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        }
      );

      // price count-up on entry
      const el = q(".js-price")[0] as HTMLElement;
      const state = { v: 0 };
      gsap.to(state, {
        v: PRICE,
        duration: 2.2,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
        onUpdate: () => {
          el.textContent = "$" + fmt.format(Math.round(state.v));
        },
      });

      gsap.from(q(".js-reveal"), {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="viewing" data-theme="dark" className="relative overflow-hidden bg-ink py-56 text-center text-bone md:py-72">
      <div className="js-bg absolute inset-0 will-change-transform">
        <Image src={IMAGES.golden.src} alt="" fill sizes="100vw" className="object-cover opacity-30" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-14 px-6">
        <h2 className="js-reveal display-lg max-w-[16ch]">
          A private residence above Tel Aviv
        </h2>
        <div className="js-reveal">
          <p className="meta text-bone/50">Offered at</p>
          <p className="js-price font-display mt-6 text-[clamp(48px,7vw,120px)] font-light leading-none text-brass">
            $0
          </p>
        </div>
        <div className="js-reveal">
          <Magnetic strength={0.35}>
            <a
              href="mailto:viewings@ora-residence.example?subject=Private%20Viewing%20Request"
              className="meta inline-block border border-bone/40 px-10 py-5 transition-colors duration-500 hover:border-brass hover:text-brass"
            >
              REQUEST PRIVATE VIEWING →
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/footer/Footer.tsx`**

```tsx
export default function Footer() {
  return (
    <footer data-theme="dark" className="flex flex-col items-start justify-between gap-6 border-t border-bone/10 bg-ink px-6 py-10 text-bone md:flex-row md:items-center md:px-16">
      <span className="font-display text-xl">ORA</span>
      <span className="meta text-bone/40">TEL AVIV · RESIDENCE ABOVE THE SEA</span>
      <span className="meta text-bone/40">© 2026 ORA. A FICTIONAL RESIDENCE.</span>
    </footer>
  );
}
```

- [ ] **Step 3: Final `app/page.tsx` order** — Preloader, Navigation, Hero, chapters 01–04, Stats, WhySection, ResidenceGallery, HorizontalStrip, BuildingMarquee, RibbonMarquee, DayTimeline, Amenities, FinalCta, Footer, CustomCursor. Remove all temporary spacers/probes.

- [ ] **Step 4: Verify** — build passes; price counts to `$14,800,000`; background zooms subtly through the section; magnetic button pulls toward cursor; anchors RESIDENCE/LOCATION/DETAILS/PRIVATE VIEWING all land on their sections via Lenis.

- [ ] **Step 5: Commit** — `git commit -am "feat: final CTA with price count-up, footer, full page assembly"`

---

### Task 16: Mobile & reduced-motion audit, README, final verification

**Files:**
- Create: `README.md`
- Modify: any component that fails the audit

**Interfaces:** none new.

- [ ] **Step 1: Reduced-motion audit** — with devtools emulating `prefers-reduced-motion: reduce`: page renders with all content visible and readable, no Lenis, no pinned scrub dead-zones trapping content off-screen. Fix any component whose content stays hidden (initial states must come from GSAP `fromTo`s inside matchMedia, never from CSS `opacity-0` that reduced-motion won't undo — the exceptions are the gallery/timeline stacks and cursor which have explicit initial inline styles; verify those still show their first scene).

- [ ] **Step 2: Mobile audit at 390×844** — no horizontal overflow (`document.body.scrollWidth <= window.innerWidth` in console); headlines fit; pinned sections shortened; cursor absent; marquees smooth; tap targets ≥ 40px.

- [ ] **Step 3: Performance pass** — dev-tools Performance recording of a full-page scroll: no long tasks > 50ms sustained during steady scroll; confirm animated properties are only transform/opacity/clip-path (spot-check Elements panel during scroll); `will-change` present only on layered/pinned movers.

- [ ] **Step 4: Write `README.md`** — project intro (fictional ORA residence, inspiration credited as interaction-system study), stack, `npm install` / `npm run dev` / `npm run build`, structure map (components/lib/hooks/public/images), how to replace imagery (`/public/images` + `lib/images.ts` + `IMAGE_REQUIREMENTS.md`), motion-engine notes (Lenis+ScrollTrigger sync, matchMedia tiers, CSS-sticky pinning convention).

- [ ] **Step 5: Final verification** — `npm run build` → zero errors, zero type errors. `npm run start` in background; `curl -s localhost:3000 | grep -c "ORA"` ≥ 1; terminal free of runtime errors; kill server. Confirm all 11 deliverables from the brief exist.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "docs: README + mobile, reduced-motion and performance audit fixes"`

---

## Self-review (done at plan time)

- **Spec coverage:** hero ✓(T4) preloader ✓(T5) nav/progress/theme ✓(T6) 4 chapters + 5 variants + 2 layered-parallax scenes ✓(T7) stats ✓(T8) why ✓(T9) gallery ✓(T10) horizontal ✓(T11) marquees ✓(T12) day timeline ✓(T13) amenities ✓(T14 with cursor) final CTA/price/footer ✓(T15) mobile/reduced-motion/perf/README ✓(T16) REFERENCE_ANALYSIS ✓(T1) images/manifest/IMAGE_REQUIREMENTS ✓(T2) motion engine ✓(T3) micro-interactions: magnetic (T6/T15), underline reveals (T6), hover scale (T9/T14 CSS), text masks (T4/T7), page reveal (T5), anchors (T6), counters (T8/T15).
- **Type consistency:** `OraImage`/`IMAGES`/`ImageKey` (T2) used verbatim in T4/T7/T9–T13/T15; `MM` from `lib/gsap` (T3) used in T4/T7/T10/T11/T13; `Magnetic` (T6) reused in T15; `data-cursor` contract (T9/T10/T11) consumed in T14; `ora:reveal` event produced (T5) and consumed (T4).
- **Placeholders:** none — every code step is complete; doc-writing steps specify required content.
