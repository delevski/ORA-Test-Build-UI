"use client";

import { useEffect, useRef, useState } from "react";

const AMBIENCE_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/audio/ambience.mp3`;
const TARGET_VOLUME = 0.55;

/**
 * Looped sea ambience, on by default. Browsers block un-gestured audio, so
 * if the initial play() is rejected the sound arms itself and starts on the
 * first interaction (pointer, key or first scroll) instead.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRaf = useRef(0);

  const fadeTo = (target: number, ms: number, then?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(fadeRaf.current);
    const from = audio.volume;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      audio.volume = from + (target - from) * p;
      if (p < 1) fadeRaf.current = requestAnimationFrame(step);
      else then?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  };

  const start = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    void audio
      .play()
      .then(() => fadeTo(TARGET_VOLUME, 1500))
      .catch(() => {
        // autoplay blocked: begin on the first user gesture
        const arm = () => {
          audio.volume = 0;
          void audio.play().then(() => fadeTo(TARGET_VOLUME, 1500)).catch(() => {});
        };
        window.addEventListener("pointerdown", arm, { once: true });
        window.addEventListener("keydown", arm, { once: true });
        window.addEventListener("wheel", arm, { once: true });
        window.addEventListener("touchstart", arm, { once: true });
      });
  };

  useEffect(() => {
    const audio = new Audio(AMBIENCE_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;
    start();
    return () => {
      cancelAnimationFrame(fadeRaf.current);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      if (audio.paused) start();
      else fadeTo(TARGET_VOLUME, 800);
    } else {
      fadeTo(0, 600, () => audio.pause());
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      className="meta fixed bottom-6 left-6 z-40 flex items-center gap-3 text-bone mix-blend-difference md:left-16"
    >
      <span className="flex h-3 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`w-[2px] bg-current transition-all duration-500 ${on ? "motion-safe:animate-pulse" : ""}`}
            style={{ height: on ? `${6 + i * 3}px` : "2px", animationDelay: `${i * 180}ms` }}
          />
        ))}
      </span>
      SOUND {on ? "ON" : "OFF"}
    </button>
  );
}
