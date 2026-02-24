# syntax=docker/dockerfile:1

# ---------- STAGE 1: build strongSwan ---------- #
FROM ubuntu:22.04 AS strongswan-builder

ENV DEBIAN_FRONTEND=noninteractive
ENV STRONGSWAN_VERSION=5.9.14

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      ca-certificates \
      flex \
      bison \
      pkg-config \
      wget \
      libcap-dev \
      libcurl4-openssl-dev \
      libgmp-dev \
      libpam0g-dev \
      libssl-dev \
      libsystemd-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /build

RUN wget -q --progress=dot:giga "https://download.strongswan.org/strongswan-${STRONGSWAN_VERSION}.tar.bz2" && \
    tar -xjf "strongswan-${STRONGSWAN_VERSION}.tar.bz2"

WORKDIR /build/strongswan-5.9.14

RUN ./configure \
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
FROM golang:1.24 AS exporter-builder

WORKDIR /src

RUN git clone --branch v1.3.0 https://github.com/torilabs/ipsec-prometheus-exporter.git .

RUN go mod vendor && \
    CGO_ENABLED=0 GOFLAGS="-buildvcs=false" \
    go build -mod=vendor -trimpath -ldflags="-s -w" -o /ipsec-exporter .


# ---------- FINAL IMAGE ---------- #
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      iproute2 \
      iptables \
      libcurl4 \
      libgmp10 \
      libssl3 \
      conntrack \
      git \
      mc && \
    rm -rf /var/lib/apt/lists/*

COPY --from=strongswan-builder /usr /usr
COPY --from=strongswan-builder /etc /etc
COPY --from=exporter-builder /ipsec-exporter /usr/local/bin/ipsec-exporter

COPY --chmod=0755 init.sh /usr/local/bin/init.sh

EXPOSE 500/udp 4500/udp 9903

ENTRYPOINT ["/usr/local/bin/init.sh"]