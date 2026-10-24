# Jaewon K9s

**这是一款免费的 Docker Desktop 扩展，可选择本地或远程 Kubernetes 上下文并打开 K9s。** 韩国开发者 **jaewon** 独立改进并免费发布本项目。源代码采用 MIT 许可证。

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [VS Code 扩展](vscode/README.zh-CN.md) · [REA 分析记录](docs/reverse-engineering.md)

## 主要功能

| 功能 | 说明 |
| --- | --- |
| 本地集群 | 从主机 kubeconfig 中选择 Docker Desktop、Kind、Minikube 等本地上下文。 |
| 远程集群 | 选择主机 `kubectl` kubeconfig 中登记的其他上下文。Docker Desktop 容器也必须能够访问相应 VPN、防火墙、认证和路由。 |
| 统一上下文选择 | 在同一列表中搜索并选择本地或远程上下文，可按名称或 API 地址搜索。 |
| K9s 终端 | 明确使用所选上下文启动 K9s，不会修改主机 kubeconfig。重新连接会启动新的终端会话。 |
| 缩放控制 | 可使用 `−`、`+`、重置按钮，或 `Ctrl/Cmd + +`、`Ctrl/Cmd + -`、`Ctrl/Cmd + 0`。缩放值保存在浏览器本地存储中。 |
| 本地 API 路由 | 仅在扩展副本中将 `localhost`、`127.0.0.1`、`::1` 改为 `host.docker.internal`，并保留 TLS 服务器名称验证。 |
| 认证提示 | 提示需要在容器中额外配置的 `exec` 插件、主机 token 文件或代理等。 |

VS Code **0.1.7** 通过 UTF-8 与显式字符宽度修复韩语 Windows 上的边框缺失，并默认启用全彩输出。输入提示图标设置请参阅 [VS Code 指南](vscode/README.zh-CN.md)。

## REA 分析

我们使用 REA 对提供的 Docker Desktop k9s 扩展 React UI 进行了静态分析。原 UI 通过主机 `kubectl` 读取固定的 `docker-desktop` 上下文，将 kubeconfig 发送给扩展 VM 服务，并通过 iframe 显示 `http://localhost:35781` 终端。在所选分析源码中未发现上下文选择和 UI 缩放控制。

此次仅进行静态分析，没有运行应用；清单中的部分文件不在分析范围内。Evidence ID、输入 SHA-256、范围及限制请参阅[详细分析记录](docs/reverse-engineering.md)。本项目不会重新分发上游实现文件或图片。

## 要求

- Docker Desktop 4.8 或更高版本，并启用 Docker Extensions
- Kubernetes 集群正在运行，主机 `kubectl` 可以读取 kubeconfig 上下文
- Docker Desktop 扩展容器可以通过网络访问远程 API 地址

如果 AWS/GCP/Azure 等 `exec` 认证插件的可执行文件或登录环境未安装在终端容器中，认证可能失败。`kubectl config view --raw --flatten` 会将认证数据复制到扩展共享卷。请仅连接可信上下文。

## 安装

### 从 GitHub Container Registry 安装

使用以下命令安装最新发行镜像：

```powershell
docker extension install ghcr.io/david365-lee/jaewon-k9s:0.1.2
```

也可使用 `latest` 标签安装最新已发布镜像。

### 本地构建并安装

```powershell
docker build -t jaewon-k9s:0.1.2 .
docker extension validate jaewon-k9s:0.1.2
docker extension install jaewon-k9s:0.1.2
```

终端默认绑定 `127.0.0.1:35782`，与现有 k9s 扩展的 `35781` 分开。如果端口已占用，请修改 `docker-compose.yaml` 中的 `JAEWON_K9S_PORT` 默认值并重新构建。

## 使用

1. 在 Docker Desktop 的 **Extensions** 中打开 **Jaewon K9s**。
2. 按上下文名称或 API 地址搜索并选择。所有本地和远程上下文都在同一列表中。
3. 选择 **Open K9s** 启动。重新连接会创建新的 K9s 终端会话。
4. 使用缩放按钮或 Ctrl/Cmd 快捷键调整终端文字大小。

## 连接与安全

- 使用 `kubectl config view -o json` 发现上下文。只有用户选择 **Connect** 后，才读取选定上下文的 kubeconfig。
- kubeconfig 以原子方式保存到扩展共享卷，权限为 `0600`。无效 JSON、不完整配置和超过 4 MiB 的负载会被拒绝。
- 不会将 kubeconfig 内容写入浏览器本地存储、日志或仓库。UI 仅持久化选定的上下文名称和缩放值。
- 主机 kubeconfig 只读。localhost 地址转换仅针对传入容器的副本。
- 不会禁用 TLS 验证；改写 API 地址时保留或设置原 TLS 服务器名称。
- 远程连接需要 Docker Desktop VPN、DNS 和路由支持。`exec`、`tokenFile`、旧版 auth-provider 和 proxy 可能还需要容器内工具或凭据。
- 镜像包含 K9s v0.51.0、ttyd v1.7.7 和 kubectl v1.36.1。K9s 发布压缩包使用固定 SHA-256 校验。组件许可证记录在 [Third-party notices](THIRD-PARTY-NOTICES.md)，并包含于镜像 `/licenses/`。

## 开发与测试

要求：Docker Desktop、Docker CLI/Buildx、Go 1.23+、Node.js 22+ 和 npm。

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

发布 `v*` 标签会触发 GitHub Actions，将 Linux amd64/arm64 镜像发布到 `ghcr.io/<owner>/jaewon-k9s`。GitHub Actions 需要软件包写入权限。

## 开发者与许可证

本项目由韩国开发者 **jaewon** 改进并免费发布。安装和使用均免费，源代码采用 [MIT License](LICENSE)。欢迎通过 [GitHub Issues](https://github.com/david365-lee/jaewon-k9s/issues) 提交问题和建议。

Jaewon K9s 使用 Docker Desktop Extensions SDK，以及独立维护的 K9s 和 ttyd。Docker、Kubernetes、K9s 等名称和商标归各自所有者所有。
