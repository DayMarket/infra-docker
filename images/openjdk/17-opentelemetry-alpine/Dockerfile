FROM openjdk:17

ENV OTEL_CLIENT_VERSION=2.9.0

ADD https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/download/v${OTEL_CLIENT_VERSION}/opentelemetry-javaagent.jar /opentelemetry-javaagent.jar

ENV OTEL_METRICS_EXPORTER=none
ENV OTEL_LOGS_EXPORTER=none