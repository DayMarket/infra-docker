FROM apache/superset:4.1.2

USER root

# Копируем дополнительные Python зависимости
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache --no-cache-dir -r /additional_requirements.txt

# Устанавливаем Node.js 18 и Yarn для сборки фронта
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g yarn

# Копируем изменённые исходники фронта
COPY src/ /app/superset-frontend/

# Копируем кастомную картинку uzum.png
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png

# Сборка фронтенда
WORKDIR /app/superset-frontend

RUN yarn install --frozen-lockfile && \
    yarn build

# Возвращаемся на пользователя superset
USER superset
