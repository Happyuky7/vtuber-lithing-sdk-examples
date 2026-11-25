# Scene Tools

Adds 3D objects next to the avatar and edits them from a small hierarchy.

## What it shows

- Loading an extension-owned glTF file with `api.assets.url()` and `api.scene.addModel()`.
- Creating primitives (cube and sphere).
- Keeping its own object list and editing position, rotation (degrees in the UI, radians in the API), uniform scale and visibility.
- Removing single objects; everything else is cleaned up automatically on deactivation.

It uses only the public SDK: no Three.js import and no access to the application's renderer.

## Replace the sample model

Put a `.glb`, or a `.gltf` with its referenced files, under `assets/` and change the path passed to `api.assets.url()`. Models are normalised to one unit by default; pass `normalize: false` to keep their own units.

Build and package from the repository root with `pnpm package`; the ZIP is written to `artifacts/example.scene-tools-1.0.0.zip`.

Requires Vtuber-Lithing 1.0.0 or newer. MIT licensed.
