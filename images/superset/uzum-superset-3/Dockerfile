# === ЭТАП 1: сборка frontend Superset ===
FROM node:18-bullseye-slim as frontend-builder

ENV ESLINT_NO_DEV_ERRORS=true
ENV TSC_COMPILE_ON_ERROR=true
ENV SKIP_PREFLIGHT_CHECK=true

WORKDIR /app

# Клонируем Superset 4.1.2
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git

WORKDIR /app/superset/superset-frontend

# Устанавливаем зависимости
RUN npm ci

# Копируем кастомные файлы
COPY custom/DashboardCard.tsx ./src/features/dashboards/DashboardCard.tsx
COPY custom/index.tsx ./src/pages/DashboardList/index.tsx

# Собираем frontend
RUN npm run build


# === ЭТАП 2: backend Superset + системный пользователь ===
FROM python:3.10-slim-bookworm

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONUNBUFFERED=1 \
    FLASK_ENV=production \
    SUPERSET_HOME=/app/superset

WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    libjpeg-dev \
    zlib1g-dev \
    libldap2-dev \
    libsasl2-dev \
    libmysqlclient-dev \
    default-libmysqlclient-dev \
    curl \
    wget \
    git \
    unzip \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    gcc \
    g++ \
    freetds-dev \
    unixodbc-dev \
    libsqlite3-dev \
    libcurl4-openssl-dev \
    libpng-dev \
    pkg-config \
    software-properties-common \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Клонируем Superset 4.1.2
RUN git clone --depth 1 --branch 4.1.2 https://github.com/apache/superset.git /app/superset

WORKDIR /app/superset

# Устанавливаем Python зависимости
RUN pip install --upgrade pip && \
    pip install -r requirements/requirements-merge.txt

# Устанавливаем Superset как Python пакет
RUN pip install .

# Копируем собранный frontend из этапа 1
COPY --from=frontend-builder /app/superset-frontend /app/superset-frontend

# Кастомные HTML и иконки
COPY custom/public_welcome.html /app/superset/templates/appbuilder/general/welcome.html

COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png


# Удаляем старые ассеты
RUN rm -rf /app/superset/static/assets/*

# Создаём системного пользователя superset
RUN useradd --user-group -d ${SUPERSET_HOME} -m --no-log-init --shell /bin/bash superset \
 && mkdir -p ${SUPERSET_HOME}/superset_home \
 && chown -R superset:superset /app

# Переключаемся на безопасного пользователя
USER superset

EXPOSE 8088

CMD ["/usr/bin/run-server.sh"]
