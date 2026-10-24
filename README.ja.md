# Jaewon K9s

**ローカルまたはリモートの Kubernetes コンテキストを選択し、K9s を開く無料の Docker Desktop 拡張機能です。** 韓国の開発者 **jaewon** が独自に改善し、無料で配布しています。ソースコードは MIT ライセンスです。

[한국어](README.md) · [English](README.en.md) · [简体中文](README.zh-CN.md) · [VS Code 拡張](vscode/README.ja.md) · [REA 分析記録](docs/reverse-engineering.md)

## 主な機能

| 機能 | 説明 |
| --- | --- |
| ローカルクラスター | ホストの kubeconfig から Docker Desktop、Kind、Minikube などのローカルコンテキストを選択します。 |
| リモートクラスター | ホスト `kubectl` の kubeconfig に登録されたリモートコンテキストを選択します。VPN、ファイアウォール、認証、ルーティングも Docker Desktop コンテナから利用可能である必要があります。 |
| コンテキスト選択 | ローカル・リモートをまとめた一覧から、名前や API アドレスで検索・選択できます。 |
| K9s ターミナル | 選択したコンテキストで K9s を明示的に起動し、ホストの kubeconfig は変更しません。再接続時は新しいターミナルセッションを開始します。 |
| ズーム操作 | `−`、`+`、リセットボタン、および `Ctrl/Cmd + +`、`Ctrl/Cmd + -`、`Ctrl/Cmd + 0` を使用できます。ズーム倍率はブラウザーのローカルストレージに保存されます。 |
| localhost 接続 | 拡張機能用のコピーに限り `localhost`、`127.0.0.1`、`::1` を `host.docker.internal` に置き換え、TLS サーバー名の検証を維持します。 |
| 認証に関する注意 | `exec` プラグイン、ホストの token ファイル、プロキシなど、コンテナ内で追加設定が必要な構成を案内します。 |

## REA による分析

提供された Docker Desktop k9s 拡張機能の React UI を REA で静的分析しました。既存 UI はホスト `kubectl` から固定の `docker-desktop` コンテキストを読み込み、拡張 VM サービスに送信して、`http://localhost:35781` のターミナルを iframe で表示します。分析対象のソースではコンテキスト選択と UI ズーム操作を確認できませんでした。

アプリを実行していない静的分析であり、一覧にあった一部ファイルは対象外です。Evidence ID、入力 SHA-256、調査範囲と制限は[詳細な分析記録](docs/reverse-engineering.md)を参照してください。上流の実装ファイルや画像は再配布していません。

## 必要条件

- Docker Desktop 4.8 以降と Docker Extensions の有効化
- Kubernetes クラスターが稼働し、ホスト `kubectl` の kubeconfig コンテキストを参照できること
- リモート API に Docker Desktop 拡張コンテナからネットワーク接続できること

AWS/GCP/Azure などの `exec` 認証プラグインは、実行ファイルやログイン要件がターミナルコンテナにない場合に動作しないことがあります。`kubectl config view --raw --flatten` は認証情報を拡張機能の共有ボリュームにコピーします。信頼できるコンテキストにのみ接続してください。

## インストール

### GitHub Container Registry から

最新リリースを次のコマンドでインストールします。

```powershell
docker extension install ghcr.io/david365-lee/jaewon-k9s:0.1.2
```

`latest` タグを指定すると、最新の公開イメージをインストールできます。

### ローカルでビルドしてインストール

```powershell
docker build -t jaewon-k9s:0.1.2 .
docker extension validate jaewon-k9s:0.1.2
docker extension install jaewon-k9s:0.1.2
```

ターミナルは既定で `127.0.0.1:35782` を使用します。既存の k9s 拡張機能が使う `35781` とは別のポートです。使用中の場合は `docker-compose.yaml` の `JAEWON_K9S_PORT` を変更して再ビルドしてください。

## 使い方

1. Docker Desktop の **Extensions** から **Jaewon K9s** を開きます。
2. 検索欄でコンテキスト名または API アドレスを検索し、一覧から選択します。ローカルとリモートは同じ一覧に表示されます。
3. **Open K9s** を押して起動します。再接続すると新しい K9s ターミナルセッションが始まります。
4. ズームボタンまたは Ctrl/Cmd ショートカットで文字サイズを調整します。

## 接続とセキュリティ

- コンテキスト一覧には `kubectl config view -o json` を使います。ユーザーが **Connect** を選んだ後にのみ、選択した kubeconfig を取得します。
- kubeconfig は拡張機能の共有ボリュームにモード `0600` で原子的に保存されます。不正な JSON、不完全な設定、4 MiB を超えるペイロードは拒否します。
- kubeconfig の内容をブラウザーのローカルストレージ、ログ、リポジトリには保存しません。UI が保存するのは選択したコンテキスト名とズーム倍率のみです。
- ホスト kubeconfig は読み取り専用です。localhost の書き換えはコンテナへ渡すコピーにのみ適用します。
- TLS 検証は無効化しません。API アドレスの変更時も元の TLS サーバー名を保持または設定します。
- リモート接続には Docker Desktop の VPN、DNS、ルーティングが必要です。`exec`、`tokenFile`、旧 auth-provider、proxy の各設定にはコンテナ内の追加ツールや認証情報が必要な場合があります。
- イメージには K9s v0.51.0、ttyd v1.7.7、kubectl v1.36.1 が含まれます。K9s のリリースアーカイブは固定 SHA-256 で検証し、各コンポーネントのライセンスをイメージ内 `/licenses/` に収録します。詳細は [Third-party notices](THIRD-PARTY-NOTICES.md) を参照してください。

## 開発とテスト

必要なツール: Docker Desktop、Docker CLI/Buildx、Go 1.23 以降、Node.js 22 以降、npm。

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

`v*` リリースタグを公開すると GitHub Actions が Linux amd64/arm64 イメージを `ghcr.io/<owner>/jaewon-k9s` に発行します。GitHub Actions にパッケージ書き込み権限が必要です。

## 開発者とライセンス

韓国の開発者 **jaewon** が改善し、無料で配布しています。インストールと利用は無料です。ソースコードは [MIT License](LICENSE) です。問題や要望は [GitHub Issues](https://github.com/david365-lee/jaewon-k9s/issues) へお寄せください。

Jaewon K9s は Docker Desktop Extensions SDK と、別途開発されている K9s および ttyd を利用します。Docker、Kubernetes、K9s などの名称・商標は各権利者に帰属します。
