# VS Code용 Jaewon K9s

**Jaewon K9s**는 로컬에 설치된 K9s를 VS Code 통합 터미널에서 실행하고, 실행 전에 로컬 또는 원격 Kubernetes 컨텍스트를 선택하는 무료 확장입니다. 상위 디렉터리의 Docker Desktop 확장과는 별도 제품입니다.

[English](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.en.md) · [日本語](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.ja.md) · [简体中文](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/README.zh-CN.md) · [Marketplace 상세 설명](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/docs/marketplace-description.ko.md)

한국의 개발자 **jaewon**이 개선하고 무료로 배포합니다.

## 주요 기능

- 로컬, 원격/기타, 전체 Kubernetes 컨텍스트 중에서 선택합니다.
- 호스트 `kubectl`로 컨텍스트를 조회하고, 일반적인 로컬 이름과 loopback API 주소를 로컬로 분류합니다.
- 선택한 컨텍스트를 지정해 새 통합 터미널에서 `k9s --context <name>`을 실행합니다.
- 터미널 확대·축소·초기화 명령을 제공합니다. `terminal.integrated.mouseWheelZoom` 기본값을 활성화해 `Ctrl`+마우스 휠 확대·축소도 지원합니다.
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
3. **로컬 클러스터**, **원격/기타 컨텍스트**, **모든 컨텍스트 보기** 중 하나를 선택합니다.
4. 컨텍스트를 선택합니다. 선택한 컨텍스트를 명시해 새 통합 터미널에서 K9s를 실행합니다.
5. 필요할 때 **Jaewon K9s: 터미널 확대**, **터미널 축소**, **터미널 확대 초기화** 명령을 사용합니다.

컨텍스트 그룹은 필터 편의를 위한 것이며 연결 가능성을 검사하지 않습니다. 원격 클러스터가 연결되지 않을 수 있고, 로컬 클러스터에도 추가 네트워크 설정이 필요할 수 있습니다. 분류가 예상과 다르면 **모든 컨텍스트 보기**를 선택하세요.

## 확대·축소 동작

확대·축소 명령은 VS Code 내장 통합 터미널 글꼴 확대·축소 기능을 사용합니다. 기본적으로 `terminal.integrated.mouseWheelZoom`을 `true`로 설정해 `Ctrl`+마우스 휠을 지원합니다. 이 설정은 K9s뿐 아니라 **모든 통합 터미널**에 적용됩니다. 명령을 통한 확대·축소만 사용하려면 VS Code 설정에서 비활성화하세요.

## 설정

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| `jaewonK9s.kubectlPath` | `kubectl` | 컨텍스트 목록을 조회할 `kubectl` 실행 파일입니다. |
| `jaewonK9s.k9sPath` | `k9s` | 통합 터미널에서 실행할 K9s 실행 파일입니다. |
| `jaewonK9s.kubeconfig` | 비어 있음 | 선택적 kubeconfig 파일입니다. 지정하면 컨텍스트 조회에 사용하고 터미널의 `KUBECONFIG` 환경 변수로 K9s에 전달합니다. 비워 두면 표준 `KUBECONFIG`와 사용자 기본 설정을 사용합니다. |
| `jaewonK9s.commandTimeout` | `15000` | 컨텍스트 조회와 K9s 버전 확인 제한 시간(밀리초, 1,000~120,000)입니다. |

## 개인정보 및 보안

컨텍스트 조회는 VS Code 호스트에서 `kubectl config view -o json`을 실행합니다. 확장은 kubeconfig 내용을 업로드·저장·로그 기록하지 않습니다. 선택한 컨텍스트 이름을 인자로 전달하고, 로컬 K9s가 호스트의 Kubernetes 인증 설정을 사용하도록 합니다. 조직 정책에 따라 kubeconfig와 자격 증명을 보호하고 신뢰할 수 있는 클러스터에만 연결하세요.

## 빌드, 테스트 및 패키징

Node.js 20 이상과 npm을 사용해 이 디렉터리에서 실행합니다.

```powershell
npm ci
npm test
npm run package
```

패키징 명령은 `jaewon-k9s-0.1.2.vsix`를 생성합니다. 로컬 설치 명령:

```powershell
code --install-extension jaewon-k9s-0.1.2.vsix
```

VS Code 패키지 아이콘은 투명 배경의 128×128 PNG인 [`icon.png`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.png)입니다. 편집 가능한 벡터 원본은 [`icon.svg`](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/icon.svg)이며, 같은 PNG를 Marketplace 확장 목록에도 사용할 수 있습니다.

## Marketplace 게시 준비

**실제 게시 작업은 아직 수행하지 않았습니다.** 게시 전 다음 사항을 확인하세요.

1. Marketplace 게시자 ID `jaewon-lee`가 프로젝트 관리자 소유인지 확인하고, Visual Studio Marketplace 관리 포털에서 게시자를 생성하거나 검증합니다.
2. manifest, 현지화된 이름과 설명, 아이콘, 번역 README 및 `docs/marketplace-description.<locale>.md`의 해당 언어별 상세 설명을 검토합니다.
3. 위 절차에 따라 VSIX를 빌드하고 테스트합니다. 출력 파일명을 지정하려면 `npx @vscode/vsce package --out jaewon-k9s-0.1.2.vsix`를 사용합니다.
4. 필요한 최소 권한인 **Marketplace (Manage)** 범위의 Personal Access Token을 만들고 안전하게 보관합니다. 저장소에 커밋하거나 프로젝트 설정에 넣지 마세요.
5. 아래 보안 유의사항을 해결하고 전체 의존성 감사를 통과한 뒤 `npx @vscode/vsce login jaewon-lee`로 인증합니다. 프로젝트 관리자가 버전과 목록 내용을 확인한 후에만 `npx @vscode/vsce publish`를 실행합니다.

아이콘과 현지화된 확장 메타데이터는 manifest와 패키지에 포함되어 있습니다. Marketplace 게시 자체는 관리자 확인 후 수동으로 수행하도록 남겨 두었습니다.

**보안 유의사항:** 현재 전체 `npm audit`에서 VSCE의 개발용 전이 의존성인 `@azure/msal-node`에 높은 심각도의 권고([GHSA-xcx6-jx8p-x3h5](https://github.com/advisories/GHSA-xcx6-jx8p-x3h5))가 보고됩니다. 이 도구는 VSIX에 포함되지 않으며 `npm audit --omit=dev` 결과는 취약점 0건이고 VSIX 패키징도 확인했습니다. 다만 게시자 인증에 영향을 줄 수 있으므로, 호환되는 상위 수정 버전이 제공되어 전체 감사가 통과하기 전까지 `vsce login` 또는 `vsce publish`를 실행하지 마세요.

## 라이선스 및 저작자

확장 소스는 [MIT License](https://github.com/david365-lee/jaewon-k9s/blob/main/vscode/LICENSE)로 제공됩니다. 한국의 개발자 **jaewon**이 개선하고 무료로 배포합니다. K9s와 Kubernetes는 별도 프로젝트이며 각 명칭, 상표, 라이선스를 유지합니다. 해당 프로그램은 이 확장에 포함되지 않습니다.
