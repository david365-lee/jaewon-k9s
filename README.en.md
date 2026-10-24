# Jaewon K9s

**A free Docker Desktop extension for selecting local or remote Kubernetes contexts and opening K9s.** It is independently improved and distributed for free by **jaewon**, a developer from South Korea. The project source is MIT-licensed.

[한국어](README.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [REA analysis](docs/reverse-engineering.md) · [Changelog](CHANGELOG.md)

## VS Code extension

Alongside the Docker Desktop extension, a separate VS Code extension runs local and remote contexts in the integrated terminal using the host's `kubectl` and K9s. See the [VS Code extension README](vscode/README.en.md) for requirements, commands, configuration, zoom behavior, and Marketplace preparation. [한국어](vscode/README.md) · [日本語](vscode/README.ja.md) · [简体中文](vscode/README.zh-CN.md)

VS Code **0.1.7** fixes missing borders on Korean Windows using UTF-8 and explicit character widths, and enables full colors by default. See the [VS Code guide](vscode/README.en.md) for prompt icon settings.

## Features

| Feature | Description |
| --- | --- |
| Local clusters | Select recognized Docker Desktop, Kind, Minikube, and other local contexts from the host kubeconfig. |
| Remote clusters | Select other contexts registered with host `kubectl`. VPN, firewall, authentication, and routing must also work from the Docker Desktop container. |
| Unified context picker | Search and select local or remote contexts from one list by context name or API endpoint. |
| K9s terminal | Open K9s explicitly for the selected context without modifying the host kubeconfig. Reconnecting starts a fresh terminal session. |
| Zoom controls | Use `−`, `+`, and reset, or `Ctrl/Cmd + +`, `Ctrl/Cmd + -`, and `Ctrl/Cmd + 0`. Zoom is saved in browser local storage. |
| Loopback routing | Rewrites `localhost`, `127.0.0.1`, and `::1` API endpoints only in the extension copy, using `host.docker.internal` while preserving TLS server-name validation. |
| Authentication warnings | Warns about selected configurations that need an exec plugin, host token file, proxy, or other container-side setup. |

## REA analysis

REA statically analyzed the supplied Docker Desktop k9s extension UI. The existing UI reads a fixed `docker-desktop` kubeconfig context through host `kubectl`, posts it to the extension VM service, and displays a terminal iframe at `http://localhost:35781`. Context selection and UI zoom controls were not found in the selected source.

This was static analysis; the application was not executed, and some inventoried files were outside the analysis selection. See the [REA report](docs/reverse-engineering.md) for Evidence ID, input digest, findings, and limitations. No upstream implementation files or image assets are redistributed.

## Requirements

- Docker Desktop 4.8 or newer with Docker Extensions enabled
- A running Kubernetes cluster and host `kubectl` kubeconfig contexts
- Remote API addresses reachable from the Docker Desktop extension container

An AWS/GCP/Azure `exec` credential plugin may fail unless its binary and login prerequisites are available inside the terminal container. `kubectl config view --raw --flatten` copies credentials into the extension's shared volume. Connect only to contexts you trust.

## Install

### Docker Desktop extension image

Install the latest release image from GitHub Container Registry:

```powershell
docker extension install ghcr.io/david365-lee/jaewon-k9s:0.1.2
```

You can use the `latest` tag to install the newest published image.

### Build and install locally

```powershell
docker build -t jaewon-k9s:0.1.2 .
docker extension validate jaewon-k9s:0.1.2
docker extension install jaewon-k9s:0.1.2
```

The terminal binds to `127.0.0.1:35782` by default, separate from the existing k9s extension on `35781`. If the port is occupied, change the `JAEWON_K9S_PORT` default in `docker-compose.yaml` and rebuild.

## Usage

1. Open **Jaewon K9s** under Docker Desktop **Extensions**.
2. Search by context name or API endpoint, then choose a context. Local and remote contexts appear together.
3. Select **Open K9s** to start. Reconnecting opens a fresh K9s terminal session.
4. Adjust the terminal using the zoom controls or Ctrl/Cmd shortcuts.

Loopback API endpoints are routed through `host.docker.internal`; TLS verification remains enabled. The K9s terminal may need a refresh after reconnecting.

## Connection and security behavior

- Context discovery uses `kubectl config view -o json`. Credentials are read only after the user chooses **Connect**, using `kubectl config view --raw --flatten --minify --context=<name> -o json`.
- The selected kubeconfig is atomically written to the Docker Desktop extension volume with mode `0600`. Invalid JSON, incomplete configs, and payloads over 4 MiB are rejected.
- Kubeconfig contents are not written to browser local storage, logs, or repository files. Only the selected context name and zoom level are persisted by the UI.
- The host kubeconfig is read-only. Loopback rewriting applies only to the copy sent into the extension container.
- TLS verification is not disabled. The original TLS server name is kept or set when a loopback API address is rewritten.
- Remote reachability depends on Docker Desktop VPN, DNS, and routing. `exec`, `tokenFile`, legacy auth-provider, and proxy configurations may need extra tools or credentials inside the container.
- K9s v0.51.0, ttyd v1.7.7, and kubectl v1.36.1 are included in the extension image. The K9s release archive is checked against a pinned SHA-256 digest. Component licenses are documented in [Third-party notices](THIRD-PARTY-NOTICES.md) and included under `/licenses/` in the image.

## Development and tests

Requirements: Docker Desktop, Docker CLI/Buildx, Go 1.23+, Node.js 22+, and npm.

```powershell
cd backend
go test ./...
cd ..\ui
npm ci
npm test -- --run
npm run build
cd ..
docker build -t jaewon-k9s:0.1.2 .
docker extension validate jaewon-k9s:0.1.2
```

Publishing a `v*` release tag triggers GitHub Actions to publish Linux amd64/arm64 images to `ghcr.io/<owner>/jaewon-k9s`. GitHub Actions must have package write permission.

## Creator and license

Improved and distributed for free by **jaewon**, a developer from South Korea. Installation and use are free. The source is licensed under the [MIT License](LICENSE). File requests and bug reports in [GitHub Issues](https://github.com/david365-lee/jaewon-k9s/issues).

Jaewon K9s uses the Docker Desktop Extensions SDK and separately maintained K9s and ttyd software. Docker, Kubernetes, K9s, and related marks remain the property of their respective owners.
