FROM ghcr.io/terraform-linters/tflint:v0.49.0 as tflint

FROM alpine:3.16

ENV DOG_VERSION=v0.15.0

COPY --from=tflint /usr/local/bin/tflint /usr/local/bin/tflint
SHELL ["/bin/ash", "-o", "pipefail", "-c"]
RUN apk add --update -t --no-cache "curl>=7.83.1-r1" "make>=4.3-r0" "jq>=1.6-r1" && \
    wget -O - -q https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s ${DOG_VERSION}