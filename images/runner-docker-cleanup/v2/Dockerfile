FROM alpine:3.16
LABEL mantainer="market-infra@uzum.com"
RUN apk add --update --no-cache \
    "bash>=5.1.16-r2" \
    "busybox-suid>=1.35.0-r15" \
    "docker>=20.10.16-r0" && \
    touch /var/log/cron.log

WORKDIR /usr/scheduler

COPY crontab.cleanup ./

COPY scripts/ ./
# execute permissions
RUN chmod u+x start.sh cleanup.sh
# Start cron
ENTRYPOINT ["./start.sh"]
