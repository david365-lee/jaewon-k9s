# VS Code 用 Jaewon K9s

**Jaewon K9s** は、ローカルにインストールされた K9s を VS Code の統合ターミナルで起動する無料拡張機能です。起動前にローカルまたはリモートの Kubernetes コンテキストを選択できます。親ディレクトリにある Docker Desktop 拡張機能とは別製品です。

[한국어](README.md) · [English](README.en.md) · [简体中文](README.zh-CN.md) · [Marketplace 掲載説明](docs/marketplace-description.ja.md)

韓国の開発者 **jaewon** が改善し、無料で配布しています。

## 主な機能

- ローカル、リモート/その他、またはすべての Kubernetes コンテキストを選択できます。
- ホストの `kubectl` でコンテキストを検出し、一般的なローカル名とループバック API アドレスをローカルとして分類します。
- 選択したコンテキストを指定して、新しい統合ターミナルで `k9s --context <name>` を起動します。
- ターミナルの拡大、縮小、リセットコマンドを提供します。`terminal.integrated.mouseWheelZoom` により `Ctrl` + マウスホイールも既定で有効です。
- `kubectl` と K9s の実行ファイル、任意の kubeconfig、コマンドのタイムアウトを設定できます。
- コマンド名、設定名、プロンプトは韓国語、英語、日本語、簡体字中国語に対応します。

## 必要条件

- VS Code 1.90 以降（デスクトップ版）
- `kubectl` をインストールして `PATH` に追加するか、`jaewonK9s.kubectlPath` を設定
- K9s をローカルにインストールして `PATH` に追加するか、`jaewonK9s.k9sPath` を設定
- 使用するコンテキストを含む kubeconfig

K9s と kubectl は拡張機能に同梱されません。リモートクラスターには VS Code ホストからのネットワーク、VPN、認証プラグイン、認証情報が必要です。この VS Code 版に Docker Desktop は不要です。

## 使い方

1. 拡張機能をインストールし、VS Code と同じユーザー環境で `kubectl` と `k9s` が動作することを確認します。
2. コマンドパレットで **Jaewon K9s: Open K9s for a Kubernetes Context** を実行するか、`Ctrl+Alt+K`（macOS は `Cmd+Alt+K`）を押します。
3. **Local cluster**、**Remote / other context**、または **Show all contexts** を選びます。
4. コンテキストを選択します。選択したコンテキストを明示して、新しい統合ターミナルで K9s が開きます。
5. 必要に応じて **Jaewon K9s: Increase Terminal Zoom**、**Decrease Terminal Zoom**、**Reset Terminal Zoom** を実行します。

コンテキストの分類は接続確認ではありません。リモートに接続できない場合や、ローカルにも追加のネットワーク設定が必要な場合があります。分類が合わないときは **Show all contexts** を選択してください。

## ズーム動作

ズームコマンドは VS Code 組み込みの統合ターミナル文字サイズ変更操作を呼び出します。既定で `terminal.integrated.mouseWheelZoom` を `true` にし、`Ctrl` + マウスホイールで拡大・縮小できます。この設定は K9s のみでなく **すべての統合ターミナル** に適用されます。明示的なズームコマンドのみ使う場合は設定で無効にしてください。

## 設定

| 設定 | 既定値 | 説明 |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | コンテキスト一覧の取得に使用する実行ファイル。 |
| `jaewonK9s.k9sPath` | `k9s` | 統合ターミナルで起動する K9s 実行ファイル。 |
| `jaewonK9s.kubeconfig` | 空 | 任意の kubeconfig ファイル。設定するとコンテキスト検出に使用し、ターミナルの `KUBECONFIG` 環境変数として K9s に渡します。空欄の場合は標準の `KUBECONFIG` とユーザー既定設定を使用します。 |
| `jaewonK9s.commandTimeout` | `15000` | コンテキスト検出と K9s バージョン確認のタイムアウト（ミリ秒、1,000～120,000）。 |

## プライバシーとセキュリティ

コンテキスト検出は VS Code ホスト上で `kubectl config view -o json` を実行します。拡張機能が kubeconfig の内容をアップロード、保存、ログ出力することはありません。選択したコンテキスト名を引数として渡し、ホストの Kubernetes 認証設定を使ってローカル K9s を起動します。組織のポリシーに従って kubeconfig と認証情報を保護し、信頼できるクラスターにのみ接続してください。

## ビルド、テスト、パッケージ

Node.js 20 以降と npm を使用し、このディレクトリで実行します。

```powershell
npm ci
npm test
npm run package
```

`jaewon-k9s-0.1.0.vsix` が作成されます。次のコマンドでローカルにインストールできます。

```powershell
code --install-extension jaewon-k9s-0.1.0.vsix
```

VS Code パッケージのアイコンは透明背景の 128×128 PNG [`icon.png`](icon.png) です。編集用ベクターソースは [`icon.svg`](icon.svg) で、同じ PNG を拡張機能の Marketplace 掲載画像にも使用できます。

## Marketplace 公開の準備

**公開はまだ実施していません。** 公開前に以下を確認してください。

1. Marketplace の発行者 ID `jaewon-lee` がプロジェクト管理者のものか確認し、Visual Studio Marketplace 管理ポータルで発行者を作成または確認します。
2. manifest、各言語のメタデータ、アイコン、翻訳 README、および `docs/marketplace-description.<locale>.md` の該当言語の説明を確認します。
3. 上記の手順で VSIX をビルドしてテストします。出力名を指定する場合は `npx @vscode/vsce package --out jaewon-k9s-0.1.0.vsix` を実行します。
4. Marketplace の Personal Access Token は必要最小限の **Marketplace (Manage)** スコープで作成して安全に保管します。リポジトリや設定に保存しないでください。
5. 以下のセキュリティ注意事項を解消し、依存関係全体の監査に合格してから `npx @vscode/vsce login jaewon-lee` で認証します。管理者がバージョンと掲載内容を確認した後にのみ `npx @vscode/vsce publish` を実行してください。

アイコンとローカライズされた拡張メタデータは manifest とパッケージに含めています。Marketplace への公開は管理者による明示的な操作として残しています。

**セキュリティ注意事項:** 現在の `npm audit` では、VSCE の開発用間接依存である `@azure/msal-node` に重大度 high の勧告が報告されています（[GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5)）。このツールは VSIX に含まれず、`npm audit --omit=dev` は脆弱性 0 件で、VSIX のパッケージ作成も確認済みです。ただし発行者認証に影響する可能性があるため、互換性のある上流修正版が提供され、全体監査に合格するまで `vsce login` または `vsce publish` を実行しないでください。

## ライセンスとクレジット

拡張機能のソースコードは [MIT License](LICENSE) で公開しています。韓国の開発者 **jaewon** が改善し、無料で配布しています。K9s と Kubernetes は別プロジェクトであり、それぞれの名称、商標、ライセンスに従います。この拡張機能にソフトウェアは同梱されません。
