FROM golang:1.19 AS builder
WORKDIR /app

RUN git clone https://github.com/KazanExpress/jiralert.git . && \
    git reset --hard 2201daf && \
    CGO_ENABLED=0 GOOS=$(go env GOHOSTOS) GOARCH=$(go env GOHOSTARCH) go build -o jiralert ./cmd/jiralert

FROM quay.io/prometheus/busybox-linux-amd64:uclibc
COPY --from=builder /app/jiralert /bin/jiralert

ENTRYPOINT [ "/bin/jiralert" ]
