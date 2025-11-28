# Лёгкая база
FROM alpine:3.20

ENV PYTHONUNBUFFERED=1

RUN apk add --no-cache \
    git=2.45.2-r0 \
    openssh=9.7_p1-r0 \
    nodejs=20.15.1-r0 \
    npm=10.7.0-r0 \
    python3=3.12.4-r0 \
    py3-pip=24.0-r0 \
    curl=8.9.1-r0 \
    tar=1.35-r2 \
    gzip=1.13-r0 \
    ca-certificates=20240705-r0 \
 && update-ca-certificates


RUN python3 -m pip install --no-cache-dir "awscli==1.43.5"

CMD ["/bin/sh"]
