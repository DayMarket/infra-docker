# === ЭТАП 1: Сборка frontend Superset ===
FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"
ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    GIT_SSL_NO_VERIFY=1 \
    PIP_ROOT_USER_ACTION=ignore

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

COPY custom/DashboardCard.tsx /git/superset/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/index.tsx /git/superset/superset-frontend/src/pages/DashboardList/index.tsx
COPY custom/fallback.png /git/superset/superset-frontend/src/static/assets/images/fallback.png

RUN cp -Rf /git/superset/superset-frontend/* /app/superset-frontend && \
    cd /app/superset-frontend && \
    npm run ${BUILD_CMD} && \
    rm -rf node_modules .cache src test public

# === ЭТАП 2: Финальный backend-образ Superset ===
FROM python:3.10-slim-bookworm AS lean

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    SUPERSET_PORT=8088 \
    PIP_ROOT_USER_ACTION=ignore

WORKDIR /app

COPY custom/apt-dependencies.txt /tmp/apt-dependencies.txt
RUN mkdir -p ${PYTHONPATH} superset/static superset-frontend apache_superset.egg-info requirements && \
    useradd --user-group -m --no-log-init --shell /bin/bash superset && \
    apt-get update -qq && \
    xargs -a /tmp/apt-dependencies.txt apt-get install -yqq --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем весь репозиторий Superset целиком
COPY --from=superset-node /git/superset/ /app/

# Копируем frontend-манифесты для совместимости
COPY --from=superset-node /app/superset-frontend/package.json /app/superset-frontend/
COPY --from=superset-node /app/superset-frontend/package-lock.json /app/superset-frontend/

COPY custom/requirements-merged.txt /app/requirements.txt

RUN pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir -e .

COPY --from=superset-node /git/superset/docker/run-server.sh /usr/bin/
RUN chmod 755 /usr/bin/run-server.sh

COPY --chown=superset:superset --from=superset-node /app/superset/static/assets superset/static/assets

COPY custom/public_welcome.html /app/superset/templates/superset/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
COPY custom/fallback.png /app/superset/static/assets/images/fallback.png

# === ОЧИСТКА МУСОРА ===
RUN apt-get remove --purge -y \
    build-essential \
    git \
  && apt-get autoremove -y \
  && apt-get clean \
  && rm -rf \
    /root/.cache \
    /app/requirements \
    /tmp/* \
    /var/lib/apt/lists/*

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}
CMD ["/usr/bin/run-server.sh"]
