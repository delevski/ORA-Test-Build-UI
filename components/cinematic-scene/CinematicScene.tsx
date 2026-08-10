"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
import type { OraImage } from "@/lib/images";

export type SceneVariant =
  | "zoom-reveal" | "vertical-mask" | "parallax-depth" | "crossfade" | "slide-reveal";

export interface CinematicSceneProps {
  chapter: string;
  eyebrow: string;
  title: string;
  image: OraImage;
  imageB?: OraImage;
  midground?: OraImage;
  foreground?: React.ReactNode;
  variant: SceneVariant;
  theme?: "dark" | "light";
  id?: string;
}

export default function CinematicScene(props: CinematicSceneProps) {
  const { chapter, eyebrow, title, image, imageB, midground, foreground, variant, theme = "dark", id } = props;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) return; // static layout, everything visible via CSS defaults

        const k = c.mobile ? 0.45 : 1; // parallax distance factor
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
        });

        // shared heading choreography: reveal 0.30–0.55, exit 0.75–0.95 of a 0–1 timeline
        const heading = () => {
          tl.fromTo(q(".js-word"), { yPercent: 115 }, { yPercent: 0, stagger: 0.02, duration: 0.18, ease: "power3.out" }, 0.3)
            .fromTo(q(".js-eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.1 }, 0.28)
            .to(q(".js-copy"), { yPercent: -40 * k, opacity: 0, duration: 0.2, ease: "power2.in" }, 0.78);
        };

        switch (variant) {
          case "zoom-reveal":
            tl.fromTo(q(".js-imgA"), { scale: 1.25 }, { scale: 1, duration: 0.5, ease: "none" }, 0)
              .to(q(".js-imgA"), { scale: 1.07, duration: 0.5, ease: "none" }, 0.5)
              .fromTo(q(".js-veil"), { opacity: 0.7 }, { opacity: 0.25, duration: 0.4, ease: "none" }, 0);
            heading();
            break;

          case "vertical-mask":
            // starts as a visible letterboxed frame (never a fully clipped black
            // viewport) and expands to full bleed during the first part of the pin
            tl.fromTo(q(".js-frame"), { clipPath: "inset(16% 10% 16% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, ease: "none" }, 0)
              .fromTo(q(".js-imgA"), { scale: 1.2 }, { scale: 1, duration: 0.55, ease: "none" }, 0)
              .to(q(".js-imgA"), { scale: 1.05, duration: 0.45, ease: "none" }, 0.55);
            heading();
            break;

          case "parallax-depth":
            tl.fromTo(q(".js-imgA"), { yPercent: 6 * k, scale: 1.05 }, { yPercent: -6 * k, scale: 1.14, duration: 1, ease: "none" }, 0);
            if (midground) tl.fromTo(q(".js-mid"), { yPercent: 14 * k }, { yPercent: -14 * k, duration: 1, ease: "none" }, 0);
            if (foreground) tl.fromTo(q(".js-fg"), { yPercent: 22 * k }, { yPercent: -30 * k, duration: 1, ease: "none" }, 0);
            tl.fromTo(q(".js-copy"), { yPercent: 10 * k }, { yPercent: -14 * k, duration: 1, ease: "none" }, 0);
            heading();
            break;

          case "crossfade":
            tl.fromTo(q(".js-imgA"), { scale: 1 }, { scale: 1.12, duration: 0.7, ease: "none" }, 0)
              .fromTo(q(".js-imgB"), { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 0.35, ease: "none" }, 0.5);
            heading();
            break;

          case "slide-reveal":
            tl.fromTo(q(".js-frame"), { xPercent: 24 * k, clipPath: "inset(10% 55% 10% 0%)" }, { xPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: "none" }, 0)
              .fromTo(q(".js-imgA"), { xPercent: -14 * k, scale: 1.15 }, { xPercent: 0, scale: 1, duration: 0.55, ease: "none" }, 0);
            heading();
            break;
        }
      });
    },
    { scope: root, dependencies: [variant] }
  );

  const dark = theme === "dark";
  const words = title.split(" ");

  return (
    <section
      ref={root}
      id={id}
      data-theme={theme}
      className={`relative h-[250vh] max-md:h-[170vh] ${dark ? "bg-ink" : "bg-bone"}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="js-frame absolute inset-0 will-change-transform" style={{ clipPath: "inset(0% 0% 0% 0%)" }}>
          <div className="js-imgA absolute inset-0 will-change-transform">
            <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover" />
          </div>
          {imageB && (
            <div className="js-imgB absolute inset-0 opacity-0 will-change-transform">
              <Image src={imageB.src} alt={imageB.alt} fill sizes="100vw" className="object-cover" />
            </div>
          )}
          <div className="js-veil absolute inset-0 bg-ink/40" />
        </div>

        {midground && (
          <div className="js-mid pointer-events-none absolute inset-x-[8%] bottom-[-10%] top-[30%] will-change-transform max-md:hidden">
            <Image src={midground.src} alt="" fill sizes="80vw" className="object-cover object-top opacity-80" />
          </div>
        )}

        {foreground && (
          <div className="js-fg pointer-events-none absolute inset-x-0 bottom-[-12%] h-[55%] will-change-transform">
            {foreground}
          </div>
        )}

        <div className="js-copy absolute inset-0 z-10 flex flex-col justify-end px-6 pb-24 md:px-16 md:pb-32">
          <p className={`js-eyebrow meta ${dark ? "text-brass" : "text-ink/60"}`}>
            {chapter} — {eyebrow}
          </p>
          <h2 className={`display-lg mt-5 max-w-[14ch] ${dark ? "text-bone" : "text-ink"}`}>
            {words.map((w, i) => (
              <span key={i} className="mask-line mr-[0.28em] inline-block align-top">
                <span className="js-word">{w}</span>
              </span>
            ))}
          </h2>
        </div>
      </div>
    </section>
  );
}
