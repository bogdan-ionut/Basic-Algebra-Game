<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/88a24625-87cd-4b62-aabe-15b3652e8414

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

## Auto deploy pe GitHub Pages (la fiecare merge/push pe `main`)

Repo-ul include acum workflow-ul `.github/workflows/deploy-pages.yml` care:
- pornește la orice push pe `main`;
- face build cu Vite;
- publică automat folderul `dist` pe GitHub Pages.

### Ce trebuie să faci tu manual (o singură dată)

1. În GitHub, deschide **Settings → Pages**.
2. La **Source**, selectează **GitHub Actions**.
3. (Dacă e nevoie) în **Settings → Actions → General**, la **Workflow permissions**, permite ca workflow-urile să poată scrie (`Read and write permissions`).
4. Fă merge în `main` (sau push direct în `main`) și verifică tab-ul **Actions**.
5. URL-ul final va fi de forma:
   `https://<user>.github.io/Basic-Algebra-Game/`

După primul deploy reușit, fiecare merge/push nou în `main` va publica automat versiunea nouă.

## Minecraft high-fidelity assets

Am integrat texturi **Faithful 32x** pentru itemele Minecraft (resurse, unelte, mâncare, ouă pentru NPC/animale/hostile), încărcate din sursa oficială upstream pentru a evita commit-uri cu fișiere binare în repo și pentru a crește claritatea vizuală.

Detalii și licențiere:
- `docs/minecraft-free-packs.md`
- `docs/ASSET_LICENSES.md`

