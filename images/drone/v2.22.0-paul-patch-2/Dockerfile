# ------------------------------------------
# Stage 1: clone backend + drone-ui
# ------------------------------------------
FROM golang:1.18 AS builder
WORKDIR /go/src/github.com/harness/drone

RUN git clone --single-branch --branch v2.22.0 --depth 1 https://github.com/harness/drone.git . && \
    git clone --single-branch --branch v2.12.0 --depth 1 https://github.com/drone/drone-ui.git ./drone-ui

COPY custom/repos.go /go/src/github.com/harness/drone/handler/api/user/repos.go

# ------------------------------------------
# Stage 2: build frontend
# ------------------------------------------

FROM node:14-slim AS drone-ui-build
WORKDIR /drone-ui

RUN apt-get update && apt-get install -y python2 g++ make && ln -s /usr/bin/python2 /usr/bin/python

COPY --from=builder /go/src/github.com/harness/drone/drone-ui/ .

COPY custom/templates.jsx src/pages/settings/templates/templates.jsx
COPY custom/switch.jsx src/components/shared/switch/switch.jsx
COPY custom/welcome.jsx src/pages/welcome/welcome.jsx

RUN npm install swiper

RUN cd /drone-ui && npm uninstall @monaco-editor/react

ENV CI=false
RUN yarn add react-infinite-scroll-component

RUN rm -rf node_modules .cache yarn.lock package-lock.json && \
    yarn install --frozen-lockfile && \
    yarn build && \
    mkdir -p ./dist && \
    mv ./build ./dist/files || mkdir -p ./dist/files

# ------------------------------------------
# Stage 3: build backend + embed frontend
# ------------------------------------------

FROM golang:1.18 AS backend

WORKDIR /go/src/github.com/harness/drone

COPY --from=builder /go/src/github.com/harness/drone .
COPY --from=drone-ui-build /drone-ui/dist/files ./static

ENV GOOS=linux

RUN go mod tidy && \
    go build -tags nolimit -ldflags='-extldflags=-static' -o release/linux/amd64/drone-server ./cmd/drone-server

# ------------------------------------------
# Final Stage: minimal runtime image
# ------------------------------------------

FROM alpine:3.11

EXPOSE 80 443
VOLUME /data

RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf
ENV GODEBUG netdns=go

COPY --from=backend /go/src/github.com/harness/drone/release/linux/amd64/drone-server .

ENTRYPOINT ["./drone-server"]
    