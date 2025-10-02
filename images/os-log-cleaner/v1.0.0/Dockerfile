FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.opensearch && \
    wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" \
         --output-document /root/.opensearch/root.crt && \
    chmod 0600 /root/.opensearch/root.crt

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir opensearch-py requests

ENV CA=/root/.opensearch/root.crt
CMD ["python3", "os-log-cleaner.py"]