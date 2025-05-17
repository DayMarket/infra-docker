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

RUN echo "[STAGE 1] Contents of backend src:" && \
    ls -la /go/src/github.com/harness/drone/handler/web && \
    ls -la /go/src/github.com/harness/drone/handler/api/user

# ------------------------------------------
# Stage 2: build frontend
# ------------------------------------------

FROM node:14-slim AS drone-ui-build
WORKDIR /drone-ui

RUN apt-get update && apt-get install -y git python2 g++ make && ln -s /usr/bin/python2 /usr/bin/python
RUN git clone --branch v2.12.0 https://github.com/drone/drone-ui.git .

COPY custom/templates.jsx src/pages/settings/templates/templates.jsx
COPY custom/switch.jsx src/components/shared/switch/switch.jsx
COPY custom/home.jsx src/pages/home/home.jsx
COPY custom/repos-recent.jsx src/components/pages/home/repos-recent.jsx

# ------------------------------------------
# Проверки перед сборкой
# ------------------------------------------

RUN echo "[CHECK] repos-recent.jsx content:" && head -n 20 src/components/pages/home/repos-recent.jsx || echo "No file"
RUN echo "[CHECK] grep for styles usage:" && grep styles src/components/pages/home/repos-recent.jsx || echo "No styles used"

# ------------------------------------------
# Сборка frontend
# ------------------------------------------
RUN yarn add swiper react-infinite-scroll-component
RUN rm -rf node_modules .cache yarn.lock package-lock.json && \
    yarn install --frozen-lockfile && \
    yarn build

# ------------------------------------------
# Проверки после сборки
# ------------------------------------------

RUN echo "[CHECK] Search for index.html in build:" && find /drone-ui -name index.html
RUN echo "[CHECK] Output JS chunks:" && find /drone-ui -name '*.js' | grep static || echo "No JS chunks found"
RUN echo "[CHECK] main.*.js content preview:" && find /drone-ui -name 'main.*.js' -exec head -n 10 {} \; || echo "No main.*.js found"

# ------------------------------------------
# Stage 3: build backend + embed frontend
# ------------------------------------------

FROM golang:1.18 AS backend

WORKDIR /go/src/github.com/harness/drone

COPY --from=builder /go/src/github.com/harness/drone /go/src/github.com/harness/drone
COPY --from=drone-ui-build /drone-ui/dist/files ./static

RUN echo "[STAGE 3] Contents of /static after COPY:" && \
    ls -la /go/src/github.com/harness/drone/static || echo "/static not found"

ENV GOOS=linux

RUN rm -f web/dist.go web/dist_gen.go && \
    go mod tidy && \
    go build -tags nolimit -ldflags='-extldflags=-static' -o release/linux/amd64/drone-server ./cmd/drone-server

# ------------------------------------------
# Final Stage: minimal runtime image
# ------------------------------------------

FROM alpine:3.11

EXPOSE 80 443
VOLUME /data

RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf
ENV GODEBUG netdns=go

COPY --from=backend /go/src/github.com/harness/drone/static /static
COPY --from=backend /go/src/github.com/harness/drone/release/linux/amd64/drone-server .

RUN echo "[FINAL STAGE] Contents of root:" && \
    ls -la / && \
    echo "[FINAL STAGE] Check static folder:" && ls -la /static || echo "NO /static"

RUN echo "[FINAL STAGE] Search for index.html:" && find / -name index.html || echo "NO index.html"

ENTRYPOINT ["./drone-server"]
    