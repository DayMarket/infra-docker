FROM python:3.10.5-alpine3.16

WORKDIR /app

RUN apk add -t --no-cache \
    "alpine-sdk>=1.0-r1" \
    "curl>=7.83.1-r1" \
    "git>=2.36.1" \
    && pip install --no-cache-dir "commitizen==3.12" \
    && curl -Lo ./terraform-docs.tar.gz "https://github.com/terraform-docs/terraform-docs/releases/download/v0.16.0/terraform-docs-v0.16.0-$(uname)-amd64.tar.gz" \
    && tar -xzf terraform-docs.tar.gz \
    && chmod +x terraform-docs \
    && mv terraform-docs /usr/local/bin/terraform-docs

CMD ["cz", "version"]
