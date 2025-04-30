FROM apache/superset:4.1.2 as base

USER root
ENV PATH="/app/node_modules/.bin:$PATH"

# Устанавливаем системные зависимости, необходимые для сборки frontend
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    python3-dev \
    libffi-dev \
    libpq-dev \
    libsasl2-dev \
    libssl-dev \
    libxml2-dev \
    libxslt1-dev \
    libldap2-dev \
    npm \
    nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Копируем весь frontend из src/superset-frontend
COPY src/superset-frontend/ /app/superset-frontend/

# Копируем кастомную картинку
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png

# Копируем кастомные Python зависимости
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache --no-cache-dir -r /additional_requirements.txt || true

# Собираем frontend
WORKDIR /app/superset-frontend
RUN yarn install --frozen-lockfile || true && \
    yarn build || true && \
    yarn cache clean

# Финальный рабочий Superset запускается как обычный образ
WORKDIR /app
USER superset
