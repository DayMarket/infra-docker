FROM spark:3.5.5-scala2.12-java17-ubuntu

USER root

RUN set -ex; \
    apt-get update; \
    apt-get install -y python3.10 python3-pip curl sudo unzip vim; \
    rm -rf /var/lib/apt/lists/*

USER spark

