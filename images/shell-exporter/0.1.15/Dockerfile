FROM docker.io/library/debian:stable-slim

COPY shell-exp/shell-exporter /usr/bin/

RUN apt-get update && \
apt-get -y --no-install-recommends install "curl=7.74.0-1.3+deb11u3" "jq=1.6-2.1" "ca-certificates=20210119" && \
apt-get clean && rm -rf /var/lib/apt/lists/* && \
chmod +x /usr/bin/shell-exporter && \
mkdir /opt/metrics 

RUN addgroup --system --gid 1002 shell-exporter && adduser --system --uid 1002 --group shell-exporter

RUN chown -R shell-exporter:shell-exporter /var/ /run /opt /tmp
 
USER shell-exporter

ENTRYPOINT [ "bash", "-c", "ln -s /opt/metrics_cm/*.sh /opt/metrics/ && /usr/bin/shell-exporter --port 9600 --f /opt/metrics" ]
