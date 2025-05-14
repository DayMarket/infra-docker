# ------------------------------------------
# Stage 1: clone backend + drone-ui
# ------------------------------------------
FROM golang:1.18 AS builder
WORKDIR /go/src/github.com/harness/drone

RUN git clone --single-branch --branch v2.22.0 --depth 1 https://github.com/harness/drone.git . && \
    git clone --single-branch --branch v2.12.0 --depth 1 https://github.com/drone/drone-ui.git ./drone-ui

# ------------------------------------------
# Stage 2: build frontend
# ------------------------------------------
FROM node:16-alpine AS frontend

WORKDIR /drone-ui

COPY --from=builder /go/src/github.com/harness/drone/drone-ui .

RUN apk add --no-cache python2 make g++

RUN yarn install --frozen-lockfile && yarn build

# ------------------------------------------
# Stage 3: build backend + embed frontend
# ------------------------------------------
FROM golang:1.18 AS backend

WORKDIR /go/src/github.com/harness/drone

COPY --from=builder /go/src/github.com/harness/drone .
COPY --from=frontend /drone-ui/build ./static/

ENV GOOS=linux
RUN go mod tidy && \
    go build -tags nolimit -ldflags "-extldflags \"-static\"" -o release/linux/amd64/drone-server github.com/harness/drone/cmd/drone-server

# ------------------------------------------
# Final Stage: minimal runtime image
# ------------------------------------------
FROM alpine:3.11

RUN apk --no-cache add ca-certificates dumb-init tzdata

WORKDIR /app

COPY --from=backend /go/src/github.com/harness/drone/release/linux/amd64/drone-server .

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./drone-server"]
    