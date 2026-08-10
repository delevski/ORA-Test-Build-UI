"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
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
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };

        if (c.reduced) {
          // static layout: no animations
          // .js-photo and .js-text stay naturally visible (no tweens run)
          return;
        }

        // normal motion: scroll-in reveals
        gsap.utils.toArray<HTMLElement>(".js-entry", root.current).forEach((entry) => {
          gsap.fromTo(
            entry.querySelector(".js-photo"),
            { clipPath: "inset(8% 6% 8% 6%)", scale: 1.1 },
            {
              clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1, ease: "power3.out",
              scrollTrigger: { trigger: entry, start: "top 85%", once: true },
            }
          );
          // fire early (photo is tall, text sits below it) and keep the tween
          // short so fast flick-scrolling can't catch text half-transparent
          gsap.from(entry.querySelectorAll(".js-text"), {
            y: 28, opacity: 0, stagger: 0.07, duration: 0.7, ease: "power3.out",
            scrollTrigger: { trigger: entry, start: "top 80%", once: true },
          });
        });

        // desktop mouse-follow tilt (skipped on mobile and reduced motion)
        const listeners: Array<{ el: HTMLElement; move: (e: MouseEvent) => void; leave: () => void }> = [];

        if (fine && (c.desktop || c.mobile)) {
          gsap.utils.toArray<HTMLElement>(".js-photo", root.current).forEach((photo) => {
            const xTo = gsap.quickTo(photo.querySelector("img"), "x", { duration: 0.6, ease: "power3.out" });
            const yTo = gsap.quickTo(photo.querySelector("img"), "y", { duration: 0.6, ease: "power3.out" });
            const move = (e: MouseEvent) => {
              const r = photo.getBoundingClientRect();
              xTo(((e.clientX - r.left) / r.width - 0.5) * 20);
              yTo(((e.clientY - r.top) / r.height - 0.5) * 20);
            };
            const leave = () => { xTo(0); yTo(0); };
            listeners.push({ el: photo, move, leave });
            photo.addEventListener("mousemove", move);
            photo.addEventListener("mouseleave", leave);
          });
        }

        // return cleanup function for GSAP to call on re-fire/revert
        return () => {
          listeners.forEach(({ el, move, leave }) => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          });
        };
      });
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
