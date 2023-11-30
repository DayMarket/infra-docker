# wg-access-server + suricata

## descr

sniffing the bridge from the docker host is not enough, nor sniffing the virtual interface created within the bridge:
all we see is the container IP, not the wireguard peer IPs.
therefore we need to sniff the `wg0` network interface from _within_ the container.

based on https://github.com/freifunkmuc/wg-access-server/pkgs/container/wg-access-server
+ suricata dcron logrotate

## run

	touch wg_privkey
	chmod 600 wg_privkey
	wg genkey > wg_privkey
	chmod 400 wg_privkey

	admin_password=PASSWORD

	docker run -it --rm \
		--cap-add NET_ADMIN \
		--device /dev/net/tun:/dev/net/tun \
		-v wg-access-server-data:/data \
		-e "WG_ADMIN_PASSWORD=$admin_password" \
		-e "WG_WIREGUARD_PRIVATE_KEY=`cat wg_privkey`" \
		-p 8000:8000/tcp \
		-p 51820:51820/udp \
		ghcr.io/daymarket/wg-access-server

eventually provide `/etc/suricata/suricata.yaml` (alpine release `3.15.0` has `suricata-6.0.4-r0`)
and custom rules e.g. as `/etc/suricata/suricata.local`.
you might grab a sample `suricata.yaml` from the data mountmoint

_from within container_

	cp /etc/suricata/suricata* /data/

_from the host_

	ls -lF /var/lib/docker/volumes/wg-access-server-data/_data/suricata*

and then use your own configs

		-v /opt/suricata/suricata.yaml:/etc/suricata/suricata.yaml \
		-v /opt/suricata/suricata.local:/etc/suricata/suricata.local \
		-v /opt/suricata/disable.conf:/etc/suricata/disable.conf \

also share resulting logs with the docker host (fluentbit cannot be installed into alpine)
if you plan to parse `eve.json`

		-v /opt/suricata/log:/var/log/suricata \

## resources

https://github.com/freifunkmuc/wg-access-server/pkgs/container/wg-access-server

https://www.freie-netze.org/wg-access-server/deployment/1-docker/

https://github.com/freifunkMUC/wg-access-server/blob/master/Dockerfile
