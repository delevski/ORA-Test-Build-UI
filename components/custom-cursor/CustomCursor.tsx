"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useIsFinePointer } from "@/hooks/useIsFinePointer";

export default function CustomCursor() {
  const root = useRef<HTMLDivElement>(null);
  const fine = useIsFinePointer();

  useGSAP(
    () => {
      if (!fine || !root.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const dot = root.current;
      const label = dot.querySelector<HTMLElement>(".js-cursorlabel")!;
      const xTo = gsap.quickTo(dot, "x", { duration: 0.25, ease: "power3.out" });
      const yTo = gsap.quickTo(dot, "y", { duration: 0.25, ease: "power3.out" });

      const move = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      const over = (e: MouseEvent) => {
        const t = (e.target as HTMLElement).closest("a, button, [data-cursor]");
        const view = (e.target as HTMLElement).closest('[data-cursor="view"]');
        gsap.to(dot.querySelector(".js-ring"), {
          scale: view ? 3.2 : t ? 1.8 : 1,
          duration: 0.35,
          ease: "power3.out",
        });
        label.style.opacity = view ? "1" : "0";
      };
      window.addEventListener("mousemove", move, { passive: true });
      window.addEventListener("mouseover", over, { passive: true });
      gsap.set(dot, { opacity: 1 });
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseover", over);
      };
    },
    { dependencies: [fine], scope: root }
  );

  if (!fine) return null;

  return (
    <div
      ref={root}
      className="pointer-events-none fixed left-0 top-0 z-[95] -translate-x-1/2 -translate-y-1/2 opacity-0"
      aria-hidden
    >
      <div className="js-ring flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/60 bg-ink/10 will-change-transform">
        <span className="js-cursorlabel text-[8px] tracking-[0.2em] text-bone opacity-0">VIEW</span>
      </div>
    </div>
  );
}
