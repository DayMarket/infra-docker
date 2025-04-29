FROM apache/superset:4.1.2

USER root

# Устанавливаем Python-зависимости
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache --no-cache-dir -r /additional_requirements.txt

# Устанавливаем Node.js 18, Yarn и Lerna (в legacy-версии)
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install -g yarn@1.22.19 lerna@6.6.2 && \
    yarn cache clean && \
    rm -rf /var/lib/apt/lists/*

# Копируем весь фронтенд Superset
COPY src/superset-frontend/ /app/superset-frontend/

# Копируем кастомную картинку
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png

# Сборка фронтенда
WORKDIR /app/superset-frontend

RUN sed -i '/"version":/a \  "private": true,' package.json && \
    lerna bootstrap && \
    yarn build && \
    yarn cache clean

USER superset
