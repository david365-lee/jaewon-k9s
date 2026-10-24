# Jaewon K9s

**Docker Desktop에서 로컬·원격 Kubernetes 컨텍스트를 선택해 K9s를 여는 무료 확장 프로그램**입니다. 한국의 개발자 **jaewon**이 독립적으로 개선해 무료로 배포합니다. 소스 코드는 MIT 라이선스입니다.

[English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-CN.md) · [REA 분석 기록](docs/reverse-engineering.md) · [변경 이력](CHANGELOG.md)

## VS Code 확장

Docker Desktop판과 별도로, 호스트의 `kubectl` 및 K9s를 사용해 VS Code 통합 터미널에서 로컬·원격 컨텍스트를 실행하는 확장도 제공합니다. 설치 요구 사항과 명령, 설정, 확대·축소, VS Code Marketplace 게시 준비 절차는 [VS Code 확장 README](vscode/README.md)를 참고하세요. [English](vscode/README.en.md) · [日本語](vscode/README.ja.md) · [简体中文](vscode/README.zh-CN.md)

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 로컬 클러스터 | 호스트 kubeconfig의 Docker Desktop, Kind, Minikube 등 로컬 컨텍스트를 선택합니다. |
| 원격 클러스터 | 호스트 `kubectl` kubeconfig에 등록된 원격 컨텍스트를 선택합니다. VPN·방화벽·인증 설정은 Docker Desktop 컨테이너에서도 접근 가능해야 합니다. |
| 컨텍스트 미리보기 | 컨텍스트 이름과 API 서버 주소를 표시하고 목록을 다시 불러옵니다. 분류가 맞지 않으면 전체 컨텍스트 표시 옵션을 사용합니다. |
| K9s 터미널 | 선택한 컨텍스트를 명시적으로 연결한 뒤 K9s를 엽니다. 호스트의 kubeconfig를 수정하지 않습니다. |
| 확대·축소 | `−`, `+`, `Reset` 버튼과 `Ctrl/Cmd + +`, `Ctrl/Cmd + -`, `Ctrl/Cmd + 0` 단축키를 지원합니다. 확대율은 브라우저 로컬 저장소에 저장됩니다. |
| 로컬 API 주소 보정 | 컨테이너에서 접근할 수 없는 `localhost`, `127.0.0.1`, `::1` API 주소를 복사본에서 `host.docker.internal`로 바꿉니다. TLS 검증을 끄지 않고 원래 호스트명을 TLS 서버 이름으로 보존합니다. |
| 인증 의존성 안내 | `exec` 플러그인, 호스트 token 파일, 프록시 등 컨테이너 내부 준비가 필요한 구성을 연결 후 안내합니다. |

## REA 기반 분석

제공된 Docker Desktop k9s 확장의 React UI를 REA 정적 분석으로 확인했습니다. 기존 UI는 호스트 `kubectl`에서 고정된 `docker-desktop` 컨텍스트의 kubeconfig를 읽어 확장 VM 서비스에 전달한 뒤, `http://localhost:35781` 터미널을 iframe으로 표시합니다. 컨텍스트 선택과 UI 줌 제어는 분석한 소스에서 확인되지 않았습니다.

분석은 앱을 실행하지 않은 정적 분석이며 일부 인벤토리 파일을 범위에서 제외했습니다. Evidence ID, 입력 SHA-256, 관찰 범위와 한계는 [REA 분석 기록](docs/reverse-engineering.md)에 상세히 기록했습니다. 원본 구현 파일과 이미지는 재배포하지 않습니다.

## 요구 사항

- Docker Desktop 4.8 이상 및 Docker Extensions 활성화
- Kubernetes 클러스터가 실행 중이며, 호스트에서 `kubectl` kubeconfig 컨텍스트를 조회할 수 있어야 합니다.
- 원격 클러스터는 Docker Desktop 확장 컨테이너에서 API 주소에 네트워크로 접근 가능해야 합니다.

AWS/GCP/Azure 등의 `exec` 인증 플러그인은 해당 실행 파일과 로그인 자격 증명이 터미널 컨테이너 안에 없으면 작동하지 않을 수 있습니다. `kubectl config view --raw --flatten`은 인증 자료를 확장 공유 볼륨으로 복사합니다. 연결은 신뢰하는 컨텍스트에 대해서만 수행하세요.

## 설치

### Docker Desktop Extension 이미지

릴리스 후 이미지는 GitHub Container Registry에서 배포하는 것을 목표로 합니다.

```powershell
docker extension install ghcr.io/david365-lee/jaewon-k9s:latest
```

프로젝트 저장소와 이미지 게시가 완료되기 전에는 위 주소를 사용할 수 없습니다. 이 작업에서는 저장소/레지스트리 게시를 위한 프로젝트 구성을 준비하며, 실제 외부 게시 상태는 별도로 확인해야 합니다.

### 로컬 빌드 및 설치

프로젝트 루트에서 실행합니다. 로컬 설치는 Docker Desktop에 별도 Jaewon K9s 확장을 추가하며 기존 k9s 확장을 제거하거나 변경하지 않습니다.

```powershell
docker build -t jaewon-k9s:0.1.0 .
docker extension validate jaewon-k9s:0.1.0
docker extension install jaewon-k9s:0.1.0
```

확장 터미널은 기본적으로 `127.0.0.1:35782`에 바인딩됩니다. 기존 k9s 확장은 `35781`을 사용합니다. 포트가 이미 사용 중이면 `docker-compose.yaml`의 `JAEWON_K9S_PORT` 기본값을 사용 가능한 로컬 포트로 바꾸고 이미지를 다시 빌드합니다.

## 사용 방법

1. Docker Desktop의 **Extensions**에서 **Jaewon K9s**를 엽니다.
2. **Connection type**에서 `Local cluster` 또는 `Remote / other context`를 선택합니다.
3. **Kubernetes context**에서 대상 컨텍스트를 선택합니다. 목록은 호스트의 kubeconfig에서 가져옵니다.
4. 분류가 예상과 다르면 **Show contexts from both groups**를 선택합니다.
5. **Connect**를 누릅니다. 새 컨텍스트를 적용할 때마다 이 단계를 다시 수행합니다.
6. `−`/`+`/`Reset` 버튼 또는 Ctrl/Cmd 단축키로 터미널 크기를 조정합니다.

로컬 주소가 `127.0.0.1` 또는 `localhost`인 클러스터는 컨테이너에서 호스트 게이트웨이(`host.docker.internal`)를 통해 접근합니다. 인증서 검증을 끄지 않습니다. 재연결 후 K9s 터미널을 새로 고쳐야 화면이 바뀌는 경우가 있습니다.

## 연결 및 보안 동작

- 확장은 컨텍스트 목록 확인에 `kubectl config view -o json`을 사용하고, 선택한 컨텍스트를 연결할 때만 `kubectl config view --raw --flatten --minify --context=<name> -o json`을 사용합니다.
- 선택한 kubeconfig는 Docker Desktop 확장 전용 볼륨에 원자적으로 기록되고 파일 권한은 `0600`으로 설정됩니다. 잘못된 JSON, 필수 kubeconfig 필드가 없는 값, 4 MiB 초과 입력은 거부합니다.
- UI는 kubeconfig를 `localStorage`, 로그 또는 프로젝트 파일에 저장하지 않습니다. 브라우저에는 선택한 컨텍스트 이름과 확대율만 저장됩니다.
- 원본 호스트 kubeconfig는 읽기 전용으로 사용합니다. loopback 주소 변환은 컨테이너에 전달되는 사본에만 적용합니다.
- `tls-server-name`을 유지·설정해 인증서 이름 검증을 보존합니다. `insecure-skip-tls-verify`를 설정하지 않습니다.
- 원격 API 연결은 Docker Desktop의 VPN·DNS·라우팅 정책에 따라 실패할 수 있습니다. kubeconfig의 `exec`, `tokenFile`, legacy auth-provider 및 proxy 설정은 추가 도구·자격 증명을 요구할 수 있으며 UI가 가능한 경우 경고합니다.
- K9s v0.51.0, ttyd v1.7.7, kubectl v1.36.1을 확장 이미지에 포함합니다. K9s 릴리스 바이너리는 고정된 SHA-256으로 확인하며, 각 구성 요소의 라이선스는 [Third-party notices](THIRD-PARTY-NOTICES.md)와 이미지의 `/licenses/`에 포함합니다.

## 프로젝트 구조

| 경로 | 내용 |
| --- | --- |
| `ui/src/App.tsx` | Docker Desktop UI, 컨텍스트 선택, 연결, 확대·축소 컨트롤 |
| `ui/src/kubeconfig.ts` | 컨텍스트 분류, 선택 kubeconfig 검증, loopback 주소 변환 |
| `backend/main.go` | 확장 VM Unix 소켓 서비스, kubeconfig 저장 |
| `backend/main_test.go` | API 응답·파일 권한·잘못된 입력 테스트 |
| `docker-compose.yaml` | 확장 서비스와 격리된 K9s 터미널 컨테이너 |
| `metadata.json` | Docker Desktop 확장 탭·서비스·호스트 kubectl 선언 |
| `docs/reverse-engineering.md` | REA Evidence, 관찰 사실, 개선점 및 분석 한계 |

## 개발과 테스트

필요한 도구는 Docker Desktop, Docker CLI/Buildx, Go 1.23 이상, Node.js 22 이상, npm입니다.

```powershell
cd backend
go test ./...
cd ..\ui
npm ci
npm test -- --run
npm run build
```

이미지 빌드와 Docker 확장 메타데이터 검증:

```powershell
cd ..
docker build -t jaewon-k9s:0.1.0 .
docker extension validate jaewon-k9s:0.1.0
```

릴리스 태그 `v*`를 게시하면 GitHub Actions가 `ghcr.io/<owner>/jaewon-k9s`에 Linux amd64/arm64 이미지를 게시하도록 구성되어 있습니다. 저장소에서 GitHub Actions의 패키지 쓰기 권한을 허용해야 합니다.

## 제작자 및 라이선스

한국의 개발자 **jaewon**이 무료로 개선·배포합니다. 설치와 사용은 무료이며, 소스 코드는 [MIT License](LICENSE)입니다. 문제 제안은 [GitHub Issues](https://github.com/david365-lee/jaewon-k9s/issues)에 등록할 수 있습니다.

Jaewon K9s는 Docker Desktop 확장 SDK와 별도로 유지되는 K9s·ttyd 소프트웨어를 사용합니다. Docker, Kubernetes, K9s 및 해당 구성 요소의 상표·저작권은 각 권리자에게 있습니다.
