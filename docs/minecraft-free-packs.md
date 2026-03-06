# High-fidelity Minecraft item packs (free) — research shortlist

> Goal: help the project switch from placeholder vector icons to much more faithful Minecraft-looking items.

## Current status in this repo

✅ Implemented: the game now uses **Faithful-style item textures from the local folder** `public/assets/minecraft-faithful/` (resources, tools, food, NPC/animal/hostile spawn eggs, utility items).

✅ Why this approach: lets maintainers upload PNG files manually in-repo and use them directly at runtime (`/assets/minecraft-faithful/...`) without changing code every time assets are updated.

## Quick recommendations (best first)

### 1) Faithful (32x / 64x)
- Website: https://faithfulpack.net/
- Why it fits: closest look to vanilla Minecraft while still higher detail.
- Typical use here: inventory-like item sprites (diamond, emerald, ingot, redstone).
- License note: check current terms and keep attribution link.

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

1. ✅ Pick one base pack (**Faithful selected**).
2. ✅ Wire local item URLs (`/assets/minecraft-faithful/<name>.png`) into the `minecraft` visual stack renderer.
3. ✅ Keep all Minecraft item keys mapped (resources/tools/utility/food/NPC-animal-hostile entries).
4. ✅ Keep attribution and license source documented in `docs/ASSET_LICENSES.md`.
5. 🔜 Optional later: add automated validation for required filenames in `public/assets/minecraft-faithful/`.

## Suggested quality bar ("HIGH FIDELITY")

- Minimum texture resolution: 32x32 (prefer 64x64).
- Avoid hand-drawn placeholders for Minecraft mode once pack assets are ready.
- Use nearest-neighbor rendering to preserve pixel-art crispness.
- Keep item silhouettes instantly recognizable for young learners.

## Manual download list (new assets for richer Minecraft look)

> Because binary assets are not committed automatically, download these manually and place them at the exact paths below.

### A) UI/Chest visuals (high impact)

- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/block/barrel_side.png`
  - Put at: `public/assets/minecraft-faithful/barrel_side.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/block/barrel_top.png`
  - Put at: `public/assets/minecraft-faithful/barrel_top.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/block/barrel_bottom.png`
  - Put at: `public/assets/minecraft-faithful/barrel_bottom.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/block/emerald_block.png`
  - Put at: `public/assets/minecraft-faithful/emerald_block.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/block/sea_lantern.png`
  - Put at: `public/assets/minecraft-faithful/sea_lantern.png`

### B) More items/NPC/animals for collectible variety

- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/netherite_ingot.png`
  - Put at: `public/assets/minecraft-faithful/netherite_ingot.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/crossbow_standby.png`
  - Put at: `public/assets/minecraft-faithful/crossbow_standby.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/trident.png`
  - Put at: `public/assets/minecraft-faithful/trident.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/axolotl_bucket.png`
  - Put at: `public/assets/minecraft-faithful/axolotl_bucket.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/fox_spawn_egg.png`
  - Put at: `public/assets/minecraft-faithful/fox_spawn_egg.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/panda_spawn_egg.png`
  - Put at: `public/assets/minecraft-faithful/panda_spawn_egg.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/allay_spawn_egg.png`
  - Put at: `public/assets/minecraft-faithful/allay_spawn_egg.png`
- URL: `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item/warden_spawn_egg.png`
  - Put at: `public/assets/minecraft-faithful/warden_spawn_egg.png`
