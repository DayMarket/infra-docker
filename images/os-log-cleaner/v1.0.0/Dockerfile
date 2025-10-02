FROM python:3.11-slim

# Установим необходимые пакеты
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

# Скачаем сертификат Яндекса
RUN mkdir -p /root/.opensearch && \
    wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" \
         --output-document /root/.opensearch/root.crt && \
    chmod 0600 /root/.opensearch/root.crt

# Скопируем скрипты в контейнер
WORKDIR /app
COPY . /app

# Установим зависимости
RUN pip install --no-cache-dir opensearch-py requests

# Установим переменную окружения для сертификата (если путь используется в коде)
ENV CA=/root/.opensearch/root.crt

# Запуск скрипта (можно изменить на нужный)
CMD ["python3", "os-log-cleaner.py"]