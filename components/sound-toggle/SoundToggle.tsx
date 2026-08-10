"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Ambient sound toggle (same behavior as the reference: off by default,
 * looped ambience with a gentle fade when enabled).
 *
 * The ambience itself is synthesized with the Web Audio API — filtered
 * brown noise with two slow LFO swells reads as distant surf below the
 * terrace. No audio asset is shipped and nothing repeats audibly.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  const build = () => {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();

    // 12s of brown noise, looped (loop point is inaudible under the filter)
    const seconds = 12;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.6;

    // slow swells: one LFO breathes the filter, a second breathes the level
    const lfo1 = ctx.createOscillator();
    lfo1.frequency.value = 0.07;
    const lfo1Gain = ctx.createGain();
    lfo1Gain.gain.value = 160;
    lfo1.connect(lfo1Gain).connect(filter.frequency);

    const swell = ctx.createGain();
    swell.gain.value = 0.6;
    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.045;
    const lfo2Gain = ctx.createGain();
    lfo2Gain.gain.value = 0.3;
    lfo2.connect(lfo2Gain).connect(swell.gain);

    const master = ctx.createGain();
    master.gain.value = 0;

    src.connect(filter).connect(swell).connect(master).connect(ctx.destination);
    src.start();
    lfo1.start();
    lfo2.start();

    ctxRef.current = ctx;
    masterRef.current = master;
  };

  const toggle = () => {
    const next = !on;
    setOn(next);
    if (next && !ctxRef.current) build();
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    if (next) {
      void ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 2);
    } else {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => void ctxRef.current?.suspend(), 900);
    }
  };

  useEffect(() => () => void ctxRef.current?.close(), []);

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
