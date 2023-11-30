FROM debian:buster-slim

ENV GITHUB_CLI_VERSION="2.39.2"

RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates=20200601~deb10u2 \
    curl=7.64.0-4+deb10u2 \
    git=1:2.20.1-2+deb10u3 \
    python3=3.7.3-1 \
    python3-pip=18.1-5 \
    python3-termcolor=1.1.0-2 \
    python3-setuptools=40.8.0-1 && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir "commitizen==3.12"

RUN set -ex && \
    curl -L "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_checksums.txt" -o checksums.txt && \
    curl -OL "https://github.com/cli/cli/releases/download/v${GITHUB_CLI_VERSION}/gh_${GITHUB_CLI_VERSION}_linux_amd64.deb" && \
    shasum --ignore-missing -a 512 -c checksums.txt && \
    dpkg -i "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb" && \
    rm -rf "gh_${GITHUB_CLI_VERSION}_linux_amd64.deb"

CMD ["gh", "--version"]
