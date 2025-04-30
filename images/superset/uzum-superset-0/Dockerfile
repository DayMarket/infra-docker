FROM apache/superset:4.1.2

USER root

RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY src/superset-frontend/ /app/superset-frontend/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY src/templates/ /app/superset/templates/

WORKDIR /app/superset-frontend
RUN yarn install --ignore-engines || true && \
    yarn build || true && \
    yarn cache clean

COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt

USER superset

CMD ["/usr/bin/run-server.sh"]
