# Лёгкая база
FROM alpine:3.20

ENV PYTHONUNBUFFERED=1

RUN apk add --no-cache \
    git \
    openssh \
    nodejs \
    npm \
    python3 \
    py3-pip \
    tar \
    gzip \
    ca-certificates \
 && update-ca-certificates

RUN python3 -m pip install --no-cache-dir "awscli==1.43.5"

CMD ["/bin/sh"]
