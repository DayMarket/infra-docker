FROM ghcr.io/terraform-linters/tflint:v0.53.3 as tflint

FROM alpine:3.19

ENV DOG_VERSION=v0.17.1

COPY --from=tflint /usr/local/bin/tflint /usr/local/bin/tflint
SHELL ["/bin/ash", "-o", "pipefail", "-c"]
RUN apk add --update -t --no-cache \
    "curl>=8.5.0" \
    "make>=4.4.1-r2" \
    "jq>=1.7.1-r0" && \
    wget -O - -q https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s ${DOG_VERSION}
