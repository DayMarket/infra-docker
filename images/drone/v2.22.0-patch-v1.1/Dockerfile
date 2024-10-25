FROM golang:1.13.0 as builder

WORKDIR /go/src/github.com/drone/drone
RUN git clone https://github.com/DayMarket/drone.git . && \
    git fetch --all --tags --prune && \
    git checkout v2.22.0-patch-v1.1

ENV GOOS linux
ENV GOARCH amd64
ENV CGO_ENABLED 1
ENV REPO github.com/drone/drone
ENV GO111MODULE on
RUN go build -tags nolimit -ldflags "-extldflags \"-static\"" -o release/linux/${GOARCH}/drone-server ${REPO}/cmd/drone-server


FROM alpine:3.11 as alpine
# hadolint ignore=DL3018
RUN apk add -U --no-cache ca-certificates tzdata

FROM alpine:3.11
EXPOSE 80 443
VOLUME /data

RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf

ENV GODEBUG netdns=go
ENV XDG_CACHE_HOME /data
ENV DRONE_DATABASE_DRIVER sqlite3
ENV DRONE_DATABASE_DATASOURCE /data/database.sqlite
ENV DRONE_RUNNER_OS=linux
ENV DRONE_RUNNER_ARCH=amd64
ENV DRONE_SERVER_PORT=:80
ENV DRONE_SERVER_HOST=localhost
ENV DRONE_DATADOG_ENABLED=false

COPY --from=alpine /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=alpine /usr/share/zoneinfo /usr/share/zoneinfo

COPY --from=builder /go/src/github.com/drone/drone/release/linux/amd64/drone-server /bin/
ENTRYPOINT ["/bin/drone-server"]