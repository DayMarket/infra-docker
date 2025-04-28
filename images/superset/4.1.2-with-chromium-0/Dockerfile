# Dockerfile для Superset 4.1.2 + Playwright Chromium (без Firefox и Geckodriver)

######################################################################
# Node stage: для сборки статичных ассетов
######################################################################
ARG PY_VER=3.9-slim-bookworm

FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        build-essential \
        python3 \
        git \
    && rm -rf /var/lib/apt/lists/*

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app/superset-frontend

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package.json ./ && \
    cp /git/superset/superset-frontend/package-lock.json ./ && \
    npm ci && \
    cp -Rf /git/superset/superset-frontend/* /app/superset-frontend

COPY ./src/superset/ /app

RUN npm run ${BUILD_CMD}

######################################################################
# Финальный образ Python + Superset
######################################################################
FROM python:${PY_VER} AS lean

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

RUN mkdir -p ${PYTHONPATH} superset/static requirements superset-frontend apache_superset.egg-info \
    && useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset \
    && apt-get update -qq && apt-get install -yqq --no-install-recommends \
        curl \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libsasl2-modules-gssapi-mit \
        libpq-dev \
        libecpg-dev \
        libldap2-dev \
        libaio1 \
        git \
    && touch superset/static/version_info.json \
    && chown -R superset:superset ./* \
    && rm -rf /var/lib/apt/lists/*

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

RUN cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    cp /git/superset/superset-frontend/package.json /app/superset-frontend/ && \
    cp -Rf /git/superset/requirements/base.txt  /app/requirements/

# Базовые зависимости из правильных requirements файлов
COPY requirements/base.txt /tmp/base.txt
COPY requirements/development.txt /tmp/development.txt

WORKDIR /tmp

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.1 setuptools==75.8.0 \
    && pip install --no-cache-dir -r /tmp/development.txt

COPY --chown=superset:superset --from=superset-node /app/superset/static/assets superset/static/assets

RUN cp -Rf /git/superset/superset/* /app/superset/ && \
    pip install --no-cache-dir -e . \
    && flask fab babel-compile --target superset/translations \
    && chown -R superset:superset superset/translations \
    && cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && \
    chown -R superset:superset ./* && chmod 755 /usr/bin/run-server.sh

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]

######################################################################
# Dev-образ с Chromium (для генерации скриншотов)
######################################################################
FROM lean AS dev

USER root

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        libnss3 \
        libdbus-glib-1-2 \
        libgtk-3-0 \
        libx11-xcb1 \
        libasound2 \
        libxtst6 \
        git \
        pkg-config \
        bzip2 \
        lbzip2 \
        wget \
        libaio1 \
        unzip \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir playwright==1.51.0 \
    && playwright install-deps \
    && playwright install chromium

USER superset
