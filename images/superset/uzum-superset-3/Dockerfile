ARG PY_VER=3.10-slim-bookworm

FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        build-essential \
        python3 \
        git

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app/superset-frontend

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package.json ./ && \
    cp /git/superset/superset-frontend/package-lock.json ./ && \
    npm ci

# Копируем кастомные frontend-файлы
COPY custom/DashboardCard.tsx /git/superset/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/index.tsx /git/superset/superset-frontend/src/pages/DashboardList/index.tsx

# Сборка frontend
RUN cp -Rf /git/superset/superset-frontend/* /app/superset-frontend && \
    npm run ${BUILD_CMD}

######################################################################
# Final lean image...
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
    netbase \
    tzdata \
    zlib1g && \
    rm -rf /var/lib/apt/lists/*

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

# Копируем исходники Superset
RUN cp -Rf /git/superset/superset/* /app/superset/ && \
    cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    mkdir -p /app/superset-frontend && \
    cp /git/superset/superset-frontend/package.json /app/superset-frontend/ && \
    cp /git/superset/superset-frontend/package-lock.json /app/superset-frontend/

# Установка зависимостей
COPY requirements-merged.txt /app/requirements.txt

# hadolint ignore=DL3013
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt && \
    playwright install-deps && \
    playwright install chromium

# Установка Superset и скрипта запуска
RUN pip install --no-cache-dir -e . && \
    cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && \
    chown -R superset:superset ./* && \
    chmod 755 /usr/bin/run-server.sh

# Копируем собранные frontend ассеты
COPY --chown=superset:superset --from=superset-node /app/superset/static/assets superset/static/assets

# Кастомные шаблоны и логотипы
COPY custom/public_welcome.html /app/superset/templates/superset/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
