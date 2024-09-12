FROM openjdk:21
ENV MAVEN_CONFIG=/root/.m2
ENV GLOBAL_MAVEN_CONFIG_DEST=/usr/share/maven/conf

COPY settings.xml $MAVEN_CONFIG/
COPY settings.xml $GLOBAL_MAVEN_CONFIG_DEST/