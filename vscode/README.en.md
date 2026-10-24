# Jaewon K9s for VS Code

**Jaewon K9s** is a free VS Code extension that launches locally installed K9s in the integrated terminal. Select a local or remote Kubernetes context first. This is a separate product from the Docker Desktop extension in the parent directory.

[한국어](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [Marketplace listing description](docs/marketplace-description.en.md)

Improved and distributed for free by **jaewon**, a developer from South Korea.

## Features

- Choose local, remote/other, or all Kubernetes contexts.
- Discover contexts with host `kubectl`; common local context names and loopback API endpoints are grouped as local.
- Launch the selected context in a new integrated terminal with `k9s --context <name>`.
- Use dedicated terminal zoom-in, zoom-out, and reset commands. `Ctrl` + mouse-wheel zoom is enabled by default through `terminal.integrated.mouseWheelZoom`.
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
3. Choose **Local cluster**, **Remote / other context**, or **Show all contexts**.
4. Select a context. K9s opens in a new integrated terminal with that context explicitly selected.
5. Run **Jaewon K9s: Increase Terminal Zoom**, **Decrease Terminal Zoom**, or **Reset Terminal Zoom** when needed.

Context groups are a convenience, not a connectivity test. A remote cluster may be unreachable, and a local context may need extra networking. Choose **Show all contexts** if a context is grouped unexpectedly.

## Zoom behavior

The zoom commands invoke VS Code's built-in integrated-terminal font zoom actions. `Ctrl` + mouse-wheel zoom is enabled by default by setting `terminal.integrated.mouseWheelZoom` to `true`. This setting applies to **all integrated terminals**, not just K9s. Turn it off in Settings if you prefer the explicit zoom commands only.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | `kubectl` executable used to list contexts. |
| `jaewonK9s.k9sPath` | `k9s` | K9s executable launched in the integrated terminal. |
| `jaewonK9s.kubeconfig` | empty | Optional kubeconfig file. When set, it is used for context discovery and passed to K9s as the terminal's `KUBECONFIG` environment variable. When empty, standard `KUBECONFIG` and user-default behavior applies. |
| `jaewonK9s.commandTimeout` | `15000` | Timeout in milliseconds for context discovery and K9s version check (1,000–120,000). |

## Privacy and security

Context discovery runs `kubectl config view -o json` on the VS Code host. The extension does not upload, persist, or log kubeconfig contents. It passes the selected context as an argument and lets local K9s use the host's Kubernetes authentication setup. Protect kubeconfig files and credentials according to your organization's policies. Connect only to clusters you trust.

## Build, test, and package

From this directory, with Node.js 20 or later and npm:

```powershell
npm ci
npm test
npm run package
```

The package command creates `jaewon-k9s-0.1.1.vsix`. Install it locally with:

```powershell
code --install-extension jaewon-k9s-0.1.1.vsix
```

The VS Code package icon is the transparent 128×128 PNG at [`icon.png`](icon.png); [`icon.svg`](icon.svg) is its editable vector source. The same PNG can be used in the publisher's extension listing.

## Marketplace publishing preparation

Publishing has **not** been performed. Before publishing:

1. Verify that publisher ID `jaewon-lee` belongs to the project maintainer; create or verify the publisher in the Visual Studio Marketplace management portal.
2. Review the manifest, localized metadata, icon, translated READMEs, and the matching detailed listing in `docs/marketplace-description.<locale>.md`.
3. Build and test the VSIX as above. To set the artifact name explicitly, use `npx @vscode/vsce package --out jaewon-k9s-0.1.1.vsix`.
4. Create a Marketplace Personal Access Token with the minimum required **Marketplace (Manage)** scope. Store it securely; never commit it or add it to project settings.
5. First resolve the security note below and pass a full dependency audit. Then authenticate with `npx @vscode/vsce login jaewon-lee`; publish with `npx @vscode/vsce publish` only after the project owner confirms the version and listing.

The manifest and package include the icon and localized extension metadata. Marketplace publishing remains a deliberate manual action.

**Security note:** The current full `npm audit` reports a high-severity advisory for `@azure/msal-node`, a transitive development dependency of VSCE ([GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5)). This tool is not included in the VSIX; `npm audit --omit=dev` reports zero vulnerabilities, and VSIX packaging was verified. Because the advisory may affect publisher authentication, do not run `vsce login` or `vsce publish` until a compatible upstream fix is available and the full audit passes.

## License and attribution

The extension source is available under the [MIT License](LICENSE). Improved and distributed for free by **jaewon**, a developer from South Korea. K9s and Kubernetes are separate projects and retain their respective names, trademarks, and licenses; their software is not bundled with this extension.
