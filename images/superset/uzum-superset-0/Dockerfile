FROM apache/superset:4.1.2

USER root

# Установка Node.js + Yarn через Corepack
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Копируем кастомные frontend-файлы в правильные места Superset 4.1.2
COPY src/superset-frontend/DashboardCard.tsx /app/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY src/superset-frontend/DashboardThumbnail.tsx /app/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
COPY src/superset-frontend/index.tsx /app/superset-frontend/src/pages/DashboardList/index.tsx

# Кастомные шаблоны и изображения
COPY src/public_welcome.html /app/superset/templates/superset/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png

# Сборка frontend
WORKDIR /app/superset-frontend
RUN yarn install --ignore-engines && \
    yarn build && \
    yarn cache clean

# Установка дополнительных Python-зависимостей
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

CMD ["/usr/bin/run-server.sh"]
