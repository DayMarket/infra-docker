# Стадия 1: сборка фронтенда
FROM node:18-bullseye-slim AS frontend-builder

WORKDIR /app/superset-frontend

# Клонируем весь код Superset
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends git ca-certificates \
    && git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset \
    && cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh \
    && cp /git/superset/superset-frontend/package.json ./ \
    && cp /git/superset/superset-frontend/package-lock.json ./ \
    && npm ci \
    && cp -R /git/superset/superset-frontend/* /app/superset-frontend \
    && npm run build \
    && apt-get purge -y --auto-remove git \
    && rm -rf /var/lib/apt/lists/*

# Стадия 2: финальный образ
FROM python:3.9-slim-bookworm AS superset-backend

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP=superset.app:create_app() \
    PYTHONPATH=/app/pythonpath \
    SUPERSET_HOME=/app/superset_home \
    SUPERSET_PORT=8088

# Устанавливаем нужные системные пакеты и сразу чистим
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
    build-essential \
    libpq-dev \
    default-libmysqlclient-dev \
    libsasl2-dev \
    libldap2-dev \
    libssl-dev \
    curl ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# Копируем ассеты из первой стадии
COPY --from=frontend-builder /app/superset-frontend/static/assets superset/static/assets

# Клонируем backend код
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset \
    && mkdir -p superset/static \
    && cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ \
    && cp -R /git/superset/superset /app/superset \
    && rm -rf /git

# Устанавливаем зависимости
COPY requirements/base.txt /tmp/base.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.0.1 setuptools==75.8.0 \
    && pip install --no-cache-dir -r /tmp/base.txt \
    && pip install --no-cache-dir -e . \
    && flask fab babel-compile --target superset/translations \
    && useradd --user-group --no-log-init --shell /bin/bash --create-home superset

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health" || exit 1

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/local/bin/gunicorn", "-w", "4", "-k", "gevent", "-b", "0.0.0.0:8088", "superset.app:create_app()"]
