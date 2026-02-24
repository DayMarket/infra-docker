# syntax=docker/dockerfile:1

# ────────── STAGE 1: Сборка strongSwan ────────── #
FROM ubuntu:22.04 AS strongswan-builder

ENV DEBIAN_FRONTEND=noninteractive
ENV STRONGSWAN_VERSION=5.9.14

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    flex bison \
    pkg-config \
    wget \
    libcap-dev \
    libcurl4-openssl-dev \
    libgmp-dev \
    libpam0g-dev \
    libssl-dev \
    libsystemd-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

RUN wget -q --progress=dot:giga "https://download.strongswan.org/strongswan-${STRONGSWAN_VERSION}.tar.bz2" && \
    tar -xjf "strongswan-${STRONGSWAN_VERSION}.tar.bz2"

WORKDIR /build/strongswan-${STRONGSWAN_VERSION}

RUN ./configure \
    --prefix=/usr \
    --sysconfdir=/etc \
    --libexecdir=/usr/libexec \
    --enable-charon \
    --enable-vici \
    --enable-swanctl \
    --enable-openssl \
    --enable-gcm \
    --enable-curl \
    --enable-kernel-netlink \
    --disable-stroke \
    && make -j$(nproc) && make install-strip

# ────────── STAGE 2: Сборка Prometheus exporter ────────── #
FROM golang:1.24-alpine AS exporter-builder

WORKDIR /src

RUN apk add --no-cache git

RUN git clone --branch v1.3.0 --depth 1 \
    https://github.com/torilabs/ipsec-prometheus-exporter.git .

RUN go mod download && \
    CGO_ENABLED=0 GOFLAGS="-buildvcs=false" \
    go build -trimpath -ldflags="-s -w" \
    -o /ipsec-exporter ./cmd/ipsec-exporter

# ────────── FINAL IMAGE ────────── #
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    iproute2 \
    iptables \
    libcurl4 \
    libgmp10 \
    libssl3 \
    libcap2 \
    libpam0g \
    libsystemd0 \
    conntrack \
    strongswan-swanctl \
    libcharon-extra-plugins \
    libstrongswan-extra-plugins \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY --from=strongswan-builder /usr/lib/ipsec/               /usr/lib/ipsec/
COPY --from=strongswan-builder /usr/lib/libstrongswan*.so*  /usr/lib/
COPY --from=strongswan-builder /usr/lib/libcharon*.so*      /usr/lib/
COPY --from=strongswan-builder /usr/sbin/charon             /usr/sbin/charon
COPY --from=strongswan-builder /usr/sbin/swanctl            /usr/sbin/swanctl
COPY --from=strongswan-builder /usr/libexec/strongswan/     /usr/libexec/strongswan/
COPY --from=exporter-builder /ipsec-exporter /usr/local/bin/ipsec-exporter
COPY --chmod=0755 init.sh /usr/local/bin/init.sh

RUN mkdir -p \
    /etc/swanctl \
    /etc/strongswan.d \
    /var/lib/strongswan \
    /var/log/strongswan \
    /run/charon

RUN chown -R root:root /etc/swanctl /var/lib/strongswan /var/log/strongswan && \
    chmod 700 /etc/swanctl /var/lib/strongswan

EXPOSE 500/udp 4500/udp 9903/tcp

ENTRYPOINT ["/usr/local/bin/init.sh"]