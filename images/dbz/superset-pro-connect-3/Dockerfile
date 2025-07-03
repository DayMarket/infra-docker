FROM quay.io/strimzi/kafka:0.33.2-kafka-3.3.2
USER root

# Debezium Postgres
ADD https://repo1.maven.org/maven2/io/debezium/debezium-connector-postgres/2.4.1.Final/debezium-connector-postgres-2.4.1.Final-plugin.tar.gz /tmp/
RUN mkdir -p /opt/kafka/plugins/debezium \
    && tar -xzf /tmp/debezium-connector-postgres-*.tar.gz -C /opt/kafka/plugins/debezium

# S3 Sink Plugin
RUN curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/confluentinc-kafka-connect-s3-10.5.21.zip -o /tmp/s3-sink.zip \
    && mkdir -p /opt/kafka/plugins/s3-sink \
    && unzip /tmp/s3-sink.zip -d /opt/kafka/plugins/s3-sink \
    && rm /tmp/s3-sink.zip

# Avro support JARs
RUN plugins="/opt/kafka/plugins/s3-sink"; \
    for jar in \
      kafka-connect-avro-converter-7.8.0.jar \
      kafka-schema-registry-client-7.8.0.jar \
      kafka-connect-avro-data-7.8.0.jar \
      kafka-avro-serializer-7.8.0.jar \
      kafka-schema-serializer-7.8.0.jar \
      avro-1.12.0.jar \
      commons-compress-1.27.1.jar \
      s3-connector-based-partitioner-0.0.4-20221117.091721-1.jar; do \
        curl -fsSL "https://yoshi-kafka-connect-plugins.s3.amazonaws.com/${jar}" -o "${plugins}/${jar}"; \
    done

RUN curl -fsSL https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-core/1.12.262/aws-java-sdk-core-1.12.262.jar -o /opt/kafka/plugins/s3-sink/aws-java-sdk-core-1.12.262.jar \
    && curl -fsSL https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-s3/1.12.262/aws-java-sdk-s3-1.12.262.jar -o /opt/kafka/plugins/s3-sink/aws-java-sdk-s3-1.12.262.jar

USER 1001
