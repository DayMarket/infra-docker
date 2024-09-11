FROM openjdk:17
ENV MAVEN_CONFIG=/root/.m2
ENV GLOBAL_MAVEN_CONFIG_DEST=/usr/share/maven/conf

RUN mkdir -p /root/.m2 \
    && mkdir /root/.m2/repository
COPY settings.xml $MAVEN_CONFIG/
COPY settings.xml $GLOBAL_MAVEN_CONFIG_DEST/