FROM golang:1.21.8-alpine3.19 AS build
RUN mkdir /app

WORKDIR /app

RUN git clone -b 'v0.35.0' --single-branch https://github.com/ozontech/file.d.git
WORKDIR /app/file.d
RUN CGO_ENABLED=0 GOOS=$(go env GOHOSTOS) GOARCH=$(go env GOHOSTARCH) go build -o file.d ./cmd

RUN cp ./file.d /file.d


FROM alpine:3.15.0

RUN mkdir /file.d
COPY --from=build /file.d /file.d/file.d

ENTRYPOINT [ "/file.d/file.d" ]
