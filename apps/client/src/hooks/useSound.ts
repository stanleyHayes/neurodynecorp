import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "neurodyne_sound_enabled";

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedCtx) {
      sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  freq: number;
  endFreq?: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

function tone({ freq, endFreq, duration = 0.12, type = "sine", gain = 0.05, delay = 0 }: ToneOpts) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 0.0001), now + duration);
  }
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

const SOUNDS = {
  hover: () => tone({ freq: 600, duration: 0.06, gain: 0.02 }),
  click: () => {
    tone({ freq: 880, endFreq: 1320, duration: 0.08, gain: 0.04 });
    tone({ freq: 1200, endFreq: 1800, duration: 0.1, gain: 0.025, delay: 0.04 });
  },
  toggle: () => tone({ freq: 520, endFreq: 880, duration: 0.12, gain: 0.04 }),
  success: () => {
    tone({ freq: 660, duration: 0.1, gain: 0.05 });
    tone({ freq: 880, duration: 0.12, gain: 0.05, delay: 0.08 });
    tone({ freq: 1175, duration: 0.16, gain: 0.05, delay: 0.18 });
  },
  notify: () => {
    tone({ freq: 880, duration: 0.08, gain: 0.04 });
    tone({ freq: 1100, duration: 0.1, gain: 0.04, delay: 0.06 });
  },
  open: () => tone({ freq: 440, endFreq: 880, duration: 0.15, gain: 0.04 }),
  close: () => tone({ freq: 880, endFreq: 440, duration: 0.15, gain: 0.04 }),
};

export type SoundName = keyof typeof SOUNDS;

export function useSoundEnabled() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // storage may be unavailable
      }
      // unlock audio on first user gesture
      if (next) {
        const ctx = getCtx();
        if (ctx?.state === "suspended") ctx.resume();
        SOUNDS.toggle();
      }
      return next;
    });
  }, []);

  return { enabled, toggle };
}

export function useSound() {
  const play = useCallback((name: SoundName) => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) !== "true") return;
    const ctx = getCtx();
    if (ctx?.state === "suspended") ctx.resume();
    SOUNDS[name]();
  }, []);

  // Listen for global custom events
  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<{ name: SoundName }>;
      if (detail?.name) play(detail.name);
    };
    window.addEventListener("ndl:sound", handler as EventListener);
    return () => window.removeEventListener("ndl:sound", handler as EventListener);
  }, [play]);

  return play;
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ndl:sound", { detail: { name } }));
}
