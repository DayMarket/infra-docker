######################################################################
# Node stage to build static assets
######################################################################
FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        build-essential \
        python3 \
        git

WORKDIR /app/superset-frontend

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    GIT_SSL_NO_VERIFY=1

RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package.json ./ && \
    cp /git/superset/superset-frontend/package-lock.json ./ && \
    npm ci && \
    cp -Rf /git/superset/superset-frontend/* /app/superset-frontend

COPY ./src/superset/ /app/

RUN npm run ${BUILD_CMD}

######################################################################
# Final lean image
######################################################################
FROM python:3.9-slim-bookworm AS lean

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088

WORKDIR /app

RUN mkdir -p ${PYTHONPATH} superset static superset-frontend apache_superset.egg-info requirements \
    && useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset

RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
    curl \
    default-libmysqlclient-dev \
    libsasl2-dev \
    libsasl2-modules-gssapi-mit \
    libpq-dev \
    libecpg-dev \
    libldap2-dev \
    libaio1 \
    build-essential \
    pkg-config \
    git && \
    rm -rf /var/lib/apt/lists/*

COPY --from=superset-node /app/superset-frontend /app/superset-frontend
COPY --from=superset-node /app/superset/static/assets /app/superset/static/assets

# Копирование исходников и установка Superset
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    mkdir -p /app/superset && \
    cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    cp -Rf /git/superset/superset/* /app/superset/

COPY ./requirements/base.txt /tmp/base.txt
COPY ./requirements/development.txt /tmp/development.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip==25.0.1 setuptools==75.8.0 && \
    pip install --no-cache-dir -r /tmp/base.txt -r /tmp/development.txt

RUN pip install --no-cache-dir -e .

RUN flask fab babel-compile --target superset/translations && \
    chown -R superset:superset superset/translations

COPY --from=superset-node /git/superset/docker/run-server.sh /usr/bin/run-server.sh

RUN chmod 755 /usr/bin/run-server.sh && \
    chown -R superset:superset /app

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
