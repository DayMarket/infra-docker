# === ЭТАП 1: сборка frontend Superset ===
FROM node:18-bullseye-slim as frontend-builder

ENV ESLINT_NO_DEV_ERRORS=true
ENV TSC_COMPILE_ON_ERROR=true
ENV SKIP_PREFLIGHT_CHECK=true
ENV GIT_SSL_NO_VERIFY=1

WORKDIR /app

# Устанавливаем git
RUN apt-get update && apt-get install -y --no-install-recommends git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Клонируем Superset 4.1.2
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git

WORKDIR /app/superset/superset-frontend
RUN find ./src -type f -name "*.test.tsx" -delete
# Устанавливаем зависимости
RUN npm ci

# Копируем кастомные файлы
COPY custom/DashboardCard.tsx ./src/features/dashboards/DashboardCard.tsx
COPY custom/index.tsx ./src/pages/DashboardList/index.tsx

# Собираем frontend
RUN npm run build


# === ЭТАП 2: backend Superset + системный пользователь ===
FROM python:3.10-slim-bookworm

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production \
    SUPERSET_HOME=/app/superset \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_PORT=8088

WORKDIR /app

# Устанавливаем системные зависимости
RUN mkdir -p ${PYTHONPATH} superset/static superset-frontend apache_superset.egg-info requirements \
    && useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset \
    && apt-get update -qq && apt-get install -yqq --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    default-libmysqlclient-dev \
    git \
    libasound2 \
    libbz2-1.0 \
    libc6 \
    libcom-err2 \
    libcrypt1 \
    libdb5.3 \
    libdbus-glib-1-2 \
    libecpg-dev \
    libffi8 \
    libgdbm6 \
    libgssapi-krb5-2 \
    libgtk-3-0 \
    libk5crypto3 \
    libkeyutils1 \
    libkrb5-3 \
    libkrb5support0 \
    libldap2-dev \
    liblzma5 \
    libncursesw6 \
    libnsl2 \
    libnss3 \
    libpq-dev \
    libreadline8 \
    libsasl2-dev \
    libsasl2-modules-gssapi-mit \
    libsqlite3-0 \
    libssl3 \
    libtinfo6 \
    libtirpc3 \
    libuuid1 \
    libx11-xcb1 \
    libxtst6 \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    libjpeg-dev \
    zlib1g-dev \
    libldap2-dev \
    netbase \
    tzdata \
    zlib1g && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app/superset

# Устанавливаем Python зависимости
COPY custom/requirements-merge.txt /app/requirements-merge.txt
RUN pip install --upgrade pip && \
    pip install -r /app/requirements-merge.txt

# Устанавливаем Superset как Python пакет
RUN pip install .

# Копируем стартовый скрипт из первого этапа
COPY --from=frontend-builder /app/superset/run-server.sh /usr/bin/run-server.sh
RUN chmod 755 /usr/bin/run-server.sh

# Копируем собранный frontend из этапа 1
COPY --from=frontend-builder /app/superset/superset-frontend /app/superset-frontend

# Кастомные HTML и иконки
COPY custom/public_welcome.html /app/superset/templates/superset/
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png

# Удаляем старые ассеты
RUN rm -rf /app/superset/static/assets/*

# Переключаемся на безопасного пользователя
USER superset

EXPOSE 8088

CMD ["/usr/bin/run-server.sh"]
