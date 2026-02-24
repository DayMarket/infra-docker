# ---------- STAGE 1: build strongSwan ---------- #
FROM ubuntu:22.04 AS strongswan-builder

ENV DEBIAN_FRONTEND=noninteractive
ENV STRONGSWAN_VERSION=5.9.14

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        wget \
        pkg-config \
        libgmp-dev \
        libssl-dev \
        libcurl4-openssl-dev \
        libsystemd-dev \
        libcap-dev \
        libpam0g-dev \
        bison \
        flex \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build

RUN wget -q --progress=dot:giga \
      https://download.strongswan.org/strongswan-${STRONGSWAN_VERSION}.tar.bz2 && \
    tar -xjf strongswan-${STRONGSWAN_VERSION}.tar.bz2 && \
    cd strongswan-${STRONGSWAN_VERSION} && \
    ./configure \
      --prefix=/usr \
      --sysconfdir=/etc \
      --enable-charon \
      --enable-vici \
      --enable-swanctl \
      --enable-openssl \
      --enable-gcm \
      --enable-curl \
      --enable-kernel-netlink \
      --disable-stroke && \
    make -j"$(nproc)" && \
    make install


# ---------- STAGE 2: build exporter ---------- #
FROM golang:1.24-alpine AS exporter-builder

RUN apk add --no-cache git

WORKDIR /src

RUN git clone --branch v1.3.0 https://github.com/torilabs/ipsec-prometheus-exporter.git .

RUN go mod vendor && \
    CGO_ENABLED=0 GOFLAGS="-buildvcs=false" \
    go build -mod=vendor -trimpath -ldflags="-s -w" -o /ipsec-exporter .


# ---------- FINAL IMAGE ---------- #
FROM ubuntu:22.04

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        iproute2 \
        iptables \
        libgmp10 \
        libssl3 \
        libcurl4 \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=strongswan-builder /usr /usr
COPY --from=strongswan-builder /etc /etc
COPY --from=exporter-builder /ipsec-exporter /usr/local/bin/ipsec-exporter

EXPOSE 500/udp 4500/udp 9903

ENTRYPOINT ["/bin/sh", "-c", "\
  sysctl -w net.ipv4.ip_forward=1 && \
  sysctl -w net.ipv4.conf.all.rp_filter=0 && \
  sysctl -w net.ipv4.conf.default.rp_filter=0 && \
  /usr/sbin/charon & \
  sleep 2 && \
  exec ipsec-exporter -vici-address /var/run/charon.vici \
                      -vici-network unix \
                      -server-host 0.0.0.0 \
                      -server-port 9903 \
                      -log-level info \
"]
