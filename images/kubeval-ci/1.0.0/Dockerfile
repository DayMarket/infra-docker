FROM alpine:3.18

# Установка необходимых зависимостей с указанием версий
RUN apk add --no-cache \
    curl=8.9.1-r1 \
    tar=1.34-r3

# Установка последней версии kubeval
RUN curl -L -o kubeval.tar.gz https://github.com/instrumenta/kubeval/releases/latest/download/kubeval-linux-amd64.tar.gz && \
    tar xf kubeval.tar.gz && \
    mv kubeval /usr/local/bin && \
    rm kubeval.tar.gz

# Проверка установки
RUN kubeval --version

# Рабочая директория
WORKDIR /workdir

# Точка входа
ENTRYPOINT ["kubeval"]
CMD ["--help"]