FROM --platform=$BUILDPLATFORM golang:1.24-alpine AS backend-builder
ARG TARGETOS
ARG TARGETARCH
WORKDIR /src
COPY backend/ ./backend/
WORKDIR /src/backend
RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -trimpath -ldflags="-s -w" -o /service .

FROM --platform=$BUILDPLATFORM node:22-alpine AS ui-builder
WORKDIR /ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM alpine:3.22
ARG TARGETARCH
ARG KUBECTL_VERSION=v1.36.1
ARG K9S_VERSION=v0.51.0
RUN set -eux; \
    apk add --no-cache ca-certificates curl tar ttyd; \
    mkdir -p /root/.kube /linux /darwin /windows /licenses /tmp/k9s; \
    case "${TARGETARCH}" in \
      amd64) K9S_SHA256=c3752ad51a5a4015a113819c4eeb6e55a4d0e4b8e652494797532f6fc8161dd7 ;; \
      arm64) K9S_SHA256=3ee05c82e5f9198928a4e86133608ba6a2c10a2244d6a7789e820f78319d640c ;; \
      *) echo "Unsupported target architecture: ${TARGETARCH}" >&2; exit 1 ;; \
    esac; \
    curl -fsSL "https://github.com/derailed/k9s/releases/download/${K9S_VERSION}/k9s_Linux_${TARGETARCH}.tar.gz" -o /tmp/k9s.tar.gz; \
    echo "${K9S_SHA256}  /tmp/k9s.tar.gz" | sha256sum -c -; \
    tar -xzf /tmp/k9s.tar.gz -C /tmp/k9s; \
    install -m 0755 /tmp/k9s/k9s /usr/local/bin/k9s; \
    cp /tmp/k9s/LICENSE /licenses/k9s-LICENSE; \
    curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/${TARGETARCH}/kubectl" -o /linux/kubectl; \
    curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/darwin/${TARGETARCH}/kubectl" -o /darwin/kubectl; \
    curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/windows/${TARGETARCH}/kubectl.exe" -o /windows/kubectl.exe; \
    curl -fsSL "https://raw.githubusercontent.com/kubernetes/kubernetes/${KUBECTL_VERSION}/LICENSE" -o /licenses/kubectl-LICENSE; \
    chmod 0755 /linux/kubectl /darwin/kubectl

LABEL org.opencontainers.image.title="Jaewon K9s" \
    org.opencontainers.image.description="Free Docker Desktop K9s extension with local and remote Kubernetes context selection and terminal zoom controls." \
    org.opencontainers.image.vendor="Jaewon" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="0.1.0" \
    org.opencontainers.image.source="https://github.com/david365-lee/jaewon-k9s" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/david365-lee/jaewon-k9s/main/jaewon-k9s.svg" \
    com.docker.desktop.extension.api.version=">= 0.2.3" \
    com.docker.extension.detailed-description="Jaewon K9s is a free Docker Desktop extension by Jaewon, a developer from South Korea. Select the Docker Desktop local Kubernetes cluster or another context from the host kubeconfig, connect it to K9s, and adjust the terminal zoom with accessible controls." \
    com.docker.extension.publisher-url="https://github.com/david365-lee" \
    com.docker.extension.additional-urls="[{\"title\":\"Documentation\",\"url\":\"https://github.com/david365-lee/jaewon-k9s\"}]" \
    com.docker.extension.screenshots="[]" \
    com.docker.extension.categories="kubernetes,utility-tools" \
    com.docker.extension.changelog="0.1.0: local and remote context selection, safe loopback routing, terminal zoom controls, and K9s v0.51.0."

COPY metadata.json jaewon-k9s.svg docker-compose.yaml /
COPY third-party/ttyd-LICENSE /licenses/ttyd-LICENSE
COPY --from=backend-builder /service /service
COPY --from=ui-builder /ui/dist /ui

ENV KUBECONFIG=/root/.kube/config
CMD ["/service", "-socket", "/run/guest-services/jaewon-k9s.sock"]
