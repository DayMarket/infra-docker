FROM python:3.11-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends wget && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.opensearch && \
    wget --progress=dot:giga "https://storage.yandexcloud.net/cloud-certs/CA.pem" \
         --output-document /root/.opensearch/root.crt && \
    chmod 0600 /root/.opensearch/root.crt

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

ENV CA=/root/.opensearch/root.crt
CMD ["python3", "os-log-cleaner.py"]