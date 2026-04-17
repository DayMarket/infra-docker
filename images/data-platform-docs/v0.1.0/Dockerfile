FROM python:3.12-slim AS builder

ARG DOCS_REF=v0.1.0

WORKDIR /build

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch "$DOCS_REF" https://github.com/DayMarket/data-platform-docs.git .

RUN pip install --no-cache-dir -r requirements.txt \
    && mkdocs build --strict

FROM nginx:alpine

COPY --from=builder /build/site/ /usr/share/nginx/html/

EXPOSE 80
