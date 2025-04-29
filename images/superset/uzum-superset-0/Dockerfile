# syntax=docker/dockerfile:1.4
FROM apache/superset:4.1.2

USER root

# Устанавливаем опции shell, чтобы pipe'ы не теряли ошибки (DL4006)
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Копируем дополнительные Python зависимости
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

# Устанавливаем Node.js 18 и Yarn для сборки фронта
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g yarn@1.22.19 && \
    yarn cache clean && \
    rm -rf /var/lib/apt/lists/*

# Копируем изменённые исходники фронта
COPY src/ /app/superset-frontend/

# Копируем кастомную картинку uzum.png
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png

# Сборка фронтенда
WORKDIR /app/superset-frontend

RUN yarn install --frozen-lockfile && \
    yarn build && \
    yarn cache clean

# Возвращаемся на пользователя superset
USER superset
