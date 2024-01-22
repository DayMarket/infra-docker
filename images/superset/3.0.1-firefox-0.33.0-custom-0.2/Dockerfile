#
# custom superset with UZ geomap
# base from here https://github.com/apache/superset/blob/3.0.1/Dockerfile
#

######################################################################
# Node stage to deal with static asset construction
######################################################################
ARG PY_VER=3.9-slim-bookworm

# if BUILDPLATFORM is null, set it to 'amd64' (or leave as is otherwise).
ARG BUILDPLATFORM=${BUILDPLATFORM:-amd64}
#FROM --platform=${BUILDPLATFORM} node:16-slim AS superset-node
FROM node:16-slim AS superset-node

ARG NPM_BUILD_CMD="build"

RUN apt-get update -q \
    && apt-get install -yq --no-install-recommends \
        python3 \
        make \
        gcc \
        g++ \
        git

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# NPM ci first, as to NOT invalidate previous steps except for when package.json changes
WORKDIR /app/superset-frontend

#COPY ./docker/frontend-mem-nag.sh /

#RUN /frontend-mem-nag.sh

#COPY superset-frontend/package*.json ./

#RUN npm ci

#COPY ./superset-frontend ./

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 3.0.1 https://github.com/apache/superset.git /git/superset
RUN cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh \
    && cp /git/superset/superset-frontend/package*.json ./ \
    && npm ci \
    && cp -Rf /git/superset/superset-frontend/* /app/superset-frontend 
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

RUN mkdir -p ${PYTHONPATH} \
    && useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset \
    && apt-get update -q \
    && apt-get install -yq --no-install-recommends \
        build-essential \
        curl \
        default-libmysqlclient-dev \
        libsasl2-dev \
        libsasl2-modules-gssapi-mit \
        libpq-dev \
        libecpg-dev \
        libldap2-dev \
        git \
    && rm -rf /var/lib/apt/lists/*

#COPY --chown=superset:superset ./requirements/*.txt  /app/requirements/
#COPY --chown=superset:superset setup.py MANIFEST.in README.md ./
# setup.py uses the version information in package.json
#COPY --chown=superset:superset superset-frontend/package.json superset-frontend/

ENV GIT_SSL_NO_VERIFY=1
RUN git clone --depth 1 --branch 3.0.1 https://github.com/apache/superset.git /git/superset
RUN mkdir /app/requirements && cp -Rf /git/superset/requirements/*.txt  /app/requirements/ && \
    cp /git/superset/setup.py /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    mkdir /app/superset-frontend && cp /git/superset/superset-frontend/package.json /app/superset-frontend/ && \
    mkdir /app/superset && cp -Rf /git/superset/superset/* /app/superset/ && \
    cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && \
    chmod 755 /usr/bin/run-server.sh

RUN mkdir -p superset/static \
    && touch superset/static/version_info.json \
    && pip install --no-cache-dir -r requirements/local.txt

COPY --chown=superset:superset --from=superset-node /app/superset/static/assets superset/static/assets
## Lastly, let's install superset itself
#COPY --chown=superset:superset superset superset

RUN chown -R superset:superset ./* \
    && pip install --no-cache-dir -e . \
    && flask fab babel-compile --target superset/translations

#COPY --chmod=755 ./docker/run-server.sh /usr/bin/
USER superset

HEALTHCHECK CMD curl -f "http://localhost:$SUPERSET_PORT/health"

EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]

######################################################################
# KE image...
######################################################################

FROM lean AS ke

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends -y firefox-esr=115.4.0esr-1~deb12u1 libsnappy-dev=1.1.9-3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir --parents /usr/local/share/ca-certificates/Yandex && \
    curl https://storage.yandexcloud.net/cloud-certs/CA.pem -o /usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt && \
    chmod 655 /usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt

ENV GECKODRIVER_VERSION=0.33.0
RUN curl -s -OJL https://github.com/mozilla/geckodriver/releases/download/v${GECKODRIVER_VERSION}/geckodriver-v${GECKODRIVER_VERSION}-linux64.tar.gz && \
    tar -x geckodriver -zf geckodriver-v${GECKODRIVER_VERSION}-linux64.tar.gz -O > /usr/bin/geckodriver && \
    chmod 755 /usr/bin/geckodriver && \
    rm geckodriver-v${GECKODRIVER_VERSION}-linux64.tar.gz

COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache --no-cache-dir -r /additional_requirements.txt
    #pip install --no-cache --no-cache-dir prophet==1.1.5
    # pip install --no-cache --no-cache-dir --force-reinstall git+https://github.com/benoitc/gunicorn.git@1efc5d91fa3dd2fad54cb931a9f7473499de5165

USER superset