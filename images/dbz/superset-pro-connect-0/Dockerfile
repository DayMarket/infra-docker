FROM    quay.io/strimzi/kafka:0.33.2-kafka-3.3.2

USER    root

ADD     https://repo1.maven.org/maven2/io/debezium/debezium-connector-postgres/2.4.1.Final/debezium-connector-postgres-2.4.1.Final-plugin.tar.gz /tmp/

RUN     mkdir -p /opt/kafka/plugins/debezium && \
        tar -xzf /tmp/debezium-connector-postgres-*.tar.gz -C /opt/kafka/plugins/debezium

USER    1001
