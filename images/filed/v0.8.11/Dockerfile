FROM golang:1.19 AS build
RUN mkdir /app

WORKDIR /app

RUN git clone --depth 1 --branch v0.8.11 https://github.com/ozontech/file.d.git
WORKDIR /app/file.d
RUN CGO_ENABLED=0 GOOS=$(go env GOHOSTOS) GOARCH=$(go env GOHOSTARCH) go build -o file.d ./cmd

RUN cp ./file.d /file.d


FROM alpine:3.15.0

RUN mkdir /file.d
COPY --from=build /file.d /file.d/file.d

ENTRYPOINT [ "/file.d/file.d" ]
