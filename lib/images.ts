export type OraImage = { src: string; alt: string };

// raw <img> output (static export) doesn't get basePath applied by Next,
// so the manifest bakes it in — set by next.config.ts for GitHub Pages
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const img = (file: string, alt: string): OraImage => ({ src: `${BASE}/images/${file}`, alt });

export type ImageKey =
  | "hero" | "approach" | "approachMid" | "arrival"
  | "interiorA" | "interiorB" | "terrace" | "salon"
  | "suite" | "spa" | "wine" | "kitchen"
  | "pool" | "cityNight" | "lobby" | "golden";

export const IMAGES: Record<ImageKey, OraImage> = {
  hero: img("hero.jpg", "Tower rising above the sea at dusk"),
  approach: img("approach.jpg", "The city from above at night"),
  approachMid: img("approach-mid.jpg", "Tower facade detail"),
  arrival: img("arrival.jpg", "Private elevator arrival hall"),
  interiorA: img("interior-a.jpg", "Living space in stone and glass"),
  interiorB: img("interior-b.jpg", "Interior with endless horizon"),
  terrace: img("terrace.jpg", "Terrace over the Mediterranean"),
  salon: img("salon.jpg", "The grand salon"),
  suite: img("suite.jpg", "The primary suite"),
  spa: img("spa.jpg", "The stone spa"),
  wine: img("wine.jpg", "The wine lounge"),
  kitchen: img("kitchen.jpg", "The chef's kitchen"),
  pool: img("pool.jpg", "The infinity pool"),
  cityNight: img("city-night.jpg", "City lights at night"),
  lobby: img("lobby.jpg", "The private lobby"),
  golden: img("golden.jpg", "Golden hour over the sea"),
};
