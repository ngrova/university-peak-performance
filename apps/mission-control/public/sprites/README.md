# Sprites — Albus's Lookout

## ✅ ACTIVE SPRITES (use these only)

These are the polished, production-ready sprites currently used by the app.
**Do not replace or modify these without explicit approval from Nick.**

| File | Used By | Description |
|------|---------|-------------|
| `albus.png` | `AlbusSprite.tsx`, `sprite-state.ts` | Main Albus wizard — floating in the terrace |
| `apprentice.png` | `ApprenticeSprites.tsx` | Apprentice agent sprite |
| `room.webp` | `Room.tsx` | Treetop terrace background |
| `crystal-harmonic.png` | `sprite-state.ts` | Crystal: context < 25% |
| `crystal-growing.png` | `sprite-state.ts` | Crystal: context 25–50% |
| `crystal-warm.png` | `sprite-state.ts` | Crystal: context 50–75% |
| `crystal-redline.png` | `sprite-state.ts` | Crystal: context > 75% |
| `moneybag-full.png` | `sprite-state.ts` | Money bag: credits > $10 |
| `moneybag-half.png` | `sprite-state.ts` | Money bag: credits $5–$10 |
| `moneybag-empty.png` | `sprite-state.ts` | Money bag: credits < $5 |

## 🗄️ archive/

Old, unpolished, or deprecated sprites. **Do not use these.**
They are kept for reference only and should not be referenced in code.

| File | Notes |
|------|-------|
| `albus-front.png/.webp` | Early Albus variant — superseded by `albus.png` |
| `albus-back.png/.webp` | Early Albus back-facing variant — never used in production |
| `apprentice.webp` | Duplicate of `apprentice.png` — use `.png` version |
| `crystal-*.webp` | WebP duplicates of crystal sprites — use `.png` versions |
| `moneybag-*.webp` | WebP duplicates of moneybag sprites — use `.png` versions |
| `spellbook.png/.webp` | Old spellbook click-to-rewind sprite — replaced by bottom RewindBar |

## Rules

- All new sprites: use descriptive kebab-case names (e.g. `crystal-redline.png`)
- Format: `.png` for sprites, `.webp` for background images
- If replacing a sprite, keep the same filename so no code changes are needed
- If retiring a sprite, move it to `archive/` and update this README
