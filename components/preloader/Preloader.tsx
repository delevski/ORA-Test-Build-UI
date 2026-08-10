"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const html = document.documentElement;
      html.classList.add("overflow-hidden");

      const counter = { v: 0 };
      const num = q(".js-num")[0] as HTMLElement;

      gsap
        .timeline({
          onComplete: () => gsap.set(root.current, { display: "none" }),
        })
        .fromTo(q(".js-word"), { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: "power4.out" })
        .to(
          counter,
          {
            v: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0.2
        )
        .to(q(".js-row"), { yPercent: -115, duration: 0.6, ease: "power3.in" }, "+=0.15")
        .add(() => {
          html.classList.remove("overflow-hidden");
          window.dispatchEvent(new CustomEvent("ora:reveal"));
        })
        .to(root.current, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.0,
          ease: "power4.inOut",
        });

      return () => html.classList.remove("overflow-hidden");
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[90] flex items-end justify-between bg-ink px-6 pb-10 md:px-16"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <span className="mask-line">
        <span className="js-row js-word font-display text-4xl text-bone md:text-6xl">ORA</span>
      </span>
      <span className="mask-line">
        <span className="js-row js-num meta text-brass">000</span>
      </span>
    </div>
  );
}
