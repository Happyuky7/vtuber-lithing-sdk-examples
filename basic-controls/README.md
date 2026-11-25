# Basic Controls

Starter extension for Vtuber-Lithing that touches every everyday API.

## What it shows

- Class-based activation and automatic cleanup with `VtuberTrackingExtension`.
- A sidebar panel (`controls`) with translated text in five languages.
- Reading the loaded avatar and its expressions (`tracking`).
- Reacting to the `avatar-loaded` host event (`integration`).
- Persistent, namespaced storage: an activation counter.
- A 3D cube added and removed through the scene API.
- Throwing an object through Avatar Collisions (declared in `dependencies`).

## Files

```text
manifest.json                 id example.basic-controls, capabilities and dependencies
src/BasicControlsExtension.ts the extension
src/index.ts                  exports `extension`
locales/*.json                en (required), es, pt, ja, zh-CN
```

Build and package from the repository root with `pnpm package`; the ZIP is written to `artifacts/example.basic-controls-1.0.0.zip`.

Requires Vtuber-Lithing 1.0.0 or newer. MIT licensed.
