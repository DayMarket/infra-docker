FROM spark:3.5.5-scala2.12-java17-python3-ubuntu
USER root
RUN apt-get update && \
    apt-get install -y kafkacat wget


ENV SPARK_HOME=${SPARK_HOME:-"/opt/spark"}
ENV SPARK_VERSION=3.5.5
ENV SPARK_MAJOR_VERSION=3.5
ENV ICEBERG_VERSION=1.9.1
ENV AWS_SDK_VERSION=1.12.262
ENV HADOOP_AWS_VERSION=3.3.4


WORKDIR ${SPARK_HOME} \
RUN curl https://dlcdn.apache.org/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz -o spark-${SPARK_VERSION}-bin-hadoop3.tgz \
 && tar xvzf spark-${SPARK_VERSION}-bin-hadoop3.tgz --directory /opt/spark --strip-components 1 \
 && rm -rf spark-${SPARK_VERSION}-bin-hadoop3.tgz



WORKDIR /opt/spark/jars
RUN curl -s https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12/${ICEBERG_VERSION}/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12-${ICEBERG_VERSION}.jar -Lo /opt/spark/jars/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12-${ICEBERG_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-aws-bundle/${ICEBERG_VERSION}/iceberg-aws-bundle-${ICEBERG_VERSION}.jar -Lo /opt/spark/jars/iceberg-aws-bundle-${ICEBERG_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/${HADOOP_AWS_VERSION}/hadoop-aws-${HADOOP_AWS_VERSION}.jar -Lo /opt/spark/jars/hadoop-aws-${HADOOP_AWS_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/spark/spark-avro_2.12/${SPARK_VERSION}/spark-avro_2.12-${SPARK_VERSION}.jar -Lo /opt/spark/jars/spark-avro_2.12-${SPARK_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/spark/spark-streaming-kafka-0-10_2.12/${SPARK_VERSION}/spark-streaming-kafka-0-10_2.12-${SPARK_VERSION}.jar -Lo /opt/spark/jars/spark-streaming-kafka-0-10_2.12-${SPARK_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/${AWS_SDK_VERSION}/aws-java-sdk-bundle-${AWS_SDK_VERSION}.jar -Lo /opt/spark/jars/aws-java-sdk-bundle-${AWS_SDK_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.11.0/jmx_prometheus_javaagent-0.11.0.jar -Lo /opt/spark/jars/jmx_prometheus_javaagent-0.11.0.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/hudi/hudi-utilities-slim-bundle_2.12/0.15.0/hudi-utilities-slim-bundle_2.12-0.15.0.jar -o /opt/spark/jars/hudi-utilities-slim-bundle.jar\
&& curl -s https://repo1.maven.org/maven2/org/apache/hudi/hudi-spark3.5-bundle_2.12/0.15.0/hudi-spark3.5-bundle_2.12-0.15.0.jar -o /opt/spark/jars/hudi-spark-bundle.jar  \
&& curl -s https://repo1.maven.org/maven2/com/clickhouse/clickhouse-jdbc/0.7.1/clickhouse-jdbc-0.7.1-all.jar -o /opt/spark/jars/clickhouse-jdbc-0.7.1-all.jar \
&& curl -s https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.5/postgresql-42.7.5.jar -o /opt/spark/jars/postgresql-42.7.5.jar


WORKDIR ${SPARK_HOME}
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir uv==0.8.3 \
&& uv pip install --system -r requirements.txt
COPY log4j2.properties /opt/spark/conf/log4j2.properties

RUN chmod -R 777 /opt


RUN wget "https://storage.yandexcloud.net/cloud-certs/CA.pem" --output-document /opt/cert/YandexInternalRootCA.crt &&  \
    chmod 655 /opt/cert/YandexInternalRootCA.crt

USER spark

ENTRYPOINT [ "/opt/entrypoint.sh" ]

