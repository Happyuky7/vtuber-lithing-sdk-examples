<div align="center">

![Vtuber-Lithing example extensions](https://vtuber-lithing.happyuky7.com/brand/banners/banner-4.jpg)

# Vtuber-Lithing example extensions

**Ready-to-build plugins for Vtuber-Lithing. Copy one to start your own.**

[![License: MIT](https://img.shields.io/badge/license-MIT-06b6d4.svg)](LICENSE)
[![SDK](https://img.shields.io/badge/SDK-1.0.0-06b6d4.svg)](https://github.com/Happyuky7/vtuber-lithing-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

[**SDK**](https://github.com/Happyuky7/vtuber-lithing-sdk) · [**SDK docs**](https://vtuber-lithing.happyuky7.com/docs/sdk/getting-started) · [**The app**](https://github.com/Happyuky7/Vtuber-Lithing) · [**Extensions showcase**](https://vtuber-lithing.happyuky7.com/extensions) · [**Discord**](https://discord.gg/shbsVYdBpJ)

</div>

---

Ready-to-build plugins for [Vtuber-Lithing](https://github.com/Happyuky7/Vtuber-Lithing), written with the [SDK](https://github.com/Happyuky7/vtuber-lithing-sdk). Copy one to start your own.

These are **plugins**: installed from a ZIP and built with the SDK. They are different from the **modules** that come with the application (Accessory Studio, Avatar Collisions, Stream Integrations…); some examples use those modules through `dependencies` to show what a plugin can add on top.

| Example | Shows | Capabilities |
| --- | --- | --- |
| [basic-controls](basic-controls/) | Panel, avatar data, storage, host events, a 3D cube, throwing objects | `tracking`, `controls`, `integration` |
| [scene-tools](scene-tools/) | glTF models, primitives, transforms and visibility | `controls`, `integration` |
| [stream-reactions](stream-reactions/) | Twitch/YouTube `stream-event`, settings, collisions | `controls`, `integration` |
| [stage-controls](stage-controls/) | Expressions over tracking, a floating stage button, a modal, a global hotkey, mode events, a request to a LAN device | `controls`, `integration`, `tracking`, `expressions`, `overlay`, `hotkeys`, `network` |

All of them are translated into English, Spanish, Portuguese, Japanese and Simplified Chinese.

## Build

```bash
pnpm install
pnpm build              # every example → <example>/dist/index.js
pnpm build stream-reactions   # just one
pnpm package            # build and zip each one into artifacts/
pnpm typecheck
```

The SDK is installed from the [vtuber-lithing-sdk](https://github.com/Happyuky7/vtuber-lithing-sdk) repository. To work against a local checkout of it instead, add this to `pnpm-workspace.yaml`:

```yaml
overrides:
  vtuber-lithing-sdk: link:../sdk
```

## Install in the application

1. Open **Settings** and turn on **Enable extension system**.
2. Under **Plugins**, choose **Install .zip extension** and pick a ZIP from `artifacts/`.
3. Enable it. Its panel appears in the editor under the **Plugins** tab (under **Modules** on Android, where the same button opens the system file picker).

## Make your own

1. Copy an example folder and rename it.
2. Give `manifest.json` a new unique `id` (for example `com.yourname.my-extension`), keep `sdkVersion` at the SDK version you build against, and request only the capabilities you use.
3. Edit `src/` and the files in `locales/`.
4. `pnpm package` picks up every folder with a `manifest.json`.

Full guide: [Getting started](https://github.com/Happyuky7/vtuber-lithing-sdk/blob/master/docs/getting-started.md) · [API reference](https://github.com/Happyuky7/vtuber-lithing-sdk/blob/master/docs/api-reference.md) · [Events](https://github.com/Happyuky7/vtuber-lithing-sdk/blob/master/docs/events.md).

## License

MIT. See [LICENSE](LICENSE).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://happyuky7.com"><img src="https://avatars.githubusercontent.com/u/58347721?v=4?s=100" width="100px;" alt="Happyuky7"/><br /><sub><b>Happyuky7</b></sub></a><br /><a href="https://github.com/Happyuky7/vtuber-lithing-sdk-examples/commits?author=Happyuky7" title="Code">💻</a> <a href="#example-Happyuky7" title="Examples">💡</a> <a href="#maintenance-Happyuky7" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## Part of Vtuber-Lithing

| Repository | What |
| --- | --- |
| [Vtuber-Lithing](https://github.com/Happyuky7/Vtuber-Lithing) | The application (Windows, Linux, Android) |
| [vtuber-lithing-sdk](https://github.com/Happyuky7/vtuber-lithing-sdk) | TypeScript SDK for extensions (plugins / addons) |
| [vtuber-lithing-sdk-examples](https://github.com/Happyuky7/vtuber-lithing-sdk-examples) | Ready-to-build example extensions |
| [lithing-native-tracking-rs](https://github.com/Happyuky7/lithing-native-tracking-rs) | Native motion tracking engine in Rust (face and hands; body next) |

Website and documentation: <https://vtuber-lithing.happyuky7.com/> · Community: [Discord](https://discord.gg/shbsVYdBpJ)

## Star History

<a href="https://www.star-history.com/#Happyuky7/vtuber-lithing-sdk-examples&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Happyuky7/vtuber-lithing-sdk-examples&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Happyuky7/vtuber-lithing-sdk-examples&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Happyuky7/vtuber-lithing-sdk-examples&type=Date" />
  </picture>
</a>

---

<div align="center">

**Happy coding!** 💚

</div>
