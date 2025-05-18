# ------------------------------------------
# Stage 1: clone backend + drone-ui
# ------------------------------------------
FROM golang:1.18 AS builder

WORKDIR /go/src/github.com/harness/drone

RUN git clone --single-branch --branch v2.22.0 --depth 1 https://github.com/harness/drone.git . && \
    rm -rf ./drone-ui && \
    rm -f ./handler/web/pages.go

COPY custom/repos.go /go/src/github.com/harness/drone/handler/web/repos.go
COPY custom/web.go /go/src/github.com/harness/drone/handler/web/web.go
COPY custom/logout.go /go/src/github.com/harness/drone/handler/web/logout.go

# ------------------------------------------
# Stage 2: build frontend
# ------------------------------------------

FROM node:14-slim AS drone-ui-build
WORKDIR /drone-ui

RUN apt-get update && apt-get install -y git python2 g++ make && ln -s /usr/bin/python2 /usr/bin/python
RUN git clone --branch v2.12.0 https://github.com/drone/drone-ui.git .

RUN rm -f \
    src/components/pages/home/repos-recent.* \
    src/pages/home/home.* \
    src/components/shared/switch/switch.* \
    src/pages/settings/templates/templates.*

#COPY custom/home.module.scss src/pages/home/home.module.scss    
#COPY custom/repos-recent.module.scss src/components/pages/home/repos-recent.module.scss
COPY custom/templates.jsx src/pages/settings/templates/templates.jsx
COPY custom/switch.jsx src/components/shared/switch/switch.jsx
COPY custom/home.jsx src/pages/home/home.jsx
#COPY custom/repos-recent.jsx src/components/pages/home/repos-recent.jsx

RUN yarn add swiper react-infinite-scroll-component timeago.js
RUN rm -rf node_modules .cache yarn.lock package-lock.json && \
    yarn install --frozen-lockfile && \
    yarn build && \
    mv dist/files/static/* dist/files/ && rmdir dist/files/static

# ------------------------------------------
# Stage 3: build backend + embed frontend
# ------------------------------------------

FROM golang:1.18 AS backend

WORKDIR /go/src/github.com/harness/drone

COPY --from=builder /go/src/github.com/harness/drone /go/src/github.com/harness/drone

COPY --from=drone-ui-build /drone-ui/dist/files/ /static/

ENV GOOS=linux

RUN rm -f web/dist.go web/dist_gen.go && \
    go mod tidy && \
    go build -tags nolimit -ldflags='-extldflags=-static' -o release/linux/amd64/drone-server ./cmd/drone-server

# ------------------------------------------
# Final Stage: minimal runtime image
# ------------------------------------------

FROM alpine:3.11

RUN apk update && apk add --no-cache curl ca-certificates && \
    echo 'text/css css;\napplication/javascript js;' > /etc/mime.types

EXPOSE 80 443

VOLUME /data

RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf

ENV GODEBUG netdns=go
ENV XDG_CACHE_HOME /data
ENV DRONE_DATABASE_DRIVER sqlite3
ENV DRONE_DATABASE_DATASOURCE /data/database.sqlite
ENV DRONE_RUNNER_OS linux
ENV DRONE_RUNNER_ARCH amd64
ENV DRONE_SERVER_PORT :80
ENV DRONE_SERVER_HOST localhost
ENV DRONE_DATADOG_ENABLED false

COPY --from=backend /static /static

COPY --from=backend /go/src/github.com/harness/drone/release/linux/amd64/drone-server .

ENTRYPOINT ["./drone-server"]
    