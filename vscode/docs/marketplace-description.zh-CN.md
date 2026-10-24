# Jaewon K9s — VS Code Marketplace 详细说明

Jaewon K9s 是一款免费的扩展，可在 VS Code 集成终端中启动 K9s，并在启动前选择本地或远程 Kubernetes 上下文。本项目由韩国开发者 jaewon 独立改进并免费发布。

## 功能

- 从 `kubectl` 发现的 kubeconfig 上下文中选择本地、远程/其他或全部上下文。
- 启动 K9s 时明确传入选定上下文，避免意外使用默认上下文。
- 提供放大、缩小、重置命令及 Ctrl+鼠标滚轮缩放。
- 配置 kubectl/K9s 可执行文件路径和可选 kubeconfig 文件。
- 命令和设置支持韩语、英语、日语和简体中文。

## 要求

需要 VS Code 1.90 或更高版本、主机本地安装的 `kubectl` 和 K9s，以及所需上下文。扩展不捆绑 K9s 或 kubectl。远程连接取决于主机网络、VPN、认证插件和凭据。

Ctrl+鼠标滚轮缩放会启用 VS Code 的 `terminal.integrated.mouseWheelZoom` 设置，该设置影响所有集成终端，而不仅是 K9s。

## 隐私与安全

上下文发现仅在主机本地执行。扩展不会上传或持久化 kubeconfig 内容。扩展将选定上下文传递给 K9s，并依赖用户本机 Kubernetes 认证配置。请仅连接可信集群。

## 作者与许可证

这款扩展由韩国开发者 jaewon 独立改进并免费分享，希望让日常 Kubernetes 工作更轻松一些。欢迎用于个人或公司项目；根据 MIT 许可证，您也可以查看、修改和重新分发源代码。本扩展不捆绑 K9s，也不代表 K9s 项目。K9s 和 Kubernetes 的商标及许可证归各自所有者所有。
