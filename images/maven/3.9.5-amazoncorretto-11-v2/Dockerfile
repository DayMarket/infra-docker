FROM maven:3.9.5-amazoncorretto-11-debian

RUN apt-get update \
    && apt-get -y install openssh-client git --no-install-recommends \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY settings.xml /usr/share/maven/conf/