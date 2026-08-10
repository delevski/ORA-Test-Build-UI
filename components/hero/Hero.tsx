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
