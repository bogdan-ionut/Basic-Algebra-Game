# High-fidelity Minecraft item packs (free) — research shortlist

> Goal: help the project switch from placeholder vector icons to much more faithful Minecraft-looking items.

## Quick recommendations (best first)

### 1) Faithful (32x / 64x)
- Website: https://faithfulpack.net/
- Why it fits: closest look to vanilla Minecraft while still higher detail.
- Typical use here: inventory-like item sprites (diamond, emerald, ingot, redstone) exported at 64x64.
- License note: verify redistribution terms for bundling textures in a public web repo before committing assets.

### 2) Compliance (32x)
- Website: https://www.compliancepack.net/
- Why it fits: vanilla-faithful style, consistent palette, clean item readability for kids.
- Typical use here: drop-in replacement for core item sprite set.
- License note: check if direct redistribution in third-party projects is allowed.

### 3) Vanilla Tweaks (modular resource packs)
- Website: https://vanillatweaks.net/
- Why it fits: pick only item modules you need without replacing everything.
- Typical use here: add specific high-quality item tweaks and keep rest of visuals unchanged.
- License note: terms are module-specific; confirm attribution/redistribution requirements.

## Extra free sources found during web search

### 4) Modrinth — MB-3D Items Pack
- Page: https://modrinth.com/resourcepack/mb3d-items-pack
- Why it fits: turns item sprites into 3D-feeling items while keeping Minecraft style.
- Good for: chest rewards and collectible item reveals.
- License note: review pack’s current Modrinth license before embedding assets.

### 5) BlenderKit — Minecraft Block Pack (free)
- Page: https://www.blenderkit.com/asset-gallery-detail/0eb31b24-7407-4f5d-9ca2-f6a6ee3ed0b3/
- Why it fits: useful if we move to pre-rendered 3D item/block thumbnails.
- Good for: generating polished PNG renders for UI cards.

### 6) Sketchfab collections (free filters)
- Example search: https://sketchfab.com/search?features=downloadable&type=models&q=minecraft%20items
- Why it fits: many downloadable Minecraft-like objects for prototyping.
- Important: each model has its own license—only use entries with compatible reuse rights.

---

## Integration plan for this repo

1. Pick one base pack (Faithful or Compliance).
2. Export only required items into `src/assets/minecraft-items/` as PNG (recommended: `64x64` and `128x128`).
3. Keep naming stable:
   - `diamond.png`
   - `emerald.png`
   - `gold_ingot.png`
   - `redstone.png`
   - `grass_block.png`
4. Wire these paths into the `minecraft` visual stack renderer.
5. Add/maintain attribution in `docs/ASSET_LICENSES.md`.

## Legal checklist before committing textures

- Confirm the pack license explicitly permits redistribution in a public GitHub repository.
- If attribution is required, include author, pack name, URL, and license version.
- Keep source URL + version number for every asset included in the repo.

## Suggested quality bar ("HIGH FIDELITY")

- Minimum texture resolution: 32x32 (prefer 64x64).
- Avoid hand-drawn placeholders for Minecraft mode once pack assets are ready.
- Use nearest-neighbor rendering to preserve pixel-art crispness.
- Keep item silhouettes instantly recognizable for young learners.
