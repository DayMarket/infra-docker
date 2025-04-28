# Stage 1: Frontend builder
FROM node:18-bullseye-slim AS frontend-builder

WORKDIR /app/superset-frontend

# Устанавливаем git только для этой стадии
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset \
    && cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh \
    && cp /git/superset/superset-frontend/package.json ./ \
    && cp /git/superset/superset-frontend/package-lock.json ./ \
    && npm ci \
    && cp -Rf /git/superset/superset-frontend/* /app/superset-frontend/ \
    && npm run build

# Stage 2: Backend build (lean)
FROM python:3.9-slim-bookworm AS superset-backend

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    FLASK_APP="superset.app:create_app()" \
    SUPERSET_PORT=8088

# Устанавливаем всё только нужное для билда и инсталляции Python пакетов
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    gcc \
    build-essential \
    default-libmysqlclient-dev \
    libsasl2-dev \
    libsasl2-modules-gssapi-mit \
    libpq-dev \
    libecpg-dev \
    libldap2-dev \
    libaio1 \
    curl \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

# Копируем только ассеты
COPY --from=frontend-builder /app/superset-frontend/assets superset/static/assets

# Копируем код Superset
RUN mkdir -p superset/static/assets superset_home pythonpath
RUN cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ \
    && cp -Rf /git/superset/superset/* /app/superset/

# Устанавливаем зависимости
COPY requirements/base.txt /tmp/base.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.0.1 setuptools==75.8.0 \
    && pip install --no-cache-dir -r /tmp/base.txt -r /tmp/development.txt \
    && pip install --no-cache-dir -e .

# Stage 3: Final Production Image
FROM python:3.9-slim-bookworm

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    FLASK_APP="superset.app:create_app()" \
    SUPERSET_PORT=8088

# Устанавливаем только системные зависимости для runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    libldap-2.5-0 \
    libsasl2-2 \
    libssl3 \
    libaio1 \
    && rm -rf /var/lib/apt/lists/*

# Копируем установленный python environment
COPY --from=superset-backend /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=superset-backend /usr/local/bin /usr/local/bin

# Копируем приложение
COPY --from=superset-backend /app /app

# Healthcheck
HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health" || exit 1

EXPOSE ${SUPERSET_PORT}

# Старт сервера
CMD ["/usr/bin/run-server.sh"]
