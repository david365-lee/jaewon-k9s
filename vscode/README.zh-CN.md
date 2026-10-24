# Jaewon K9s for VS Code

**Jaewon K9s** 是一款免费的 VS Code 扩展，可在集成终端中启动本机安装的 K9s。启动前可选择本地或远程 Kubernetes 上下文。它与上级目录中的 Docker Desktop 扩展是两个独立产品。

[한국어](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.md) · [English](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.en.md) · [日本語](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.ja.md) · [Marketplace 上架说明](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/docs/marketplace-description.zh-CN.md)

本项目由韩国开发者 **jaewon** 改进并免费发布。

## 功能

- 在一个可搜索的列表中查找并选择本地或远程 Kubernetes 上下文。
- 列表显示本地/远程类型、当前上下文、集群和 API 地址。
- 在新的集成终端中使用 `k9s --context <name>` 启动选定上下文。
- 提供终端放大、缩小和重置命令。默认通过 `terminal.integrated.mouseWheelZoom` 启用 `Ctrl` + 鼠标滚轮缩放。
- 配置 `kubectl` 和 K9s 可执行文件路径、可选 kubeconfig 文件及命令超时。
- 命令、设置和提示支持韩语、英语、日语和简体中文。

## 要求

- VS Code 1.90 或更高版本（桌面版）
- 已安装且位于 `PATH` 的 `kubectl`，或设置 `jaewonK9s.kubectlPath`
- 本机已安装且位于 `PATH` 的 K9s，或设置 `jaewonK9s.k9sPath`
- 包含所需上下文的 kubeconfig

此扩展不捆绑 K9s 或 kubectl。连接远程集群需要 VS Code 主机具备可用的网络、VPN、认证插件和凭据。此 VS Code 版本不需要 Docker Desktop。

## 使用方法

1. 安装扩展，并确认 `kubectl` 和 `k9s` 在 VS Code 使用的同一用户环境中可正常运行。
2. 从命令面板运行 **Jaewon K9s: Open K9s for a Kubernetes Context**，或按 `Ctrl+Alt+K`（macOS 为 `Cmd+Alt+K`）。
3. 在可搜索列表中选择上下文。每个条目会显示本地/远程类型、当前上下文、集群和 API 地址。
4. K9s 会在新的集成终端中打开，并明确使用所选上下文。
5. 根据需要运行 **Jaewon K9s: Increase Terminal Zoom**、**Decrease Terminal Zoom** 或 **Reset Terminal Zoom**。

## Windows 边框、颜色与输入提示图标

0.1.7 整理了在韩语 Windows 环境中验证的 K9s 边框缺失与颜色受限问题修复。

- 在 Windows 上启动 K9s 前，将控制台输入和输出设置为 UTF-8（65001）。
- 设置 `RUNEWIDTH_EASTASIAN=0`，将边框字符按单个单元格计算，与 VS Code 终端保持一致。
- 默认使用全彩输出。仅在需要旧式16色输出时启用 `jaewonK9s.windowsConsoleCompatibility`。
- 关闭已有 K9s 终端并通过 `Ctrl+Alt+K` 重新启动。其他扩展或手动运行的 `k9s` 不会自动使用此扩展的启动设置。

`:` 命令输入栏中的小狗和 `/` 搜索栏中的贵宾犬是 K9s 内置图标。如需隐藏，请运行 `k9s info` 确认配置文件位置，将以下值合并到现有 `config.yaml` 的 `k9s.ui` 下，再重新启动 K9s。请保留其他配置。这是 K9s 自身的选项，扩展不会自动修改用户的 K9s 配置文件。

```yaml
k9s:
  ui:
    noIcons: true
```

## 缩放行为

缩放命令调用 VS Code 内置的集成终端字体缩放操作。默认将 `terminal.integrated.mouseWheelZoom` 设为 `true`，以支持 `Ctrl` + 鼠标滚轮。该设置作用于**所有集成终端**，而不仅是 K9s。如只想使用显式缩放命令，可在设置中关闭。

## 设置

| 设置 | 默认值 | 说明 |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | 用于列出上下文的 `kubectl` 可执行文件。 |
| `jaewonK9s.k9sPath` | `k9s` | 在集成终端中启动的 K9s 可执行文件。 |
| `jaewonK9s.kubeconfig` | 空 | 可选 kubeconfig 文件。设置后用于发现上下文，并通过终端 `KUBECONFIG` 环境变量传递给 K9s。留空时使用标准 `KUBECONFIG` 和用户默认配置。 |
| `jaewonK9s.commandTimeout` | `15000` | 上下文发现和 K9s 版本检查超时时间（毫秒，1,000–120,000）。 |
| `jaewonK9s.windowsConsoleCompatibility` | `false` | 可选的 Windows 旧式16色输出。默认全彩；更改仅适用于新启动的 K9s 终端。 |

## 隐私与安全

上下文发现会在 VS Code 主机上运行 `kubectl config view -o json`。扩展不会上传、持久化或记录 kubeconfig 内容。扩展仅将选定上下文作为参数传递，并由本机 K9s 使用主机 Kubernetes 认证配置。请按组织策略保护 kubeconfig 和凭据，并且只连接可信集群。

## 构建、测试和打包

需要 Node.js 20 或更高版本和 npm。在此目录运行：

```powershell
npm ci
npm test
npm run package
```

命令将生成 `jaewon-k9s-0.1.8.vsix`。可使用以下命令本地安装：

```powershell
code --install-extension jaewon-k9s-0.1.8.vsix
```

VS Code 包使用透明背景的 128×128 PNG [`icon.png`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.png) 作为图标；可编辑的矢量源文件是 [`icon.svg`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.svg)。同一 PNG 也可用于扩展 Marketplace 页面。

## 更新 Marketplace 扩展

通过发布者管理页面更新现有 Marketplace 扩展：

1. 检查 manifest、本地化元数据、图标、翻译后的 README，以及 `docs/marketplace-description.<locale>.md`。
2. 构建并测试 VSIX。若要指定文件名，请运行 `npx @vscode/vsce package --out jaewon-k9s-0.1.8.vsix`。
3. 在 Visual Studio Marketplace 发布者管理页面中选择 **Jaewon K9s → More Actions → Update**，然后上传 VSIX。

请更新现有的 `jaewon-k9s` 扩展，而不是创建新扩展。图标和本地化扩展元数据已包含在 manifest 和包中。

**安全提示：** VSCE 的开发期传递依赖 `@azure/msal-node` 曾报告高危安全公告（[GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5)），该工具不会打包进 VSIX。不要将发布 PAT 存入仓库或项目设置；在确认上游兼容修复并通过完整审计前，请避免使用 VSCE CLI 登录。可通过已授权的 Marketplace 浏览器会话更新现有扩展。

## 许可证与致谢

扩展源代码采用 [MIT License](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/LICENSE)。本项目由韩国开发者 **jaewon** 改进并免费发布。K9s 和 Kubernetes 是独立项目，各自的名称、商标和许可证仍归其所有者所有；本扩展不捆绑其软件。
