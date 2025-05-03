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
COPY custom/apt-dependencies.txt /tmp/apt-dependencies.txt
RUN mkdir -p ${PYTHONPATH} superset/static superset-frontend apache_superset.egg-info requirements \
  && useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset \
  && apt-get update -qq \
  && xargs -a /tmp/apt-dependencies.txt apt-get install -yqq --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*
# Устанавливаем Python зависимости
COPY custom/requirements-merge.txt /tmp/requirements-merge.txt
RUN set -eux; \
    pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /tmp/requirements-merge.txt && \
    pip install --no-cache-dir --editable .
WORKDIR /app/superset
# Копируем собранные frontend ассеты в runtime
COPY --from=frontend-builder /app/superset/static/assets ./static/assets
# collect static
RUN superset collect --force --noinput
# Поверх всего кладём кастомные HTML и иконки
COPY custom/public_welcome.html  ./templates/superset/public_welcome.html
COPY custom/favicon.png          ./static/assets/images/favicon.png
COPY custom/uzum.png             ./static/assets/images/uzum.png
# Копируем стартовый скрипт из первого этапа
COPY --from=frontend-builder /app/superset/docker/run-server.sh /usr/bin/run-server.sh
RUN chmod 755 /usr/bin/run-server.sh
# Переключаемся на безопасного пользователя
USER superset
EXPOSE 8088
CMD ["/usr/bin/run-server.sh"]
