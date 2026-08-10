"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";

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
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };

        if (c.reduced) {
          // static layout: no animations
          // .js-amenity elements left at natural visible state (no gsap.from runs, so CSS defaults apply)
          return;
        }

        // normal motion: stagger reveal
        gsap.from(".js-amenity", {
          y: 48,
          opacity: 0,
          stagger: 0.06,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        });
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
