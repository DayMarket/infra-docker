######################################################################
# Node stage to deal with static asset construction
######################################################################
ARG PY_VER=3.9-slim-bookworm

FROM node:16-bookworm-slim AS superset-node

ARG NPM_BUILD_CMD="build"

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        build-essential \
        python3 \
        git

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /app/superset-frontend

# Копируем кастомный frontend
COPY ./src/superset-frontend/ /app/superset-frontend/

# Устанавливаем и собираем
RUN npm ci && npm run ${BUILD_CMD}

######################################################################
# Final lean image with Superset 4.1.2 backend and copied frontend
######################################################################
FROM apache/superset:4.1.2 AS lean

WORKDIR /app
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

USER root

RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
        curl \
        build-essential \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libsasl2-modules-gssapi-mit \
        libpq-dev \
        libecpg-dev \
        libldap2-dev \
        git \
    && rm -rf /var/lib/apt/lists/*

# Копируем кастомный frontend и статику из предыдущего stage
COPY --from=superset-node /app/superset-frontend /app/superset-frontend
COPY --from=superset-node /app/superset-frontend/build /app/superset/static/assets

# Кастомные правки
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

# Установка прав и финальные команды
RUN chown -R superset:superset ./* && chmod 755 /usr/bin/run-server.sh
USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"
EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
