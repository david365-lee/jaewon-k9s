# VS Code용 Jaewon K9s

**Jaewon K9s**는 로컬에 설치된 K9s를 VS Code 통합 터미널에서 실행하고, 실행 전에 로컬 또는 원격 Kubernetes 컨텍스트를 선택하는 무료 확장입니다. 상위 디렉터리의 Docker Desktop 확장과는 별도 제품입니다.

[English](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.en.md) · [日本語](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.ja.md) · [简体中文](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.zh-CN.md) · [Marketplace 상세 설명](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/docs/marketplace-description.ko.md)

한국의 개발자 **jaewon**이 개선하고 무료로 배포합니다.

## 주요 기능

- 단일 검색 선택창에서 로컬·원격 Kubernetes 컨텍스트를 함께 검색하고 선택합니다.
- 목록에서 로컬/원격 유형, 현재 컨텍스트, 클러스터와 API 주소를 확인할 수 있습니다.
- 선택한 컨텍스트를 지정해 새 통합 터미널에서 `k9s --context <name>`을 실행합니다.
- K9s 사이드바의 정밀 확대·축소 영역에서 휠을 움직이면 글꼴 크기가 1px씩 바뀝니다. 작은 입력은 누적하고 빠른 연속 입력은 제한합니다. 숫자 직접 입력과 +/−, 초기화 버튼도 제공합니다. VS Code 기본 Ctrl+휠 확대는 기본값에서 껐습니다. 사용자 설정에서 `terminal.integrated.mouseWheelZoom`을 명시적으로 켰다면 직접 꺼 주세요. 크기 변경은 모든 통합 터미널에 적용됩니다.
- `kubectl` 및 K9s 실행 파일 경로, 선택적 kubeconfig 파일, 명령 시간 제한을 설정할 수 있습니다.
- 한국어, 영어, 일본어, 중국어 간체로 명령, 설정 및 프롬프트를 표시합니다.

## 요구 사항

- 데스크톱용 VS Code 1.90 이상
- `kubectl` 설치 및 `PATH` 등록 또는 `jaewonK9s.kubectlPath` 설정
- K9s 설치 및 `PATH` 등록 또는 `jaewonK9s.k9sPath` 설정
- 사용할 컨텍스트가 포함된 kubeconfig

확장 패키지에는 K9s와 kubectl이 포함되지 않습니다. 원격 클러스터 연결에는 VS Code 호스트의 네트워크, VPN, 인증 플러그인 및 자격 증명이 필요합니다. VS Code 버전은 Docker Desktop 없이 사용할 수 있습니다.

## 사용 방법

1. 확장을 설치하고 VS Code와 동일한 사용자 환경에서 `kubectl`과 `k9s`가 실행되는지 확인합니다.
2. 명령 팔레트에서 **Jaewon K9s: Kubernetes 컨텍스트에서 K9s 열기**를 실행하거나 `Ctrl+Alt+K`(macOS는 `Cmd+Alt+K`)를 누릅니다.
3. 검색 가능한 목록에서 컨텍스트를 선택합니다. 로컬·원격 구분, 현재 컨텍스트, 클러스터와 API 주소가 항목에 표시됩니다.
4. 선택한 컨텍스트를 명시해 새 통합 터미널에서 K9s를 실행합니다.
5. 필요할 때 **Jaewon K9s: 터미널 확대**, **터미널 축소**, **터미널 확대 초기화** 명령을 사용합니다.

## Windows 테두리·색상 및 명령 입력창

0.1.7은 한국어 Windows 환경에서 확인된 K9s 테두리 누락과 색상 제한 문제를 정리한 릴리스입니다.

- Windows에서 K9s 실행 전에 콘솔 입력·출력을 UTF-8(65001)로 설정합니다.
- `RUNEWIDTH_EASTASIAN=0`으로 테두리 문자를 VS Code 터미널과 같은 한 칸 폭으로 계산합니다.
- 전체 색상 출력을 기본으로 사용합니다. 16색 호환 출력은 `jaewonK9s.windowsConsoleCompatibility`를 `true`로 설정할 때만 적용합니다.
- 변경 사항은 기존 터미널을 종료하고 `Ctrl+Alt+K`로 새로 실행해야 적용됩니다. 다른 확장이나 수동 `k9s` 실행에는 이 확장의 실행 설정이 자동 적용되지 않습니다.

`:` 명령 입력창의 강아지와 `/` 검색창의 푸들 표시는 K9s 기본 아이콘입니다. 숨기려면 `k9s info`로 설정 파일 위치를 확인하고, 기존 `config.yaml`의 `k9s.ui` 아래에 다음 값을 병합한 뒤 K9s를 다시 실행하세요. 다른 설정을 덮어쓰지 마세요. 이 옵션은 K9s 자체 설정이며 확장이 사용자 설정 파일을 자동 수정하지는 않습니다.

```yaml
k9s:
  ui:
    noIcons: true
```

## 확대·축소 동작

K9s 사이드바의 정밀 확대·축소 영역에서 휠을 움직이면 글꼴 크기가 1px씩 바뀝니다. 작은 입력은 누적하고 빠른 연속 입력은 제한합니다. 숫자 직접 입력과 +/−, 초기화 버튼도 제공합니다. VS Code 기본 Ctrl+휠 확대는 기본값에서 껐습니다. 사용자 설정에서 `terminal.integrated.mouseWheelZoom`을 명시적으로 켰다면 직접 꺼 주세요. 크기 변경은 모든 통합 터미널에 적용됩니다.

## 설정

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | 컨텍스트 목록을 조회할 `kubectl` 실행 파일입니다. |
| `jaewonK9s.k9sPath` | `k9s` | 통합 터미널에서 실행할 K9s 실행 파일입니다. |
| `jaewonK9s.kubeconfig` | 비어 있음 | 선택적 kubeconfig 파일입니다. 지정하면 컨텍스트 조회에 사용하고 터미널의 `KUBECONFIG` 환경 변수로 K9s에 전달합니다. 비워 두면 표준 `KUBECONFIG`와 사용자 기본 설정을 사용합니다. |
| `jaewonK9s.commandTimeout` | `15000` | 컨텍스트 조회와 K9s 버전 확인 제한 시간(밀리초, 1,000~120,000)입니다. |
| `jaewonK9s.windowsConsoleCompatibility` | `false` | Windows에서만 사용하는 선택적 16색 호환 출력입니다. 기본값은 전체 색상이며 새 K9s 터미널에 적용됩니다. |

## 개인정보 및 보안

컨텍스트 조회는 VS Code 호스트에서 `kubectl config view -o json`을 실행합니다. 확장은 kubeconfig 내용을 업로드·저장·로그 기록하지 않습니다. 선택한 컨텍스트 이름을 인자로 전달하고, 로컬 K9s가 호스트의 Kubernetes 인증 설정을 사용하도록 합니다. 조직 정책에 따라 kubeconfig와 자격 증명을 보호하고 신뢰할 수 있는 클러스터에만 연결하세요.

## 빌드, 테스트 및 패키징

Node.js 20 이상과 npm을 사용해 이 디렉터리에서 실행합니다.

```powershell
npm ci
npm test
npm run package
```

패키징 명령은 `jaewon-k9s-0.1.9.vsix`를 생성합니다. 로컬 설치 명령:

```powershell
code --install-extension jaewon-k9s-0.1.9.vsix
```

VS Code 패키지 아이콘은 투명 배경의 128×128 PNG인 [`icon.png`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.png)입니다. 편집 가능한 벡터 원본은 [`icon.svg`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.svg)이며, 같은 PNG를 Marketplace 확장 목록에도 사용할 수 있습니다.

## Marketplace 업데이트

Marketplace에 공개된 확장은 게시자 관리 포털에서 업데이트할 수 있습니다.

1. manifest, 현지화된 이름과 설명, 아이콘, 번역 README 및 `docs/marketplace-description.<locale>.md`를 검토합니다.
2. VSIX를 빌드하고 테스트합니다. 필요하면 `npx @vscode/vsce package --out jaewon-k9s-0.1.9.vsix`로 출력 파일명을 지정합니다.
3. Visual Studio Marketplace의 게시자 관리 페이지에서 **Jaewon K9s → More Actions → Update**를 선택한 뒤 VSIX를 업로드합니다.

새 확장을 등록하는 대신 기존 `jaewon-k9s` 항목을 업데이트해야 합니다. 아이콘과 현지화된 확장 메타데이터는 manifest와 패키지에 포함됩니다.

**보안 유의사항:** VSCE의 개발용 전이 의존성인 `@azure/msal-node`에 높은 심각도의 권고([GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5))가 보고된 적이 있습니다. 이 도구는 VSIX에 포함되지 않습니다. 게시용 PAT를 저장소나 프로젝트 설정에 넣지 말고, 호환되는 상위 수정 버전과 전체 감사 결과를 확인하기 전에는 VSCE CLI 로그인을 사용하지 마세요. 승인된 Marketplace 브라우저 세션에서 기존 확장 업데이트를 수행할 수 있습니다.

## 라이선스 및 저작자

확장 소스는 [MIT License](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/LICENSE)로 제공됩니다. 한국의 개발자 **jaewon**이 개선하고 무료로 배포합니다. K9s와 Kubernetes는 별도 프로젝트이며 각 명칭, 상표, 라이선스를 유지합니다. 해당 프로그램은 이 확장에 포함되지 않습니다.
