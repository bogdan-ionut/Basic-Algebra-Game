# Asset licenses (Minecraft-style items)

Use this file whenever textures/models are added to the repository.

## Runtime-loaded textures (not redistributed in-repo)

The app loads Faithful 32x item textures from the official public GitHub repository at runtime (no `.png` binaries are committed in this repository):

- **Pack**: Faithful 32x (Java)
- **Project**: Faithful Resource Pack
- **Source repo**: https://github.com/Faithful-Resource-Pack/Faithful-32x-Java
- **Source branch for textures**: `java-latest`
- **Texture path upstream**: `assets/minecraft/textures/item/*.png`
- **Runtime base URL used by app**:
  `https://raw.githubusercontent.com/Faithful-Resource-Pack/Faithful-32x-Java/java-latest/assets/minecraft/textures/item`
- **License**: Faithful License Version 3 (20 Feb 2023)
- **License page**: https://github.com/Faithful-Resource-Pack/Faithful-32x-Java/blob/main/LICENSE.txt
- **Attribution requirement**: Yes (credit + link to https://faithfulpack.net/)

### Attribution text used by this project

"Minecraft-style item textures are sourced from Faithful 32x by the Faithful Resource Pack team (https://faithfulpack.net/), used under the Faithful License v3."

## Verification steps

1. Check the upstream page and license text.
2. Confirm usage terms are still valid for app runtime loading.
3. Keep attribution text and source links updated.
4. If assets are ever re-bundled in-repo, also include the unmodified upstream license file in this repository.
