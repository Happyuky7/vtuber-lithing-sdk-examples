# Stage Controls

Tour of the APIs the application renders and manages for extensions.

## What it shows

- Holding an avatar expression on top of tracking with `avatar.setExpression()` (`expressions`), listing them with `avatar.expressions()`.
- A floating button over the stage with `ui.overlay()`, hidden from stream capture by default (`overlay`).
- A full-screen dialog with `ui.modal()` (`overlay`).
- A system-wide hotkey, `Ctrl+Alt+H` (`Cmd+Alt+H` on macOS), with `registerHotkey()` and its failure reasons (`hotkeys`).
- The `stream-mode` and `recording` host events (`integration`).
- A native HTTP request to a device on the local network with `network.request()` and `network.isAllowed()` (`network`).

Expressions, overlays, modals and hotkeys are released by the application when the extension stops; the code only resets its own state.

## Files

```text
manifest.json                  id example.stage-controls, capabilities, sdkVersion
src/StageControlsExtension.ts  the extension
src/index.ts                   exports `extension`
locales/*.json                 en (required), es, pt, ja, zh-CN
```

Build and package from the repository root with `pnpm package`; the ZIP is written to `artifacts/example.stage-controls-1.0.0.zip`.

Requires Vtuber-Lithing 1.0.0 or newer (SDK 1.0.0). MIT licensed.
