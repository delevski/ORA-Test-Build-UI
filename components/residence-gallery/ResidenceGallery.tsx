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
