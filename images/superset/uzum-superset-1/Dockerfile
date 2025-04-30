FROM apache/superset:4.1.2

USER root

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Установка Node.js и Yarn через Corepack
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    corepack enable && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем кастомные frontend-файлы
COPY custom/DashboardCard.tsx /app/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/DashboardThumbnail.tsx /app/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
COPY custom/index.tsx /app/superset-frontend/src/pages/DashboardList/index.tsx

# Кастомный логотип и welcome-шаблон
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
COPY custom/public_welcome.html /app/superset/templates/superset/

# Переход в директорию фронтенда
WORKDIR /app/superset-frontend

# Пометка проекта как private (иначе yarn падает)
RUN echo '{ "private": true }' > package.json

# Установка и сборка фронтенда (базовый пакет нужен только для yarn)
RUN yarn install --ignore-engines || true && \
    yarn build || true && \
    yarn cache clean

# Установка дополнительных Python-зависимостей
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

CMD ["/usr/bin/run-server.sh"]
