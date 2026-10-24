# VS Code 用 Jaewon K9s

**Jaewon K9s** は、ローカルにインストールされた K9s を VS Code の統合ターミナルで起動する無料拡張機能です。起動前にローカルまたはリモートの Kubernetes コンテキストを選択できます。親ディレクトリにある Docker Desktop 拡張機能とは別製品です。

[한국어](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.md) · [English](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.en.md) · [简体中文](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.zh-CN.md) · [Marketplace 掲載説明](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/docs/marketplace-description.ja.md)

韓国の開発者 **jaewon** が改善し、無料で配布しています。

## 主な機能

- ローカルとリモートの Kubernetes コンテキストを1つの一覧から検索・選択できます。
- 一覧にはローカル/リモートの種別、現在のコンテキスト、クラスター、API アドレスが表示されます。
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
3. 検索可能な一覧からコンテキストを選択します。各項目にローカル/リモートの種別、現在のコンテキスト、クラスター、API アドレスが表示されます。
4. 選択したコンテキストを明示して、新しい統合ターミナルで K9s が開きます。
5. 必要に応じて **Jaewon K9s: Increase Terminal Zoom**、**Decrease Terminal Zoom**、**Reset Terminal Zoom** を実行します。

## Windows の罫線・色と入力欄のアイコン

0.1.7 は韓国語 Windows で確認された K9s の罫線欠落と色数制限への修正をまとめたリリースです。

- Windows で K9s を起動する前に、コンソールの入出力を UTF-8（65001）に設定します。
- `RUNEWIDTH_EASTASIAN=0` により罫線文字を VS Code ターミナルと同じ1セル幅として扱います。
- 既定でフルカラーを使用します。従来の16色出力が必要な場合のみ `jaewonK9s.windowsConsoleCompatibility` を `true` にします。
- 既存の K9s ターミナルを終了し、`Ctrl+Alt+K` から新しく起動してください。他の拡張機能や手動起動の `k9s` には、この起動設定は自動適用されません。

`:` のコマンド入力欄に表示される犬と `/` の検索欄のプードルは K9s 標準のアイコンです。非表示にするには `k9s info` で設定ファイルの場所を確認し、既存の `config.yaml` の `k9s.ui` に次の値を追加して K9s を再起動します。他の設定は保持してください。これは K9s 自体の設定であり、拡張機能はユーザーの設定ファイルを自動変更しません。

```yaml
k9s:
  ui:
    noIcons: true
```

## ズーム動作

ズームコマンドは VS Code 組み込みの統合ターミナル文字サイズ変更操作を呼び出します。既定で `terminal.integrated.mouseWheelZoom` を `true` にし、`Ctrl` + マウスホイールで拡大・縮小できます。この設定は K9s のみでなく **すべての統合ターミナル** に適用されます。明示的なズームコマンドのみ使う場合は設定で無効にしてください。

## 設定

| 設定 | 既定値 | 説明 |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | コンテキスト一覧の取得に使用する実行ファイル。 |
| `jaewonK9s.k9sPath` | `k9s` | 統合ターミナルで起動する K9s 実行ファイル。 |
| `jaewonK9s.kubeconfig` | 空 | 任意の kubeconfig ファイル。設定するとコンテキスト検出に使用し、ターミナルの `KUBECONFIG` 環境変数として K9s に渡します。空欄の場合は標準の `KUBECONFIG` とユーザー既定設定を使用します。 |
| `jaewonK9s.commandTimeout` | `15000` | コンテキスト検出と K9s バージョン確認のタイムアウト（ミリ秒、1,000～120,000）。 |
| `jaewonK9s.windowsConsoleCompatibility` | `false` | Windows 専用の任意の16色互換出力。既定はフルカラーで、新しい K9s ターミナルに適用されます。 |

## プライバシーとセキュリティ

コンテキスト検出は VS Code ホスト上で `kubectl config view -o json` を実行します。拡張機能が kubeconfig の内容をアップロード、保存、ログ出力することはありません。選択したコンテキスト名を引数として渡し、ホストの Kubernetes 認証設定を使ってローカル K9s を起動します。組織のポリシーに従って kubeconfig と認証情報を保護し、信頼できるクラスターにのみ接続してください。

## ビルド、テスト、パッケージ

Node.js 20 以降と npm を使用し、このディレクトリで実行します。

```powershell
npm ci
npm test
npm run package
```

`jaewon-k9s-0.1.7.vsix` が作成されます。次のコマンドでローカルにインストールできます。

```powershell
code --install-extension jaewon-k9s-0.1.7.vsix
```

VS Code パッケージのアイコンは透明背景の 128×128 PNG [`icon.png`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.png) です。編集用ベクターソースは [`icon.svg`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.svg) で、同じ PNG を拡張機能の Marketplace 掲載画像にも使用できます。

## Marketplace の更新

既存の Marketplace 掲載を発行者管理ページから更新します。

1. manifest、各言語のメタデータ、アイコン、翻訳 README、および `docs/marketplace-description.<locale>.md` を確認します。
2. VSIX をビルドしてテストします。出力名を指定する場合は `npx @vscode/vsce package --out jaewon-k9s-0.1.7.vsix` を実行します。
3. Visual Studio Marketplace 発行者管理ページで **Jaewon K9s → More Actions → Update** を選び、VSIX をアップロードします。

新しい拡張を作成せず、既存の `jaewon-k9s` 掲載を更新してください。アイコンとローカライズされた拡張メタデータは manifest とパッケージに含まれます。

**セキュリティ注意事項:** VSCE の開発用間接依存 `@azure/msal-node` には重大度 high の勧告が報告されたことがあります（[GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5)）。このツールは VSIX に含まれません。公開用 PAT をリポジトリや設定に保存せず、互換性のある上流修正と全体監査を確認するまでは VSCE CLI ログインを避けてください。承認済み Marketplace ブラウザーセッションから既存拡張を更新できます。

## ライセンスとクレジット

拡張機能のソースコードは [MIT License](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/LICENSE) で公開しています。韓国の開発者 **jaewon** が改善し、無料で配布しています。K9s と Kubernetes は別プロジェクトであり、それぞれの名称、商標、ライセンスに従います。この拡張機能にソフトウェアは同梱されません。
