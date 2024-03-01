FROM maven:3.9.4-amazoncorretto-21-debian
RUN apt-get update \
    && apt-get -y --no-install-recommendsinstall openssh-client git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY settings.xml /usr/share/maven/conf/
