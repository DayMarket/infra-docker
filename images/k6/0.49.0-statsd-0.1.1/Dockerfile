# This Dockerfile is used to create a Docker image containing your customized k6 binary.
#
# Once built, publish the resulting image to your publicly accessible container registry, e.g. https://hub.docker.com/.
# The published image will then be used to create your container(s) within the Kubernetes cluster.
#

# Stage 1: Setup Go environment and build custom k6 from sources using xk6 (https://github.com/grafana/xk6)
FROM golang:1.21-alpine3.19 as builder
WORKDIR $GOPATH/src/go.k6.io/k6
RUN apk --no-cache add git=2.40.1-r0 && \
#
    CGO_ENABLED=0 go install go.k6.io/xk6/cmd/xk6@latest && \
# TODO - Want more extensions?! Provide additional `--with ...` lines to the following command:
    CGO_ENABLED=0 xk6 build v0.49.0 \
    --with github.com/LeonAdato/xk6-output-statsd@v0.1.1 \
    --output /tmp/k6

FROM alpine:3.19 as release
# hadolint ignore=DL3018
RUN apk add --no-cache ca-certificates=20230506-r0 && \
    adduser -D -u 12345 -g 12345 k6
COPY --from=builder /tmp/k6 /usr/bin/k6

USER k6
WORKDIR /home/k6

ENTRYPOINT ["k6"]