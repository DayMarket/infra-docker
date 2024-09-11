FROM maven:3.9.4-amazoncorretto-21-debian
ENV MAVEN_CONFIG=/root/.m2
ENV GLOBAL_MAVEN_CONFIG_DEST=/usr/share/maven/conf

RUN apt-get update \
    && apt-get -y --no-install-recommends install openssh-client git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.m2 \
    && mkdir /root/.m2/repository
COPY settings.xml $MAVEN_CONFIG/
COPY settings.xml $GLOBAL_MAVEN_CONFIG_DEST/

