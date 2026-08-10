"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";

const ITEMS = ["Private Lobby", "Spa", "Grand Salon", "Terrace", "Rooftop", "City View"];

export default function RibbonMarquee() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) {
          // static layout: no animations, ribbon stays at initial position
          return;
        }

        // normal motion: infinite xPercent loop
        gsap.to(".js-ribbon", { xPercent: -50, ease: "none", duration: 30, repeat: -1 });
      });
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
