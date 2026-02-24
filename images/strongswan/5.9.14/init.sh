#!/bin/sh
set -eu

# Sysctl
sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
sysctl -w net.ipv4.conf.all.rp_filter=0 >/dev/null 2>&1 || true
sysctl -w net.ipv4.conf.default.rp_filter=0 >/dev/null 2>&1 || true

# Masquerade
  iptables -t nat -C POSTROUTING -d 10.201.0.0/16 -j MASQUERADE && \
  iptables -t nat -A POSTROUTING -d 10.201.0.0/16 -j MASQUERADE

# Запуск charon
mkdir -p /var/run
/usr/libexec/ipsec/charon &

# Ждем VICI сокет
i=0
while [ ! -S /var/run/charon.vici ]; do
  i=$((i+1))
  [ "$i" -gt 100 ] && echo "charon.vici not ready" >&2 && exit 1
  sleep 0.2
done

# Загрузка конфига
/usr/sbin/swanctl --load-all
/usr/sbin/swanctl --list-sas || true  # Для дебага

# Запуск экспортера
exec /usr/local/bin/ipsec-exporter \
  -vici-address /var/run/charon.vici \
  -vici-network unix \
  -server-host 0.0.0.0 \
  -server-port 9903 \
  -log-level info