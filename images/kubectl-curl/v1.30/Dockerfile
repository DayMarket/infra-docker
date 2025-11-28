FROM dockerhub-proxy.infra.internal.daymarket.uz/bitnamilegacy/kubectl:1.30

USER 0

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl=7.88.1-10+deb12u5 \
 && rm -rf /var/lib/apt/lists/*


USER 1001