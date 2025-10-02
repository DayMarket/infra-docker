FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl \
      ca-certificates \
      lsof \
      coreutils \
      util-linux && \
    rm -rf /var/lib/apt/lists/*
ARG KUBECTL_VERSION=v1.31.1
RUN curl -sSL -o /usr/local/bin/kubectl https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl && \
    chmod +x /usr/local/bin/kubectl
ENTRYPOINT ["kubectl"]
