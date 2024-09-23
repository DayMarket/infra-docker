FROM golang:1.17 AS tfmask
RUN mkdir /app

WORKDIR /app

RUN git clone https://github.com/daymarket/tfmask.git
WORKDIR /app/tfmask
RUN CGO_ENABLED=0 GOOS=$(go env GOHOSTOS) GOARCH=$(go env GOHOSTARCH) go build .
RUN cp ./tfmask /tfmask

FROM ghcr.io/kazanexpress/tf-toolbox:0.2.4 as toolbox

FROM alpine/terragrunt:1.8.5 as builder
# hadolint ignore=DL3018
RUN apk update && \
    apk add --no-cache --upgrade bash curl && \
    curl https://storage.yandexcloud.net/yandexcloud-yc/install.sh > /install.sh && \
    /bin/bash /install.sh

FROM ghcr.io/terraform-linters/tflint:v0.53.0 as tflint

FROM hashicorp/terraform:1.8.5
ARG TERRAGRUNT=v0.59.7
ENV TFMASK_VALUES_REGEX="(?i)^.*[^a-zA-Z](oauth|secret|certificate|token|password|key|result).*$" \
    TF_CLI_ARGS="-no-color"

ADD https://github.com/gruntwork-io/terragrunt/releases/download/${TERRAGRUNT}/terragrunt_linux_amd64 /usr/local/bin/terragrunt
COPY --from=tfmask /tfmask /usr/local/bin/tfmask

RUN apk add --update --no-cache \
    "bash>=5.2.0" \
    "git>=2.43.0" \
    "openssh>=9.6" \
    "jq>=1.7.1-r0" \
    "curl>=8.5.0" \
    "ansible>=4.8.0" \
    "make>=4.4.1-r2" \
    "postgresql-client>=3.15" && \
    chmod +x /usr/local/bin/terragrunt && chmod +x /usr/local/bin/tfmask

COPY --from=builder /root/yandex-cloud/bin/yc /bin/yc
COPY --from=toolbox /app /bin
COPY --from=tflint /usr/local/bin/tflint /usr/local/bin/tflint
WORKDIR /drone/src
