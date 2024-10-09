FROM alpine:3.20.3

USER root

RUN apk add --update -t --no-cache  "bash>=5.2.26-r0" "curl>=8.10.1-r0" "jq>=1.7.1-r0" && \
    addgroup -S commandrun && adduser -S curl -G curl

USER curl