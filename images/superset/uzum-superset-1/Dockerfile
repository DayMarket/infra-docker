FROM apache/superset:4.1.2

USER root

# Установка Node.js 18 + Corepack (Yarn)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Временное решение для yarn: создаем package.json с флагом "private"
WORKDIR /app/superset-frontend
RUN echo '{ "private": true }' > package.json && \
    yarn init -y && \
    yarn config set workspaces-experimental true

# Копируем только кастомные frontend-файлы (с учетом реальных путей Superset 4.1.2)
COPY custom/DashboardCard.tsx /app/superset-frontend/src/features/dashboards/DashboardCard.tsx
COPY custom/DashboardThumbnail.tsx /app/superset-frontend/src/pages/DashboardList/DashboardThumbnail.tsx
COPY custom/index.tsx /app/superset-frontend/src/pages/DashboardList/index.tsx

# Копируем шаблон welcome
COPY custom/public_welcome.html /app/superset/templates/superset/public_welcome.html

# Копируем кастомные изображения
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png

# Сборка frontend
RUN yarn install --ignore-engines && \
    yarn build && \
    yarn cache clean

# Установка дополнительных Python зависимостей
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

CMD ["/usr/bin/run-server.sh"]
