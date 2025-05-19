FROM ghcr.io/actions/actions-runner:2.324.0

USER root

RUN set -ex && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    wget \
    libgconf-2-4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnss3-dev \
    libxss-dev \
    fonts-liberation \
    libasound2 \
    libu2f-udev \
    libvulkan1 \
    xdg-utils && \
    rm -rf /var/lib/apt/lists/*

RUN wget -q https://github.com/allure-framework/allurectl/releases/download/2.10.1/allurectl_linux_386 -O /home/runner/allurectl && \ 
    chmod +x /home/runner/allurectl && \ 
    chown runner:runner /home/runner/allurectl && \
    wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt-get install -y --no-install-recommends ./google-chrome-stable_current_amd64.deb

USER runner