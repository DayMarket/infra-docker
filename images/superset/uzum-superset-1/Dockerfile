FROM apache/superset:4.1.2

USER root

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Установка Node.js 18 и Yarn через Corepack
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    corepack enable && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копирование кастомных frontend-файлов
COPY custom/DashboardCard.tsx /app/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/DashboardThumbnail.tsx /app/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
COPY custom/index.tsx /app/superset-frontend/src/pages/DashboardList/index.tsx
COPY custom/ChartCard.tsx /app/superset-frontend/src/features/home/ChartCard.tsx

# Кастомный логотип и favicon
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png

# Кастомный шаблон welcome-страницы
COPY custom/public_welcome.html /app/superset/templates/superset/

# Сборка frontend
WORKDIR /app/superset-frontend
RUN yarn config set private true && \
    yarn install --ignore-engines --frozen-lockfile && \
    yarn build && \
    yarn cache clean

# Установка дополнительных Python-зависимостей
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

CMD ["/usr/bin/run-server.sh"]
