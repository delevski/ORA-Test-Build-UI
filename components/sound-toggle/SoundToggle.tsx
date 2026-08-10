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
  const washRef = useRef<GainNode | null>(null);
  const deepFilterRef = useRef<BiquadFilterNode | null>(null);
  const waveTimer = useRef<number | null>(null);

  const build = () => {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();

    // 12s of brown noise, looped (loop point is inaudible under the filters)
    const seconds = 12;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // layer 1 — constant distant rumble (very low, sits under everything)
    const deepSrc = ctx.createBufferSource();
    deepSrc.buffer = buffer;
    deepSrc.loop = true;
    const deep = ctx.createBiquadFilter();
    deep.type = "lowpass";
    deep.frequency.value = 200;
    deep.Q.value = 0.4;
    const deepGain = ctx.createGain();
    deepGain.gain.value = 0.35;
    deepSrc.connect(deep).connect(deepGain).connect(master);
    deepSrc.start();

    // layer 2 — the "wash": brighter band that only opens when a wave breaks
    const washSrc = ctx.createBufferSource();
    washSrc.buffer = buffer;
    washSrc.loop = true;
    washSrc.playbackRate.value = 0.85; // decorrelate from layer 1
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 750;
    band.Q.value = 0.45;
    const wash = ctx.createGain();
    wash.gain.value = 0;
    washSrc.connect(band).connect(wash).connect(master);
    washSrc.start();

    ctxRef.current = ctx;
    masterRef.current = master;
    washRef.current = wash;
    deepFilterRef.current = deep;
  };

  // each wave: slow build, break, long hiss-out — randomized period so it never loops
  const scheduleWave = () => {
    const ctx = ctxRef.current;
    const wash = washRef.current;
    const deep = deepFilterRef.current;
    if (!ctx || !wash || !deep) return;
    const t = ctx.currentTime;
    const attack = 1.6 + Math.random() * 1.2;
    const release = 3.2 + Math.random() * 1.8;
    const peak = 0.4 + Math.random() * 0.35;

    wash.gain.cancelScheduledValues(t);
    wash.gain.setValueAtTime(Math.max(wash.gain.value, 0.02), t);
    wash.gain.linearRampToValueAtTime(peak, t + attack);
    wash.gain.exponentialRampToValueAtTime(0.02, t + attack + release);

    deep.frequency.cancelScheduledValues(t);
    deep.frequency.setValueAtTime(deep.frequency.value, t);
    deep.frequency.linearRampToValueAtTime(340, t + attack);
    deep.frequency.linearRampToValueAtTime(200, t + attack + release);

    waveTimer.current = window.setTimeout(scheduleWave, (attack + release + 1 + Math.random() * 3) * 1000);
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
      master.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 2);
      scheduleWave();
    } else {
      if (waveTimer.current) window.clearTimeout(waveTimer.current);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => void ctxRef.current?.suspend(), 900);
    }
  };

  useEffect(
    () => () => {
      if (waveTimer.current) window.clearTimeout(waveTimer.current);
      void ctxRef.current?.close();
    },
    []
  );

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
