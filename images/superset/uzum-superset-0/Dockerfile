FROM apache/superset:4.1.2

USER root

# Устанавливаем Node.js + Yarn через Corepack
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Копируем только кастомные frontend-файлы
COPY src/superset-frontend/src/DashboardCard.tsx /app/superset-frontend/src/views/Dashboard/
COPY src/superset-frontend/src/DashboardThumbnail.tsx /app/superset-frontend/src/views/Dashboard/
COPY src/superset-frontend/src/index.tsx /app/superset-frontend/src/views/Dashboard/
COPY src/superset-frontend/src/DashboardList/index.tsx /app/superset-frontend/src/views/Dashboard/DashboardList/

# Сборка frontend
WORKDIR /app/superset-frontend
RUN yarn install --ignore-engines || true && \
    yarn build || true && \
    yarn cache clean

# Копируем кастомный темплейт и requirements
COPY src/templates/ /app/superset/templates/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

CMD ["/usr/bin/run-server.sh"]
