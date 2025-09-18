# syntax=docker/dockerfile:1.7
ARG KUBECTL_VERSION=v1.31.1
ARG TARGETOS=linux
ARG TARGETARCH=amd64

# ===== stage: downloader =====
FROM alpine:3.20 AS downloader
ARG KUBECTL_VERSION
ARG TARGETOS
ARG TARGETARCH
RUN apk add --no-cache curl
# Скачаем бинарник и sha256
RUN curl -fsSLo /tmp/kubectl \
      "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/${TARGETOS}/${TARGETARCH}/kubectl" \
 && curl -fsSLo /tmp/kubectl.sha256 \
      "https://dl.k8s.io/${KUBECTL_VERSION}/bin/${TARGETOS}/${TARGETARCH}/kubectl.sha256" \
 && echo "$(cat /tmp/kubectl.sha256)  /tmp/kubectl" | sha256sum -c -

# ===== stage: runtime =====
FROM alpine:3.20

RUN apk add --no-cache ca-certificates bash
# Non-root пользователь с фиксированным uid/gid
RUN addgroup -g 1001 app && adduser -D -u 1001 -G app app
# Рабочая директория (удобно монтировать kubeconfig и т.д.)
WORKDIR /work
# Кладём kubectl
COPY --from=downloader /tmp/kubectl /usr/local/bin/kubectl
RUN chmod +x /usr/local/bin/kubectl

LABEL org.opencontainers.image.title="kubectl" \
      org.opencontainers.image.description="Minimal kubectl image (Alpine, non-root)" \
      org.opencontainers.image.source="https://kubernetes.io" \
      org.opencontainers.image.licenses="Apache-2.0"

# Non-root по умолчанию
USER 1001
ENTRYPOINT ["kubectl"]
