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
    <section ref={root} data-theme="dark" className="relative h-screen bg-ink text-bone motion-safe:h-[500vh] motion-safe:max-md:h-[320vh]">
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
