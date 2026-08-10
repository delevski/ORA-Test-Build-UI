"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, MM } from "@/lib/gsap";
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
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) {
          // static layout: no animations, rows stay at initial position
          return;
        }

        // normal motion: infinite xPercent loops with velocity boost
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
      });
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
