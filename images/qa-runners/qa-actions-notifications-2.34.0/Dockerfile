FROM ghcr.io/actions/actions-runner:2.324.0

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER root

ENV JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8

RUN apt-get update && \
    apt-get install -y --no-install-recommends wget gnupg && \
    wget -qO - https://repos.azul.com/azul-repo.key | gpg --dearmor -o /usr/share/keyrings/azul.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" > /etc/apt/sources.list.d/zulu.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends zulu17-jdk && \
    rm -rf /var/lib/apt/lists/*

RUN wget -q https://github.com/qa-guru/allure-notifications/releases/download/4.9.0/allure-notifications-4.9.0.jar -O /home/runner/notifications.jar

USER runner

LABEL org.opencontainers.image.source=https://github.com/daymarket/qa-docker
