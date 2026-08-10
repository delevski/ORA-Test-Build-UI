"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/providers/SmoothScrollProvider";
import Magnetic from "@/components/ui/Magnetic";

const LINKS = [
  { label: "RESIDENCE", href: "#residence" },
  { label: "LOCATION", href: "#location" },
  { label: "DETAILS", href: "#details" },
];

export default function Navigation() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const nav = root.current!;
      // theme flipping: watch every themed section
      document.querySelectorAll<HTMLElement>("section[data-theme], footer[data-theme]").forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top 48px",
          end: "bottom 48px",
          onToggle: (self) => {
            if (self.isActive) nav.dataset.theme = sec.dataset.theme;
          },
        });
      });
      // progress bar
      gsap.fromTo(
        ".js-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        }
      );
    },
    { scope: root }
  );

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    if (lenis) lenis.scrollTo(target as HTMLElement, { duration: 1.6 });
    else (target as HTMLElement).scrollIntoView({ behavior: "auto" });
  };

  return (
    <nav
      ref={root}
      data-theme="dark"
      className="fixed inset-x-0 top-0 z-[80] transition-colors duration-500"
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-16">
        <a href="#top" onClick={(e) => go(e, "#top")} className="font-display text-xl tracking-wide">
          ORA
        </a>
        <div className="hidden gap-10 md:flex">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={(e) => go(e, l.href)} className="link-underline meta">
              {l.label}
            </a>
          ))}
        </div>
        <Magnetic>
          <a href="#viewing" onClick={(e) => go(e, "#viewing")} className="meta border-b border-current pb-1">
            PRIVATE VIEWING →
          </a>
        </Magnetic>
      </div>
      <div className="js-progress h-px w-full origin-left bg-brass/80" />
    </nav>
  );
}
