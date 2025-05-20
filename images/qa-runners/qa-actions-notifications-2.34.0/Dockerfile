FROM ghcr.io/actions/runner:2.324.0

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER root

ENV JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8

# Установка JDK 17 от Azul
RUN wget -qO - https://repos.azul.com/azul-repo.key | gpg --dearmor -o /usr/share/keyrings/azul.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" > /etc/apt/sources.list.d/zulu.list && \
    apt-get update && \
    apt-get install -y zulu17-jdk wget && \
    rm -rf /var/lib/apt/lists/*

# Скачивание Allure Notifications 4.9.0
RUN wget -q https://github.com/qa-guru/allure-notifications/releases/download/4.9.0/allure-notifications-4.9.0.jar -O /home/runner/notifications.jar

USER runner

LABEL org.opencontainers.image.source=https://github.com/daymarket/qa-docker
