FROM ghcr.io/actions/runner:2.324.0

USER root

ENV JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8

RUN curl -s https://repos.azul.com/azul-repo.key | gpg --dearmor -o /usr/share/keyrings/azul.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/azul.gpg] https://repos.azul.com/zulu/deb stable main" | tee /etc/apt/sources.list.d/zulu.list && \
    apt update && \
    apt install -y zulu17-jdk wget

RUN wget -q https://github.com/qa-guru/allure-notifications/releases/download/4.9.0/allure-notifications-4.9.0.jar -O /home/runner/notifications.jar

USER runner

LABEL org.opencontainers.image.source=https://github.com/daymarket/qa-docker
