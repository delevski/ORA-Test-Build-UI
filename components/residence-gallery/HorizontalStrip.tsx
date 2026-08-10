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
