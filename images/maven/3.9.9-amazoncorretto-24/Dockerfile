FROM maven:3.9.9-amazoncorretto-24
ENV MAVEN_CONFIG=/root/.m2
ENV GLOBAL_MAVEN_CONFIG_DEST=/usr/share/maven/conf

RUN rm -rf /root/.m2/repository && mkdir -p /root/.m2/repository
COPY settings.xml $MAVEN_CONFIG/
COPY settings.xml $GLOBAL_MAVEN_CONFIG_DEST/

