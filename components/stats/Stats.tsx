"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";

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
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) {
          // static layout: set final values without animation
          const nums = gsap.utils.toArray<HTMLElement>(".js-stat", root.current);
          nums.forEach((el) => {
            const target = Number(el.dataset.value);
            el.textContent = fmt.format(target);
          });
          // .js-row elements left at natural visible state (no gsap.from runs, so CSS defaults apply)
          return;
        }

        // normal motion: count-up and slide animations
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
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="details" data-theme="light" className="bg-bone py-40 text-ink md:py-56">
      <div className="grid grid-cols-2 gap-x-8 gap-y-24 px-6 md:grid-cols-4 md:px-16">
        {STATS.map((s) => (
          <div key={s.label} className="js-row">
            <div className="js-stat font-display text-[clamp(56px,7vw,120px)] font-light leading-none" data-value={s.value} aria-live="polite">
              0
            </div>
            <div className="meta mt-4 text-ink/50">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
