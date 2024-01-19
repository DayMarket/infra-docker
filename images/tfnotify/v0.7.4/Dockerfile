ARG GOLANG_IMAGE="golang:1.17"
# hadolint ignore=DL3006
FROM ${GOLANG_IMAGE} AS build
RUN mkdir /app

WORKDIR /app

RUN CGO_ENABLED=0 GOOS=$(go env GOHOSTOS) GOARCH=$(go env GOHOSTARCH) go install github.com/mercari/tfnotify@v0.7.4

RUN cp "$GOPATH/bin/tfnotify" /tfnotify


FROM alpine:3.18.5

COPY --from=build /tfnotify /usr/bin/tfnotify

ENTRYPOINT [ "tfnotify" ]
