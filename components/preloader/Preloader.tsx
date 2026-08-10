"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";

const SPLASH_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/videos/splash.mp4`;

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const html = document.documentElement;

      if (window.matchMedia(MM.reduced).matches) {
        // reduced motion: skip the ~3s splash straight to reveal
        window.dispatchEvent(new CustomEvent("ora:reveal"));
        gsap.set(root.current, { display: "none" });
        return;
      }

      html.classList.add("overflow-hidden");

      const counter = { v: 0 };
      const num = q(".js-num")[0] as HTMLElement;
      const vid = q(".js-vid")[0] as HTMLVideoElement | undefined;
      void vid?.play().catch(() => {});

      gsap
        .timeline({
          onComplete: () => {
            gsap.set(root.current, { display: "none" });
            vid?.pause();
          },
        })
        .fromTo(q(".js-vid"), { scale: 1.08 }, { scale: 1, duration: 3, ease: "power2.out" }, 0)
        .fromTo(q(".js-word"), { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "power4.out" }, 0)
        .to(
          counter,
          {
            v: 100,
            duration: 1.9,
            ease: "power2.inOut",
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0.2
        )
        .to(q(".js-row"), { yPercent: -115, duration: 0.6, ease: "power3.in" }, 2.4)
        // ~3s of splash, then hand off to the hero and fade the whole screen out
        .add(() => {
          html.classList.remove("overflow-hidden");
          window.dispatchEvent(new CustomEvent("ora:reveal"));
        }, 3)
        .to(root.current, { opacity: 0, duration: 0.9, ease: "power2.inOut" }, 3);

      return () => html.classList.remove("overflow-hidden");
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex items-end justify-between overflow-hidden bg-ink px-6 pb-10 md:px-16"
      aria-hidden
    >
      <video
        className="js-vid absolute inset-0 h-full w-full object-cover will-change-transform"
        src={SPLASH_SRC}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      />
      <div className="absolute inset-0 bg-ink/30" />
      <span className="mask-line relative">
        <span className="js-row js-word font-display text-4xl text-bone md:text-6xl">ORA</span>
      </span>
      <span className="mask-line relative">
        <span className="js-row js-num meta text-brass">000</span>
      </span>
    </div>
  );
}
