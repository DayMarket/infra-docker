FROM eclipse-temurin:23-jdk as java
FROM  trinodb/trino:475
ENV JAVA_HOME=/opt/java/openjdk
COPY --from=java $JAVA_HOME $JAVA_HOME
ENV PATH="${JAVA_HOME}/bin:${PATH}"