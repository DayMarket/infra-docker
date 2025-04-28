# Стадия 1: сборка фронтенда 
FROM node:18-bullseye-slim AS frontend-builder

WORKDIR /app/superset-frontend

# Клонируем весь код Superset
ENV GIT_SSL_NO_VERIFY=1

RUN apt-get update -qq \
    && apt-get install -yqq --no-install-recommends \
    build-essential \
    git \
    ca-certificates \
    && git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset \
    && cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh \
    && cp /git/superset/superset-frontend/package.json ./ \
    && cp /git/superset/superset-frontend/package-lock.json ./ \
    && npm ci \
    && cp -Rf /git/superset/superset-frontend/* /app/superset-frontend

COPY ./src/superset/ /app

RUN npm run build

# Стадия 2: финальный образ
FROM python:3.9-slim-bookworm AS superset-backend

WORKDIR /app

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

RUN mkdir -p ${PYTHONPATH} superset/static requirements superset-frontend apache_superset.egg-info requirements \
    && useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset \
    && apt-get update -qq && apt-get install -yqq --no-install-recommends \
        curl \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libsasl2-modules-gssapi-mit \
        libpq-dev \
        libecpg-dev \
        libldap2-dev \
        gcc \
        git \
     && touch superset/static/version_info.json \
     && chown -R superset:superset ./* \
     && rm -rf /var/lib/apt/lists/*

ENV GIT_SSL_NO_VERIFY=1

RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset \
    && cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ \
    && cp /git/superset/superset-frontend/package.json /app/superset-frontend/ \
    && cp -Rf /git/superset/requirements/base.txt  /app/requirements/ 

COPY --chown=superset:superset --from=frontend-builder /app/superset/static/assets superset/static/assets

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.1 setuptools==75.8.0 \
    && pip install --no-cache-dir -r requirements/base.txt \
    && pip install --no-cache-dir -e . \
    && cp -Rf /git/superset/docker/run-server.sh /usr/bin/ \
    && chown -R superset:superset ./* \
    && chmod 755 /usr/bin/run-server.sh

RUN mkdir --parents /usr/local/share/ca-certificates/Yandex && \
    curl https://storage.yandexcloud.net/cloud-certs/CA.pem -o /usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt && \
    chmod 655 /usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt

COPY requirements.txt /additional_requirements.txt

RUN  pip install --no-cache --no-cache-dir -r /additional_requirements.txt

COPY custom/uzum.png /app/superset/static/assets/images/uzum.png

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health" || exit 1

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
