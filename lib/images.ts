export type OraImage = { src: string; alt: string };

export type ImageKey =
  | "hero" | "approach" | "approachMid" | "arrival"
  | "interiorA" | "interiorB" | "terrace" | "salon"
  | "suite" | "spa" | "wine" | "kitchen"
  | "pool" | "cityNight" | "lobby" | "golden";

export const IMAGES: Record<ImageKey, OraImage> = {
  hero: { src: "/images/hero.jpg", alt: "Tower rising above the sea at dusk" },
  approach: { src: "/images/approach.jpg", alt: "The city from above at night" },
  approachMid: { src: "/images/approach-mid.jpg", alt: "Tower facade detail" },
  arrival: { src: "/images/arrival.jpg", alt: "Private elevator arrival hall" },
  interiorA: { src: "/images/interior-a.jpg", alt: "Living space in stone and glass" },
  interiorB: { src: "/images/interior-b.jpg", alt: "Interior with endless horizon" },
  terrace: { src: "/images/terrace.jpg", alt: "Terrace over the Mediterranean" },
  salon: { src: "/images/salon.jpg", alt: "The grand salon" },
  suite: { src: "/images/suite.jpg", alt: "The primary suite" },
  spa: { src: "/images/spa.jpg", alt: "The stone spa" },
  wine: { src: "/images/wine.jpg", alt: "The wine lounge" },
  kitchen: { src: "/images/kitchen.jpg", alt: "The chef's kitchen" },
  pool: { src: "/images/pool.jpg", alt: "The infinity pool" },
  cityNight: { src: "/images/city-night.jpg", alt: "City lights at night" },
  lobby: { src: "/images/lobby.jpg", alt: "The private lobby" },
  golden: { src: "/images/golden.jpg", alt: "Golden hour over the sea" },
};
