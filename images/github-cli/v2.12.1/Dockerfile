FROM debian:buster-slim

ENV GITHUB_CLI_VERSION="2.12.1"

RUN set -ex; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      git; \
    rm -rf /var/lib/apt/lists/*

RUN set -ex; \
    curl -L "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_checksums.txt" -o checksums.txt; \
    curl -OL "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_linux_amd64.deb"; \
    shasum --ignore-missing -a 512 -c checksums.txt; \
    dpkg -i "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb"; \
    rm -rf "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb"

CMD ["gh", "--version"]