FROM dockerhub-proxy.infra.internal.daymarket.uz/bitnamilegacy/kubectl:1.30

USER 0

RUN apt-get update \
 && apt-get install -y curl \
 && rm -rf /var/lib/apt/lists/*

USER 1001