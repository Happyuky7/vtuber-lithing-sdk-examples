# Stream Reactions

Throws objects at the avatar when Twitch or YouTube events arrive.

| Event | Reaction (configurable) |
| --- | --- |
| Bits at or above the minimum | A violet star |
| Super Chat at or above the minimum | A gold star |
| Subscription, membership, gifted subs | Cubes (per sub, times the number gifted) |
| Follow | A ball |
| Raid | Cans, one per ten viewers (up to ten) |

## What it shows

- The typed `stream-event` host event: `this.listen('stream-event', (event) => …)` infers `StreamEvent`.
- Settings stored with `api.storage` and edited from the panel.
- `api.collisions.spawn()` with different kinds, colours and speeds.
- Declaring two built-in modules in `dependencies` so they are enabled with the plugin. The modules ship with the application; this plugin only reacts to what they provide.

## Try it

1. Install and enable the extension; Avatar Collisions and Stream Integrations are enabled with it.
2. In the Stream Integrations panel, connect Twitch or YouTube, or send a test event.
3. Each event appears in the panel's log together with the reaction it caused.

Build and package from the repository root with `pnpm package`; the ZIP is written to `artifacts/example.stream-reactions-1.0.0.zip`.

Requires Vtuber-Lithing 1.0.0 or newer. MIT licensed.
