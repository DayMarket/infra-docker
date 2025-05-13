FROM  trinodb/trino:475
ENV JAVA_HOME=/opt/java/openjdk
COPY --from=eclipse-temurin:23-jdk $JAVA_HOME $JAVA_HOME
ENV PATH="${JAVA_HOME}/bin:${PATH}"