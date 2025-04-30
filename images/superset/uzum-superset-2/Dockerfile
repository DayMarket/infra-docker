# ---------- Node stage: Build Superset frontend ----------
    FROM node:18-bullseye-slim AS superset-node

    ARG BUILD_CMD=build
    
    RUN apt-get update -qq && \
        apt-get install -yqq --no-install-recommends \
            build-essential \
            python3 \
            git && \
        rm -rf /var/lib/apt/lists/*
    
    ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    WORKDIR /app/superset-frontend
    
    # Клонируем Superset 4.1.2
    ENV GIT_SSL_NO_VERIFY=1
    RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset && \
        cp /git/superset/docker/frontend-mem-nag.sh / && /frontend-mem-nag.sh && \
        cp /git/superset/superset-frontend/package.json ./ && \
        cp /git/superset/superset-frontend/package-lock.json ./ && \
        npm ci
    
    # Копируем кастомные frontend-файлы в оригинальный исходник перед сборкой
    COPY custom/DashboardCard.tsx /git/superset/superset-frontend/src/features/dashboards/DashboardCard.tsx
    COPY custom/DashboardThumbnail.tsx /git/superset/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
    COPY custom/index.tsx /git/superset/superset-frontend/src/pages/DashboardList/index.tsx
    
    # Копируем всё в рабочую папку и билдим
    RUN cp -Rf /git/superset/superset-frontend/* /app/superset-frontend && \
        npm run ${BUILD_CMD}
    
    # ---------- Lean stage: Final Superset image ----------
    FROM python:3.10-slim-bookworm AS lean
    
    WORKDIR /app
    ENV LANG=C.UTF-8 \
        LC_ALL=C.UTF-8 \
        SUPERSET_ENV=production \
        FLASK_APP="superset.app:create_app()" \
        PYTHONPATH="/app/pythonpath" \
        SUPERSET_HOME="/app/superset_home" \
        SUPERSET_PORT=8088
    
    RUN apt-get update -qq && \
        apt-get install -yqq --no-install-recommends \
            build-essential \
            curl \
            default-libmysqlclient-dev \
            libsasl2-dev \
            libsasl2-modules-gssapi-mit \
            libpq-dev \
            libecpg-dev \
            libldap2-dev \
            git && \
        mkdir -p ${PYTHONPATH} superset/static superset-frontend apache_superset.egg-info requirements && \
        useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset && \
        rm -rf /var/lib/apt/lists/*
    
    # Клонируем исходники Superset 4.1.2
    RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /git/superset
    
    # Базовая установка Superset
    RUN cp /git/superset/setup.py /git/superset/MANIFEST.in /git/superset/README.md /app/ && \
        cp -Rf /git/superset/requirements/*.txt /app/requirements/ && \
        pip install --no-cache-dir -r requirements/base.txt
    
    # Копируем собранные ассеты
    COPY --from=superset-node /app/superset-frontend /app/superset-frontend
    COPY --from=superset-node /app/superset-frontend/build /app/superset/static/assets
    
    # Копируем backend Superset
    RUN cp -Rf /git/superset/superset /app/superset && \
        pip install --no-cache-dir -e . && \
        flask fab babel-compile --target superset/translations && \
        cp /git/superset/docker/run-server.sh /usr/bin/ && \
        chmod 755 /usr/bin/run-server.sh
    
    # Кастомный шаблон и логотип
    COPY custom/public_welcome.html /app/superset/templates/superset/
    COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
    COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
    
    # Установка дополнительных Python-зависимостей
    COPY requirements.txt /additional_requirements.txt
    RUN pip install --no-cache-dir -r /additional_requirements.txt
    
    USER superset
    
    HEALTHCHECK CMD curl -f "http://localhost:${SUPERSET_PORT}/health"
    EXPOSE ${SUPERSET_PORT}
    
    CMD ["/usr/bin/run-server.sh"]
    