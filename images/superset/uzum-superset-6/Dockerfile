# === ЭТАП 1: Сборка frontend Superset ===
FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    GIT_SSL_NO_VERIFY=1

# hadolint ignore=DL3008
RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
    build-essential \
    python3 \
    git

WORKDIR /app/superset-frontend

RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package.json ./ && \
    cp /git/superset/superset-frontend/package-lock.json ./ && \
    npm ci

# Копируем кастомные frontend-файлы
#COPY custom/DashboardCard.tsx /git/superset/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/index.tsx /git/superset/superset-frontend/src/pages/DashboardList/index.tsx
#COPY custom/ChartCard.tsx /git/superset/superset-frontend/src/views/ChartList/ChartCard.tsx

#COPY custom/Welcome.tsx /git/superset/superset-frontend/src/pages/Home/index.tsx

#COPY custom/fallback.png /git/superset/superset-frontend/src/static/assets/images/fallback.png

# Сборка frontend
RUN cp -Rf /git/superset/superset-frontend/* /app/superset-frontend && \
    npm run ${BUILD_CMD}

# === ЭТАП 2: Финальный backend-образ Superset ===
FROM python:3.10-slim-bookworm AS lean

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_PORT=8088

WORKDIR /app

# Копируем список зависимостей и устанавливаем
COPY custom/apt-dependencies.txt /tmp/apt-dependencies.txt

RUN mkdir -p ${PYTHONPATH} superset/static superset-frontend apache_superset.egg-info requirements && \
    useradd --user-group -m --no-log-init --shell /bin/bash superset && \
    apt-get update -qq && \
    xargs -a /tmp/apt-dependencies.txt apt-get install -yqq --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем Superset исходники
COPY --from=superset-node /git/superset /git/superset

RUN cp -Rf /git/superset/superset/* /app/superset/ && \
    cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    mkdir -p /app/superset-frontend && \
    cp /git/superset/superset-frontend/package.json /app/superset-frontend/ && \
    cp /git/superset/superset-frontend/package-lock.json /app/superset-frontend/

# Устанавливаем Python зависимости
COPY custom/requirements-merged.txt /app/requirements.txt

# hadolint ignore=DL3013
RUN pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -e . 

# Копируем скрипт запуска
RUN cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && chmod 755 /usr/bin/run-server.sh

# Копируем собранные frontend ассеты
COPY --chown=superset:superset --from=superset-node /app/superset/static/assets superset/static/assets

# Копируем кастомные шаблоны и иконки
COPY custom/public_welcome.html /app/superset/templates/superset/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
COPY custom/fallback.png /app/superset/static/assets/images/fallback.png

# Очистка после сборки: APT, Python, frontend-исходники и временные данные
RUN apt-get remove --purge -y \
    build-essential \
    git \
    python3-dev \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf \
    /app/superset-frontend \
    /app/requirements \
    /app/setup.cfg \
    /app/MANIFEST.in \
    /app/README.md \
    /app/.git \
    /app/tests \
    /app/docs \
    /root/.cache \
    /tmp/* \
    /var/lib/apt/lists/* \
    /git/superset/.git \
    /tmp/* \
    /var/tmp/*

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
