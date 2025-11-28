FROM alpine:3.20

RUN apk add --no-cache \
    git=2.45.4-r0 \
    openssh=9.7_p1-r5 \
    nodejs=20.15.1-r0 \
    npm=10.9.1-r0 \
    python3=3.12.12-r0 \
    py3-pip=24.0-r2 \
    curl=8.14.1-r2 \
    tar=1.35-r2 \
    gzip=1.13-r0 \
    ca-certificates=20250911-r0 \
 && update-ca-certificates

ENV PIP_BREAK_SYSTEM_PACKAGES=1

RUN python3 -m pip install --no-cache-dir "awscli==1.43.5"

CMD ["/bin/sh"]
