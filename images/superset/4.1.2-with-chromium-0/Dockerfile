# syntax=docker/dockerfile:1.4

#################################################################################
# Builder Stage
#################################################################################
ARG PY_VER=3.9-slim-bookworm

FROM python:${PY_VER} AS builder

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

# Установка системных зависимостей
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    libpq-dev \
    libldap2-dev \
    libaio1 \
    libsasl2-dev \
    libsasl2-modules-gssapi-mit \
    git \
    curl \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY --chown=superset:superset requirements/development.txt /tmp/
COPY --chown=superset:superset requirements/base.txt /tmp/

# Убираем лишние строки (-e file:.)
RUN sed -i '/^-e file:.*/d' /tmp/base.txt /tmp/development.txt

# Установка зависимостей
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.0.1 setuptools==75.8.0 \
    && pip install --no-cache-dir -r /tmp/base.txt -r /tmp/development.txt

# Клонируем Superset
ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

# Ставим сам Superset
RUN cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    cp -Rf /git/superset/superset/* /app/superset/ && \
    pip install --no-cache-dir -e .

#################################################################################
# Runtime Stage
#################################################################################
FROM python:${PY_VER}

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

# Только минимальные системные зависимости
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
    curl \
    libpq-dev \
    libldap2-dev \
    libaio1 \
    libsasl2-dev \
    libsasl2-modules-gssapi-mit \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем установленное из builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

# Права пользователя
RUN useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset && \
    chown -R superset:superset /app

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
