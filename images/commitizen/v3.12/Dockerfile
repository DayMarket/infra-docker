FROM python:3.10.5-alpine3.16

WORKDIR /app

# add dependincies
RUN apk add --update -t --no-cache \
    "alpine-sdk>=1.0-r1" \
    "curl>=7.83.1-r1" \
    "git>=2.36.1" \
    && pip install --no-cache-dir "commitizen==3.12.0"

CMD ["cz", "version"]