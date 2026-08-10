# ORA — Image Requirements

This document specifies the visual direction, dimensions, and swap notes for the 16 images used across the ORA landing page. It exists so a future photo shoot (or a fresh stock pass) can replace any file without touching code — **all swaps happen only in `/public/images` + `lib/images.ts`**. No other file should ever hardcode an image path.

Brand direction: warm, dusk-toned luxury architecture and interiors. No people. No daytime-office stock. Palette should read as consistent across the set — amber/gold light, stone, glass, deep blues/purples of dusk skies, champagne accents.

## Final image table (11 hero subjects)

| File to replace (`/public/images/`) | Recommended dimensions | Aspect ratio | Visual direction | Transparent foreground element for parallax? |
|---|---|---|---|---|
| `hero.jpg` | 3200×1800 | 16:9 landscape | Tower silhouette at dusk, warm-to-cool gradient sky, water or horizon line, no people | Yes — a foreground tower silhouette or foliage cutout reads well against the sky |
| `approach-mid.jpg` (tower exterior) | 3200×1800 | 16:9 landscape | Tower facade detail in golden-hour light, warm reflective glass/stone, dramatic upward or oblique angle | No — flat facade shot, parallax adds little |
| `arrival.jpg` (elevator arrival) | 2400×3000 | 4:5 portrait | Private elevator lobby, marble + brushed brass, warm downlight, symmetrical composition, no people | Yes — foreground door/frame elements can separate for depth |
| `interior-a.jpg` (living room) | 2400×3000 | 4:5 portrait | Living space in stone and glass, warm wood/stone accent wall, evening ambiance, no people | No — full-room shot, flat parallax layer is enough |
| `kitchen.jpg` | 2400×3000 | 4:5 portrait | Chef's kitchen, dark stone island, warm pendant lighting, no people | No |
| `suite.jpg` (bedroom) | 2400×3000 | 4:5 portrait | Primary suite, warm earth tones, soft evening light, minimal styling, no people | No |
| `spa.jpg` | 2400×3000 | 4:5 portrait | Stone spa / steam room, warm low light, candle or single light source, no people | No |
| `wine.jpg` (wine room) | 2400×2400 | 1:1 marquee square | Wine lounge/cellar, warm sconce lighting, champagne/gold accents, arched or vaulted display, no people | No |
| `terrace.jpg` | 3200×1800 | 16:9 landscape | Terrace over the Mediterranean, sunset/golden-hour sky, outdoor furniture silhouette, no people | Yes — foreground umbrella/rail/furniture element separates well for parallax |
| `pool.jpg` (infinity pool) | 2400×2400 | 1:1 marquee square | Infinity pool at dusk, warm ambient pool lighting against a cooling sky, no people | No — flat aerial/eye-level shot |
| `city-night.jpg` (city aerial) | 3200×1800 | 16:9 landscape | City lights at dusk/night, warm amber grid of windows against a cool sky, wide aerial or elevated framing | No — flat aerial, parallax adds little |

Two supporting images not in the 11-subject table but part of the manifest:
- `approach.jpg` — aerial city-at-dusk approach shot, cool-to-warm transitional sky, no people. 3200×1800, 16:9.
- `interior-b.jpg` — interior with an endless horizon (large glass wall onto the sea), dusk silhouette lighting, no people. 2400×3000, 4:5.
- `salon.jpg` — the grand salon, warm chandelier light, vaulted or high-ceilinged interior, no people. 2400×3000, 4:5.
- `lobby.jpg` — private lobby, warm marble and brass, no people. 2400×3000, 4:5.
- `golden.jpg` — golden hour over the sea, warm horizon, no people. 3200×1800, 16:9.

## Notes

- **Dimension guide by role**: 2400×3000 portrait for gallery/suite/spa-style detail shots; 3200×1800 landscape for hero/terrace/city-aerial wide shots; 2400×2400 square for marquee tiles (wine, pool).
- **Palette check**: before accepting any replacement, downscale and eyeball it next to the rest of the set (`sips -Z 300 file.jpg`). Reject anything that reads as bright/white daytime office stock, cool fluorescent lighting, or that contains visible people.
- **Parallax candidates**: hero, terrace, and elevator arrival benefit most from a separated transparent foreground layer (silhouette, railing, doorway) because they have strong depth cues. Flat aerials (approach, city-night, pool) do not — a single flat layer is sufficient and avoids visual artifacts from a bad cutout.
- All swaps: replace the file in `/public/images` with the same filename (same extension), then update only the `alt` text in `lib/images.ts` if the description changes. Never rename `ImageKey` entries — later tasks import them verbatim from `@/lib/images`.
