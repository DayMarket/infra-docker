FROM quay.io/strimzi/kafka:0.33.2-kafka-3.3.2

USER root

# Debezium Postgres
ADD https://repo1.maven.org/maven2/io/debezium/debezium-connector-postgres/2.4.1.Final/debezium-connector-postgres-2.4.1.Final-plugin.tar.gz /tmp/
RUN mkdir -p /opt/kafka/plugins/debezium && \
    tar -xzf /tmp/debezium-connector-postgres-2.4.1.Final-plugin.tar.gz -C /opt/kafka/plugins/debezium && \
    rm -f /tmp/debezium-connector-postgres-2.4.1.Final-plugin.tar.gz

# S3 Sink
RUN curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/confluentinc-kafka-connect-s3-10.5.21.zip -o /tmp/s3-sink.zip && \
    mkdir -p /opt/kafka/plugins/s3-sink && \
    unzip /tmp/s3-sink.zip -d /opt/kafka/plugins/s3-sink && \
    rm -f /tmp/s3-sink.zip

# Avro support
RUN curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-connect-avro-converter-7.8.0.jar -o /opt/kafka/plugins/s3-sink/kafka-connect-avro-converter-7.8.0.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-schema-registry-client-7.8.0.jar -o /opt/kafka/plugins/s3-sink/kafka-schema-registry-client-7.8.0.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-connect-avro-data-7.8.0.jar -o /opt/kafka/plugins/s3-sink/kafka-connect-avro-data-7.8.0.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-avro-serializer-7.8.0.jar -o /opt/kafka/plugins/s3-sink/kafka-avro-serializer-7.8.0.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-schema-serializer-7.8.0.jar -o /opt/kafka/plugins/s3-sink/kafka-schema-serializer-7.8.0.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/avro-1.12.0.jar -o /opt/kafka/plugins/s3-sink/avro-1.12.0.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/commons-compress-1.27.1.jar -o /opt/kafka/plugins/s3-sink/commons-compress-1.27.1.jar

# AWS Credentials Provider JARs (required for AwsAccessKeyIdSecretKeyProvider)
RUN curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/aws-java-sdk-core-1.12.262.jar -o /opt/kafka/plugins/s3-sink/aws-java-sdk-core-1.12.262.jar && \
    curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/aws-java-sdk-s3-1.12.262.jar -o /opt/kafka/plugins/s3-sink/aws-java-sdk-s3-1.12.262.jar

# Custom partitioner
RUN curl -fsSL https://yoshi-kafka-connect-plugins.s3.amazonaws.com/s3-connector-based-partitioner-0.0.4-20221117.091721-1.jar -o /opt/kafka/plugins/s3-sink/s3-connector-based-partitioner.jar

USER 1001
