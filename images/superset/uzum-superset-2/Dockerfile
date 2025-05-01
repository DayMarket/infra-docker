ARG PY_VER=3.10-slim-bookworm

FROM node:18-bullseye-slim AS superset-node

ARG NPM_BUILD_CMD="build"

RUN apt-get update -qq && \
    apt-get install -yqq --no-install-recommends \
        build-essential \
        python3 \
        git

ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    GIT_SSL_NO_VERIFY=1

WORKDIR /app/superset-frontend

# Клонируем репозиторий Superset и подготавливаем frontend
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
    cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
    cp /git/superset/superset-frontend/package*.json ./ && \
    npm ci

# Кастомные frontend-файлы
#COPY custom/DashboardCard.tsx /git/superset/superset-frontend/src/features/dashboards/DashboardCard.tsx
#COPY custom/DashboardThumbnail.tsx /git/superset/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
#COPY custom/index.tsx /git/superset/superset-frontend/src/pages/DashboardList/index.tsx

# Сборка frontend
RUN cp -Rf /git/superset/superset-frontend/* /app/superset-frontend && \
    npm run ${BUILD_CMD}

# ---------------- Final stage ----------------
FROM python:${PY_VER} AS lean

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    SUPERSET_ENV=production \
    FLASK_APP="superset.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    SUPERSET_HOME="/app/superset_home" \
    SUPERSET_PORT=8088 \
    GIT_SSL_NO_VERIFY=1

WORKDIR /app

# Установка системных зависимостей и playwright deps
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends \
    build-essential \
    curl \
    git \
    libpq-dev \
    default-libmysqlclient-dev \
    libsasl2-dev \
    libldap2-dev \
    libffi-dev \
    libssl-dev \
    libx11-xcb1 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm-dev \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Установка Python-зависимостей
COPY requirements-merged.txt /app/requirements.txt
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt && \
    playwright install-deps && \
    playwright install chromium

# Клонирование Superset
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset

# Копируем backend код
RUN mkdir -p ${PYTHONPATH} superset/static superset-frontend apache_superset.egg-info requirements && \
    cp /git/superset/setup.py /git/superset/pyproject.toml /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
    cp -Rf /git/superset/superset /app/superset && \
    pip install --no-cache-dir -e . && \
    flask fab babel-compile --target superset/translations

# Добавляем собранные frontend-ассеты
COPY --from=superset-node /app/superset/static/assets /app/superset/static/assets

# Кастомные шаблоны и логотипы
COPY custom/public_welcome.html /app/superset/templates/superset/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png

# Финальные настройки
RUN useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset && \
    chown -R superset:superset ./* && \
    cp -Rf /git/superset/docker/run-server.sh /usr/bin/ && \
    chmod 755 /usr/bin/run-server.sh

USER superset

HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"
EXPOSE ${SUPERSET_PORT}

CMD ["/usr/bin/run-server.sh"]
