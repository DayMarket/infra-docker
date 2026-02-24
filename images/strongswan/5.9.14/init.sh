#!/bin/sh
set -eu

sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
sysctl -w net.ipv4.conf.all.rp_filter=0 >/dev/null 2>&1 || true
sysctl -w net.ipv4.conf.default.rp_filter=0 >/dev/null 2>&1 || true

exec /usr/local/bin/ipsec-exporter \
  -vici-address /var/run/charon.vici \
  -vici-network unix \
  -server-host 0.0.0.0 \
  -server-port 9903 \
  -log-level info