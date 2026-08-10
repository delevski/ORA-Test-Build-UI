"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, MM } from "@/lib/gsap";
import { IMAGES } from "@/lib/images";
import Magnetic from "@/components/ui/Magnetic";

const PRICE = 14800000;
const fmt = new Intl.NumberFormat("en-US");

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add({ desktop: MM.desktop, mobile: MM.mobile, reduced: MM.reduced }, (ctx) => {
        const c = ctx.conditions as { desktop: boolean; mobile: boolean; reduced: boolean };
        if (c.reduced) {
          // reduced motion: set final values immediately, no animations
          const priceEl = gsap.utils.selector(root)(".js-price")[0] as HTMLElement;
          priceEl.textContent = "$" + fmt.format(PRICE);
          // .js-reveal elements left at natural visible state (no gsap.from runs, so CSS defaults apply)
          return;
        }

        // normal motion: all animations from brief
        const q = gsap.utils.selector(root);

        // slow background zoom across the section
        gsap.fromTo(
          q(".js-bg"),
          { scale: 1 },
          {
            scale: 1.08,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          }
        );

        // price count-up on entry
        const el = q(".js-price")[0] as HTMLElement;
        const state = { v: 0 };
        gsap.to(state, {
          v: PRICE,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
          onUpdate: () => {
            el.textContent = "$" + fmt.format(Math.round(state.v));
          },
        });

        gsap.from(q(".js-reveal"), {
          y: 40,
          opacity: 0,
          stagger: 0.12,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="viewing" data-theme="dark" className="relative overflow-hidden bg-ink py-56 text-center text-bone md:py-72">
      <div className="js-bg absolute inset-0 will-change-transform">
        <Image src={IMAGES.golden.src} alt="" fill sizes="100vw" className="object-cover opacity-30" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-14 px-6">
        <h2 className="js-reveal display-lg max-w-[16ch]">
          A private residence above Tel Aviv
        </h2>
        <div className="js-reveal">
          <p className="meta text-bone/50">Offered at</p>
          <p className="js-price font-display mt-6 text-[clamp(48px,7vw,120px)] font-light leading-none text-brass">
            $0
          </p>
        </div>
        <div className="js-reveal">
          <Magnetic strength={0.35}>
            <a
              href="mailto:viewings@ora-residence.example?subject=Private%20Viewing%20Request"
              className="meta inline-block border border-bone/40 px-10 py-5 transition-colors duration-500 hover:border-brass hover:text-brass"
            >
              REQUEST PRIVATE VIEWING →
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
