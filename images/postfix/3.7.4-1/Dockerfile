FROM alpine:3.17.1

EXPOSE 25/tcp

# hadolint ignore=DL3018
RUN apk --no-cache add ca-certificates libintl postfix~=3.7 tzdata

ENTRYPOINT ["/entrypoint.sh"]

COPY entrypoint.sh /
