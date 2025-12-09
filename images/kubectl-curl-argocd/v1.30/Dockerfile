FROM bitnamilegacy/kubectl:1.30
ARG ARGOCD_VERSION=v2.13.0

USER 0

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl; \
    rm -rf /var/lib/apt/lists/*; \
    curl -sSL -o /usr/local/bin/argocd \
      "https://github.com/argoproj/argo-cd/releases/download/${ARGOCD_VERSION}/argocd-linux-amd64"; \
    chmod +x /usr/local/bin/argocd; \
    argocd version --client || true

USER 1001
