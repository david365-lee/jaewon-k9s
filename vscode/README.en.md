# Jaewon K9s for VS Code

**Jaewon K9s** is a free VS Code extension that launches locally installed K9s in the integrated terminal. Select a local or remote Kubernetes context first. This is a separate product from the Docker Desktop extension in the parent directory.

[한국어](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.md) · [日本語](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.ja.md) · [简体中文](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.zh-CN.md) · [Marketplace listing description](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/docs/marketplace-description.en.md)

Improved and distributed for free by **jaewon**, a developer from South Korea.

## Features

- Search and choose local or remote Kubernetes contexts from one picker.
- Review each context's local/remote type, current-context status, cluster, and API endpoint in the list.
- Launch the selected context in a new integrated terminal with `k9s --context <name>`.
- Scroll over the precise zoom control in the K9s sidebar to change the font size by 1px. Small deltas accumulate and rapid bursts are limited. Enter an exact size or use +/− and Reset. Native Ctrl+wheel zoom is disabled by default; if you explicitly enabled `terminal.integrated.mouseWheelZoom`, turn it off in Settings. Font size changes apply to all integrated terminals.
- Configure executable paths for `kubectl` and K9s, an optional kubeconfig file, and the command timeout.
- Localized command labels, settings, and prompts for Korean, English, Japanese, and Simplified Chinese.

## Requirements

- VS Code 1.90 or later (desktop)
- `kubectl` installed and on `PATH`, or configured through `jaewonK9s.kubectlPath`
- K9s installed locally and on `PATH`, or configured through `jaewonK9s.k9sPath`
- A kubeconfig containing the contexts you want to use

The extension does not bundle K9s or kubectl. Remote clusters require working network access, VPN, authentication plugins, and credentials from the VS Code host. Docker Desktop is not required for this VS Code edition.

## Use

1. Install the extension and verify that `kubectl` and `k9s` work in the same user environment as VS Code.
2. Run **Jaewon K9s: Open K9s for a Kubernetes Context** from the Command Palette, or press `Ctrl+Alt+K` (`Cmd+Alt+K` on macOS).
3. Search the combined list and select a context. Each item shows its local/remote type, current-context status, cluster, and API endpoint.
4. K9s opens in a new integrated terminal with that context explicitly selected.
5. Run **Jaewon K9s: Increase Terminal Zoom**, **Decrease Terminal Zoom**, or **Reset Terminal Zoom** when needed.

## Windows borders, colors, and prompt icons

Version 0.1.7 consolidates the fixes verified on Korean Windows for missing K9s borders and restricted colors.

- Set console input and output to UTF-8 (65001) before starting K9s on Windows.
- Set `RUNEWIDTH_EASTASIAN=0` so ambiguous border characters occupy one cell, matching the VS Code terminal.
- Use full-color output by default. Enable `jaewonK9s.windowsConsoleCompatibility` only when optional legacy 16-color output is needed.
- Close existing K9s terminals and launch a new one with `Ctrl+Alt+K`. These launch settings do not automatically apply to other extensions or manually started `k9s` sessions.

The dog shown in the `:` command prompt and the poodle in the `/` search prompt are built-in K9s icons. To hide them, use `k9s info` to locate the configuration file, merge the following value under `k9s.ui` in the existing `config.yaml`, and restart K9s. Preserve the other settings. This is a K9s option; the extension does not automatically edit your K9s configuration.

```yaml
k9s:
  ui:
    noIcons: true
```

## Zoom behavior

Scroll over the precise zoom control in the K9s sidebar to change the font size by 1px. Small deltas accumulate and rapid bursts are limited. Enter an exact size or use +/− and Reset. Native Ctrl+wheel zoom is disabled by default; if you explicitly enabled `terminal.integrated.mouseWheelZoom`, turn it off in Settings. Font size changes apply to all integrated terminals.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | `kubectl` executable used to list contexts. |
| `jaewonK9s.k9sPath` | `k9s` | K9s executable launched in the integrated terminal. |
| `jaewonK9s.kubeconfig` | empty | Optional kubeconfig file. When set, it is used for context discovery and passed to K9s as the terminal's `KUBECONFIG` environment variable. When empty, standard `KUBECONFIG` and user-default behavior applies. |
| `jaewonK9s.commandTimeout` | `15000` | Timeout in milliseconds for context discovery and K9s version check (1,000–120,000). |
| `jaewonK9s.windowsConsoleCompatibility` | `false` | Optional Windows-only legacy 16-color output. Full color is the default; changes apply to new K9s terminals. |

## Privacy and security

Context discovery runs `kubectl config view -o json` on the VS Code host. The extension does not upload, persist, or log kubeconfig contents. It passes the selected context as an argument and lets local K9s use the host's Kubernetes authentication setup. Protect kubeconfig files and credentials according to your organization's policies. Connect only to clusters you trust.

## Build, test, and package

From this directory, with Node.js 20 or later and npm:

```powershell
npm ci
npm test
npm run package
```

The package command creates `jaewon-k9s-0.1.9.vsix`. Install it locally with:

```powershell
code --install-extension jaewon-k9s-0.1.9.vsix
```

The VS Code package icon is the transparent 128×128 PNG at [`icon.png`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.png); [`icon.svg`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.svg) is its editable vector source. The same PNG can be used in the publisher's extension listing.

## Marketplace updates

Update the existing Marketplace listing through the publisher management page:

1. Review the manifest, localized metadata, icon, translated READMEs, and `docs/marketplace-description.<locale>.md`.
2. Build and test the VSIX. To set its filename explicitly, use `npx @vscode/vsce package --out jaewon-k9s-0.1.9.vsix`.
3. In Visual Studio Marketplace publisher management, select **Jaewon K9s → More Actions → Update**, then upload the VSIX.

Update the existing `jaewon-k9s` listing rather than creating a new extension. The manifest and package include the icon and localized extension metadata.

**Security note:** A high-severity advisory has been reported for `@azure/msal-node`, a transitive development dependency of VSCE ([GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5)). It is not included in the VSIX. Do not store a publishing PAT in the repository or project settings, and avoid VSCE CLI login until a compatible upstream fix and full audit are confirmed. An approved Marketplace browser session can be used to update the existing extension.

## License and attribution

The extension source is available under the [MIT License](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/LICENSE). Improved and distributed for free by **jaewon**, a developer from South Korea. K9s and Kubernetes are separate projects and retain their respective names, trademarks, and licenses; their software is not bundled with this extension.
