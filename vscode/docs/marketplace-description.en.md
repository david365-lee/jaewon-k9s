# Jaewon K9s — VS Code Marketplace description

Jaewon K9s is a free extension that launches K9s in the VS Code integrated terminal and lets you select a local or remote Kubernetes context first. It is independently improved and distributed for free by jaewon, a developer from South Korea.

## Features

- Quickly choose from kubeconfig contexts discovered by `kubectl`, grouped as local, remote/other, or all.
- Pass the selected context explicitly to K9s to avoid unintentionally using the default context.
- Use zoom-in, zoom-out, and reset commands, plus Ctrl+mouse-wheel zoom.
- Configure the kubectl/K9s executable paths and an optional kubeconfig file.
- Localized commands and settings for Korean, English, Japanese, and Simplified Chinese.

## Requirements

Requires VS Code 1.90 or later, locally installed `kubectl` and K9s, and the contexts you want to use. K9s and kubectl are not bundled. Remote connectivity depends on the host's network, VPN, authentication plugins, and credentials.

Ctrl+mouse-wheel zoom enables VS Code's `terminal.integrated.mouseWheelZoom` setting, which affects all integrated terminals—not only K9s.

## Privacy and security

Context discovery runs locally on the host. The extension does not upload or persist kubeconfig contents. It passes the selected context to K9s and relies on the user's local Kubernetes authentication configuration. Connect only to trusted clusters.

## Author and license

This extension is independently improved and shared for free by jaewon, a developer from South Korea, to make everyday Kubernetes work a little more convenient. You are welcome to use it for personal or company projects, and the MIT License lets you inspect, modify, and redistribute its source. The extension does not bundle K9s or represent the K9s project. K9s and Kubernetes trademarks and licenses remain with their respective owners.
