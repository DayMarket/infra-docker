######################################################################
# STAGE 1 — Node.js: сборка кастомного frontend
######################################################################
FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"

# Установка зависимостей для билда фронтенда
RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        build-essential \
        python3 \
        git \
    && rm -rf /var/lib/apt/lists/*

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app/superset-frontend

# Клонируем Superset 4.1.2
ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package.json ./ && \
    cp /git/superset/superset-frontend/package-lock.json ./ && \
    npm ci && \
    cp -Rf /git/superset/superset-frontend/* /app/superset-frontend

# Копируем кастомные frontend-файлы
COPY custom/DashboardCard.tsx /app/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/DashboardThumbnail.tsx /app/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
COPY custom/index.tsx /app/superset-frontend/src/pages/DashboardList/index.tsx
COPY custom/public_welcome.html /app/superset/templates/superset/

# Сборка фронтенда
RUN yarn install --ignore-engines && \
    yarn add --dev cross-env && \
    yarn build && \
    yarn cache clean

######################################################################
# STAGE 2 — Python: финальный lean-образ
######################################################################
FROM python:3.10-slim-bookworm AS lean

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

# Базовые зависимости
RUN mkdir -p ${PYTHONPATH} superset/static requirements superset-frontend apache_superset.egg-info superset_home && \
    useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset && \
    apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        curl \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libsasl2-modules-gssapi-mit \
        libpq-dev \
        libecpg-dev \
        libldap2-dev \
        git && \
    rm -rf /var/lib/apt/lists/*

# Клонируем Superset 4.1.2
ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

# Копируем backend и requirements
RUN cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    cp -Rf /git/superset/superset/* /app/superset/ && \
    cp -Rf /git/superset/requirements/base.txt /app/requirements/

# Установка Python-зависимостей
RUN pip install --no-cache-dir --upgrade setuptools==75.8.0 pip==25.0 && \
    pip install --no-cache-dir -r requirements/base.txt

# Копируем собранные frontend assets
COPY --from=superset-node /app/superset-frontend/static/assets superset/static/assets

# Завершающая настройка
RUN pip install --no-cache-dir -e . && \
    flask fab babel-compile --target superset/translations && \
    cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && \
    chmod 755 /usr/bin/run-server.sh && \
    chown -R superset:superset ./*

# Кастомные изображения
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png

# Кастомные зависимости
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
