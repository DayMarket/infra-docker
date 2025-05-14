# ------------------------------------------
# Stage 1: clone backend + drone-ui
# ------------------------------------------
FROM golang:1.18 as builder

WORKDIR /go/src/github.com/DayMarket/drone

RUN git clone https://github.com/DayMarket/drone.git . && \
    git clone --single-branch --branch daymarket-drone-ui-performance-patch https://github.com/DayMarket/drone-ui.git ./drone-ui

# ------------------------------------------
# Stage 2: build frontend
# ------------------------------------------
FROM node:18 as frontend

WORKDIR /drone-ui
COPY --from=builder /go/src/github.com/DayMarket/drone/drone-ui .
RUN yarn install --frozen-lockfile && yarn build

# ------------------------------------------
# Stage 3: build backend + embed frontend
# ------------------------------------------
FROM golang:1.18 as backend

WORKDIR /go/src/github.com/DayMarket/drone
COPY --from=builder /go/src/github.com/DayMarket/drone .

COPY --from=frontend /drone-ui/build ./static/

ENV GOOS=linux
ENV GOARCH=amd64
ENV CGO_ENABLED=1
ENV GO111MODULE=on

RUN go mod tidy && \
    go build -tags nolimit -ldflags "-extldflags \"-static\"" -o release/linux/${GOARCH}/drone-server github.com/DayMarket/drone/cmd/drone-server

# ------------------------------------------
# Stage 4: final runtime image
# ------------------------------------------
FROM alpine:3.11

LABEL maintainer="core-infra-team@daymarket"

EXPOSE 80 443
VOLUME /data

WORKDIR /app

RUN apk add -U --no-cache ca-certificates tzdata && \
    [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf

ENV GODEBUG=netdns=go
ENV XDG_CACHE_HOME=/data
ENV DRONE_DATABASE_DRIVER=postgres
ENV DRONE_DATABASE_DATASOURCE=""
ENV DRONE_RUNNER_OS=linux
ENV DRONE_RUNNER_ARCH=amd64
ENV DRONE_SERVER_PORT=:80
ENV DRONE_SERVER_HOST=localhost
ENV DRONE_DATADOG_ENABLED=false

COPY --from=backend /go/src/github.com/DayMarket/drone/release/linux/amd64/drone-server /usr/local/bin/drone-server

USER 1000:1000
ENTRYPOINT ["drone-server"]
    