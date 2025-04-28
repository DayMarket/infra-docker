# Stage 1: Build frontend assets
FROM node:18-bullseye-slim AS frontend-builder

ARG NPM_BUILD_CMD=build
WORKDIR /app/superset-frontend

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

# Клонируем только frontend
ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset \
    && cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh \
    && cp /git/superset/superset-frontend/package.json ./ \
    && cp /git/superset/superset-frontend/package-lock.json ./ \
    && npm ci \
    && cp -Rf /git/superset/superset-frontend/* /app/superset-frontend

RUN npm run ${NPM_BUILD_CMD}


# Stage 2: Build backend and prepare final image
FROM python:3.9-slim-bookworm AS superset-backend

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

# Системные библиотеки для Superset
RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
        curl \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libpq-dev \
        libldap2-dev \
        libssl-dev \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

# Создаем пользователя
RUN useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset

# Копируем requirements
COPY requirements/base.txt /tmp/base.txt

# Устанавливаем только необходимые Python пакеты
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.1 setuptools==75.8.0 \
    && pip install --no-cache-dir -r /tmp/base.txt

# Копируем Superset backend код
ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

COPY --from=frontend-builder /app/superset-frontend/assets superset/static/assets

# Копируем backend код
RUN mkdir -p /app/superset \
    && cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ \
    && cp -Rf /git/superset/superset/* /app/superset/ \
    && pip install --no-cache-dir -e .

# Статические папки
RUN touch superset/static/version_info.json \
    && chown -R superset:superset /app

# Смена пользователя
USER superset

# Healthcheck + порт
HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"
EXPOSE ${SUPERSET_PORT}

# Стартовый скрипт
CMD ["/usr/local/bin/gunicorn", "--bind", "0.0.0.0:8088", "superset.app:create_app()", "--workers=4", "--timeout=300"]
