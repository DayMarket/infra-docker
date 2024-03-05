#
# custom superset with UZ geomap
# base from here https://github.com/apache/superset/blob/3.1.1/Dockerfile
#

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

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 3.1.1 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package.json ./ && \
    cp /git/superset/superset-frontend/package-lock.json ./ && \
    npm ci && \
    cp -Rf /git/superset/superset-frontend/* /app/superset-frontend 
COPY ./src/superset/ /app

# This seems to be the most expensive step
RUN npm run ${BUILD_CMD}

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
        curl \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libsasl2-modules-gssapi-mit \
        libpq-dev \
        libecpg-dev \
        libldap2-dev \
        git \
     && touch superset/static/version_info.json \
     && chown -R superset:superset ./* \
     && rm -rf /var/lib/apt/lists/*


ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 3.1.1 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/setup.py /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    cp /git/superset/superset-frontend/package.json /app/superset-frontend/ && \
    cp -Rf /git/superset/requirements/*.txt  /app/requirements/ && \
    pip install --no-cache-dir -r requirements/local.txt

COPY --chown=superset:superset --from=superset-node /app/superset/static/assets superset/static/assets

RUN cp -Rf /git/superset/superset/* /app/superset/ && \
    pip install --no-cache-dir -e . \
    && flask fab babel-compile --target superset/translations \
    && chown -R superset:superset superset/translations && \
    cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && \
    chown -R superset:superset ./* && \
    chmod 755 /usr/bin/run-server.sh

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]

######################################################################
# DEV image...
######################################################################
FROM lean AS dev
ARG GECKODRIVER_VERSION=v0.33.0 \
    FIREFOX_VERSION=117.0.1

USER root

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        libnss3 \
        libdbus-glib-1-2 \
        libgtk-3-0 \
        libx11-xcb1 \
        libasound2 \
        libxtst6 \
        wget
    # Install GeckoDriver WebDriver
RUN curl -s -OJL https://github.com/mozilla/geckodriver/releases/download/${GECKODRIVER_VERSION}/geckodriver-${GECKODRIVER_VERSION}-linux64.tar.gz \
    && tar xfz geckodriver-${GECKODRIVER_VERSION}-linux64.tar.gz -C /usr/local/bin
    # Install Firefox
RUN curl -s -OJL "https://download-installer.cdn.mozilla.net/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2" \
    && tar xfj firefox-${FIREFOX_VERSION}.tar.bz2 -C /opt
RUN ln -s /opt/firefox/firefox /usr/local/bin/firefox
RUN apt-get autoremove -yqq --purge wget && rm -rf /var/[log,tmp]/* /tmp/*
# Cache everything for dev purposes...
RUN --mount=type=bind,target=./requirements/base.txt,src=./requirements/base.txt \
    --mount=type=bind,target=./requirements/docker.txt,src=./requirements/docker.txt \
    pip install --no-cache-dir -r requirements/docker.txt && \
    mkdir --parents /usr/local/share/ca-certificates/Yandex && \
    curl https://storage.yandexcloud.net/cloud-certs/CA.pem -o /usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt && \
    chmod 655 /usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt

COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache --no-cache-dir -r /additional_requirements.txt

USER superset
