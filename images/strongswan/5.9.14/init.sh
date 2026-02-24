#!/bin/sh
set -eu

sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
sysctl -w net.ipv4.conf.all.rp_filter=0 >/dev/null 2>&1 || true
sysctl -w net.ipv4.conf.default.rp_filter=0 >/dev/null 2>&1 || true

mkdir -p /var/run

/usr/sbin/charon &
i=0
while [ ! -S /var/run/charon.vici ]; do
  i=$((i + 1))
  if [ "$i" -gt 100 ]; then
    echo "charon.vici not found" >&2
    exit 1
  fi
  sleep 0.2
done

# expects /etc/swanctl/swanctl.conf (+ optionally swanctl.secrets) to be mounted
swanctl --load-all || true

exec /usr/local/bin/ipsec-exporter \
  -vici-address /var/run/charon.vici \
  -vici-network unix \
  -server-host 0.0.0.0 \
  -server-port 9903 \
  -log-level info