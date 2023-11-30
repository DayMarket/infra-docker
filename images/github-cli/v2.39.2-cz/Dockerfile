FROM python:3.9.9-slim-buster

ENV GITHUB_CLI_VERSION="2.39.2"

# hadolint ignore=DL3008
RUN set -ex & \
    pip3 install --no-cache-dir "commitizen==3.12.0" && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    curl && \
    rm -rf /var/lib/apt/lists/* && \
    curl -L "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_checksums.txt" -o checksums.txt && \
    curl -OL "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_linux_amd64.deb" && \
    shasum --ignore-missing -a 512 -c checksums.txt && \
    dpkg -i "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb" && \
    rm -rf "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb"

CMD ["gh", "--version"]
