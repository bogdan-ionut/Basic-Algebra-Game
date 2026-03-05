# Pachete free (stil Minecraft foarte fidel) pentru sprites / textures / modele

> Scop: shortlist rapid pentru "look Minecraft" cât mai apropiat de vanilla, cu opțiuni gratuite și ușor de integrat în jocuri educaționale.

## 1) Faithful (32x / 64x)
- Tip: texture pack clasic, foarte apropiat de Minecraft vanilla (doar mai detaliat).
- Licență / utilizare: verifică pagina oficială pentru termenii de redistribuire în proiecte comerciale/non-comerciale.
- Când să-l alegi: dacă vrei ca elevii să recunoască instant itemele vanilla (diamond, emerald, gold ingot, redstone etc.) dar să arate mai curate.

## 2) Compliance (32x)
- Tip: variantă "faithful to vanilla" cu direcție artistică strict apropiată de jocul original.
- Licență / utilizare: verifică termenii de reuse pe sursa oficială înainte de bundling în repo.
- Când să-l alegi: dacă vrei consistență vizuală mare și puțin "stilizat".

## 3) Vanilla Tweaks (resource packs configurabile)
- Tip: pachete modulare (poți lua doar componentele dorite: UI, iteme, block-uri).
- Licență / utilizare: verifică ce module permit redistribuire directă în aplicații web.
- Când să-l alegi: dacă vrei să păstrezi 95% aspectul vanilla și să schimbi strict elementele care deranjează.

## 4) Bare Bones (stil simplificat, tot recognoscibil)
- Tip: minimalist/cartoon, inspirat de promo-art Minecraft.
- Licență / utilizare: verifică termenii oficiali.
- Când să-l alegi: dacă vrei iteme mai "curate" pentru copii mici, dar încă recognoscibile.

## 5) Rodrigo's Pack (8x8 pixel art)
- Tip: pixel-art low-res, retro.
- Licență / utilizare: verifică termenii oficiali.
- Când să-l alegi: dacă vrei performanță excelentă și estetică foarte simplă.

---

## Pipeline recomandat pentru proiectul Basic-Algebra-Game
1. Alege un pack "faithful" (ex: Faithful/Compliance) și extrage doar itemele folosite în exerciții.
2. Normalizează la aceeași dimensiune (de ex. 64x64 PNG).
3. Exportă variante @1x și @2x (pentru retina).
4. Definește un atlas minim de iteme:
   - `diamond`
   - `emerald`
   - `gold_ingot`
   - `redstone`
   - `grass_block`
5. Păstrează într-un `ASSET_LICENSES.md`:
   - nume pack
   - URL sursă
   - versiune
   - condiții de atribuire

## Notă legală importantă
- "Free" nu înseamnă automat "redistribuire permisă".
- Verifică întotdeauna termenii pachetului + Mojang/Microsoft EULA pentru asset-uri derivative.
- Pentru aplicații publice, menționează atribuirea exact cum cere autorul pack-ului.
