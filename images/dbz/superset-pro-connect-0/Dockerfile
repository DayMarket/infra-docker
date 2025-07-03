FROM quay.io/strimzi/kafka:0.33.2-kafka-3.3.2

USER root

# Debezium PostgreSQL Connector
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/debezium-connector-postgres-3.0.7.Final-plugin.tar.gz /tmp/
RUN mkdir -p /opt/kafka/plugins/debezium && \
    tar -xzf /tmp/debezium-connector-postgres-3.0.7.Final-plugin.tar.gz -C /opt/kafka/plugins/debezium

# Debezium Scripting (optional)
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/debezium-scripting-3.0.7.Final.tar.gz /tmp/
RUN mkdir -p /opt/kafka/plugins/debezium-scripting && \
    tar -xzf /tmp/debezium-scripting-3.0.7.Final.tar.gz -C /opt/kafka/plugins/debezium-scripting

# Confluent Avro support
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-connect-avro-converter-7.8.0.jar /opt/kafka/plugins/
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-schema-registry-client-7.8.0.jar /opt/kafka/plugins/
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-connect-avro-data-7.8.0.jar /opt/kafka/plugins/
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-avro-serializer-7.8.0.jar /opt/kafka/plugins/
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/kafka-schema-serializer-7.8.0.jar /opt/kafka/plugins/
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/avro-1.12.0.jar /opt/kafka/plugins/
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/commons-compress-1.27.1.jar /opt/kafka/plugins/

# S3 Sink Connector
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/confluentinc-kafka-connect-s3-10.5.21.zip /tmp/
RUN unzip /tmp/confluentinc-kafka-connect-s3-10.5.21.zip -d /opt/kafka/plugins/s3-sink

# Custom S3 Partitioner
ADD https://yoshi-kafka-connect-plugins.s3.amazonaws.com/s3-connector-based-partitioner-0.0.4-20221117.091721-1.jar /opt/kafka/plugins/

USER 1001
