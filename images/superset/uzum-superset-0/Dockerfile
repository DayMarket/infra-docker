FROM apache/superset:4.1.2

USER root

# Установим yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y yarn && \
    apt-get clean

# Копируем кастомный frontend
COPY src/superset-frontend/ /app/superset-frontend/

# Устанавливаем зависимости и билдим фронт с отключением ошибок
WORKDIR /app/superset-frontend
RUN yarn install --ignore-engines || true && \
    yarn build || true && \
    yarn cache clean

# Копируем кастомные requirements
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

# Команда запуска
CMD ["/usr/bin/run-server.sh"]
