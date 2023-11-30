FROM debian:buster-slim

ENV GITHUB_CLI_VERSION="2.39.2"

RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates=20200601~deb10u2 \
    curl=7.64.0-4+deb10u2 \
    git=1:2.20.1-2+deb10u3 && \
    rm -rf /var/lib/apt/lists/*

RUN set -ex && \
    curl -L "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_checksums.txt" -o checksums.txt && \
    curl -OL "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_linux_amd64.deb" && \
    shasum --ignore-missing -a 512 -c checksums.txt && \
    dpkg -i "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb" && \
    rm -rf "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb"

CMD ["gh", "--version"]
